import React from 'react';
import TestRenderer, {act} from 'react-test-renderer';
import {AppState, AppStateStatus} from 'react-native';
import {PushNotificationBridge} from '../src/components/PushNotificationBridge';
import {startFirebaseNotifications} from '../src/utils/Firebase';

jest.mock('../src/store/hooks', () => ({useAppSelector: jest.fn(() => true)}));
jest.mock('../src/utils/Firebase', () => ({startFirebaseNotifications: jest.fn()}));

let renderer: TestRenderer.ReactTestRenderer;
let resume: (state: AppStateStatus) => void;
const cleanup = jest.fn();
const remove = jest.fn();

beforeEach(() => {
  jest.useFakeTimers();
  jest.clearAllMocks();
  jest.spyOn(AppState, 'addEventListener').mockImplementation((_, callback) => {
    resume = callback;
    return {remove};
  });
  jest.mocked(startFirebaseNotifications).mockResolvedValue(cleanup);
});

afterEach(async () => {
  await act(async () => renderer?.unmount());
  jest.useRealTimers();
  jest.restoreAllMocks();
});

it('recovers from a temporary Firebase startup failure without another login', async () => {
  jest.mocked(startFirebaseNotifications).mockRejectedValueOnce(new Error('SERVICE_NOT_AVAILABLE'));
  await act(async () => { renderer = TestRenderer.create(<PushNotificationBridge />); });
  await act(async () => { jest.advanceTimersByTime(5000); });
  expect(startFirebaseNotifications).toHaveBeenCalledTimes(2);
  await act(async () => { resume('active'); jest.advanceTimersByTime(60000); });
  expect(startFirebaseNotifications).toHaveBeenCalledTimes(2);
});

it('retries immediately on resume and cancels retries when the bridge unmounts', async () => {
  jest.mocked(startFirebaseNotifications).mockRejectedValue(new Error('Offline'));
  await act(async () => { renderer = TestRenderer.create(<PushNotificationBridge />); });
  await act(async () => { resume('active'); });
  expect(startFirebaseNotifications).toHaveBeenCalledTimes(2);
  await act(async () => { renderer.unmount(); });
  await act(async () => { jest.advanceTimersByTime(60000); });
  expect(startFirebaseNotifications).toHaveBeenCalledTimes(2);
  expect(remove).toHaveBeenCalledTimes(1);
});

it('cleans up startup that finishes after logout', async () => {
  let finish!: (value: () => void) => void;
  jest.mocked(startFirebaseNotifications).mockReturnValueOnce(new Promise(resolve => { finish = resolve; }));
  await act(async () => { renderer = TestRenderer.create(<PushNotificationBridge />); });
  await act(async () => { renderer.unmount(); });
  await act(async () => { finish(cleanup); });
  expect(cleanup).toHaveBeenCalledTimes(1);
});
