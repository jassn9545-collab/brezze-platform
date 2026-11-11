import React from 'react';
import TestRenderer, {act} from 'react-test-renderer';
import {AppState, AppStateStatus, Linking} from 'react-native';
import {getStripeAccountStatus, StripeAccountStatus} from '../src/apis/stripe';
import {useStripeAccountStatus} from '../src/hooks/useStripeAccountStatus';

jest.mock('@react-navigation/native', () => ({
  useFocusEffect: (callback: () => void) => require('react').useEffect(callback, [callback]),
}));
jest.mock('../src/apis/stripe', () => ({getStripeAccountStatus: jest.fn()}));

let latest: ReturnType<typeof useStripeAccountStatus>;
let renderer: TestRenderer.ReactTestRenderer;
let onState: (state: AppStateStatus) => void;
let onURL: (event: {url: string}) => void;
const remove = jest.fn();
const removeURL = jest.fn();
const refreshProfile = jest.fn();
const status = (ready: boolean) => ({ready_for_payments: ready}) as StripeAccountStatus;
const Probe = () => {
  latest = useStripeAccountStatus(refreshProfile);
  return null;
};

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(AppState, 'addEventListener').mockImplementation((_, callback) => {
    onState = callback;
    return {remove};
  });
  jest.spyOn(Linking, 'addEventListener').mockImplementation((_, callback) => {
    onURL = callback;
    return {remove: removeURL} as unknown as ReturnType<typeof Linking.addEventListener>;
  });
  jest.mocked(getStripeAccountStatus).mockResolvedValue(status(false));
});

afterEach(async () => {
  await act(async () => renderer?.unmount());
  jest.restoreAllMocks();
});

it('refreshes Stripe and the profile when the browser returns to the focused screen', async () => {
  await act(async () => { renderer = TestRenderer.create(<Probe />); });
  expect(latest.status?.ready_for_payments).toBe(false);
  jest.mocked(getStripeAccountStatus).mockResolvedValue(status(true));
  await act(async () => { onState('background'); });
  expect(getStripeAccountStatus).toHaveBeenCalledTimes(1);
  await act(async () => { onState('active'); });
  expect(latest.status?.ready_for_payments).toBe(true);
  expect(refreshProfile).toHaveBeenCalledTimes(2);
  await act(async () => { onState('active'); });
  expect(getStripeAccountStatus).toHaveBeenCalledTimes(2);
});

it('does not overwrite a new approval with an older response', async () => {
  let resolveOlder!: (value: StripeAccountStatus) => void;
  jest.mocked(getStripeAccountStatus).mockReturnValueOnce(new Promise(resolve => { resolveOlder = resolve; }));
  await act(async () => { renderer = TestRenderer.create(<Probe />); });
  jest.mocked(getStripeAccountStatus).mockResolvedValue(status(true));
  await act(async () => { await latest.refresh(); });
  await act(async () => { resolveOlder(status(false)); });
  expect(latest.status?.ready_for_payments).toBe(true);
  expect(latest.loading).toBe(false);
});

it.each(['return', 'refresh'])(
  'refreshes on a Stripe %s deep link when the screen stays active',
  async result => {
    await act(async () => { renderer = TestRenderer.create(<Probe />); });
    jest.mocked(getStripeAccountStatus).mockResolvedValue(status(true));
    await act(async () => {
      onURL({url: `bezzieprovider://stripe/onboarding/${result}`});
    });
    expect(latest.status?.ready_for_payments).toBe(true);
    expect(getStripeAccountStatus).toHaveBeenCalledTimes(2);
    expect(refreshProfile).toHaveBeenCalledTimes(2);
  },
);

it('ignores links unrelated to the Stripe callback', async () => {
  await act(async () => { renderer = TestRenderer.create(<Probe />); });
  await act(async () => {
    onURL({url: 'bezzieprovider://jobs/42'});
    onURL({url: 'bezzieprovider://stripe/onboarding/return-other'});
    onURL({url: 'https://example.com/stripe/onboarding/return'});
  });
  expect(getStripeAccountStatus).toHaveBeenCalledTimes(1);
});

it('keeps the last known status when a refresh fails and removes the resume listener', async () => {
  jest.mocked(getStripeAccountStatus).mockResolvedValue(status(true));
  await act(async () => { renderer = TestRenderer.create(<Probe />); });
  jest.mocked(getStripeAccountStatus).mockRejectedValueOnce(new Error('Offline'));
  await act(async () => { await latest.refresh(); });
  expect(latest.status?.ready_for_payments).toBe(true);
  expect(latest.loading).toBe(false);
  await act(async () => { renderer.unmount(); });
  expect(remove).toHaveBeenCalledTimes(1);
  expect(removeURL).toHaveBeenCalledTimes(1);
});
