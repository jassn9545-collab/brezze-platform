import notifee, {AndroidImportance} from '@notifee/react-native';

export const createNotificationChannel = () =>
  notifee.createChannel({
    id: 'bezzie_updates',
    name: 'Our Bezzie updates',
    description: 'Job hire and work submission notifications',
    importance: AndroidImportance.HIGH,
    sound: 'default',
  });

export const displayForegroundNotification = async (
  title: string,
  body: string | undefined,
  data: Record<string, unknown> | undefined,
  messageId: string | undefined,
) => {
  const channelId = await createNotificationChannel();
  await notifee.displayNotification({
    id: messageId,
    title,
    body,
    data: Object.fromEntries(
      Object.entries(data ?? {}).map(([key, value]) => [key, String(value)]),
    ),
    android: {
      channelId,
      smallIcon: 'ic_notification',
      color: '#005AAA',
      pressAction: {id: 'default'},
      autoCancel: true,
    },
    ios: {
      sound: 'default',
      foregroundPresentationOptions: {banner: true, list: true, sound: true},
    },
  });
};
