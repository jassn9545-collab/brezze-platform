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
  return {
    notifications: response.data.data.notifications ?? [],
    unread_count: Number(response.data.data.unread_count ?? 0),
  };
};

export const markNotificationRead = async (notificationId: number) => {
  await api.post(`${URLs.getUserNotifications}/${notificationId}/read`);
};

export const markAllNotificationsRead = async () => {
  await api.post(`${URLs.getUserNotifications}/read-all`);
};
