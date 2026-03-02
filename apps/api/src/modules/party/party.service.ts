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
