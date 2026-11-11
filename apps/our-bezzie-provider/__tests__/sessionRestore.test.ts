/** @jest-environment-options {"customExportConditions": ["node", "node-addons"]} */
import {Linking} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {configureStore} from '@reduxjs/toolkit';
import api from '../src/apis/api';
import {authReducer, getAuthorization, userLogin, userVerification} from '../src/slices/auth.slice';
import URLs from '../src/config/urls';

jest.mock('@react-native-async-storage/async-storage', () => ({getItem: jest.fn(), setItem: jest.fn()}));
jest.mock('../src/apis/api', () => {
  const client = jest.fn();
  Object.assign(client, {defaults: {headers: {}}, post: jest.fn(), get: jest.fn()});
  return {__esModule: true, default: client};
});
jest.mock('../src/navigators', () => ({navigationRef: {navigate: jest.fn(), resetRoot: jest.fn()}}));
jest.mock('../src/utils/util', () => ({handleInviteURL: jest.fn()}));
jest.mock('../src/utils/toast', () => ({}));
jest.mock('../src/screens', () => ({FAQ: () => null}));

const makeStore = () => configureStore({reducer: {auth: authReducer}});
const user = {id: 42, name: 'Test Customer', email: 'customer@example.test', phone: '1234567890', user_type: 'client'};

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(Linking, 'getInitialURL').mockResolvedValue(null);
  jest.mocked(AsyncStorage.getItem).mockImplementation(async key => key === 'token' ? 'test-session' : null);
  jest.mocked(api.post).mockResolvedValue({data: {data: {
    basic_info: 0, profile_pic: 0, proof: 0, is_verification_completed: 0,
  }}});
  jest.mocked(api.get).mockResolvedValue({data: {data: user}});
});

afterEach(() => jest.restoreAllMocks());

it('restores the customer profile before showing the details checklist', async () => {
  const store = makeStore();
  await store.dispatch(getAuthorization());

  expect(api.get).toHaveBeenCalledWith(URLs.accountProfile);
  expect(store.getState().auth.initialRouteName).toBe('MyDocuments');
  expect(store.getState().auth.myProfile?.user.email).toBe(user.email);
  expect(store.getState().auth.isAuthorized).toBe(false);
});

it('ignores a stale authorized flag when there is no token', async () => {
  jest.mocked(AsyncStorage.getItem).mockImplementation(async key => key === 'authorized' ? 'true' : null);
  const store = makeStore();
  await store.dispatch(getAuthorization());

  expect(store.getState().auth.isAuthorized).toBe(false);
  expect(store.getState().auth.initialRouteName).toBe('Walkthrough');
  expect(api.get).not.toHaveBeenCalled();
});

it('does not restore a provider account in the customer app', async () => {
  jest.mocked(api.get).mockResolvedValue({data: {data: {...user, user_type: 'freelancer'}}});
  const store = makeStore();
  await store.dispatch(getAuthorization());

  expect(store.getState().auth.initialRouteName).toBe('Login');
  expect(store.getState().auth.myProfile).toBeUndefined();
});

it('hydrates the signup profile before the screen navigates', async () => {
  jest.mocked(api).mockResolvedValue({data: {data: {user, token: 'new-session'}}});
  const store = makeStore();
  await store.dispatch(userVerification({email: user.email, otp: '123456', user_type: 'client'}));

  expect(store.getState().auth.myProfile?.user.email).toBe(user.email);
  expect(store.getState().auth.userVerificationLoading).toBe('loaded');
  const {navigationRef} = require('../src/navigators');
  expect(navigationRef.resetRoot).not.toHaveBeenCalled();
});

it('hydrates the login profile before the screen navigates', async () => {
  jest.mocked(api).mockResolvedValue({data: {data: {user, token: 'new-session', basic_info: 0, is_verification_completed: 0}}});
  const store = makeStore();
  await store.dispatch(userLogin({email: user.email, password: 'test-password', user_type: 'client'}));

  expect(store.getState().auth.myProfile?.user.email).toBe(user.email);
  expect(store.getState().auth.loading).toBe('loaded');
  const {navigationRef} = require('../src/navigators');
  expect(navigationRef.navigate).not.toHaveBeenCalled();
});
