import { Test, TestingModule } from '@nestjs/testing';
import { ProvinceService } from './province.service';
import { PrismaService } from '../../common/prisma/prisma.service';

const mockPrisma = {
    province: { findMany: jest.fn() },
};

describe('ProvinceService', () => {
    let service: ProvinceService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ProvinceService,
                { provide: PrismaService, useValue: mockPrisma },
            ],
        }).compile();

        service = module.get<ProvinceService>(ProvinceService);
        jest.clearAllMocks();
    });

    describe('findAll', () => {
        it('should return every province with its region when no election is given', async () => {
            const provinces = [{ id: 1, nameTh: 'กรุงเทพมหานคร', region: { id: 7 } }];
            mockPrisma.province.findMany.mockResolvedValue(provinces);

            const result = await service.findAll();

            expect(result).toEqual(provinces);
            expect(mockPrisma.province.findMany).toHaveBeenCalledWith({
                where: undefined,
                include: { region: true },
                orderBy: { nameTh: 'asc' },
            });
        });

        it('should only return provinces that have constituencies in the given election', async () => {
            mockPrisma.province.findMany.mockResolvedValue([]);

            await service.findAll(1);

            expect(mockPrisma.province.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: { constituencies: { some: { electionId: 1 } } },
                }),
            );
        });
    });
});
