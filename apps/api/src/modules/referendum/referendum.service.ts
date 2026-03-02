import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { RedisService } from '../../common/redis/redis.service';
import { ElectionGateway } from '../../gateways/election.gateway';
import {
    CreateReferendumDto,
    UpdateReferendumDto,
    UpdateReferendumResultDto,
    ToggleReferendumDto,
} from './dto/referendum.dto';
import { ReferendumStatus } from '@prisma/client';

@Injectable()
export class ReferendumService {
    private readonly logger = new Logger(ReferendumService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly redis: RedisService,
        private readonly gateway: ElectionGateway,
    ) { }

    async findByElection(electionId: number) {
        return this.prisma.referendum.findMany({
            where: { electionId },
            orderBy: { displayOrder: 'asc' },
        });
    }

    async findById(id: number) {
        const referendum = await this.prisma.referendum.findUnique({
            where: { id },
            include: {
                results: {
                    include: { province: true },
                    orderBy: { province: { nameTh: 'asc' } },
                },
            },
        });

        if (!referendum) {
            throw new NotFoundException(`Referendum #${id} not found`);
        }

        return referendum;
    }

    async create(dto: CreateReferendumDto) {
        return this.prisma.referendum.create({
            data: {
                electionId: dto.electionId,
                questionTh: dto.questionTh,
                questionEn: dto.questionEn ?? '',
                descriptionTh: dto.descriptionTh,
                descriptionEn: dto.descriptionEn,
                isEnabled: dto.isEnabled ?? false,
                displayOrder: dto.displayOrder ?? 0,
                totalEligibleVoters: dto.totalEligibleVoters ?? 0,
            },
        });
    }

    async update(id: number, dto: UpdateReferendumDto) {
        await this.findById(id);
        return this.prisma.referendum.update({
            where: { id },
            data: dto,
        });
    }

    async updateResults(dto: UpdateReferendumResultDto) {
        const result = await this.prisma.referendumResult.upsert({
            where: {
                referendumId_provinceId: {
                    referendumId: dto.referendumId,
                    provinceId: dto.provinceId,
                },
            },
            update: {
                approveCount: dto.approveCount,
                disapproveCount: dto.disapproveCount,
                abstainCount: dto.abstainCount ?? 0,
                totalVoters: dto.totalVoters ?? 0,
                countingProgress: dto.countingProgress ?? 0,
            },
            create: {
                referendumId: dto.referendumId,
                provinceId: dto.provinceId,
                approveCount: dto.approveCount,
                disapproveCount: dto.disapproveCount,
                abstainCount: dto.abstainCount ?? 0,
                totalVoters: dto.totalVoters ?? 0,
                countingProgress: dto.countingProgress ?? 0,
            },
        });

        // Recalculate referendum totals
        const allResults = await this.prisma.referendumResult.findMany({
            where: { referendumId: dto.referendumId },
        });

        const totals = allResults.reduce(
            (acc, r) => ({
                approveCount: acc.approveCount + r.approveCount,
                disapproveCount: acc.disapproveCount + r.disapproveCount,
                abstainCount: acc.abstainCount + r.abstainCount,
                totalVoters: acc.totalVoters + r.totalVoters,
                countingProgress: acc.countingProgress + r.countingProgress,
            }),
            { approveCount: 0, disapproveCount: 0, abstainCount: 0, totalVoters: 0, countingProgress: 0 },
        );

        const avgProgress = allResults.length > 0 ? totals.countingProgress / allResults.length : 0;

        await this.prisma.referendum.update({
            where: { id: dto.referendumId },
            data: {
                approveCount: totals.approveCount,
                disapproveCount: totals.disapproveCount,
                abstainCount: totals.abstainCount,
                totalVoters: totals.totalVoters,
                countingProgress: avgProgress,
            },
        });

        // Broadcast
        this.gateway.broadcastReferendumUpdated({
            referendumId: dto.referendumId,
            approveCount: totals.approveCount,
            disapproveCount: totals.disapproveCount,
            abstainCount: totals.abstainCount,
            countingProgress: avgProgress,
        });

        await this.redis.invalidatePattern('summary:*');
        return result;
    }

    async toggle(id: number, dto: ToggleReferendumDto) {
        await this.findById(id);
        const updated = await this.prisma.referendum.update({
            where: { id },
            data: { isEnabled: dto.isEnabled },
        });

        this.gateway.broadcastReferendumToggled({
            referendumId: id,
            isEnabled: dto.isEnabled,
        });

        await this.redis.invalidatePattern('summary:*');
        this.logger.log(`Referendum #${id} toggled to ${dto.isEnabled}`);
        return updated;
    }
}
