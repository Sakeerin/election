import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { RedisService } from '../../common/redis/redis.service';
import { ElectionGateway } from '../../gateways/election.gateway';
import { SummaryService } from '../summary/summary.service';
import { UpdateConstituencyVotesDto, UpdatePartyListDto, BatchUpdateConstituencyVotesDto } from './dto/update-votes.dto';
import { ConstituencyStatus } from '@prisma/client';

@Injectable()
export class VoteService {
    private readonly logger = new Logger(VoteService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly redis: RedisService,
        private readonly gateway: ElectionGateway,
        private readonly summary: SummaryService,
    ) { }

    async updateConstituencyVotes(dto: UpdateConstituencyVotesDto) {
        this.logger.debug(`Updating votes for constituency #${dto.constituencyId}`);

        const constituency = await this.prisma.constituency.findUnique({
            where: { id: dto.constituencyId },
            select: { id: true, electionId: true, candidates: { select: { id: true, partyId: true } } },
        });

        if (!constituency) {
            throw new BadRequestException(`Constituency #${dto.constituencyId} not found`);
        }

        const { electionId } = constituency;

        // All DB work in one transaction; broadcast only AFTER successful commit
        const results = await this.prisma.$transaction(async (tx) => {
            this.logger.debug(`Upserting ${dto.votes.length} vote results in constituency #${dto.constituencyId}`);

            // Reset all results to not-leading / not-winner before re-ranking
            await tx.constituencyResult.updateMany({
                where: { constituencyId: dto.constituencyId },
                data: { isLeading: false, isWinner: false },
            });

            // Upsert vote count for each candidate submitted
            for (const vote of dto.votes) {
                const candidate = constituency.candidates.find((c) => c.id === vote.candidateId);
                if (!candidate) continue;

                await tx.constituencyResult.upsert({
                    where: {
                        constituencyId_candidateId: {
                            constituencyId: dto.constituencyId,
                            candidateId: vote.candidateId,
                        },
                    },
                    update: { voteCount: vote.voteCount },
                    create: {
                        constituencyId: dto.constituencyId,
                        candidateId: vote.candidateId,
                        partyId: candidate.partyId,
                        voteCount: vote.voteCount,
                    },
                });
            }

            // Find the single leader (highest voteCount) and mark accordingly
            const leader = await tx.constituencyResult.findFirst({
                where: { constituencyId: dto.constituencyId },
                orderBy: { voteCount: 'desc' },
                select: { id: true },
            });

            if (leader) {
                await tx.constituencyResult.update({
                    where: { id: leader.id },
                    data: {
                        isLeading: true,
                        isWinner: dto.countingProgress === 100,
                    },
                });
            }

            // Update constituency stats
            await tx.constituency.update({
                where: { id: dto.constituencyId },
                data: {
                    ...(dto.totalVoters !== undefined && { totalVoters: dto.totalVoters }),
                    ...(dto.goodBallots !== undefined && { goodBallots: dto.goodBallots }),
                    ...(dto.badBallots !== undefined && { badBallots: dto.badBallots }),
                    ...(dto.noVoteBallots !== undefined && { noVoteBallots: dto.noVoteBallots }),
                    ...(dto.countingProgress !== undefined && { countingProgress: dto.countingProgress }),
                    ...(dto.countingProgress === 100 && { status: ConstituencyStatus.COMPLETED }),
                    ...(dto.countingProgress !== undefined &&
                        dto.countingProgress > 0 &&
                        dto.countingProgress < 100 && { status: ConstituencyStatus.COUNTING }),
                },
            });

            // Fetch final state to return and broadcast
            return tx.constituencyResult.findMany({
                where: { constituencyId: dto.constituencyId },
                include: { candidate: true, party: true },
                orderBy: { voteCount: 'desc' },
            });
        });

        // Broadcast AFTER successful commit — data is now persisted
        this.gateway.broadcastVoteUpdated({
            constituencyId: dto.constituencyId,
            results: results.map((r) => ({
                id: r.id,
                constituencyId: r.constituencyId,
                candidateId: r.candidateId,
                partyId: r.partyId,
                voteCount: r.voteCount,
                isLeading: r.isLeading,
                isWinner: r.isWinner,
                updatedAt: r.updatedAt.toISOString(),
            })),
        });

        // Scoped cache invalidation — only clear summaries for this election
        await this.redis.invalidatePattern(`summary:*:${electionId}`);

        // Election-wide progress is recomputed after the cache clear so clients never get stale numbers.
        // Votes are already committed, so a failure here must not fail the request.
        try {
            const progress = await this.summary.getCountingProgress(electionId);
            this.gateway.broadcastCountingProgress({
                totalCounted: progress.totalCounted,
                percentage: progress.percentage,
            });
        } catch (err) {
            this.logger.warn(`Failed to broadcast counting progress for election #${electionId}: ${err}`);
        }

        this.logger.log(`Updated votes for constituency #${dto.constituencyId} (election #${electionId})`);
        return results;
    }

    async updatePartyListAllocation(dto: UpdatePartyListDto) {
        this.logger.debug(`Updating party list allocation for party #${dto.partyId}, election #${dto.electionId}`);

        const constituencySeats = await this.prisma.constituencyResult.count({
            where: {
                partyId: dto.partyId,
                isWinner: true,
                constituency: { electionId: dto.electionId },
            },
        });

        const allocation = await this.prisma.partyListAllocation.upsert({
            where: {
                electionId_partyId: {
                    electionId: dto.electionId,
                    partyId: dto.partyId,
                },
            },
            update: {
                totalPartyListVotes: dto.totalPartyListVotes,
                allocatedSeats: dto.allocatedSeats,
                constituencySeats,
                totalSeats: constituencySeats + dto.allocatedSeats,
            },
            create: {
                electionId: dto.electionId,
                partyId: dto.partyId,
                totalPartyListVotes: dto.totalPartyListVotes,
                allocatedSeats: dto.allocatedSeats,
                constituencySeats,
                totalSeats: constituencySeats + dto.allocatedSeats,
            },
        });

        this.gateway.broadcastPartyUpdated({
            partyId: dto.partyId,
            totalSeats: allocation.totalSeats,
            constituencySeats: allocation.constituencySeats,
            partyListSeats: allocation.allocatedSeats,
        });

        // Scoped cache invalidation
        await this.redis.invalidatePattern(`summary:*:${dto.electionId}`);

        this.logger.log(`Updated party list allocation for party #${dto.partyId}, election #${dto.electionId}`);
        return allocation;
    }

    /**
     * Atomically update votes for multiple constituencies in a single request.
     * Useful for bulk imports where updating one at a time would be too slow.
     */
    async batchUpdateConstituencyVotes(dto: BatchUpdateConstituencyVotesDto) {
        this.logger.log(`Batch updating ${dto.updates.length} constituencies`);

        const results = await Promise.allSettled(
            dto.updates.map((update) => this.updateConstituencyVotes(update)),
        );

        const succeeded = results.filter((r) => r.status === 'fulfilled').length;
        const failed = results
            .map((r, i) => ({ index: i, result: r }))
            .filter((r) => r.result.status === 'rejected')
            .map(({ index, result }) => ({
                constituencyId: dto.updates[index].constituencyId,
                error: (result as PromiseRejectedResult).reason?.message ?? 'Unknown error',
            }));

        this.logger.log(`Batch update complete: ${succeeded} succeeded, ${failed.length} failed`);
        return { succeeded, failed };
    }
}
