import { apiClient } from "@/lib/api-client";

export type NotificationType =
  | "booking_created"
  | "booking_confirmed"
  | "booking_rejected"
  | "booking_cancelled"
  | "booking_completed"
  | "booking_in_progress"
  | "payment_pending"
  | "payment_success"
  | "payment_failed"
  | "payment_refunded"
  | "therapist_approved"
  | "therapist_rejected";

export type NotificationDto = {
  id: string;
  notification_type: NotificationType;
  title: string;
  message: string;
  data: Record<string, unknown>;
  is_read: boolean;
  created_at: string;
};

export const notificationService = {
  listNotifications: async (): Promise<NotificationDto[]> => {
    const response = await apiClient.get<NotificationDto[]>("/notifications/");
    const payload = response as any;
    const data = payload?.data ?? payload;
    return Array.isArray(data) ? data : data?.results ?? [];
  },

  getUnreadCount: async (): Promise<number> => {
    const response = await apiClient.get<{ count: number }>("/notifications/unread-count/");
    const payload = response as any;
    const data = payload?.data ?? payload;
    return data?.count ?? 0;
  },

  markAsRead: async (id: string): Promise<void> => {
    await apiClient.patch(`/notifications/${id}/read/`, {});
  },

  markAllAsRead: async (): Promise<void> => {
    await apiClient.post("/notifications/mark-all-read/", {});
  },
};
