import { apiFetch } from "@/lib/api-client";

export type MessageDto = {
  id: string;
  sender: {
    id: string;
    full_name: string;
    avatar_url?: string;
    role: string;
  };
  sender_type: "customer" | "therapist";
  content: string;
  is_read: boolean;
  created_at: string;
};

export type ConversationDto = {
  id: string;
  customer: {
    id: string;
    full_name: string;
    avatar_url?: string;
    role: string;
  };
  therapist: {
    id: string;
    full_name: string;
    avatar_url?: string;
    role: string;
  };
  therapist_id_attr: string;
  last_message_preview: string;
  last_message_at: string | null;
  messages?: MessageDto[];
  unread_count: number;
  created_at: string;
  updated_at: string;
};

export async function getConversations(): Promise<ConversationDto[]> {
  const response = await apiFetch<ConversationDto[] | { results: ConversationDto[] }>("/conversations/");
  if (Array.isArray(response)) {
    return response;
  }
  return response.results ?? [];
}

export async function getConversation(id: string): Promise<ConversationDto> {
  return apiFetch<ConversationDto>(`/conversations/${id}/`);
}

export async function startConversation(therapistId: string): Promise<ConversationDto> {
  return apiFetch<ConversationDto>(`/conversations/start/${therapistId}/`, {
    method: "POST",
  });
}

export async function sendMessage(conversationId: string, content: string): Promise<MessageDto> {
  return apiFetch<MessageDto>(`/conversations/${conversationId}/send/`, {
    method: "POST",
    body: JSON.stringify({ content }),
  });
}

export async function markRead(conversationId: string, messageIds?: string[]): Promise<{ marked_read: number }> {
  return apiFetch<{ marked_read: number }>(`/conversations/${conversationId}/mark-read/`, {
    method: "POST",
    body: JSON.stringify({ message_ids: messageIds ?? [] }),
  });
}

export const conversationService = {
  getConversations,
  getConversation,
  startConversation,
  sendMessage,
  markRead,
};
