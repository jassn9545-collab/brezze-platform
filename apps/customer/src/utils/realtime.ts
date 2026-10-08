import Echo from 'laravel-echo';
import PusherDefault, {ChannelAuthorizationCallback} from 'pusher-js/react-native';
import api from '../apis/api';
import URLs from '../config/urls';
import { ChatMessage } from '../apis/chat';

export type UserRealtimeEvent = {
  kind: string;
  status?: string;
  conversation_id?: number;
  notification?: {
    id: number;
    title: string;
    message: string;
    type: string;
    action_type: string | null;
    action_id: number | null;
    is_read: boolean;
    created_at: string;
  };
};

let echo: Echo<'reverb'> | null = null;
const PusherConstructor = (
  PusherDefault as unknown as {Pusher?: typeof PusherDefault}
).Pusher ?? PusherDefault;

const connection = () => {
  if (!echo) {
    echo = new Echo<'reverb'>({
      broadcaster: 'reverb',
      Pusher: PusherConstructor,
      key: URLs.realtime.key,
      wsHost: URLs.realtime.host,
      wsPort: URLs.realtime.port,
      wssPort: URLs.realtime.port,
      forceTLS: URLs.realtime.secure,
      enabledTransports: URLs.realtime.secure ? ['wss'] : ['ws'],
      authorizer: (channel: { name: string }) => ({
        authorize: (socketId: string, callback: ChannelAuthorizationCallback) => {
          api.post('/broadcasting/auth', {
            socket_id: socketId,
            channel_name: channel.name,
          })
            .then(response => callback(null, response.data))
            .catch(error => callback(error instanceof Error ? error : new Error('Channel authorization failed.'), null));
        },
      }),
    });
  }
  return echo;
};

export const subscribeToConversation = (
  conversationId: number,
  onMessage: (message: ChatMessage) => void,
) => {
  const channelName = `chat.${conversationId}`;
  const channel = connection().private(channelName);
  const handler = (event: { message: ChatMessage }) => onMessage(event.message);
  channel.listen('.chat.message', handler);
  return () => {
    channel.stopListening('.chat.message', handler);
    connection().leave(channelName);
  };
};

export const subscribeToUser = (
  userId: number,
  onChatMessage: () => void,
  onUserEvent?: (event: UserRealtimeEvent) => void,
) => {
  const channelName = `user.${userId}`;
  const channel = connection().private(channelName);
  channel.listen('.chat.message', onChatMessage);
  if (onUserEvent) channel.listen('.user.event', onUserEvent);
  return () => {
    channel.stopListening('.chat.message', onChatMessage);
    if (onUserEvent) channel.stopListening('.user.event', onUserEvent);
    connection().leave(channelName);
  };
};
