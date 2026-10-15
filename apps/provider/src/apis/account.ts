import api from './api';
import URLs from '../config/urls';

export type AppNotification = {
  id: number;
  title: string;
  message: string;
  type: string;
  action_type: string | null;
  action_id: number | null;
  is_read: boolean;
  created_at: string;
};

export type NotificationFeed = {
  notifications: AppNotification[];
  unread_count: number;
};

export type SupportRequestParams = {
  name: string;
  email: string;
  country_code?: string;
  phone: string;
  message: string;
};

export const submitSupportRequest = async (params: SupportRequestParams) => {
  const response = await api.post(URLs.supportRequests, params);
  return response.data.data;
};

export const getNotificationFeed = async (): Promise<NotificationFeed> => {
  const response = await api.get(URLs.getUserNotifications);
  const notifications: AppNotification[] = response.data.data.notifications ?? [];
  const bellNotifications = notifications.filter(
    notification =>
      notification.type !== 'chat_message' &&
      notification.action_type !== 'conversation',
  );

  return {
    notifications: bellNotifications,
    unread_count: bellNotifications.filter(notification => !notification.is_read).length,
  };
};

export const markNotificationRead = async (notificationId: number) => {
  await api.post(`${URLs.getUserNotifications}/${notificationId}/read`);
};

export const markAllNotificationsRead = async () => {
  await api.post(`${URLs.getUserNotifications}/read-all`);
};
