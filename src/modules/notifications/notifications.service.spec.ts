import { Test, TestingModule } from '@nestjs/testing';
import { NotificationPriority, NotificationType, ScopeType } from '@electromon/shared';
import { PrismaService } from '../../common/prisma/prisma.service';
import { createMockPrismaService } from '../../../test/helpers/prisma.mock';
import { TEST_CAMPAIGN_ID } from '../../../test/helpers/fixtures';
import { FcmService } from './fcm.service';
import { NotificationsService } from './notifications.service';
import { RecipientResolverService } from './recipient-resolver.service';
import { NotificationDispatchPayload } from './notification.events';

describe('NotificationsService', () => {
  let service: NotificationsService;
  let prisma: ReturnType<typeof createMockPrismaService>;
  let fcm: { send: jest.Mock; tokensForUsers: jest.Mock };
  let recipients: { resolve: jest.Mock; resolveScopeLabel: jest.Mock };

  beforeEach(async () => {
    prisma = createMockPrismaService();
    fcm = {
      send: jest.fn().mockResolvedValue(undefined),
      tokensForUsers: jest.fn().mockResolvedValue([{ userId: 'ward-1', token: 'tok-1', platform: 'ANDROID' }]),
    };
    recipients = {
      resolve: jest.fn().mockResolvedValue([{ userId: 'ward-1', sendPush: true }]),
      resolveScopeLabel: jest.fn().mockResolvedValue('Kargi PU'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        { provide: PrismaService, useValue: prisma },
        { provide: RecipientResolverService, useValue: recipients },
        { provide: FcmService, useValue: fcm },
      ],
    }).compile();

    service = module.get(NotificationsService);
  });

  const payload: NotificationDispatchPayload = {
    type: NotificationType.RESULT_SUBMITTED,
    campaignId: TEST_CAMPAIGN_ID,
    actorUserId: 'agent-1',
    entityType: 'COLLATION_RESULT',
    entityId: 'result-1',
    sourceEventId: 'log-1',
    sendPush: true,
    collationResult: {
      level: 'POLLING_UNIT',
      scopeType: ScopeType.POLLING_UNIT,
      scopeId: 'pu-1',
      submittedById: 'agent-1',
    },
  };

  it('persists an inbox row then sends FCM without vote figures in the copy', async () => {
    prisma.notification.create.mockResolvedValue({ id: 'n-1' });

    await service.dispatch(payload);

    expect(prisma.notification.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          recipientUserId: 'ward-1',
          title: 'New PU result submitted',
          body: 'Kargi PU submitted results for review.',
          priority: NotificationPriority.HIGH,
        }),
      }),
    );
    const created = prisma.notification.create.mock.calls[0][0].data;
    expect(JSON.stringify(created)).not.toMatch(/votes|accredited|registered/i);
    expect(fcm.send).toHaveBeenCalledWith(
      expect.objectContaining({
        tokens: ['tok-1'],
        title: 'New PU result submitted',
      }),
    );
  });

  it('swallows unique-constraint duplicates', async () => {
    prisma.notification.create.mockRejectedValue({ code: 'P2002' });

    await expect(service.dispatch(payload)).resolves.toEqual([]);
    expect(fcm.send).not.toHaveBeenCalled();
  });
});
