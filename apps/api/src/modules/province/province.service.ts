import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class ProvinceService {
    constructor(private readonly prisma: PrismaService) { }

    /** List provinces; with electionId, only those that have constituencies in that election. */
    async findAll(electionId?: number) {
        return this.prisma.province.findMany({
            where: electionId ? { constituencies: { some: { electionId } } } : undefined,
            include: { region: true },
            orderBy: { nameTh: 'asc' },
        });
    }
}
