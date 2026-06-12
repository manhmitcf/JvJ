import { create } from "zustand";
import type { ConversationDto, MessageDto } from "@/services/conversation-service";
import { conversationService } from "@/services/conversation-service";

type ConversationStore = {
  conversations: ConversationDto[];
  activeConversation: ConversationDto | null;
  isLoading: boolean;
  isSending: boolean;
  error: string | null;
  isOpen: boolean;
  fetchConversations: () => Promise<void>;
  fetchConversation: (id: string) => Promise<void>;
  startConversation: (therapistId: string) => Promise<string>;
  sendMessage: (conversationId: string, content: string) => Promise<void>;
  markRead: (conversationId: string) => Promise<void>;
  setActiveConversation: (conversation: ConversationDto | null) => void;
  appendMessage: (conversationId: string, message: MessageDto) => void;
  open: () => void;
  close: () => void;
};

export const useConversationStore = create<ConversationStore>((set, get) => ({
  conversations: [],
  activeConversation: null,
  isLoading: false,
  isSending: false,
  error: null,
  isOpen: false,

  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),

  fetchConversations: async () => {
    set({ isLoading: true, error: null });
    try {
      const conversations = await conversationService.getConversations();
      set({ conversations: Array.isArray(conversations) ? conversations : [], isLoading: false });
    } catch (err) {
      set({ error: (err as Error).message, isLoading: false });
    }
  },

  fetchConversation: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const conversation = await conversationService.getConversation(id);
      set({ activeConversation: conversation, isLoading: false });
    } catch (err) {
      set({ error: (err as Error).message, isLoading: false });
    }
  },

  startConversation: async (therapistId: string) => {
    set({ isLoading: true, error: null });
    try {
      const conversation = await conversationService.startConversation(therapistId);
      const existing = get().conversations.find((c) => c.id === conversation.id);
      if (!existing) {
        set((state) => ({
          conversations: [conversation, ...state.conversations],
          activeConversation: conversation,
          isLoading: false,
        }));
      } else {
        set({ activeConversation: conversation, isLoading: false });
      }
      return conversation.id;
    } catch (err) {
      set({ error: (err as Error).message, isLoading: false });
      throw err;
    }
  },

  sendMessage: async (conversationId: string, content: string) => {
    set({ isSending: true, error: null });
    try {
      const message = await conversationService.sendMessage(conversationId, content);
      const active = get().activeConversation;
      if (active && active.id === conversationId) {
        set({
          activeConversation: {
            ...active,
            messages: [...(active.messages ?? []), message],
            last_message_preview: content.slice(0, 100),
            last_message_at: message.created_at,
          },
        });
      }
      set((state) => ({
        conversations: state.conversations.map((c) =>
          c.id === conversationId
            ? { ...c, last_message_preview: content.slice(0, 100), last_message_at: message.created_at }
            : c
        ),
        isSending: false,
      }));
    } catch (err) {
      set({ error: (err as Error).message, isSending: false });
      throw err;
    }
  },

  markRead: async (conversationId: string) => {
    try {
      await conversationService.markRead(conversationId);
      set((state) => ({
        conversations: state.conversations.map((c) =>
          c.id === conversationId ? { ...c, unread_count: 0 } : c
        ),
        activeConversation:
          state.activeConversation?.id === conversationId
            ? { ...state.activeConversation, unread_count: 0 }
            : state.activeConversation,
      }));
    } catch (err) {
      console.error("markRead error:", err);
    }
  },

  setActiveConversation: (conversation) => {
    set({ activeConversation: conversation });
  },

  appendMessage: (conversationId: string, message: MessageDto) => {
    const active = get().activeConversation;
    if (active && active.id === conversationId) {
      const alreadyExists = active.messages?.some((m) => m.id === message.id);
      if (!alreadyExists) {
        set({
          activeConversation: {
            ...active,
            messages: [...(active.messages ?? []), message],
          },
        });
      }
    }
  },
}));
