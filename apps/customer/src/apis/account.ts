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

export type PrivacyPolicy = {
  updated_at: string;
  title: string;
  intro: string;
  sections: Array<{ title: string; paragraphs: string[] }>;
  rights: Array<{ title: string; description: string }>;
  contact_email: string;
};

export type SupportRequestParams = {
  name: string;
  email: string;
  country_code?: string;
  phone: string;
  message: string;
};

export const getNotificationFeed = async (): Promise<NotificationFeed> => {
  const response = await api.get(URLs.getUserNotifications);
  return {
    notifications: response.data.data.notifications ?? [],
    unread_count: Number(response.data.data.unread_count ?? 0),
  };
};

export const getNotifications = async (): Promise<AppNotification[]> =>
  (await getNotificationFeed()).notifications;

export const markNotificationRead = async (notificationId: number) => {
  await api.post(`${URLs.getUserNotifications}/${notificationId}/read`);
};

export const markAllNotificationsRead = async () => {
  await api.post(`${URLs.getUserNotifications}/read-all`);
};

export const getPrivacyPolicy = async (): Promise<PrivacyPolicy> => {
  const response = await api.get(URLs.privacyPolicy);
  return response.data.data;
};

export const submitSupportRequest = async (params: SupportRequestParams) => {
  const response = await api.post(URLs.supportRequests, params);
  return response.data.data;
};

export const updateAccountPassword = async (
  currentPassword: string,
  newPassword: string,
  confirmation: string,
) => {
  const response = await api.post(URLs.updateAccountPassword, {
    current_password: currentPassword,
    new_password: newPassword,
    new_password_confirmation: confirmation,
  });
  return response.data.data;
};
