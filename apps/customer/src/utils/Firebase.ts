import {getApp} from '@react-native-firebase/app';
import {
  AuthorizationStatus,
  getMessaging,
  getToken,
  onMessage,
  onTokenRefresh,
  registerDeviceForRemoteMessages,
  requestPermission,
} from '@react-native-firebase/messaging';
import {PermissionsAndroid, Platform} from 'react-native';
import api from '../apis/api';

const registerToken = async (token: string) => {
  await api.post('/devices', {token, platform: Platform.OS, app_type: 'customer'});
};

export const startFirebaseNotifications = async () => {
  try {
    const messaging = getMessaging(getApp());
    if (Platform.OS === 'android' && Platform.Version >= 33) {
      await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
    }
    await registerDeviceForRemoteMessages(messaging);
    const permission = await requestPermission(messaging);
    const allowed = permission === AuthorizationStatus.AUTHORIZED
      || permission === AuthorizationStatus.PROVISIONAL;
    if (!allowed && Platform.OS === 'ios') return () => undefined;

    await registerToken(await getToken(messaging));
    const unsubscribeRefresh = onTokenRefresh(messaging, token => {
      registerToken(token).catch(() => undefined);
    });
    const unsubscribeMessage = onMessage(messaging, message => {
      const title = message.notification?.title ?? 'Our Bezzie Provider';
      const body = message.notification?.body;
      toast.show(body ? `${title}: ${body}` : title, {type: 'normal'});
    });

    return () => {
      unsubscribeRefresh();
      unsubscribeMessage();
    };
  } catch (error) {
    if (__DEV__) console.warn('Firebase notification setup failed', error);
    return () => undefined;
  }
};

export const unregisterFirebaseDevice = async () => {
  try {
    const token = await getToken(getMessaging(getApp()));
    await api.delete('/devices', {data: {token}});
  } catch {
    // Logout must still succeed when Firebase has not been configured.
  }
};

// import notifee, {
//   AndroidImportance,
//   AndroidStyle,
//   AndroidVisibility,
//   Notification,
//   NotificationAndroid,
//   NotificationIOS,
// } from '@notifee/react-native';

// import {FirebaseMessagingTypes} from '@react-native-firebase/messaging';
// import {Platform} from 'react-native';
// import {AnyObject} from 'yup';

// export async function requestPermission() {
//   await notifee.requestPermission({
//     alert: true,
//     badge: true,
//     sound: true,
//     carPlay: true,
//     announcement: true,
//   });
// }

// const iosDefault: NotificationIOS = {
//   interruptionLevel: 'timeSensitive',
//   badgeCount: 0,
// };

// const androidDefault: NotificationAndroid = {
//   channelId: 'local',
//   lightUpScreen: true,
//   badgeCount: 0,
//   importance: AndroidImportance.HIGH,
//   visibility: AndroidVisibility.PUBLIC,
// };

// export async function createChannels() {
//   const channelId = await notifee.createChannel({
//     id: 'local',
//     name: 'Gandharva Notification Channel',
//     badge: true,
//     lights: true,
//     bypassDnd: true,
//     importance: AndroidImportance.HIGH,
//     visibility: AndroidVisibility.PUBLIC,
//   });
//   return channelId;
// }

// export async function onMessageReceived(
//   message: FirebaseMessagingTypes.RemoteMessage,
// ) {
//   console.log(
//     Platform.OS,
//     'New Notification Message: ',
//     JSON.stringify(message),
//   );
//   const data = message.data;
//   // MARK: - Notifee data is exist
//   if (data?.notifee) {
//     let notifeeData =
//       typeof data?.notifee === 'object'
//         ? data?.notifee
//         : JSON.parse(data?.notifee);
//     notifee.displayNotification(notifeeData);
//     return;
//   }

//   // MARK: - Notifee data is not exist fallback to notification data
//   let {
//     title,
//     body,
//     image,
//     ios: firebaseIOS,
//     android: firebseAndroid,
//   } = message.notification ?? {};

//   // If no title and body message return
//   if (!title && !body) {
//     return;
//   }

//   if (
//     typeof data?.fcm_options === 'object' &&
//     (data.fcm_options as any).image
//   ) {
//     image = (data.fcm_options as any).image as string;
//   }

//   let ios = iosDefault;
//   if (image) {
//     ios.attachments = [{url: image}];
//   }
//   if (firebaseIOS) {
//     let {badge, sound, ...rest} = firebaseIOS;
//     ios = Object.assign({}, ios, rest);
//     if (badge) {
//       ios.badgeCount = Number(firebaseIOS.badge);
//     }
//     if (typeof sound === 'string') {
//       ios.sound = sound;
//     } else if (sound) {
//       ios.criticalVolume = sound.volume;
//       ios.critical = sound.critical;
//       ios.sound = sound.name;
//     }
//   }

//   let android = androidDefault;

//   if (firebseAndroid) {
//     let {visibility, imageUrl, count, priority, ...rest} = firebseAndroid;
//     android = Object.assign({}, android, rest);
//     if (imageUrl) {
//       android.largeIcon = imageUrl;
//       android.style = {
//         type: AndroidStyle.BIGPICTURE,
//         picture: imageUrl,
//       };
//     }
//     if (count) {
//       android.badgeCount = count;
//     }
//     if (priority) {
//       android.importance = (priority as number) + 2;
//     }
//     if (visibility) {
//       android.visibility = visibility as number;
//     }
//   }

//   const notification: Notification = {
//     id: message.messageId,
//     title: title,
//     subtitle: firebaseIOS?.subtitle,
//     body: body,
//     ios,
//     android,
//     data,
//   };
//   notifee.displayNotification(notification);
// }

// // export const onFCMTokenRefresh = async (firebaseToken: string) => {
// //   console.log('FCM Token (onTokenRefresh):', firebaseToken);

// //   const isAuthorized = await AsyncStorage.getItem('authorized');
// //   const token = await AsyncStorage.getItem('token');
// //   if (isAuthorized) {
// //     const response = await api({
// //       method: 'POST',
// //       url: URLs.refreshToken,
// //       headers: {
// //         'Content-Type': 'application/json',
// //         Authorization: `Bearer ${token}`,
// //       },
// //       data: {firebaseToken},
// //     });
// //     console.log('Firebase refreshToken api response:', response.data.status);
// //   }
// // };

// export const redirectionFunction = (data: AnyObject) => {
//   console.log('Notification redirection function', JSON.stringify(data));
//   switch (data.type) {
//     // case 'orderAcceptedByDriver':
//     //   navigationRef.navigate('BottomTab', {screen: 'Trips'});
//     //   break;
//     // case 'orderArrivedAtRestaurant':
//     //   navigationRef.navigate('BottomTab', {screen: 'Trips'});
//     //   break;
//     // case 'orderCancelled':
//     //   navigationRef.navigate('PastTripDetails', {tripId: data.orderId});
//     //   break;
//     // case 'scheduledOrderCancelled':
//     //   navigationRef.navigate('EnterAddress', {
//     //     data: {type: 'now'},
//     //   });
//       // break;
//   }
// };
