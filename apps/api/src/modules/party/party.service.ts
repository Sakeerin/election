import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreatePartyDto } from './dto/create-party.dto';
import { UpdatePartyDto } from './dto/update-party.dto';
import type { PaginationQuery } from '../election/election.service';

@Injectable()
export class PartyService {
    private readonly logger = new Logger(PartyService.name);

    constructor(private readonly prisma: PrismaService) { }

    /**
     * Return a paginated list of all parties, ordered by party number.
     * Default: page 1, 50 records per page, max 200.
     */
    async findAll({ page = 1, limit = 50 }: PaginationQuery = {}) {
        const take = Math.min(Math.max(1, limit), 200);
        const skip = (Math.max(1, page) - 1) * take;

        const [items, total] = await this.prisma.$transaction([
            this.prisma.party.findMany({
                skip,
                take,
                orderBy: { partyNumber: 'asc' },
            }),
            this.prisma.party.count(),
        ]);

        return { items, total, page: Math.max(1, page), limit: take };
    }

    async findById(id: number) {
        const party = await this.prisma.party.findUnique({
            where: { id },
            include: {
                partyListCandidates: { orderBy: { rank: 'asc' } },
            },
        });

        if (!party) {
            throw new NotFoundException(`Party #${id} not found`);
        }

        return party;
    }

    /**
     * Get full party detail for a specific election, including constituency wins,
     * party-list allocation and total votes.
     * Uses targeted queries to avoid N+1 patterns.
     */
    async getPartyDetail(id: number, electionId?: number) {
        const party = await this.findById(id);

        let targetElectionId = electionId;
        if (!targetElectionId) {
            const latestElection = await this.prisma.election.findFirst({
                orderBy: { createdAt: 'desc' },
                select: { id: true },
            });
            targetElectionId = latestElection?.id;
        }

        if (!targetElectionId) {
            throw new NotFoundException('No election found');
        }

        // Run all independent queries in parallel for performance
        const [allocation, constituencyWins, votesSum] = await Promise.all([
            this.prisma.partyListAllocation.findUnique({
                where: {
                    electionId_partyId: { electionId: targetElectionId, partyId: id },
                },
                select: { allocatedSeats: true },
            }),
            this.prisma.constituencyResult.findMany({
                where: {
                    partyId: id,
                    isLeading: true,
                    constituency: { electionId: targetElectionId },
                },
                select: {
                    constituencyId: true,
                    voteCount: true,
                    constituency: {
                        select: {
                            constituencyNumber: true,
                            province: { select: { nameTh: true } },
                        },
                    },
                    candidate: { select: { nameTh: true } },
                },
                orderBy: [
                    { constituency: { province: { nameTh: 'asc' } } },
                    { constituency: { constituencyNumber: 'asc' } },
                ],
            }),
            this.prisma.constituencyResult.aggregate({
                where: { partyId: id, constituency: { electionId: targetElectionId } },
                _sum: { voteCount: true },
            }),
        ]);

        return {
            party,
            constituencySeats: constituencyWins.length,
            partyListSeats: allocation?.allocatedSeats ?? 0,
            totalSeats: constituencyWins.length + (allocation?.allocatedSeats ?? 0),
            totalVotes: votesSum._sum.voteCount ?? 0,
            rank: 0,
            partyListCandidates: party.partyListCandidates,
            constituencyWins: constituencyWins.map((win) => ({
                constituencyId: win.constituencyId,
                provinceNameTh: win.constituency.province.nameTh,
                constituencyNumber: win.constituency.constituencyNumber,
                candidateNameTh: win.candidate.nameTh,
                voteCount: win.voteCount,
            })),
        };
    }

    async create(dto: CreatePartyDto) {
        const party = await this.prisma.party.create({
            data: {
                nameTh: dto.nameTh,
                nameEn: dto.nameEn ?? '',
                abbreviation: dto.abbreviation ?? '',
                color: dto.color ?? '#333333',
                logoUrl: dto.logoUrl,
                leaderName: dto.leaderName,
                leaderImageUrl: dto.leaderImageUrl,
                partyNumber: dto.partyNumber ?? 0,
            },
        });
        this.logger.log(`Created party #${party.id}: ${party.nameTh}`);
        return party;
    }

    async update(id: number, dto: UpdatePartyDto) {
        await this.findById(id);
        const updated = await this.prisma.party.update({ where: { id }, data: dto });
        this.logger.log(`Updated party #${id}`);
        return updated;
    }

    async delete(id: number) {
        await this.findById(id);
        await this.prisma.party.delete({ where: { id } });
        this.logger.log(`Deleted party #${id}`);
        return { deleted: true, id };
    }
}
