import {
  NotificationPriority,
  NotificationType,
} from '@electromon/shared';

export const NOTIFICATION_DISPATCH_EVENT = 'notification.dispatch';

export type NotificationEntityType = 'COLLATION_RESULT' | 'FIELD_REPORT' | 'SITUATION_UPDATE';

export type NotificationDispatchPayload = {
  type: NotificationType;
  campaignId: string;
  actorUserId: string;
  entityType: NotificationEntityType;
  entityId: string;
  sourceEventId: string;
  sendPush: boolean;
  scopeName?: string;
  collationResult?: {
    level: string;
    scopeType: string;
    scopeId: string;
    submittedById?: string | null;
  };
  fieldReport?: {
    wardId?: string | null;
    pollingUnitId?: string | null;
    reportedById: string;
    isUrgent: boolean;
    incidentSeverity?: string | null;
    status?: string | null;
  };
  situationUpdate?: {
    pollingUnitId: string;
    isUrgent: boolean;
    status?: string | null;
  };
};

export type ResolvedRecipient = {
  userId: string;
  sendPush: boolean;
  priority?: NotificationPriority;
};
