import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Prisma } from '@electromon/db';
import type { JwtPayload } from '@electromon/shared';
import { PrismaService } from '../../common/prisma/prisma.service';
import { FcmService } from './fcm.service';
import { buildNotificationCopy } from './notification-copy';
import { NotificationDispatchPayload } from './notification.events';
import { RecipientResolverService } from './recipient-resolver.service';
import {
  ListNotificationsQueryDto,
  RegisterDeviceDto,
  UnregisterDeviceDto,
} from './dto/notifications.dto';

const DEFAULT_LIMIT = 30;
const MAX_LIMIT = 100;

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private prisma: PrismaService,
    private recipients: RecipientResolverService,
    private fcm: FcmService,
  ) {}

  async dispatch(payload: NotificationDispatchPayload) {
    const [resolved, scopeName] = await Promise.all([
      this.recipients.resolve(payload),
      this.recipients.resolveScopeLabel(payload),
    ]);
    if (resolved.length === 0) return [];

    const urgent =
      payload.fieldReport?.isUrgent === true || payload.situationUpdate?.isUrgent === true;
    const copy = buildNotificationCopy(payload.type, scopeName, { urgent });
    const deepLink = this.buildData(payload, copy.route);
    const createdIds: string[] = [];
    const pushUserIds: string[] = [];

    for (const recipient of resolved) {
      const priority = recipient.priority ?? copy.priority;
      try {
        const row = await this.prisma.notification.create({
          data: {
            campaignId: payload.campaignId,
            recipientUserId: recipient.userId,
            actorUserId: payload.actorUserId,
            type: payload.type,
            priority,
            title: copy.title,
            body: copy.body,
            entityType: payload.entityType,
            entityId: payload.entityId,
            sourceEventId: payload.sourceEventId,
            data: deepLink,
          },
        });
        createdIds.push(row.id);
        if (recipient.sendPush) {
          pushUserIds.push(recipient.userId);
        }
      } catch (error) {
        if (this.isUniqueViolation(error)) continue;
        this.logger.error({ err: error }, 'Failed to persist notification');
      }
    }

    if (pushUserIds.length > 0) {
      const tokens = await this.fcm.tokensForUsers(pushUserIds);
      if (tokens.length > 0) {
        const data: Record<string, string> = {};
        for (const [key, value] of Object.entries(deepLink)) {
          if (value != null) data[key] = String(value);
        }
        await this.fcm.send({
          tokens: tokens.map((item) => item.token),
          title: copy.title,
          body: copy.body,
          data,
          priority: copy.priority,
        });
      }
    }

    return createdIds;
  }

  async registerDevice(user: JwtPayload, dto: RegisterDeviceDto) {
    return this.prisma.deviceToken.upsert({
      where: { token: dto.token },
      create: {
        userId: user.sub,
        token: dto.token,
        platform: dto.platform,
        campaignId: user.campaignId ?? null,
        isActive: true,
        lastSeenAt: new Date(),
      },
      update: {
        userId: user.sub,
        platform: dto.platform,
        campaignId: user.campaignId ?? null,
        isActive: true,
        lastSeenAt: new Date(),
      },
    });
  }

  async unregisterDevice(user: JwtPayload, dto: UnregisterDeviceDto) {
    await this.prisma.deviceToken.updateMany({
      where: { token: dto.token, userId: user.sub },
      data: { isActive: false },
    });
    return { success: true };
  }

  async list(user: JwtPayload, query: ListNotificationsQueryDto) {
    if (!user.campaignId) {
      return { items: [], nextCursor: null };
    }
    const limit = Math.min(query.limit ?? DEFAULT_LIMIT, MAX_LIMIT);
    const where: Prisma.NotificationWhereInput = {
      recipientUserId: user.sub,
      campaignId: user.campaignId,
      ...(query.unreadOnly ? { readAt: null } : {}),
    };

    if (query.cursor) {
      const cursor = await this.prisma.notification.findFirst({
        where: { id: query.cursor, recipientUserId: user.sub },
      });
      if (cursor) {
        where.createdAt = { lt: cursor.createdAt };
      }
    }

    const rows = await this.prisma.notification.findMany({
      where,
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      take: limit + 1,
    });
    const hasMore = rows.length > limit;
    const items = hasMore ? rows.slice(0, limit) : rows;
    return {
      items: items.map((row) => this.toDto(row)),
      nextCursor: hasMore ? items[items.length - 1]?.id ?? null : null,
    };
  }

  async unreadCount(user: JwtPayload) {
    if (!user.campaignId) return { count: 0 };
    const count = await this.prisma.notification.count({
      where: {
        recipientUserId: user.sub,
        campaignId: user.campaignId,
        readAt: null,
      },
    });
    return { count };
  }

  async markRead(user: JwtPayload, id: string) {
    const existing = await this.prisma.notification.findFirst({
      where: { id, recipientUserId: user.sub },
    });
    if (!existing) throw new NotFoundException('Notification not found');
    const row = await this.prisma.notification.update({
      where: { id },
      data: { readAt: existing.readAt ?? new Date() },
    });
    return this.toDto(row);
  }

  async markAllRead(user: JwtPayload) {
    if (!user.campaignId) return { success: true, count: 0 };
    const result = await this.prisma.notification.updateMany({
      where: {
        recipientUserId: user.sub,
        campaignId: user.campaignId,
        readAt: null,
      },
      data: { readAt: new Date() },
    });
    return { success: true, count: result.count };
  }

  private buildData(payload: NotificationDispatchPayload, route: string): Record<string, string> {
    const collation = payload.collationResult;
    const field = payload.fieldReport;
    const situation = payload.situationUpdate;
    const pollingUnitId =
      collation?.scopeType === 'POLLING_UNIT'
        ? collation.scopeId
        : field?.pollingUnitId ?? situation?.pollingUnitId ?? '';
    const wardId =
      collation?.scopeType === 'WARD' ? collation.scopeId : field?.wardId ?? '';

    return {
      type: payload.type,
      campaignId: payload.campaignId,
      entityType: payload.entityType,
      entityId: payload.entityId,
      pollingUnitId,
      wardId,
      route,
    };
  }

  private toDto(row: {
    id: string;
    type: string;
    priority: string;
    title: string;
    body: string;
    entityType: string;
    entityId: string;
    data: Prisma.JsonValue;
    readAt: Date | null;
    createdAt: Date;
  }) {
    return {
      id: row.id,
      type: row.type,
      priority: row.priority,
      title: row.title,
      body: row.body,
      entityType: row.entityType,
      entityId: row.entityId,
      data: row.data,
      readAt: row.readAt,
      createdAt: row.createdAt,
    };
  }

  private isUniqueViolation(error: unknown) {
    return typeof error === 'object' && error !== null && 'code' in error && (error as { code: string }).code === 'P2002';
  }
}

export type { RegisterDeviceDto, UnregisterDeviceDto, ListNotificationsQueryDto };
