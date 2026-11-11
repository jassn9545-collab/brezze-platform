import {Platform} from 'react-native';
import notifee, {EventType} from '@notifee/react-native';
import {onMessage} from '@react-native-firebase/messaging';
import {startFirebaseNotifications} from '../src/utils/Firebase';
import {displayForegroundNotification} from '../src/utils/foregroundNotification';
import {openNotificationDestination} from '../src/utils/notificationNavigation';

jest.mock('@react-native-firebase/app', () => ({getApp: jest.fn(() => ({}))}));
jest.mock('@react-native-firebase/messaging', () => ({
  AuthorizationStatus: {AUTHORIZED: 1, PROVISIONAL: 2},
  getMessaging: jest.fn(() => ({})),
  registerDeviceForRemoteMessages: jest.fn(async () => undefined),
  requestPermission: jest.fn(async () => 1),
  getToken: jest.fn(async () => 'test-token'),
  onTokenRefresh: jest.fn(() => jest.fn()),
  onMessage: jest.fn(() => jest.fn()),
  onNotificationOpenedApp: jest.fn(() => jest.fn()),
  getInitialNotification: jest.fn(async () => null),
}));
jest.mock('@notifee/react-native', () => ({
  __esModule: true,
  default: {
    onForegroundEvent: jest.fn(() => jest.fn()),
    getInitialNotification: jest.fn(async () => null),
  },
  EventType: {PRESS: 1, DELIVERED: 3},
}));
jest.mock('../src/apis/api', () => ({post: jest.fn(async () => ({}))}));
jest.mock('../src/utils/foregroundNotification', () => ({
  createNotificationChannel: jest.fn(async () => 'bezzie_updates'),
  displayForegroundNotification: jest.fn(async () => undefined),
}));
jest.mock('../src/utils/notificationNavigation', () => ({
  openNotificationDestination: jest.fn(),
}));

const jobData = {type: 'job_in_progress', action_type: 'project', action_id: '24'};
let cleanup: () => void;

beforeEach(() => {
  jest.clearAllMocks();
});

afterEach(() => cleanup?.());

it.each(['job_in_progress', 'payment_succeeded', 'payment_failed', 'new_job'])(
  'shows a system notification with its job destination for %s', async type => {
  cleanup = await startFirebaseNotifications();
  const receive = jest.mocked(onMessage).mock.calls[0][1];
  const data = {...jobData, type};
  await receive({
    messageId: 'hire-24',
    notification: {title: 'You were hired', body: 'You have been hired for Repair the wall.'},
    data,
  });

  expect(displayForegroundNotification).toHaveBeenCalledWith(
    'You were hired',
    'You have been hired for Repair the wall.',
    data,
    'hire-24',
  );
  expect(openNotificationDestination).not.toHaveBeenCalled();
});

it('opens the hired job once when its system notification is tapped', async () => {
  cleanup = await startFirebaseNotifications();
  const receive = jest.mocked(notifee.onForegroundEvent).mock.calls[0][0];
  const notification = {id: 'hire-24', data: jobData};
  receive({type: EventType.DELIVERED, detail: {notification}});
  expect(openNotificationDestination).not.toHaveBeenCalled();
  receive({type: EventType.PRESS, detail: {notification}});
  receive({type: EventType.PRESS, detail: {notification}});
  expect(openNotificationDestination).toHaveBeenCalledTimes(1);
  expect(openNotificationDestination).toHaveBeenCalledWith(jobData);
});

it('consumes a notification that launches the Android app and releases its event listener', async () => {
  const originalOS = Platform.OS;
  Platform.OS = 'android';
  jest.mocked(notifee.getInitialNotification).mockResolvedValueOnce({
    notification: {id: 'hire-initial', data: jobData},
    pressAction: {id: 'default'},
  });
  try {
    cleanup = await startFirebaseNotifications();
    expect(openNotificationDestination).toHaveBeenCalledWith(jobData);
    const unsubscribe = jest.mocked(notifee.onForegroundEvent).mock.results[0].value;
    cleanup();
    expect(unsubscribe).toHaveBeenCalledTimes(1);
    cleanup = () => undefined;
  } finally {
    Platform.OS = originalOS;
  }
});
