/** @jest-environment-options {"customExportConditions": ["node", "node-addons"]} */
import React from 'react';
import TestRenderer, {act} from 'react-test-renderer';
import {Linking, Text} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {configureStore} from '@reduxjs/toolkit';
import {Provider, useSelector} from 'react-redux';
import api from '../src/apis/api';
import {authActions, authReducer, getAuthorization} from '../src/slices/auth.slice';
import {AuthStack} from '../src/navigators/AuthStack';
import {PushNotificationBridge} from '../src/components/PushNotificationBridge';
import {startFirebaseNotifications} from '../src/utils/Firebase';

jest.mock('@react-native-async-storage/async-storage', () => ({getItem: jest.fn(), setItem: jest.fn()}));
jest.mock('../src/apis/api', () => ({defaults: {headers: {}}, post: jest.fn(), get: jest.fn()}));
jest.mock('../src/navigators', () => ({navigationRef: {navigate: jest.fn()}}));
jest.mock('../src/utils/util', () => ({handleInviteURL: jest.fn()}));
jest.mock('../src/utils/Firebase', () => ({startFirebaseNotifications: jest.fn()}));
jest.mock('../src/screens', () => Object.fromEntries([
  'WalkthroughScreen', 'LoginScreen', 'SignupScreen', 'VerificationScreen',
  'ForgotPasswordScreen', 'ResetPasswordScreen', 'CommonSucessScreen',
  'MyDocumentsScreen', 'UploadUserDetailScreen', 'UploadDocumentScreen', 'DocumentReviewScreen',
].map(name => [name, () => null])));
jest.mock('@react-navigation/native-stack', () => ({
  createNativeStackNavigator: () => ({
    Navigator: ({initialRouteName}: {initialRouteName: string}) =>
      require('react').createElement(require('react-native').Text, null, initialRouteName),
    Screen: () => null,
  }),
}));

const makeStore = () => configureStore({reducer: {auth: authReducer}});
type State = ReturnType<ReturnType<typeof makeStore>['getState']>;
const NavigationProbe = () => {
  const auth = useSelector((state: State) => state.auth);
  if (auth.booting === 'loading') return null;
  return auth.isAuthorized
    ? <Text>Dashboard</Text>
    : <AuthStack initialRouteName={auth.initialRouteName} />;
};

let renderer: TestRenderer.ReactTestRenderer;
const cleanup = jest.fn();
beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(Linking, 'getInitialURL').mockResolvedValue(null);
  jest.mocked(AsyncStorage.getItem).mockImplementation(async key => key === 'token' ? 'test-session' : null);
  jest.mocked(api.get).mockResolvedValue({data: {data: {
    id: 24, name: 'Test Provider', email: 'provider@example.test', user_type: 'freelancer',
  }}});
  jest.mocked(startFirebaseNotifications).mockResolvedValue(cleanup);
});
afterEach(async () => {
  await act(async () => renderer?.unmount());
  jest.restoreAllMocks();
});

it.each([
  [{basic_info: 1, profile_pic: 1, proof: 1, is_verification_completed: 0}, 'DocumentReview'],
  [{basic_info: 0, profile_pic: 0, proof: 0, is_verification_completed: 0}, 'MyDocuments'],
  [{basic_info: 1, profile_pic: 1, proof: 1, is_verification_completed: 1}, 'Dashboard'],
])('restores a signed-in account to %s without requiring another login', async (status, route) => {
  jest.mocked(api.post).mockResolvedValue({data: {data: status}});
  const store = makeStore();
  await act(async () => {
    renderer = TestRenderer.create(<Provider store={store}><PushNotificationBridge /><NavigationProbe /></Provider>);
    await store.dispatch(getAuthorization());
  });
  expect(renderer.root.findByType(Text).props.children).toBe(route);
  expect(Boolean(store.getState().auth.isAuthorized)).toBe(route === 'Dashboard');
  expect(store.getState().auth.myProfile?.user.email).toBe('provider@example.test');
  expect(startFirebaseNotifications).toHaveBeenCalledTimes(1);
  await act(async () => { store.dispatch(authActions.autoLogout()); });
  expect(cleanup).toHaveBeenCalledTimes(1);
});

it.each(['missing', 'rejected'])('does not start push with a %s session', async kind => {
  if (kind === 'missing') jest.mocked(AsyncStorage.getItem).mockResolvedValue(null);
  else jest.mocked(api.post).mockRejectedValue(new Error('Unauthenticated'));
  const store = makeStore();
  await act(async () => {
    renderer = TestRenderer.create(<Provider store={store}><PushNotificationBridge /><NavigationProbe /></Provider>);
    await store.dispatch(getAuthorization());
  });
  expect(renderer.root.findByType(Text).props.children).toBe(kind === 'missing' ? 'Walkthrough' : 'Login');
  expect(startFirebaseNotifications).not.toHaveBeenCalled();
});

it('does not enter the app from a stale authorized flag without a token', async () => {
  jest.mocked(AsyncStorage.getItem).mockImplementation(async key => key === 'authorized' ? 'true' : null);
  const store = makeStore();
  await act(async () => {
    renderer = TestRenderer.create(<Provider store={store}><NavigationProbe /></Provider>);
    await store.dispatch(getAuthorization());
  });
  expect(renderer.root.findByType(Text).props.children).toBe('Walkthrough');
  expect(store.getState().auth.isAuthorized).toBe(false);
  expect(api.get).not.toHaveBeenCalled();
});

it('returns to login if the restored token belongs to a customer', async () => {
  jest.mocked(api.post).mockResolvedValue({data: {data: {
    basic_info: 0, profile_pic: 0, proof: 0, is_verification_completed: 0,
  }}});
  jest.mocked(api.get).mockResolvedValue({data: {data: {
    id: 24, name: 'Test Customer', email: 'customer@example.test', user_type: 'client',
  }}});
  const store = makeStore();
  await act(async () => {
    renderer = TestRenderer.create(<Provider store={store}><NavigationProbe /></Provider>);
    await store.dispatch(getAuthorization());
  });
  expect(renderer.root.findByType(Text).props.children).toBe('Login');
  expect(store.getState().auth.myProfile).toBeUndefined();
});
