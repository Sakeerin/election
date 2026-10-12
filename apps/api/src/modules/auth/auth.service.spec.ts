import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { PrismaService } from '../../common/prisma/prisma.service';

const mockPrisma = {
    user: {
        findUnique: jest.fn(),
    },
};

const mockJwt = {
    sign: jest.fn().mockReturnValue('mock-token'),
};

const mockUser = {
    id: 1,
    username: 'admin',
    displayName: 'Admin User',
    role: 'SUPER_ADMIN',
    isActive: true,
    passwordHash: '',
    createdAt: new Date(),
    updatedAt: new Date(),
};

describe('AuthService', () => {
    let service: AuthService;

    beforeEach(async () => {
        mockUser.passwordHash = await bcrypt.hash('password123', 10);

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthService,
                { provide: PrismaService, useValue: mockPrisma },
                { provide: JwtService, useValue: mockJwt },
            ],
        }).compile();

        service = module.get<AuthService>(AuthService);
        jest.clearAllMocks();
    });

    describe('login', () => {
        it('should return accessToken and user on valid credentials', async () => {
            mockPrisma.user.findUnique.mockResolvedValue(mockUser);
            mockJwt.sign.mockReturnValue('signed-token');

            const result = await service.login({ username: 'admin', password: 'password123' });

            expect(result.accessToken).toBe('signed-token');
            expect(result.user.username).toBe('admin');
            expect(result.user).not.toHaveProperty('passwordHash');
        });

        it('should throw UnauthorizedException for unknown user', async () => {
            mockPrisma.user.findUnique.mockResolvedValue(null);

            await expect(service.login({ username: 'ghost', password: 'x' }))
                .rejects.toThrow(UnauthorizedException);
        });

        it('should throw UnauthorizedException for inactive user', async () => {
            mockPrisma.user.findUnique.mockResolvedValue({ ...mockUser, isActive: false });

            await expect(service.login({ username: 'admin', password: 'password123' }))
                .rejects.toThrow(UnauthorizedException);
        });

        it('should throw UnauthorizedException for wrong password', async () => {
            mockPrisma.user.findUnique.mockResolvedValue(mockUser);

            await expect(service.login({ username: 'admin', password: 'wrong' }))
                .rejects.toThrow(UnauthorizedException);
        });
    });

    describe('getProfile', () => {
        it('should return user profile for valid id', async () => {
            const profileUser = { id: 1, username: 'admin', displayName: 'Admin', role: 'SUPER_ADMIN', isActive: true, createdAt: new Date() };
            mockPrisma.user.findUnique.mockResolvedValue(profileUser);

            const result = await service.getProfile(1);

            expect(result.username).toBe('admin');
        });

        it('should throw UnauthorizedException for nonexistent user', async () => {
            mockPrisma.user.findUnique.mockResolvedValue(null);

            await expect(service.getProfile(999)).rejects.toThrow(UnauthorizedException);
        });
    });
});
