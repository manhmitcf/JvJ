import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiClient } from "@/lib/api-client";
import { bookingService } from "./booking-service";

describe("booking service payment actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("marks booking as paid", async () => {
    vi.mocked(apiClient.get).mockResolvedValue({
      data: {
        id: "booking-1",
        code: "BK001",
        customer: "customer-1",
        customer_name: "Nguyen Van A",
        therapist: "therapist-1",
        therapist_name: "Therapist Nguyen",
        treatment: "treatment-1",
        treatment_name: "Massage trị liệu",
        treatment_price: "390000",
        timeslot: "slot-1",
        slot_date: "2026-06-10",
        slot_start_time: "09:00",
        slot_end_time: "10:00",
        address: "123 Đà Nẵng",
        contact_phone: "0905123456",
        total_amount: "390000",
        status: "confirmed",
        payment_status: "paid",
        note: null,
        rejection_reason: null,
        confirmed_at: "2026-06-01T10:00:00Z",
        completed_at: null,
        cancelled_at: null,
        created_at: "2026-06-01T08:00:00Z",
      },
      status: 200,
    });

    const updated = await bookingService.markBookingPaid("booking-1");

    expect(updated.paymentStatus).toBe("paid");
  });

  it("marks booking as failed", async () => {
    vi.mocked(apiClient.get).mockResolvedValue({
      data: {
        id: "booking-1",
        code: "BK001",
        customer: "customer-1",
        customer_name: "Nguyen Van A",
        therapist: "therapist-1",
        therapist_name: "Therapist Nguyen",
        treatment: "treatment-1",
        treatment_name: "Massage trị liệu",
        treatment_price: "390000",
        timeslot: "slot-1",
        slot_date: "2026-06-10",
        slot_start_time: "09:00",
        slot_end_time: "10:00",
        address: "123 Đà Nẵng",
        contact_phone: "0905123456",
        total_amount: "390000",
        status: "confirmed",
        payment_status: "failed",
        note: null,
        rejection_reason: null,
        confirmed_at: "2026-06-01T10:00:00Z",
        completed_at: null,
        cancelled_at: null,
        created_at: "2026-06-01T08:00:00Z",
      },
      status: 200,
    });

    const updated = await bookingService.markBookingPaymentFailed("booking-1");

    expect(updated.paymentStatus).toBe("failed");
  });

  it("throws when booking not found", async () => {
    vi.mocked(apiClient.get).mockRejectedValue(new Error("Request failed with status code 404"));

    await expect(bookingService.markBookingPaid("missing-booking")).rejects.toThrow("Booking not found");
  });
});
