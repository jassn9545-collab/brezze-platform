import api from './api';
import URLs from '../config/urls';

export type ChatParticipant = {
  id: number;
  name: string;
  profile_image: string | null;
};

export type ChatMessage = {
  id: number;
  conversation_id: number;
  sender_id: number;
  body: string;
  created_at: string;
  read_at: string | null;
};

export type Conversation = {
  id: number;
  project_id: number | null;
  project_title: string | null;
  other_user: ChatParticipant;
  latest_message: Pick<ChatMessage, 'id' | 'sender_id' | 'body' | 'created_at'> | null;
  unread_count: number;
  updated_at: string;
};

export const getConversations = async (): Promise<Conversation[]> => {
  const response = await api.get(URLs.chatConversations);
  return response.data.data.conversations ?? [];
};

export const getOrCreateConversation = async (
  projectId: number,
): Promise<Conversation> => {
  const response = await api.post(URLs.chatConversations, {project_id: projectId});
  return response.data.data.conversation;
};

export const getConversationMessages = async (
  conversationId: number,
  afterId?: number,
): Promise<{conversation: Conversation; messages: ChatMessage[]}> => {
  const response = await api.get(
    `${URLs.chatConversations}/${conversationId}/messages`,
    {params: afterId ? {after_id: afterId} : undefined},
  );
  return {
    conversation: response.data.data.conversation,
    messages: response.data.data.messages ?? [],
  };
};

export const sendConversationMessage = async (
  conversationId: number,
  body: string,
): Promise<ChatMessage> => {
  const response = await api.post(
    `${URLs.chatConversations}/${conversationId}/messages`,
    {body},
  );
  return response.data.data.message;
};
