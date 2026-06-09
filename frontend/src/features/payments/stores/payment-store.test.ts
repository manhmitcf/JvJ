import { type BookingDto, type PaymentDto, type PaymentSimulateResponseDto } from "@/types/api";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiClient } from "@/lib/api-client";
import { usePaymentStore } from "./payment-store";

const mockBookingDto: BookingDto = {
  id: "booking-1",
  code: "JVJ-0001",
  customer: "customer-1",
  customer_name: "Nguyen Van A",
  therapist: "therapist-1",
  therapist_name: "Therapist Name",
  treatment: "treatment-1",
  treatment_name: "Massage tri lieu",
  treatment_price: "350000",
  timeslot: "timeslot-1",
  slot_date: "2026-06-15",
  slot_start_time: "08:00",
  slot_end_time: "09:00",
  address: "Hai Chau, Da Nang",
  contact_phone: "0901000001",
  total_amount: "350000",
  status: "pending",
  payment_status: "unpaid",
  note: null,
  rejection_reason: null,
  confirmed_at: null,
  completed_at: null,
  cancelled_at: null,
  created_at: "2026-06-01T10:00:00Z",
};

const mockBookingDto2: BookingDto = {
  ...mockBookingDto,
  id: "booking-2",
  code: "JVJ-0002",
};

const mockPaymentDto: PaymentDto = {
  id: "payment-1",
  booking: "booking-1",
  method: "vnpay_qr",
  amount: "350000",
  status: "pending",
  vnpay_transaction_id: null,
  created_at: "2026-06-15T08:00:00Z",
  completed_at: null,
  timeline: [],
};

const mockPaymentDto2: PaymentDto = {
  ...mockPaymentDto,
  booking: "booking-2",
};

const mockPaymentSimulateSuccess: PaymentSimulateResponseDto = {
  id: "payment-1",
  booking: "booking-1",
  method: "vnpay_qr",
  amount: "350000",
  status: "success",
  vnpay_transaction_id: "VNP123456",
  created_at: "2026-06-15T08:00:00Z",
  completed_at: "2026-06-15T08:01:00Z",
  timeline: [
    { id: "tl-1", label: "Khoi tao thanh toan", tone: "neutral", occurred_at: "2026-06-15T08:00:00Z" },
    { id: "tl-2", label: "Thanh toan thanh cong", tone: "success", occurred_at: "2026-06-15T08:01:00Z" },
  ],
  callback: {
    success: true,
    vnp_TransactionNo: "VNP123456",
    vnp_ResponseCode: "00",
  },
};

const mockPaymentSimulateFailed: PaymentSimulateResponseDto = {
  id: "payment-1",
  booking: "booking-1",
  method: "vnpay_qr",
  amount: "350000",
  status: "failed",
  vnpay_transaction_id: null,
  created_at: "2026-06-15T08:00:00Z",
  completed_at: "2026-06-15T08:01:00Z",
  timeline: [
    { id: "tl-1", label: "Khoi tao thanh toan", tone: "neutral", occurred_at: "2026-06-15T08:00:00Z" },
    { id: "tl-3", label: "Thanh toan that bai", tone: "warning", occurred_at: "2026-06-15T08:01:00Z" },
  ],
  callback: {
    success: false,
    vnp_TransactionNo: undefined,
    vnp_ResponseCode: "99",
  },
};

const mockPaidBookingDto: BookingDto = {
  ...mockBookingDto,
  status: "confirmed",
  payment_status: "paid",
};

const mockFailedBookingDto: BookingDto = {
  ...mockBookingDto,
  status: "cancelled",
  payment_status: "failed",
};

describe("payment-store", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    usePaymentStore.setState({
      booking: null,
      currentBookingId: null,
      isLoading: false,
      error: null,
      actionMessage: null,
    });
  });

  it("loads booking by id", async () => {
    vi.mocked(apiClient.get)
      .mockResolvedValueOnce({ data: mockBookingDto, status: 200 })
      .mockResolvedValueOnce({ data: mockPaymentDto, status: 200 });

    await usePaymentStore.getState().loadBooking("booking-1");

    const state = usePaymentStore.getState();
    expect(state.booking?.id).toBe("booking-1");
    expect(state.booking?.code).toBe("JVJ-0001");
    expect(state.currentBookingId).toBe("booking-1");
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();
  });

  it("clears stale booking while loading another booking", async () => {
    vi.mocked(apiClient.get)
      .mockResolvedValueOnce({ data: mockBookingDto, status: 200 })
      .mockResolvedValueOnce({ data: mockPaymentDto, status: 200 });

    await usePaymentStore.getState().loadBooking("booking-1");

    vi.mocked(apiClient.get)
      .mockResolvedValueOnce({ data: mockBookingDto2, status: 200 })
      .mockResolvedValueOnce({ data: mockPaymentDto2, status: 200 });

    const loadingPromise = usePaymentStore.getState().loadBooking("booking-2");
    expect(usePaymentStore.getState().booking).toBeNull();
    expect(usePaymentStore.getState().currentBookingId).toBe("booking-2");

    await loadingPromise;
    expect(usePaymentStore.getState().booking?.id).toBe("booking-2");
  });

  it("marks payment paid by explicit booking id", async () => {
    vi.mocked(apiClient.get)
      .mockResolvedValueOnce({ data: mockBookingDto, status: 200 })
      .mockResolvedValueOnce({ data: mockPaymentDto, status: 200 });

    await usePaymentStore.getState().loadBooking("booking-1");

    vi.mocked(apiClient.post).mockResolvedValueOnce({
      data: mockPaymentSimulateSuccess,
      status: 200,
    });
    vi.mocked(apiClient.get).mockResolvedValueOnce({
      data: mockPaidBookingDto,
      status: 200,
    });

    await usePaymentStore.getState().markPaid("booking-1");

    const state = usePaymentStore.getState();
    expect(state.booking?.id).toBe("booking-1");
    expect(state.booking?.paymentStatus).toBe("paid");
    expect(state.actionMessage).toContain("thành công");
    expect(state.error).toBeNull();
  });

  it("updates failed payment by explicit booking id", async () => {
    vi.mocked(apiClient.post).mockResolvedValueOnce({
      data: mockPaymentSimulateFailed,
      status: 200,
    });
    vi.mocked(apiClient.get).mockResolvedValueOnce({
      data: mockFailedBookingDto,
      status: 200,
    });

    await usePaymentStore.getState().markFailed("booking-1");

    const state = usePaymentStore.getState();
    expect(state.booking?.id).toBe("booking-1");
    expect(state.booking?.paymentStatus).toBe("failed");
  });
});
