import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateElectionDto } from './dto/create-election.dto';
import { UpdateElectionDto, UpdateElectionStatusDto } from './dto/update-election.dto';
import { ElectionStatus, ElectionType } from '@prisma/client';

@Injectable()
export class ElectionService {
    constructor(private readonly prisma: PrismaService) { }

    async findAll() {
        return this.prisma.election.findMany({
            orderBy: { electionDate: 'desc' },
            include: { _count: { select: { constituencies: true } } },
        });
    }

    async findActive() {
        return this.prisma.election.findFirst({
            where: {
                status: { in: [ElectionStatus.ACTIVE, ElectionStatus.COUNTING] },
            },
            include: {
                sections: { orderBy: { displayOrder: 'asc' } },
                _count: { select: { constituencies: true, referendums: true } },
            },
        });
    }

    async findById(id: number) {
        const election = await this.prisma.election.findUnique({
            where: { id },
            include: {
                sections: { orderBy: { displayOrder: 'asc' } },
                _count: { select: { constituencies: true, referendums: true } },
            },
        });

        if (!election) {
            throw new NotFoundException(`Election #${id} not found`);
        }

        return election;
    }

    async create(dto: CreateElectionDto) {
        return this.prisma.election.create({
            data: {
                name: dto.name,
                electionDate: new Date(dto.electionDate),
                type: (dto.type as ElectionType) || ElectionType.GENERAL,
                hasReferendum: dto.hasReferendum ?? false,
                totalEligibleVoters: dto.totalEligibleVoters ?? 0,
            },
        });
    }

    async update(id: number, dto: UpdateElectionDto) {
        await this.findById(id);
        return this.prisma.election.update({
            where: { id },
            data: {
                ...(dto.name && { name: dto.name }),
                ...(dto.electionDate && { electionDate: new Date(dto.electionDate) }),
                ...(dto.type && { type: dto.type as ElectionType }),
                ...(dto.hasReferendum !== undefined && { hasReferendum: dto.hasReferendum }),
                ...(dto.totalEligibleVoters !== undefined && { totalEligibleVoters: dto.totalEligibleVoters }),
            },
        });
    }

    async updateStatus(id: number, dto: UpdateElectionStatusDto) {
        await this.findById(id);
        return this.prisma.election.update({
            where: { id },
            data: { status: dto.status as ElectionStatus },
        });
    }
}
