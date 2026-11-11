import React from 'react';
import TestRenderer, {act} from 'react-test-renderer';
import {FlatList} from 'react-native';
import {useDispatch} from 'react-redux';
import {Loader} from '../src/components';
import {ReviewScreen} from '../src/screens/ReviewScreen';
import {jobPostDetailsScreen as JobDetails} from '../src/screens/JobPostDetailsScreen';

jest.mock('react-redux', () => ({connect: () => (component: unknown) => component, useDispatch: jest.fn()}));
jest.mock('@react-navigation/native', () => ({
  useFocusEffect: (callback: () => void) => require('react').useEffect(callback, [callback]),
}));
jest.mock('react-native-safe-area-context', () => ({useSafeAreaInsets: () => ({top: 0, bottom: 0})}));
jest.mock('@d11/react-native-fast-image', () => 'FastImage');
jest.mock('../src/components', () => ({
  BackButtom: 'BackButtom', Button: 'Button', Loader: 'Loader', JobPaymentButton: 'JobPaymentButton',
  ReadMore: 'ReadMore', Screen: 'Screen', Text: 'AppText',
}));
jest.mock('../src/components/ListEmptyComponent', () => 'ListEmpty');
jest.mock('../src/theme', () => ({
  colors: {primary: '#0965BD', palette: new Proxy({}, {get: () => '#ffffff'})},
  spacing: new Proxy({}, {get: () => 8}),
}));
jest.mock('../src/config/defaults', () => ({Currency: {code: 'AUD', sign: '$'}}));
jest.mock('../src/i18n', () => ({translate: (key: string) => key}));
jest.mock('../src/apis/chat', () => ({openChatConversation: jest.fn()}));
jest.mock('../src/utils/Firebase', () => ({PUSH_NOTIFICATION_EVENT: 'push-test'}));
jest.mock('../src/slices/job.slice', () => ({
  submitReview: (params: unknown) => ({type: 'review', payload: params}),
  getJobDetail: jest.fn(), hireJob: jest.fn(),
}));
jest.mock('../src/apis/api', () => ({get: jest.fn(async () => ({data: {data: {can_review: true, has_reviewed: false}}}))}));

function deferred() {
  let resolve!: (value?: unknown) => void;
  let reject!: (reason: Error) => void;
  const promise = new Promise((ok, fail) => {resolve = ok; reject = fail;});
  return {promise, resolve, reject};
}
let renderer: TestRenderer.ReactTestRenderer;
const navigation = {reset: jest.fn()};
const loader = () => renderer.root.findByType(Loader).props;

afterEach(async () => {
  await act(async () => renderer?.unmount());
  jest.clearAllMocks();
});

async function renderReview() {
  await act(async () => {
    renderer = TestRenderer.create(<ReviewScreen {...{navigation, route: {params: {jobId: 10}}} as any} />);
  });
  await act(async () => renderer.root.findByProps({accessibilityLabel: '5 star rating'}).props.onPress());
  return renderer.root.findByProps({text: 'Submit Review'}).props.onPress;
}

it('keeps review loading through success navigation and rejects rapid repeated taps', async () => {
  const request = deferred();
  const dispatch = jest.fn(() => ({unwrap: () => request.promise}));
  jest.mocked(useDispatch).mockReturnValue(dispatch as unknown as ReturnType<typeof useDispatch>);
  const submit = await renderReview();
  let operation!: Promise<void>;
  await act(async () => {operation = submit(); submit();});
  expect(dispatch).toHaveBeenCalledTimes(1);
  expect(loader()).toMatchObject({loading: true, inOutAnimation: false});
  expect(renderer.root.findByProps({text: 'Submit Review'}).props.disabled).toBe(true);
  await act(async () => {request.resolve(); await operation;});
  expect(navigation.reset).toHaveBeenCalledTimes(1);
  // Real navigation now unmounts this screen; there must be no empty-loader gap.
  expect(loader().loading).toBe(true);
});

it('releases review loading after failure and allows another submission', async () => {
  const request = deferred();
  const dispatch = jest.fn(() => ({unwrap: () => request.promise}));
  jest.mocked(useDispatch).mockReturnValue(dispatch as unknown as ReturnType<typeof useDispatch>);
  const submit = await renderReview();
  let operation!: Promise<void>;
  await act(async () => {operation = submit();});
  await act(async () => {request.reject(new Error('Offline')); await operation;});
  expect(loader().loading).toBe(false);
  expect(navigation.reset).not.toHaveBeenCalled();
  dispatch.mockReturnValueOnce({unwrap: () => Promise.resolve(undefined)});
  await act(async () => renderer.root.findByProps({text: 'Submit Review'}).props.onPress());
  expect(dispatch).toHaveBeenCalledTimes(2);
});

const bid = {id: 20, user_id: 3, is_hired: false};
function jobProps() {
  return {
    route: {params: {id: 10}}, navigation,
    data: {id: 10, status: 'active', bids: [bid]}, setting: {base_url: ''},
    loading: 'loaded', hireJobLoading: 'loaded',
    get: jest.fn().mockReturnValue({unwrap: () => Promise.resolve(undefined)}),
    hireJob: jest.fn(),
  };
}
function hireCallback() {
  return renderer.root.findByType(FlatList).props.renderItem({item: bid, index: 0}).props.onPressHire;
}

it('keeps one hire loader across POST completion and the details refresh', async () => {
  const post = deferred(), refresh = deferred();
  const props = jobProps();
  props.hireJob.mockReturnValue({unwrap: () => post.promise});
  await act(async () => {renderer = TestRenderer.create(<JobDetails {...props as any} />);});
  // A previous successful hire elsewhere must not trigger an extra details request.
  expect(props.get).toHaveBeenCalledTimes(1);
  props.get.mockReturnValue({unwrap: () => refresh.promise});
  const hire = hireCallback();
  let operation!: Promise<void>;
  await act(async () => {operation = hire(bid); hire(bid);});
  expect(props.hireJob).toHaveBeenCalledTimes(1);
  expect(loader()).toMatchObject({loading: true, inOutAnimation: false});
  await act(async () => {post.resolve(); await Promise.resolve();});
  expect(props.get).toHaveBeenCalledTimes(2);
  expect(loader().loading).toBe(true);
  await act(async () => {refresh.resolve(); await operation;});
  expect(loader().loading).toBe(false);
  await act(async () => renderer.update(<JobDetails {...{...props, loading: 'loading'} as any} />));
  expect(loader().loading).toBe(false); // background refresh with visible data
});

it('releases the hire loader on rejection without issuing the success refresh', async () => {
  const post = deferred();
  const props = jobProps(); props.hireJob.mockReturnValue({unwrap: () => post.promise});
  await act(async () => {renderer = TestRenderer.create(<JobDetails {...props as any} />);});
  let operation!: Promise<void>;
  await act(async () => {operation = hireCallback()(bid);});
  await act(async () => {post.reject(new Error('Offline')); await operation;});
  expect(loader().loading).toBe(false);
  expect(props.get).toHaveBeenCalledTimes(1);
});
