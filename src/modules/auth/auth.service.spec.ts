import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../../common/prisma/prisma.service';
import { createMockPrismaService } from '../../../test/helpers/prisma.mock';
import {
  TEST_PASSWORD,
  testUserRecord,
  TEST_CAMPAIGN_ID,
} from '../../../test/helpers/fixtures';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: ReturnType<typeof createMockPrismaService>;
  let jwtService: JwtService;

  beforeEach(async () => {
    prisma = createMockPrismaService();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('signed-access-token'),
          },
        },
      ],
    }).compile();

    service = module.get(AuthService);
    jwtService = module.get(JwtService);
    process.env.JWT_ACCESS_SECRET = 'test-secret';
  });

  describe('validateUser', () => {
    it('returns user when credentials are valid', async () => {
      prisma.user.findUnique.mockResolvedValue(testUserRecord);

      const user = await service.validateUser('director@electromon.ng', TEST_PASSWORD);

      expect(user.email).toBe('director@electromon.ng');
    });

    it('throws when user is not found', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(service.validateUser('missing@example.com', TEST_PASSWORD)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('throws when password is invalid', async () => {
      prisma.user.findUnique.mockResolvedValue(testUserRecord);

      await expect(
        service.validateUser('director@electromon.ng', 'wrong-password'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('login', () => {
    it('returns tokens and user profile on success', async () => {
      prisma.user.findUnique.mockResolvedValue(testUserRecord);
      prisma.refreshToken.create.mockResolvedValue({ id: 'rt-1' });
      prisma.activityLog.create.mockResolvedValue({ id: 'log-1' });

      const result = await service.login({
        email: 'director@electromon.ng',
        password: TEST_PASSWORD,
      });

      expect(result.accessToken).toBe('signed-access-token');
      expect(result.refreshToken).toBeDefined();
      expect(result.user.campaignId).toBe(TEST_CAMPAIGN_ID);
      expect(jwtService.sign).toHaveBeenCalled();
      expect(prisma.refreshToken.create).toHaveBeenCalled();
    });
  });
});
