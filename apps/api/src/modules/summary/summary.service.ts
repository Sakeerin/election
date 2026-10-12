import { Injectable, Logger, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { RedisService } from '../../common/redis/redis.service';
import { APP_CONSTANTS } from '../../common/constants/app.constants';

export interface CountingProgress {
    totalConstituencies: number;
    totalCounted: number;
    percentage: number;
}

@Injectable()
export class SummaryService {
    private readonly logger = new Logger(SummaryService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly redis: RedisService,
    ) { }

    /**
     * Return full overview for an election: parties, counting progress and referendum info.
     * Cached for SUMMARY_CACHE_TTL seconds; keyed by electionId so cache clears are scoped.
     */
    async getOverview(electionId: number) {
        const cacheKey = `summary:overview:${electionId}`;

        try {
            const cached = await this.redis.getJson<unknown>(cacheKey);
            if (cached) return cached;

            const election = await this.prisma.election.findUnique({
                where: { id: electionId },
                include: {
                    sections: { where: { isEnabled: true }, orderBy: { displayOrder: 'asc' } },
                },
            });

            if (!election) throw new NotFoundException(`Election #${electionId} not found`);

            // All independent queries in parallel
            const [parties, progress, referendums] = await Promise.all([
                this.getPartyLeaderboard(electionId) as Promise<unknown[]>,
                this.getCountingProgress(electionId) as Promise<CountingProgress>,
                election.hasReferendum
                    ? this.prisma.referendum.findMany({
                          where: { electionId, isEnabled: true },
                          orderBy: { displayOrder: 'asc' },
                      })
                    : Promise.resolve(null),
            ]);

            const result = {
                election: {
                    id: election.id,
                    name: election.name,
                    electionDate: election.electionDate,
                    type: election.type,
                    status: election.status,
                    hasReferendum: election.hasReferendum,
                    totalEligibleVoters: election.totalEligibleVoters,
                },
                totalCounted: progress.totalCounted,
                countingPercentage: progress.percentage,
                parties,
                referendum: referendums,
                sections: election.sections,
                lastUpdated: new Date().toISOString(),
            };

            await this.redis.setJson(cacheKey, result, APP_CONSTANTS.SUMMARY_CACHE_TTL);
            return result;
        } catch (error) {
            if (error instanceof NotFoundException) throw error;
            this.logger.error(`getOverview failed for election #${electionId}: ${error}`);
            throw new InternalServerErrorException('Failed to fetch election overview');
        }
    }

    /**
     * Return ranked party leaderboard for an election.
     * Only includes parties that actually have votes or allocations in this election.
     * Combines constituency wins + party-list allocations.
     * Sorted by: total seats (desc), then total votes (desc).
     */
    async getPartyLeaderboard(electionId: number) {
        const cacheKey = `summary:leaderboard:${electionId}`;

        try {
            const cached = await this.redis.getJson<unknown>(cacheKey);
            if (cached) return cached;

            // All queries run in parallel
            const [allocations, constituencyWins, totalVotes] = await Promise.all([
                this.prisma.partyListAllocation.findMany({
                    where: { electionId },
                    include: { party: true },
                }),
                this.prisma.constituencyResult.groupBy({
                    by: ['partyId'],
                    where: {
                        isLeading: true,
                        constituency: { electionId },
                    },
                    _count: { id: true },
                }),
                this.prisma.constituencyResult.groupBy({
                    by: ['partyId'],
                    where: { constituency: { electionId } },
                    _sum: { voteCount: true },
                }),
            ]);

            // Collect only parties that appear in THIS election's data (no global party dump)
            const partyIds = new Set<number>([
                ...allocations.map((a) => a.partyId),
                ...constituencyWins.map((w) => w.partyId),
                ...totalVotes.map((v) => v.partyId),
            ]);

            // Fetch party details only for the relevant set
            const parties = await this.prisma.party.findMany({
                where: { id: { in: [...partyIds] } },
            });

            const partyMap = new Map(
                parties.map((p) => [
                    p.id,
                    { party: p, constituencySeats: 0, partyListSeats: 0, totalSeats: 0, totalVotes: 0, rank: 0 },
                ]),
            );

            for (const win of constituencyWins) {
                const entry = partyMap.get(win.partyId);
                if (entry) entry.constituencySeats = win._count.id;
            }
            for (const alloc of allocations) {
                const entry = partyMap.get(alloc.partyId);
                if (entry) entry.partyListSeats = alloc.allocatedSeats;
            }
            for (const vote of totalVotes) {
                const entry = partyMap.get(vote.partyId);
                if (entry) entry.totalVotes = vote._sum.voteCount ?? 0;
            }

            const result = Array.from(partyMap.values())
                .map((e) => ({ ...e, totalSeats: e.constituencySeats + e.partyListSeats }))
                .filter((e) => e.totalSeats > 0 || e.totalVotes > 0)
                .sort((a, b) => b.totalSeats - a.totalSeats || b.totalVotes - a.totalVotes)
                .map((e, i) => ({ ...e, rank: i + 1 }));

            await this.redis.setJson(cacheKey, result, APP_CONSTANTS.SUMMARY_CACHE_TTL);
            return result;
        } catch (error) {
            this.logger.error(`getPartyLeaderboard failed for election #${electionId}: ${error}`);
            throw new InternalServerErrorException('Failed to fetch party leaderboard');
        }
    }

    /**
     * Return counting progress for an election.
     * Uses DB aggregation to avoid loading all constituency rows into memory.
     */
    async getCountingProgress(electionId: number): Promise<CountingProgress> {
        const cacheKey = `summary:progress:${electionId}`;

        try {
            const cached = await this.redis.getJson<CountingProgress>(cacheKey);
            if (cached) return cached;

            const [aggregate, totalCompleted] = await Promise.all([
                this.prisma.constituency.aggregate({
                    where: { electionId },
                    _avg: { countingProgress: true },
                    _count: { id: true },
                }),
                this.prisma.constituency.count({
                    where: { electionId, status: 'COMPLETED' },
                }),
            ]);

            const result = {
                totalConstituencies: aggregate._count.id,
                totalCounted: totalCompleted,
                percentage: Math.round((aggregate._avg.countingProgress ?? 0) * 100) / 100,
            };

            await this.redis.setJson(cacheKey, result, APP_CONSTANTS.SUMMARY_CACHE_TTL);
            return result;
        } catch (error) {
            this.logger.error(`getCountingProgress failed for election #${electionId}: ${error}`);
            throw new InternalServerErrorException('Failed to fetch counting progress');
        }
    }

    async getProvinceResults(electionId: number, provinceId: number) {
        try {
            const constituencies = await this.prisma.constituency.findMany({
                where: { electionId, provinceId },
                include: {
                    province: true,
                    results: {
                        include: { candidate: true, party: true },
                        orderBy: { voteCount: 'desc' },
                    },
                },
                orderBy: { constituencyNumber: 'asc' },
            });

            const province = constituencies[0]?.province ?? null;

            return {
                province,
                constituencies: constituencies.map((c) => ({
                    id: c.id,
                    constituencyNumber: c.constituencyNumber,
                    status: c.status,
                    countingProgress: c.countingProgress,
                    totalVoters: c.totalVoters,
                    results: c.results,
                })),
            };
        } catch (error) {
            this.logger.error(`getProvinceResults failed for election #${electionId}, province #${provinceId}: ${error}`);
            throw new InternalServerErrorException('Failed to fetch province results');
        }
    }
}
