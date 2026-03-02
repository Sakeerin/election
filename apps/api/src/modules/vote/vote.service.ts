import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { RedisService } from '../../common/redis/redis.service';
import { ElectionGateway } from '../../gateways/election.gateway';
import { UpdateConstituencyVotesDto, UpdatePartyListDto } from './dto/update-votes.dto';
import { ConstituencyStatus } from '@prisma/client';

@Injectable()
export class VoteService {
    private readonly logger = new Logger(VoteService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly redis: RedisService,
        private readonly gateway: ElectionGateway,
    ) { }

    async updateConstituencyVotes(dto: UpdateConstituencyVotesDto) {
        const constituency = await this.prisma.constituency.findUnique({
            where: { id: dto.constituencyId },
            include: { candidates: true },
        });

        if (!constituency) {
            throw new Error(`Constituency #${dto.constituencyId} not found`);
        }

        // Update each candidate's vote count in a transaction
        const results = await this.prisma.$transaction(async (tx) => {
            // Upsert vote results for each candidate
            const updatedResults = [];
            for (const vote of dto.votes) {
                const candidate = constituency.candidates.find(c => c.id === vote.candidateId);
                if (!candidate) continue;

                const result = await tx.constituencyResult.upsert({
                    where: {
                        constituencyId_candidateId: {
                            constituencyId: dto.constituencyId,
                            candidateId: vote.candidateId,
                        },
                    },
                    update: {
                        voteCount: vote.voteCount,
                        isLeading: false,
                        isWinner: false,
                    },
                    create: {
                        constituencyId: dto.constituencyId,
                        candidateId: vote.candidateId,
                        partyId: candidate.partyId,
                        voteCount: vote.voteCount,
                    },
                });
                updatedResults.push(result);
            }

            // Recompute isLeading and isWinner
            if (updatedResults.length > 0) {
                const allResults = await tx.constituencyResult.findMany({
                    where: { constituencyId: dto.constituencyId },
                    orderBy: { voteCount: 'desc' },
                });

                if (allResults.length > 0) {
                    // Mark the leader
                    await tx.constituencyResult.update({
                        where: { id: allResults[0].id },
                        data: {
                            isLeading: true,
                            isWinner: dto.countingProgress === 100,
                        },
                    });
                }
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
                    ...(dto.countingProgress !== undefined && dto.countingProgress > 0 && dto.countingProgress < 100 && { status: ConstituencyStatus.COUNTING }),
                },
            });

            // Return final results
            return tx.constituencyResult.findMany({
                where: { constituencyId: dto.constituencyId },
                include: { candidate: true, party: true },
                orderBy: { voteCount: 'desc' },
            });
        });

        // Broadcast via WebSocket
        this.gateway.broadcastVoteUpdated({
            constituencyId: dto.constituencyId,
            results: results.map(r => ({
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

        // Invalidate cached summaries
        await this.redis.invalidatePattern('summary:*');

        this.logger.log(`Updated votes for constituency #${dto.constituencyId}`);
        return results;
    }

    async updatePartyListAllocation(dto: UpdatePartyListDto) {
        // Get constituency seats count for this party
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

        // Broadcast party update
        this.gateway.broadcastPartyUpdated({
            partyId: dto.partyId,
            totalSeats: allocation.totalSeats,
            constituencySeats: allocation.constituencySeats,
            partyListSeats: allocation.allocatedSeats,
        });

        // Invalidate cached summaries
        await this.redis.invalidatePattern('summary:*');

        this.logger.log(`Updated party list allocation for party #${dto.partyId}`);
        return allocation;
    }
}
