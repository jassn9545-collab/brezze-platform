import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { ChatDetailScreen } from '../src/screens/ChatDetailScreen';

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

jest.mock('../src/components', () => {
  const native = require('react-native');
  return { Screen: native.View, Text: native.Text };
});

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
}));
describe('ChatDetailScreen', () => {
  it('allows the user to send a message and appends it to the conversation', async () => {
    const navigation = { goBack: jest.fn() };

    let component!: renderer.ReactTestRenderer;

    await act(async () => {
      component = renderer.create(
        <ChatDetailScreen
          navigation={navigation as any}
          route={{ key: 'ChatDetail', name: 'ChatDetail' } as any}
        />,
      );
    });

    const input = component.root.findByProps({ testID: 'chat-message-input' });
    await act(async () => input.props.onChangeText('Hello from Codex'));

    const sendButton = component.root.findByProps({ testID: 'chat-send-button' });
    await act(async () => sendButton.props.onPress());

    const messageTexts = component.root.findAllByProps({ testID: 'chat-message-text' });
    const hasUserMessage = messageTexts.some(
      node => String(node.props.children) === 'Hello from Codex',
    );

    expect(hasUserMessage).toBe(true);
    await act(async () => component.unmount());
  });
});
