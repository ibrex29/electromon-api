import { NotificationPriority, NotificationType } from '@electromon/shared';

export type NotificationCopy = {
  title: string;
  body: string;
  priority: NotificationPriority;
  route: string;
};

export function buildNotificationCopy(
  type: NotificationType,
  scopeName?: string,
  options?: { urgent?: boolean },
): NotificationCopy {
  const name = scopeName?.trim() || 'a polling unit';

  switch (type) {
    case NotificationType.RESULT_SUBMITTED:
      return {
        title: 'New PU result submitted',
        body: `${name} submitted results for review.`,
        priority: NotificationPriority.HIGH,
        route: 'ward.resultDetail',
      };
    case NotificationType.RESULT_APPROVED:
      return {
        title: 'Result approved',
        body: 'Your polling unit result was approved.',
        priority: NotificationPriority.HIGH,
        route: 'agent.resultStatus',
      };
    case NotificationType.RESULT_RETURNED:
      return {
        title: 'Result returned for correction',
        body: `${name} was returned. Open the app to see the reason.`,
        priority: NotificationPriority.HIGH,
        route: 'agent.resultStatus',
      };
    case NotificationType.WARD_RETURNED_BY_LGA:
      return {
        title: 'Ward rollup returned',
        body: 'LGA returned your ward totals.',
        priority: NotificationPriority.HIGH,
        route: 'ward.rollup',
      };
    case NotificationType.WARD_FORWARDED_TO_LGA:
      return {
        title: 'Ward rollup submitted',
        body: `${name} was forwarded for LGA review.`,
        priority: NotificationPriority.NORMAL,
        route: 'lga.wardRollup',
      };
    case NotificationType.INCIDENT_REPORTED:
      return {
        title: 'New incident reported',
        body: `An incident was reported at ${name}.`,
        priority: options?.urgent ? NotificationPriority.HIGH : NotificationPriority.NORMAL,
        route: 'ward.incidentDetail',
      };
    case NotificationType.INCIDENT_RESOLVED:
      return {
        title: 'Incident resolved',
        body: 'Your incident report was marked resolved.',
        priority: NotificationPriority.NORMAL,
        route: 'agent.incidentDetail',
      };
    case NotificationType.INCIDENT_ESCALATED:
      return {
        title: 'Incident escalated',
        body: `An incident at ${name} was escalated to LGA.`,
        priority: NotificationPriority.HIGH,
        route: 'lga.incidentDetail',
      };
    case NotificationType.SITUATION_UPDATE:
      return {
        title: 'Situation room update',
        body: `A situation update was posted at ${name}.`,
        priority: options?.urgent ? NotificationPriority.HIGH : NotificationPriority.NORMAL,
        route: 'ward.dashboard',
      };
  }
}
