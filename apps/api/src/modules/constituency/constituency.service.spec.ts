import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ConstituencyService } from './constituency.service';
import { PrismaService } from '../../common/prisma/prisma.service';
import { RedisService } from '../../common/redis/redis.service';
import { ElectionGateway } from '../../gateways/election.gateway';
import { SummaryService } from '../summary/summary.service';

const mockConstituency = { id: 5, electionId: 2, provinceId: 1, constituencyNumber: 3 };

const mockPrisma = {
    constituency: {
        findUnique: jest.fn(),
        update: jest.fn(),
    },
};

const mockRedis = {
    invalidatePattern: jest.fn(),
};

const mockGateway = {
    broadcastCountingProgress: jest.fn(),
};

const mockSummary = {
    getCountingProgress: jest.fn(),
};

describe('ConstituencyService', () => {
    let service: ConstituencyService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ConstituencyService,
                { provide: PrismaService, useValue: mockPrisma },
                { provide: RedisService, useValue: mockRedis },
                { provide: ElectionGateway, useValue: mockGateway },
                { provide: SummaryService, useValue: mockSummary },
            ],
        }).compile();

        service = module.get<ConstituencyService>(ConstituencyService);
        jest.clearAllMocks();

        mockPrisma.constituency.findUnique.mockResolvedValue(mockConstituency);
        mockPrisma.constituency.update.mockResolvedValue({ ...mockConstituency, countingProgress: 60 });
        mockRedis.invalidatePattern.mockResolvedValue(undefined);
        mockSummary.getCountingProgress.mockResolvedValue({
            totalConstituencies: 400,
            totalCounted: 12,
            percentage: 41.25,
        });
    });

    describe('update', () => {
        it('should throw NotFoundException when constituency not found', async () => {
            mockPrisma.constituency.findUnique.mockResolvedValue(null);

            await expect(service.update(999, { countingProgress: 10 })).rejects.toThrow(NotFoundException);
            expect(mockRedis.invalidatePattern).not.toHaveBeenCalled();
        });

        it('should invalidate the election summary cache and broadcast fresh progress', async () => {
            await service.update(5, { countingProgress: 60 });

            expect(mockRedis.invalidatePattern).toHaveBeenCalledWith('summary:*:2');
            expect(mockSummary.getCountingProgress).toHaveBeenCalledWith(2);
            expect(mockGateway.broadcastCountingProgress).toHaveBeenCalledWith({
                totalCounted: 12,
                percentage: 41.25,
            });
            // Progress must be recomputed AFTER the stale cache entry is cleared
            expect(mockRedis.invalidatePattern.mock.invocationCallOrder[0]).toBeLessThan(
                mockSummary.getCountingProgress.mock.invocationCallOrder[0],
            );
        });

        it('should broadcast progress when only the status changes', async () => {
            await service.update(5, { status: 'COMPLETED' });

            expect(mockGateway.broadcastCountingProgress).toHaveBeenCalledTimes(1);
        });

        it('should invalidate the cache but not broadcast progress for unrelated fields', async () => {
            await service.update(5, { eligibleVoters: 120000 });

            expect(mockRedis.invalidatePattern).toHaveBeenCalledWith('summary:*:2');
            expect(mockSummary.getCountingProgress).not.toHaveBeenCalled();
            expect(mockGateway.broadcastCountingProgress).not.toHaveBeenCalled();
        });

        it('should still return the update when the progress broadcast fails', async () => {
            mockSummary.getCountingProgress.mockRejectedValue(new Error('redis down'));

            const result = await service.update(5, { countingProgress: 60 });

            expect(result).toEqual({ ...mockConstituency, countingProgress: 60 });
            expect(mockGateway.broadcastCountingProgress).not.toHaveBeenCalled();
        });
    });
});
