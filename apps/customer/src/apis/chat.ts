import api from './api';

export interface ChatUser {
  id: number;
  name: string;
  profile_image: string | null;
}

export interface ChatMessage {
  id: number;
  conversation_id: number;
  sender_id: number;
  body: string;
  read_at: string | null;
  created_at: string;
}

export interface ChatConversation {
  id: number;
  project_id: number | null;
  project_title: string | null;
  other_user: ChatUser;
  latest_message: Pick<ChatMessage, 'id' | 'body' | 'sender_id' | 'created_at'> | null;
  unread_count: number;
  updated_at: string;
}

export async function getChatConversations(): Promise<ChatConversation[]> {
  const response = await api.get('/chat/conversations');
  return response.data.data.conversations;
}

export async function openChatConversation(
  recipientId: number,
  projectId?: number,
): Promise<ChatConversation> {
  const response = await api.post('/chat/conversations', {
    recipient_id: recipientId,
    ...(projectId ? { project_id: projectId } : {}),
  });
  return response.data.data.conversation;
}

export async function getChatMessages(conversationId: number, afterId?: number): Promise<{
  conversation: ChatConversation;
  messages: ChatMessage[];
}> {
  const response = await api.get('/chat/conversations/' + conversationId + '/messages', {
    params: afterId ? { after_id: afterId } : undefined,
  });
  return response.data.data;
}

export async function sendChatMessage(
  conversationId: number,
  body: string,
): Promise<ChatMessage> {
  const response = await api.post(`/chat/conversations/${conversationId}/messages`, {
    body,
  });
  return response.data.data.message;
}
