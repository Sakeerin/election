import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreatePartyDto } from './dto/create-party.dto';
import { UpdatePartyDto } from './dto/update-party.dto';

@Injectable()
export class PartyService {
    constructor(private readonly prisma: PrismaService) { }

    async findAll() {
        return this.prisma.party.findMany({
            orderBy: { partyNumber: 'asc' },
        });
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

    async getPartyDetail(id: number, electionId?: number) {
        const party = await this.findById(id);

        // If electionId not provided, get the latest one
        let targetElectionId = electionId;
        if (!targetElectionId) {
            const latestElection = await this.prisma.election.findFirst({
                orderBy: { createdAt: 'desc' },
            });
            targetElectionId = latestElection?.id;
        }

        if (!targetElectionId) {
            throw new NotFoundException('No election found');
        }

        // Get party list allocation
        const allocation = await this.prisma.partyListAllocation.findUnique({
            where: {
                electionId_partyId: {
                    electionId: targetElectionId,
                    partyId: id,
                },
            },
        });

        // Get constituency wins
        const constituencyWins = await this.prisma.constituencyResult.findMany({
            where: {
                partyId: id,
                isLeading: true,
                constituency: { electionId: targetElectionId },
            },
            include: {
                constituency: {
                    include: { province: true },
                },
                candidate: true,
            },
            orderBy: [
                { constituency: { province: { nameTh: 'asc' } } },
                { constituency: { constituencyNumber: 'asc' } },
            ],
        });

        // Get total votes
        const votesSum = await this.prisma.constituencyResult.aggregate({
            where: {
                partyId: id,
                constituency: { electionId: targetElectionId },
            },
            _sum: { voteCount: true },
        });

        // For rank, we'd need to compare with others, but let's keep it simple for now
        // or just return 0 if we don't want to calculate it here.
        // Actually, let's just return what we have.

        return {
            party,
            constituencySeats: constituencyWins.length,
            partyListSeats: allocation?.allocatedSeats ?? 0,
            totalSeats: constituencyWins.length + (allocation?.allocatedSeats ?? 0),
            totalVotes: votesSum._sum.voteCount ?? 0,
            rank: 0, // Should be calculated or fetched from a leaderboard cache
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
        return this.prisma.party.create({
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
    }

    async update(id: number, dto: UpdatePartyDto) {
        await this.findById(id);
        return this.prisma.party.update({
            where: { id },
            data: dto,
        });
    }

    async delete(id: number) {
        await this.findById(id);
        return this.prisma.party.delete({ where: { id } });
    }
}
