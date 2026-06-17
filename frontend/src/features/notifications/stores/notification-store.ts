import { create } from "zustand";
import type { NotificationDto } from "@/services/notification-service";
import { notificationService } from "@/services/notification-service";

type NotificationStore = {
  notifications: NotificationDto[];
  unreadCount: number;
  isOpen: boolean;
  isLoading: boolean;
  fetchNotifications: () => Promise<void>;
  refreshUnreadCount: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  open: () => void;
  close: () => void;
  toggle: () => void;
};

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isOpen: false,
  isLoading: false,

  fetchNotifications: async () => {
    set({ isLoading: true });
    try {
      const notifications = await notificationService.listNotifications();
      set({ notifications, isLoading: false });
    } catch (error) {
      console.error("fetchNotifications error:", error);
      set({ notifications: [], isLoading: false });
    }
  },

  refreshUnreadCount: async () => {
    try {
      const unreadCount = await notificationService.getUnreadCount();
      set({ unreadCount });
    } catch (error) {
      console.error("refreshUnreadCount error:", error);
    }
  },

  markAsRead: async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      set((state) => ({
        notifications: state.notifications.map((n) =>
          n.id === id ? { ...n, is_read: true } : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      }));
    } catch (error) {
      console.error("markAsRead error:", error);
    }
  },

  markAllAsRead: async () => {
    try {
      await notificationService.markAllAsRead();
      set((state) => ({
        notifications: state.notifications.map((n) => ({ ...n, is_read: true })),
        unreadCount: 0,
      }));
    } catch (error) {
      console.error("markAllAsRead error:", error);
    }
  },

  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
  toggle: () => set((state) => ({ isOpen: !state.isOpen })),
}));
