import {navigationRef} from '../navigators/navigationUtilities';

export type NotificationNavigationData = {
  type?: unknown;
  action_type?: unknown;
  action_id?: unknown;
  conversation_id?: unknown;
};

const numericId = (value: unknown): number | null => {
  const id = Number(value);
  return Number.isFinite(id) && id > 0 ? id : null;
};

const COMPLETED_JOB_TYPES = new Set([
  'job_completed',
  'payment_succeeded',
  'payment_processing',
  'payment_failed',
  'payment_cancelled',
  'review_received',
]);

export const openNotificationDestination = (
  data: NotificationNavigationData,
  attempt = 0,
): void => {
  if (!navigationRef.isReady()) {
    if (attempt < 20) {
      setTimeout(() => openNotificationDestination(data, attempt + 1), 250);
    }
    return;
  }

  const type = String(data.type ?? '');
  const actionType = String(data.action_type ?? '');
  const actionId = numericId(data.action_id);
  const conversationId = numericId(data.conversation_id) ?? actionId;

  if ((type === 'chat_message' || actionType === 'conversation') && conversationId) {
    navigationRef.navigate('ChatDetail', {conversationId});
    return;
  }

  if (actionType === 'project' && actionId) {
    navigationRef.navigate('JobDetail', {
      id: actionId,
      from: COMPLETED_JOB_TYPES.has(type) ? 'CompleteJob' : 'ActiveJob',
    });
    return;
  }

  navigationRef.navigate('Notification');
};
