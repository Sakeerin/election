import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateElectionDto } from './dto/create-election.dto';
import { UpdateElectionDto, UpdateElectionStatusDto } from './dto/update-election.dto';
import { ElectionStatus, ElectionType } from '@prisma/client';

export interface PaginationQuery {
    page?: number;
    limit?: number;
}

@Injectable()
export class ElectionService {
    private readonly logger = new Logger(ElectionService.name);

    constructor(private readonly prisma: PrismaService) { }

    /**
     * Return a paginated list of elections, newest first.
     * Default: page 1, 20 records per page, max 100.
     */
    async findAll({ page = 1, limit = 20 }: PaginationQuery = {}) {
        const take = Math.min(Math.max(1, limit), 100);
        const skip = (Math.max(1, page) - 1) * take;

        const [items, total] = await this.prisma.$transaction([
            this.prisma.election.findMany({
                skip,
                take,
                orderBy: { electionDate: 'desc' },
                include: { _count: { select: { constituencies: true } } },
            }),
            this.prisma.election.count(),
        ]);

        return { items, total, page: Math.max(1, page), limit: take };
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
        const election = await this.prisma.election.create({
            data: {
                name: dto.name,
                electionDate: new Date(dto.electionDate),
                type: (dto.type as ElectionType) || ElectionType.GENERAL,
                hasReferendum: dto.hasReferendum ?? false,
                totalEligibleVoters: dto.totalEligibleVoters ?? 0,
            },
        });
        this.logger.log(`Created election #${election.id}: ${election.name}`);
        return election;
    }

    async update(id: number, dto: UpdateElectionDto) {
        await this.findById(id);
        const updated = await this.prisma.election.update({
            where: { id },
            data: {
                ...(dto.name && { name: dto.name }),
                ...(dto.electionDate && { electionDate: new Date(dto.electionDate) }),
                ...(dto.type && { type: dto.type as ElectionType }),
                ...(dto.hasReferendum !== undefined && { hasReferendum: dto.hasReferendum }),
                ...(dto.totalEligibleVoters !== undefined && { totalEligibleVoters: dto.totalEligibleVoters }),
            },
        });
        this.logger.log(`Updated election #${id}`);
        return updated;
    }

    async updateStatus(id: number, dto: UpdateElectionStatusDto) {
        await this.findById(id);
        const updated = await this.prisma.election.update({
            where: { id },
            data: { status: dto.status as ElectionStatus },
        });
        this.logger.log(`Election #${id} status changed to ${dto.status}`);
        return updated;
    }
}
