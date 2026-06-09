import { apiClient } from "@/lib/api-client";
import {
  type PaymentDto,
  type PaymentInitiateResponseDto,
  type PaymentSimulateResponseDto,
  type PaymentTimelineDto,
} from "@/types/api";
import {
  type Payment,
  type PaymentInitiateResult,
  type PaymentSimulateResult,
  type PaymentTimeline,
  type PaymentMethod,
} from "@/types/payment";
import { mapPayment, mapPaymentTimeline } from "@/services/mappers/payment-mapper";

type PaymentInitiatePayload = {
  method?: PaymentMethod;
};

type PaymentSimulatePayload = {
  success?: boolean;
};

export const paymentService = {
  /**
   * POST /api/v1/payments/:booking_id/initiate/
   * Tạo payment intent cho booking.
   */
  async initiatePayment(
    bookingId: string,
    payload?: PaymentInitiatePayload
  ): Promise<PaymentInitiateResult> {
    const response = await apiClient.post<PaymentInitiateResponseDto>(
      `/payments/${bookingId}/initiate/`,
      payload || {}
    );

    const payment = mapPayment(response.data);
    return {
      ...payment,
      paymentUrl: response.data.payment_url,
      qrCodeUrl: response.data.qr_code_url,
    };
  },

  /**
   * GET /api/v1/payments/:booking_id/
   * Lấy thông tin payment của booking.
   */
  async getPayment(bookingId: string): Promise<Payment | null> {
    try {
      const response = await apiClient.get<PaymentDto>(`/payments/${bookingId}/`);
      return mapPayment(response.data);
    } catch (error) {
      if (error instanceof Error && error.message.includes("404")) {
        return null;
      }
      throw error;
    }
  },

  /**
   * GET /api/v1/payments/:booking_id/timeline/
   * Lấy payment timeline của booking.
   */
  async getPaymentTimeline(bookingId: string): Promise<PaymentTimeline[]> {
    try {
      const response = await apiClient.get<PaymentTimelineDto[]>(
        `/payments/${bookingId}/timeline/`
      );
      return response.data.map(mapPaymentTimeline);
    } catch (error) {
      if (error instanceof Error && error.message.includes("404")) {
        return [];
      }
      throw error;
    }
  },

  /**
   * POST /api/v1/payments/:booking_id/simulate/
   * Mock VNPAY callback (dev/testing only).
   */
  async simulatePayment(
    bookingId: string,
    payload?: PaymentSimulatePayload
  ): Promise<PaymentSimulateResult> {
    const response = await apiClient.post<PaymentSimulateResponseDto>(
      `/payments/${bookingId}/simulate/`,
      payload || {}
    );

    const payment = mapPayment(response.data);
    return {
      ...payment,
      callback: {
        success: response.data.callback.success,
        vnpTransactionNo: response.data.callback.vnp_TransactionNo,
        vnpResponseCode: response.data.callback.vnp_ResponseCode,
      },
    };
  },
};
