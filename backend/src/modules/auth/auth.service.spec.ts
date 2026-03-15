import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PrismaService } from '../../common/prisma/prisma.service';
import { RedisService } from '../../common/redis/redis.service';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: PrismaService;

  const mockPrisma = {
    user: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  };

  const mockJwt = {
    sign: jest.fn(() => 'token'),
    verify: jest.fn(),
  };

  const mockConfig = {
    get: jest.fn((key: string) => (key === 'JWT_ACCESS_EXPIRES_IN' ? '15m' : '7d')),
  };

  const mockRedis = {};

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: JwtService, useValue: mockJwt },
        { provide: ConfigService, useValue: mockConfig },
        { provide: RedisService, useValue: mockRedis },
      ],
    }).compile();
    service = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('signUp', () => {
    it('should throw ConflictException if email exists', async () => {
      mockPrisma.user.findFirst.mockResolvedValue({ id: '1', email: 'a@b.com' });
      await expect(
        service.signUp({ email: 'a@b.com', password: 'Pass123!', name: 'Test' }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('login', () => {
    it('should throw UnauthorizedException if user not found', async () => {
      mockPrisma.user.findFirst.mockResolvedValue(null);
      await expect(
        service.login({ email: 'a@b.com', password: 'Pass123!' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
