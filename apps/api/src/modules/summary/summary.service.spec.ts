import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { SummaryService } from './summary.service';
import { PrismaService } from '../../common/prisma/prisma.service';
import { RedisService } from '../../common/redis/redis.service';

const mockPrisma = {
    election: { findUnique: jest.fn() },
    referendum: { findMany: jest.fn() },
    partyListAllocation: { findMany: jest.fn() },
    constituencyResult: { groupBy: jest.fn() },
    party: { findMany: jest.fn() },
    constituency: { aggregate: jest.fn(), count: jest.fn() },
};

const mockRedis = {
    getJson: jest.fn(),
    setJson: jest.fn(),
    invalidatePattern: jest.fn(),
};

describe('SummaryService', () => {
    let service: SummaryService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                SummaryService,
                { provide: PrismaService, useValue: mockPrisma },
                { provide: RedisService, useValue: mockRedis },
            ],
        }).compile();

        service = module.get<SummaryService>(SummaryService);
        jest.clearAllMocks();
    });

    describe('getOverview', () => {
        it('should return cached data when available', async () => {
            const cached = { election: { id: 1 }, parties: [] };
            mockRedis.getJson.mockResolvedValue(cached);

            const result = await service.getOverview(1);
            expect(result).toEqual(cached);
            expect(mockPrisma.election.findUnique).not.toHaveBeenCalled();
        });

        it('should throw NotFoundException when election not found', async () => {
            mockRedis.getJson.mockResolvedValue(null);
            mockPrisma.election.findUnique.mockResolvedValue(null);

            await expect(service.getOverview(999)).rejects.toThrow(NotFoundException);
        });

        it('should build and cache overview when election exists', async () => {
            mockRedis.getJson.mockResolvedValue(null);
            mockRedis.setJson.mockResolvedValue(undefined);

            const election = {
                id: 1, name: 'Test Election', electionDate: new Date(), type: 'GENERAL',
                status: 'ACTIVE', hasReferendum: false, totalEligibleVoters: 1000,
                sections: [],
            };
            mockPrisma.election.findUnique.mockResolvedValue(election);

            // getPartyLeaderboard dependencies
            mockPrisma.partyListAllocation.findMany.mockResolvedValue([]);
            mockPrisma.constituencyResult.groupBy.mockResolvedValue([]);
            mockPrisma.party.findMany.mockResolvedValue([]);

            // getCountingProgress dependencies
            mockPrisma.constituency.aggregate.mockResolvedValue({ _avg: { countingProgress: 50 }, _count: { id: 400 } });
            mockPrisma.constituency.count.mockResolvedValue(200);

            const result = await service.getOverview(1) as { election: { id: number }; totalCounted: number };

            expect(result.election.id).toBe(1);
            expect(result.totalCounted).toBe(200);
            expect(mockRedis.setJson).toHaveBeenCalled();
        });
    });

    describe('getCountingProgress', () => {
        it('should use DB aggregate instead of loading all rows', async () => {
            mockRedis.getJson.mockResolvedValue(null);
            mockRedis.setJson.mockResolvedValue(undefined);
            mockPrisma.constituency.aggregate.mockResolvedValue({
                _avg: { countingProgress: 75.5 },
                _count: { id: 400 },
            });
            mockPrisma.constituency.count.mockResolvedValue(300);

            const result = await service.getCountingProgress(1) as { totalConstituencies: number; totalCounted: number; percentage: number };

            expect(result.totalConstituencies).toBe(400);
            expect(result.totalCounted).toBe(300);
            expect(result.percentage).toBe(75.5);
            // Verify we used aggregate, not findMany
            expect(mockPrisma.constituency.aggregate).toHaveBeenCalledTimes(1);
        });
    });

    describe('getPartyLeaderboard', () => {
        it('should only fetch parties that exist in the election (not all parties globally)', async () => {
            mockRedis.getJson.mockResolvedValue(null);
            mockRedis.setJson.mockResolvedValue(undefined);

            mockPrisma.partyListAllocation.findMany.mockResolvedValue([
                { partyId: 5, allocatedSeats: 10, party: { id: 5, nameTh: 'Party A' } },
            ]);
            mockPrisma.constituencyResult.groupBy
                .mockResolvedValueOnce([{ partyId: 5, _count: { id: 50 } }]) // constituency wins
                .mockResolvedValueOnce([{ partyId: 5, _sum: { voteCount: 100000 } }]); // total votes

            mockPrisma.party.findMany.mockResolvedValue([{ id: 5, nameTh: 'Party A', color: '#ff0000' }]);

            await service.getPartyLeaderboard(1);

            // Must filter by the specific party IDs found, not fetch all
            expect(mockPrisma.party.findMany).toHaveBeenCalledWith({
                where: { id: { in: [5] } },
            });
        });
    });
});
