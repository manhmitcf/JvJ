import { create } from "zustand";
import { bookingService } from "@/services/booking-service";
import { paymentService } from "@/services/payment-service";
import { type Booking } from "@/types/booking";
import { type Payment, type PaymentInitiateResult } from "@/types/payment";

type PaymentStore = {
  booking: Booking | null;
  payment: Payment | null;
  paymentInitiate: PaymentInitiateResult | null;
  currentBookingId: string | null;
  isLoading: boolean;
  error: string | null;
  actionMessage: string | null;
  loadBooking: (bookingId: string) => Promise<void>;
  initiatePayment: (bookingId: string, method?: "vnpay_qr" | "vnpay_card") => Promise<void>;
  simulatePaymentSuccess: (bookingId: string) => Promise<void>;
  simulatePaymentFailed: (bookingId: string) => Promise<void>;
  retryPayment: (bookingId: string) => Promise<void>;
  // Deprecated: kept for backward compat
  markPaid: (bookingId: string) => Promise<void>;
  markFailed: (bookingId: string) => Promise<void>;
};

export const usePaymentStore = create<PaymentStore>((set, get) => ({
  booking: null,
  payment: null,
  paymentInitiate: null,
  currentBookingId: null,
  isLoading: false,
  error: null,
  actionMessage: null,

  loadBooking: async (bookingId) => {
    set({ booking: null, payment: null, currentBookingId: bookingId, isLoading: true, error: null, actionMessage: null });
    try {
      const [booking, payment] = await Promise.all([
        bookingService.getBooking(bookingId),
        paymentService.getPayment(bookingId),
      ]);
      if (get().currentBookingId !== bookingId) return;
      set({
        booking: booking ? { ...booking } : null,
        payment: payment ? { ...payment } : null,
        isLoading: false
      });
    } catch (error) {
      if (get().currentBookingId !== bookingId) return;
      set({ error: (error as Error).message, isLoading: false, booking: null, payment: null });
    }
  },

  initiatePayment: async (bookingId, method = "vnpay_qr") => {
    set({ currentBookingId: bookingId, isLoading: true, error: null, actionMessage: null });
    try {
      const result = await paymentService.initiatePayment(bookingId, { method });
      if (get().currentBookingId !== bookingId) return;
      set({
        payment: result,
        paymentInitiate: result,
        isLoading: false,
        actionMessage: "Đã khởi tạo thanh toán. Vui lòng quét mã QR hoặc nhấn nút giả lập bên dưới.",
      });
    } catch (error) {
      if (get().currentBookingId !== bookingId) return;
      set({ error: `Không thể khởi tạo thanh toán: ${(error as Error).message}`, isLoading: false });
    }
  },

  simulatePaymentSuccess: async (bookingId) => {
    set({ currentBookingId: bookingId, isLoading: true, error: null, actionMessage: null });
    try {
      const result = await paymentService.simulatePayment(bookingId, { success: true });
      if (get().currentBookingId !== bookingId) return;

      // Reload booking to get updated payment_status
      const updatedBooking = await bookingService.getBooking(bookingId);
      if (get().currentBookingId !== bookingId) return;

      set({
        payment: result,
        booking: updatedBooking ? { ...updatedBooking } : get().booking,
        isLoading: false,
        actionMessage: "Thanh toán thành công! JvJ đã ghi nhận giao dịch của bạn.",
      });
    } catch (error) {
      if (get().currentBookingId !== bookingId) return;
      set({ error: `Giả lập thanh toán thất bại: ${(error as Error).message}`, isLoading: false });
    }
  },

  simulatePaymentFailed: async (bookingId) => {
    set({ currentBookingId: bookingId, isLoading: true, error: null, actionMessage: null });
    try {
      const result = await paymentService.simulatePayment(bookingId, { success: false });
      if (get().currentBookingId !== bookingId) return;

      // Reload booking to get updated payment_status
      const updatedBooking = await bookingService.getBooking(bookingId);
      if (get().currentBookingId !== bookingId) return;

      set({
        payment: result,
        booking: updatedBooking ? { ...updatedBooking } : get().booking,
        isLoading: false,
        actionMessage: `Giao dịch thất bại (mã lỗi: ${result.callback.vnpResponseCode || "unknown"}). Bạn có thể thử lại.`,
      });
    } catch (error) {
      if (get().currentBookingId !== bookingId) return;
      set({ error: `Giả lập thanh toán thất bại: ${(error as Error).message}`, isLoading: false });
    }
  },

  retryPayment: async (bookingId) => {
    set({ currentBookingId: bookingId, isLoading: true, error: null, actionMessage: null, paymentInitiate: null });
    try {
      // Clear payment state, reload booking
      const booking = await bookingService.getBooking(bookingId);
      if (get().currentBookingId !== bookingId) return;
      set({
        booking: booking ? { ...booking } : null,
        payment: null,
        isLoading: false,
        actionMessage: "Đã đưa giao dịch về trạng thái chờ. Bạn có thể khởi tạo thanh toán mới.",
      });
    } catch (error) {
      if (get().currentBookingId !== bookingId) return;
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  // Deprecated: backward compat only
  markPaid: async (bookingId) => {
    await get().simulatePaymentSuccess(bookingId);
  },

  markFailed: async (bookingId) => {
    await get().simulatePaymentFailed(bookingId);
  },
}));
