import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateConstituencyDto } from './dto/create-constituency.dto';
import { UpdateConstituencyDto } from './dto/update-constituency.dto';
import { ConstituencyStatus } from '@prisma/client';

@Injectable()
export class ConstituencyService {
    constructor(private readonly prisma: PrismaService) { }

    async findByElection(electionId: number, provinceId?: number) {
        return this.prisma.constituency.findMany({
            where: {
                electionId,
                ...(provinceId && { provinceId }),
            },
            include: {
                province: true,
                _count: { select: { candidates: true } },
            },
            orderBy: [
                { province: { nameTh: 'asc' } },
                { constituencyNumber: 'asc' },
            ],
        });
    }

    async findById(id: number) {
        const constituency = await this.prisma.constituency.findUnique({
            where: { id },
            include: {
                province: { include: { region: true } },
                candidates: {
                    include: { party: true },
                    orderBy: { candidateNumber: 'asc' },
                },
                results: {
                    include: { candidate: true, party: true },
                    orderBy: { voteCount: 'desc' },
                },
            },
        });

        if (!constituency) {
            throw new NotFoundException(`Constituency #${id} not found`);
        }

        return constituency;
    }

    async getResults(id: number) {
        const constituency = await this.findById(id);
        return {
            constituency: {
                id: constituency.id,
                constituencyNumber: constituency.constituencyNumber,
                province: constituency.province,
                status: constituency.status,
                countingProgress: constituency.countingProgress,
                totalVoters: constituency.totalVoters,
                goodBallots: constituency.goodBallots,
                badBallots: constituency.badBallots,
                noVoteBallots: constituency.noVoteBallots,
            },
            results: constituency.results,
        };
    }

    async create(dto: CreateConstituencyDto) {
        return this.prisma.constituency.create({
            data: {
                electionId: dto.electionId,
                provinceId: dto.provinceId,
                constituencyNumber: dto.constituencyNumber,
                eligibleVoters: dto.eligibleVoters ?? 0,
            },
            include: { province: true },
        });
    }

    async update(id: number, dto: UpdateConstituencyDto) {
        await this.findById(id);
        return this.prisma.constituency.update({
            where: { id },
            data: {
                ...(dto.eligibleVoters !== undefined && { eligibleVoters: dto.eligibleVoters }),
                ...(dto.totalVoters !== undefined && { totalVoters: dto.totalVoters }),
                ...(dto.goodBallots !== undefined && { goodBallots: dto.goodBallots }),
                ...(dto.badBallots !== undefined && { badBallots: dto.badBallots }),
                ...(dto.noVoteBallots !== undefined && { noVoteBallots: dto.noVoteBallots }),
                ...(dto.countingProgress !== undefined && { countingProgress: dto.countingProgress }),
                ...(dto.status && { status: dto.status as ConstituencyStatus }),
            },
            include: { province: true },
        });
    }
}
