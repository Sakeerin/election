import { Injectable, NotFoundException, Logger, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { RedisService } from '../../common/redis/redis.service';
import { ElectionGateway } from '../../gateways/election.gateway';
import {
    CreateReferendumDto,
    UpdateReferendumDto,
    UpdateReferendumResultDto,
    ToggleReferendumDto,
} from './dto/referendum.dto';
import { APP_CONSTANTS } from '../../common/constants/app.constants';

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
        const referendum = await this.prisma.referendum.create({
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
        this.logger.log(`Created referendum #${referendum.id} for election #${dto.electionId}`);
        return referendum;
    }

    async update(id: number, dto: UpdateReferendumDto) {
        await this.findById(id);
        const updated = await this.prisma.referendum.update({ where: { id }, data: dto });
        this.logger.log(`Updated referendum #${id}`);
        return updated;
    }

    /**
     * Upsert a per-province result then re-aggregate totals using the database
     * (avoids loading all province rows into JS memory).
     */
    async updateResults(dto: UpdateReferendumResultDto) {
        this.logger.debug(`Updating referendum #${dto.referendumId} results for province #${dto.provinceId}`);

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

        // Aggregate totals with a single DB query instead of loading all records into JS
        const [sums, avgProgress] = await Promise.all([
            this.prisma.referendumResult.aggregate({
                where: { referendumId: dto.referendumId },
                _sum: {
                    approveCount: true,
                    disapproveCount: true,
                    abstainCount: true,
                    totalVoters: true,
                },
            }),
            this.prisma.referendumResult.aggregate({
                where: { referendumId: dto.referendumId },
                _avg: { countingProgress: true },
            }),
        ]);

        const totals = {
            approveCount: sums._sum.approveCount ?? 0,
            disapproveCount: sums._sum.disapproveCount ?? 0,
            abstainCount: sums._sum.abstainCount ?? 0,
            totalVoters: sums._sum.totalVoters ?? 0,
            countingProgress: avgProgress._avg.countingProgress ?? 0,
        };

        await this.prisma.referendum.update({
            where: { id: dto.referendumId },
            data: totals,
        });

        this.gateway.broadcastReferendumUpdated({
            referendumId: dto.referendumId,
            approveCount: totals.approveCount,
            disapproveCount: totals.disapproveCount,
            abstainCount: totals.abstainCount,
            countingProgress: totals.countingProgress,
        });

        // Scoped cache invalidation — we need the electionId to scope properly
        try {
            const referendum = await this.prisma.referendum.findUnique({
                where: { id: dto.referendumId },
                select: { electionId: true },
            });
            if (referendum) {
                await this.redis.invalidatePattern(`summary:*:${referendum.electionId}`);
            }
        } catch (err) {
            this.logger.warn(`Failed to invalidate cache after referendum update: ${err}`);
        }

        this.logger.log(`Updated referendum #${dto.referendumId} results for province #${dto.provinceId}`);
        return result;
    }

    async toggle(id: number, dto: ToggleReferendumDto) {
        const referendum = await this.findById(id);
        const updated = await this.prisma.referendum.update({
            where: { id },
            data: { isEnabled: dto.isEnabled },
        });

        this.gateway.broadcastReferendumToggled({
            referendumId: id,
            isEnabled: dto.isEnabled,
        });

        await this.redis.invalidatePattern(`summary:*:${referendum.electionId}`);
        this.logger.log(`Referendum #${id} toggled to ${dto.isEnabled}`);
        return updated;
    }
}
