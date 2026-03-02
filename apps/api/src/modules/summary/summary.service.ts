import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { RedisService } from '../../common/redis/redis.service';

@Injectable()
export class SummaryService {
    private readonly logger = new Logger(SummaryService.name);
    private readonly CACHE_TTL = 30; // 30 seconds

    constructor(
        private readonly prisma: PrismaService,
        private readonly redis: RedisService,
    ) { }

    async getOverview(electionId: number) {
        const cacheKey = `summary:overview:${electionId}`;
        const cached = await this.redis.getJson<any>(cacheKey);
        if (cached) return cached;

        const election = await this.prisma.election.findUnique({
            where: { id: electionId },
            include: {
                sections: { where: { isEnabled: true }, orderBy: { displayOrder: 'asc' } },
            },
        });

        if (!election) return null;

        // Get party leaderboard
        const parties = await this.getPartyLeaderboard(electionId);

        // Get counting progress
        const progress = await this.getCountingProgress(electionId);

        // Get referendum data if applicable
        let referendums = null;
        if (election.hasReferendum) {
            referendums = await this.prisma.referendum.findMany({
                where: { electionId, isEnabled: true },
                orderBy: { displayOrder: 'asc' },
            });
        }

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

        await this.redis.setJson(cacheKey, result, this.CACHE_TTL);
        return result;
    }

    async getPartyLeaderboard(electionId: number) {
        const cacheKey = `summary:leaderboard:${electionId}`;
        const cached = await this.redis.getJson<any>(cacheKey);
        if (cached) return cached;

        // Get party list allocations
        const allocations = await this.prisma.partyListAllocation.findMany({
            where: { electionId },
            include: { party: true },
        });

        // Get constituency wins per party
        const constituencyWins = await this.prisma.constituencyResult.groupBy({
            by: ['partyId'],
            where: {
                isLeading: true,
                constituency: { electionId },
            },
            _count: { id: true },
        });

        // Get total votes per party
        const totalVotes = await this.prisma.constituencyResult.groupBy({
            by: ['partyId'],
            where: {
                constituency: { electionId },
            },
            _sum: { voteCount: true },
        });

        // Get all parties to include those with no seats
        const allParties = await this.prisma.party.findMany();

        const partyMap = new Map<number, any>();

        // Initialize from all parties
        for (const party of allParties) {
            partyMap.set(party.id, {
                party,
                constituencySeats: 0,
                partyListSeats: 0,
                totalSeats: 0,
                totalVotes: 0,
                rank: 0,
            });
        }

        // Apply constituency wins
        for (const win of constituencyWins) {
            const entry = partyMap.get(win.partyId);
            if (entry) {
                entry.constituencySeats = win._count.id;
            }
        }

        // Apply party list allocations
        for (const alloc of allocations) {
            const entry = partyMap.get(alloc.partyId);
            if (entry) {
                entry.partyListSeats = alloc.allocatedSeats;
            }
        }

        // Apply total votes
        for (const vote of totalVotes) {
            const entry = partyMap.get(vote.partyId);
            if (entry) {
                entry.totalVotes = vote._sum.voteCount ?? 0;
            }
        }

        // Calculate total seats and sort
        const result = Array.from(partyMap.values())
            .map((entry) => ({
                ...entry,
                totalSeats: entry.constituencySeats + entry.partyListSeats,
            }))
            .filter((entry) => entry.totalSeats > 0 || entry.totalVotes > 0)
            .sort((a, b) => b.totalSeats - a.totalSeats || b.totalVotes - a.totalVotes)
            .map((entry, index) => ({
                ...entry,
                rank: index + 1,
            }));

        await this.redis.setJson(cacheKey, result, this.CACHE_TTL);
        return result;
    }

    async getCountingProgress(electionId: number) {
        const cacheKey = `summary:progress:${electionId}`;
        const cached = await this.redis.getJson<any>(cacheKey);
        if (cached) return cached;

        const constituencies = await this.prisma.constituency.findMany({
            where: { electionId },
            select: { countingProgress: true, status: true },
        });

        const totalConstituencies = constituencies.length;
        const totalCounted = constituencies.filter(
            (c) => c.status === 'COMPLETED',
        ).length;

        const avgProgress =
            totalConstituencies > 0
                ? constituencies.reduce((sum, c) => sum + c.countingProgress, 0) / totalConstituencies
                : 0;

        const result = {
            totalConstituencies,
            totalCounted,
            percentage: Math.round(avgProgress * 100) / 100,
        };

        await this.redis.setJson(cacheKey, result, this.CACHE_TTL);
        return result;
    }

    async getProvinceResults(electionId: number, provinceId: number) {
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

        const province = constituencies[0]?.province || null;

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
    }
}
