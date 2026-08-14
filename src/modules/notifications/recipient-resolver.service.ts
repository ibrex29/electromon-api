import { Injectable, Logger } from '@nestjs/common';
import { CampaignRole, ScopeType } from '@electromon/shared';
import { PrismaService } from '../../common/prisma/prisma.service';
import { ScopeResolverService } from '../../common/collation/scope-resolver.service';
import {
  NotificationDispatchPayload,
  ResolvedRecipient,
} from './notification.events';

const WARD_ROLES: CampaignRole[] = [
  CampaignRole.WARD_RA_OFFICER,
  CampaignRole.WARD_COORDINATOR,
];

const PU_ROLES: CampaignRole[] = [
  CampaignRole.POLLING_AGENT,
  CampaignRole.POLLING_UNIT_OFFICER,
];

const LGA_ROLES: CampaignRole[] = [
  CampaignRole.LGA_COLLATION_OFFICER,
  CampaignRole.LGA_COORDINATOR,
];

@Injectable()
export class RecipientResolverService {
  private readonly logger = new Logger(RecipientResolverService.name);

  constructor(
    private prisma: PrismaService,
    private scopeResolver: ScopeResolverService,
  ) {}

  async resolve(payload: NotificationDispatchPayload): Promise<ResolvedRecipient[]> {
    const actorId = payload.actorUserId;
    const recipients = await this.resolveRaw(payload);
    const unique = new Map<string, ResolvedRecipient>();
    for (const recipient of recipients) {
      if (recipient.userId === actorId) continue;
      const existing = unique.get(recipient.userId);
      if (!existing || (recipient.sendPush && !existing.sendPush)) {
        unique.set(recipient.userId, recipient);
      }
    }
    if (unique.size === 0) {
      this.logger.warn(
        { type: payload.type, entityId: payload.entityId, campaignId: payload.campaignId },
        'No notification recipients resolved',
      );
    }
    return [...unique.values()];
  }

  async resolveScopeLabel(payload: NotificationDispatchPayload): Promise<string | undefined> {
    if (payload.scopeName) return payload.scopeName;
    if (payload.collationResult) {
      return this.scopeResolver.resolveScopeName(
        payload.collationResult.scopeType as ScopeType,
        payload.collationResult.scopeId,
      );
    }
    if (payload.fieldReport?.pollingUnitId) {
      return this.scopeResolver.resolveScopeName(
        ScopeType.POLLING_UNIT,
        payload.fieldReport.pollingUnitId,
      );
    }
    if (payload.fieldReport?.wardId) {
      return this.scopeResolver.resolveScopeName(ScopeType.WARD, payload.fieldReport.wardId);
    }
    if (payload.situationUpdate?.pollingUnitId) {
      return this.scopeResolver.resolveScopeName(
        ScopeType.POLLING_UNIT,
        payload.situationUpdate.pollingUnitId,
      );
    }
    return undefined;
  }

  private async resolveRaw(payload: NotificationDispatchPayload): Promise<ResolvedRecipient[]> {
    switch (payload.type) {
      case 'RESULT_SUBMITTED':
        return this.wardOfficersForCollation(payload, payload.sendPush);
      case 'RESULT_APPROVED':
      case 'RESULT_RETURNED':
        return this.puAgentForCollation(payload, payload.sendPush);
      case 'WARD_RETURNED_BY_LGA':
        return this.wardOfficersForCollation(payload, payload.sendPush);
      case 'WARD_FORWARDED_TO_LGA':
        return this.lgaOfficersForCollation(payload, false);
      case 'INCIDENT_REPORTED':
        return this.incidentReportedRecipients(payload);
      case 'INCIDENT_RESOLVED':
        return payload.fieldReport?.reportedById
          ? [{ userId: payload.fieldReport.reportedById, sendPush: payload.sendPush }]
          : [];
      case 'INCIDENT_ESCALATED':
        return this.lgaOfficersForIncident(payload, false);
      case 'SITUATION_UPDATE':
        return this.wardOfficersForSituation(payload, payload.sendPush);
      default:
        return [];
    }
  }

  async findUsersByRoleAndScope(
    campaignId: string,
    roles: CampaignRole[],
    scopeType: ScopeType,
    scopeId: string,
  ): Promise<string[]> {
    const rows = await this.prisma.campaignMembership.findMany({
      where: {
        campaignId,
        isActive: true,
        role: { in: roles },
        scopeType,
        scopeId,
      },
      select: { userId: true },
    });
    return rows.map((row) => row.userId);
  }

  private async wardOfficersForCollation(
    payload: NotificationDispatchPayload,
    sendPush: boolean,
  ): Promise<ResolvedRecipient[]> {
    const wardId = await this.resolveWardId(payload);
    if (!wardId) return [];
    const userIds = await this.findUsersByRoleAndScope(
      payload.campaignId,
      WARD_ROLES,
      ScopeType.WARD,
      wardId,
    );
    return userIds.map((userId) => ({ userId, sendPush }));
  }

  private async puAgentForCollation(
    payload: NotificationDispatchPayload,
    sendPush: boolean,
  ): Promise<ResolvedRecipient[]> {
    const submittedById = payload.collationResult?.submittedById;
    if (submittedById) {
      return [{ userId: submittedById, sendPush }];
    }
    const scopeId = payload.collationResult?.scopeId;
    if (!scopeId) return [];
    const userIds = await this.findUsersByRoleAndScope(
      payload.campaignId,
      PU_ROLES,
      ScopeType.POLLING_UNIT,
      scopeId,
    );
    return userIds.map((userId) => ({ userId, sendPush }));
  }

  private async lgaOfficersForCollation(
    payload: NotificationDispatchPayload,
    sendPush: boolean,
  ): Promise<ResolvedRecipient[]> {
    const lgaId = await this.resolveLgaId(payload);
    if (!lgaId) return [];
    const userIds = await this.findUsersByRoleAndScope(
      payload.campaignId,
      LGA_ROLES,
      ScopeType.LGA,
      lgaId,
    );
    return userIds.map((userId) => ({ userId, sendPush }));
  }

  private async incidentReportedRecipients(
    payload: NotificationDispatchPayload,
  ): Promise<ResolvedRecipient[]> {
    const wardId = payload.fieldReport?.wardId ?? (await this.wardIdFromPollingUnit(payload.fieldReport?.pollingUnitId));
    const recipients: ResolvedRecipient[] = [];
    if (wardId) {
      const wardOfficers = await this.findUsersByRoleAndScope(
        payload.campaignId,
        WARD_ROLES,
        ScopeType.WARD,
        wardId,
      );
      recipients.push(...wardOfficers.map((userId) => ({ userId, sendPush: payload.sendPush })));
    }

    const urgent = payload.fieldReport?.isUrgent === true;
    if (urgent) {
      const lgaRecipients = await this.lgaOfficersForIncident(payload, false);
      recipients.push(...lgaRecipients);
    }
    return recipients;
  }

  private async lgaOfficersForIncident(
    payload: NotificationDispatchPayload,
    sendPush: boolean,
  ): Promise<ResolvedRecipient[]> {
    const wardId = payload.fieldReport?.wardId ?? (await this.wardIdFromPollingUnit(payload.fieldReport?.pollingUnitId));
    if (!wardId) return [];
    const ward = await this.prisma.ward.findUnique({
      where: { id: wardId },
      select: { lgaId: true },
    });
    if (!ward?.lgaId) return [];
    const userIds = await this.findUsersByRoleAndScope(
      payload.campaignId,
      LGA_ROLES,
      ScopeType.LGA,
      ward.lgaId,
    );
    return userIds.map((userId) => ({ userId, sendPush }));
  }

  private async wardOfficersForSituation(
    payload: NotificationDispatchPayload,
    sendPush: boolean,
  ): Promise<ResolvedRecipient[]> {
    const wardId = await this.wardIdFromPollingUnit(payload.situationUpdate?.pollingUnitId);
    if (!wardId) return [];
    const userIds = await this.findUsersByRoleAndScope(
      payload.campaignId,
      WARD_ROLES,
      ScopeType.WARD,
      wardId,
    );
    return userIds.map((userId) => ({ userId, sendPush }));
  }

  private async resolveWardId(payload: NotificationDispatchPayload): Promise<string | undefined> {
    const result = payload.collationResult;
    if (!result) return payload.fieldReport?.wardId ?? undefined;
    if (result.scopeType === ScopeType.WARD) return result.scopeId;
    if (result.scopeType === ScopeType.POLLING_UNIT) {
      return this.wardIdFromPollingUnit(result.scopeId);
    }
    return undefined;
  }

  private async resolveLgaId(payload: NotificationDispatchPayload): Promise<string | undefined> {
    const result = payload.collationResult;
    if (!result) return undefined;
    if (result.scopeType === ScopeType.LGA) return result.scopeId;
    try {
      const chain = await this.scopeResolver.resolveScopeChain(
        result.scopeType as ScopeType,
        result.scopeId,
      );
      return chain.lga?.id;
    } catch {
      return undefined;
    }
  }

  private async wardIdFromPollingUnit(pollingUnitId?: string | null): Promise<string | undefined> {
    if (!pollingUnitId) return undefined;
    const pu = await this.prisma.pollingUnit.findUnique({
      where: { id: pollingUnitId },
      select: { wardId: true },
    });
    return pu?.wardId;
  }
}
