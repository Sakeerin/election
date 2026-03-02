import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { RedisService } from '../../common/redis/redis.service';
import { ElectionGateway } from '../../gateways/election.gateway';
import { UpdateSectionDto, ToggleSectionDto, ReorderSectionsDto } from './dto/section.dto';

@Injectable()
export class SectionService {
    private readonly logger = new Logger(SectionService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly redis: RedisService,
        private readonly gateway: ElectionGateway,
    ) { }

    async findByElection(electionId: number) {
        return this.prisma.electionSection.findMany({
            where: { electionId },
            orderBy: { displayOrder: 'asc' },
        });
    }

    async update(id: number, dto: UpdateSectionDto) {
        const section = await this.prisma.electionSection.findUnique({ where: { id } });
        if (!section) throw new NotFoundException(`Section #${id} not found`);

        const updated = await this.prisma.electionSection.update({
            where: { id },
            data: dto,
        });

        await this.redis.invalidatePattern('summary:*');
        return updated;
    }

    async toggle(id: number, dto: ToggleSectionDto) {
        const section = await this.prisma.electionSection.findUnique({ where: { id } });
        if (!section) throw new NotFoundException(`Section #${id} not found`);

        const updated = await this.prisma.electionSection.update({
            where: { id },
            data: { isEnabled: dto.isEnabled },
        });

        this.gateway.broadcastSectionToggled({
            sectionKey: updated.sectionKey,
            isEnabled: dto.isEnabled,
        });

        await this.redis.invalidatePattern('summary:*');
        this.logger.log(`Section "${updated.sectionKey}" toggled to ${dto.isEnabled}`);
        return updated;
    }

    async reorder(dto: ReorderSectionsDto) {
        await this.prisma.$transaction(
            dto.items.map((item) =>
                this.prisma.electionSection.update({
                    where: { id: item.id },
                    data: { displayOrder: item.displayOrder },
                }),
            ),
        );

        await this.redis.invalidatePattern('summary:*');
        return this.findByElection(dto.electionId);
    }
}
