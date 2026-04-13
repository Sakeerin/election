import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateCandidateDto } from './dto/create-candidate.dto';
import { UpdateCandidateDto } from './dto/update-candidate.dto';

@Injectable()
export class CandidateService {
    constructor(private readonly prisma: PrismaService) { }

    async findByConstituency(constituencyId: number) {
        return this.prisma.candidate.findMany({
            where: { constituencyId },
            include: { party: true },
            orderBy: { candidateNumber: 'asc' },
        });
    }

    async findById(id: number) {
        const candidate = await this.prisma.candidate.findUnique({
            where: { id },
            include: {
                party: true,
                constituency: {
                    include: {
                        province: { include: { region: true } },
                    },
                },
            },
        });

        if (!candidate) {
            throw new NotFoundException(`Candidate #${id} not found`);
        }

        return candidate;
    }

    async getCandidateDetail(id: number) {
        const candidate = await this.findById(id);

        // Get results for all candidates in this constituency
        const results = await this.prisma.constituencyResult.findMany({
            where: {
                constituencyId: candidate.constituencyId,
            },
            include: {
                candidate: true,
                party: true,
            },
            orderBy: { voteCount: 'desc' },
        });

        return {
            candidate,
            constituency: candidate.constituency,
            results: results.map((r) => ({
                candidateId: r.candidateId,
                candidateNameTh: r.candidate.nameTh,
                partyNameTh: r.party.nameTh,
                partyColor: r.party.color,
                voteCount: r.voteCount,
                isLeading: r.isLeading,
                isWinner: r.isWinner,
            })),
        };
    }

    async create(dto: CreateCandidateDto) {
        return this.prisma.candidate.create({
            data: {
                partyId: dto.partyId,
                constituencyId: dto.constituencyId,
                nameTh: dto.nameTh,
                nameEn: dto.nameEn ?? '',
                imageUrl: dto.imageUrl,
                candidateNumber: dto.candidateNumber ?? 0,
            },
            include: { party: true },
        });
    }

    async update(id: number, dto: UpdateCandidateDto) {
        await this.findById(id);
        return this.prisma.candidate.update({
            where: { id },
            data: dto,
            include: { party: true },
        });
    }

    async delete(id: number) {
        await this.findById(id);
        return this.prisma.candidate.delete({ where: { id } });
    }
}
