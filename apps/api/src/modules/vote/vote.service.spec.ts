import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { VoteService } from './vote.service';
import { PrismaService } from '../../common/prisma/prisma.service';
import { RedisService } from '../../common/redis/redis.service';
import { ElectionGateway } from '../../gateways/election.gateway';
import { SummaryService } from '../summary/summary.service';

const mockConstituency = {
    id: 1,
    electionId: 1,
    candidates: [
        { id: 10, partyId: 100 },
        { id: 11, partyId: 101 },
    ],
};

const mockPrisma = {
    constituency: {
        findUnique: jest.fn(),
        update: jest.fn(),
    },
    constituencyResult: {
        updateMany: jest.fn(),
        upsert: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
    },
    partyListAllocation: {
        upsert: jest.fn(),
    },
    $transaction: jest.fn(),
};

const mockRedis = {
    invalidatePattern: jest.fn(),
    getJson: jest.fn(),
    setJson: jest.fn(),
};

const mockGateway = {
    broadcastVoteUpdated: jest.fn(),
    broadcastPartyUpdated: jest.fn(),
    broadcastCountingProgress: jest.fn(),
};

const mockSummary = {
    getCountingProgress: jest.fn(),
};

describe('VoteService', () => {
    let service: VoteService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                VoteService,
                { provide: PrismaService, useValue: mockPrisma },
                { provide: RedisService, useValue: mockRedis },
                { provide: ElectionGateway, useValue: mockGateway },
                { provide: SummaryService, useValue: mockSummary },
            ],
        }).compile();

        service = module.get<VoteService>(VoteService);
        jest.clearAllMocks();
    });

    describe('updateConstituencyVotes', () => {
        it('should throw BadRequestException when constituency not found', async () => {
            mockPrisma.constituency.findUnique.mockResolvedValue(null);

            await expect(
                service.updateConstituencyVotes({ constituencyId: 999, votes: [] }),
            ).rejects.toThrow(BadRequestException);
        });

        it('should update votes, broadcast and invalidate cache on success', async () => {
            mockPrisma.constituency.findUnique.mockResolvedValue(mockConstituency);

            const mockResults = [
                { id: 1, constituencyId: 1, candidateId: 10, partyId: 100, voteCount: 500, isLeading: true, isWinner: false, updatedAt: new Date() },
                { id: 2, constituencyId: 1, candidateId: 11, partyId: 101, voteCount: 300, isLeading: false, isWinner: false, updatedAt: new Date() },
            ];

            // Simulate $transaction executing the callback
            mockPrisma.$transaction.mockImplementation((fn: (tx: typeof mockPrisma) => Promise<unknown>) =>
                fn(mockPrisma),
            );
            mockPrisma.constituencyResult.updateMany.mockResolvedValue({ count: 2 });
            mockPrisma.constituencyResult.upsert.mockResolvedValue(mockResults[0]);
            mockPrisma.constituencyResult.findFirst.mockResolvedValue({ id: 1 });
            mockPrisma.constituencyResult.update.mockResolvedValue(mockResults[0]);
            mockPrisma.constituency.update.mockResolvedValue(mockConstituency);
            mockPrisma.constituencyResult.findMany.mockResolvedValue(mockResults);
            mockRedis.invalidatePattern.mockResolvedValue(undefined);

            const result = await service.updateConstituencyVotes({
                constituencyId: 1,
                votes: [
                    { candidateId: 10, voteCount: 500 },
                    { candidateId: 11, voteCount: 300 },
                ],
                countingProgress: 50,
            });

            expect(result).toEqual(mockResults);
            expect(mockGateway.broadcastVoteUpdated).toHaveBeenCalledTimes(1);
            expect(mockRedis.invalidatePattern).toHaveBeenCalledWith('summary:*:1');
        });

        it('should broadcast fresh counting progress after invalidating the cache', async () => {
            mockPrisma.constituency.findUnique.mockResolvedValue(mockConstituency);
            mockPrisma.$transaction.mockImplementation((fn: (tx: typeof mockPrisma) => Promise<unknown>) =>
                fn(mockPrisma),
            );
            mockPrisma.constituencyResult.updateMany.mockResolvedValue({ count: 0 });
            mockPrisma.constituencyResult.upsert.mockResolvedValue({});
            mockPrisma.constituencyResult.findFirst.mockResolvedValue(null);
            mockPrisma.constituency.update.mockResolvedValue(mockConstituency);
            mockPrisma.constituencyResult.findMany.mockResolvedValue([]);
            mockRedis.invalidatePattern.mockResolvedValue(undefined);
            mockSummary.getCountingProgress.mockResolvedValue({
                totalConstituencies: 33,
                totalCounted: 4,
                percentage: 27.5,
            });

            await service.updateConstituencyVotes({ constituencyId: 1, votes: [], countingProgress: 100 });

            expect(mockSummary.getCountingProgress).toHaveBeenCalledWith(1);
            expect(mockGateway.broadcastCountingProgress).toHaveBeenCalledWith({
                totalCounted: 4,
                percentage: 27.5,
            });
            // Progress must be recomputed AFTER the stale cache entry is cleared
            expect(mockRedis.invalidatePattern.mock.invocationCallOrder[0]).toBeLessThan(
                mockSummary.getCountingProgress.mock.invocationCallOrder[0],
            );
        });
    });

    describe('batchUpdateConstituencyVotes', () => {
        it('should report partial failures without throwing', async () => {
            mockPrisma.constituency.findUnique
                .mockResolvedValueOnce(mockConstituency)
                .mockResolvedValueOnce(null); // Second will fail

            mockPrisma.$transaction.mockImplementationOnce((fn: (tx: typeof mockPrisma) => Promise<unknown>) =>
                fn(mockPrisma),
            );
            mockPrisma.constituencyResult.updateMany.mockResolvedValue({ count: 0 });
            mockPrisma.constituencyResult.upsert.mockResolvedValue({});
            mockPrisma.constituencyResult.findFirst.mockResolvedValue(null);
            mockPrisma.constituency.update.mockResolvedValue({});
            mockPrisma.constituencyResult.findMany.mockResolvedValue([]);
            mockRedis.invalidatePattern.mockResolvedValue(undefined);

            const result = await service.batchUpdateConstituencyVotes({
                updates: [
                    { constituencyId: 1, votes: [] },
                    { constituencyId: 999, votes: [] },
                ],
            });

            expect(result.succeeded).toBe(1);
            expect(result.failed).toHaveLength(1);
            expect(result.failed[0].constituencyId).toBe(999);
        });
    });
});
