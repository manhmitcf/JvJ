import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiFetch } from "@/lib/api-client";
import { approveBooking, getTherapistBookings, rejectBooking } from "./booking-service";

const mockBookingApiResults = [
  {
    id: "booking-1",
    code: "JVJ-0001",
    customer: "customer-uuid-1",
    customer_name: "Nguyễn Văn A",
    therapist: "therapist-uuid-1",
    therapist_name: "Trần Hoài Nam",
    treatment: "treatment-uuid-1",
    treatment_name: "Massage cổ vai gáy",
    treatment_price: "350000",
    timeslot: "slot-uuid-1",
    slot_date: "2026-06-10",
    slot_start_time: "09:00",
    slot_end_time: "10:00",
    address: "123 Đà Nẵng",
    contact_phone: "0901234567",
    total_amount: "350000",
    status: "pending",
    payment_status: "unpaid",
    note: null,
    rejection_reason: null,
    confirmed_at: null,
    completed_at: null,
    cancelled_at: null,
    created_at: "2026-06-01T08:00:00Z",
  },
  {
    id: "booking-2",
    code: "JVJ-0002",
    customer: "customer-uuid-2",
    customer_name: "Trần Thị B",
    therapist: "therapist-uuid-1",
    therapist_name: "Trần Hoài Nam",
    treatment: "treatment-uuid-2",
    treatment_name: "Vật lý trị liệu",
    treatment_price: "500000",
    timeslot: "slot-uuid-2",
    slot_date: "2026-06-16",
    slot_start_time: "09:00",
    slot_end_time: "10:00",
    address: "456 Đà Nẵng",
    contact_phone: "0907654321",
    total_amount: "500000",
    status: "completed",
    payment_status: "paid",
    note: null,
    rejection_reason: null,
    confirmed_at: "2026-06-15T10:00:00Z",
    completed_at: "2026-06-16T10:00:00Z",
    cancelled_at: null,
    created_at: "2026-06-01T09:00:00Z",
  },
];

describe("booking-service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fetches only bookings that belong to a therapist", async () => {
    vi.mocked(apiFetch).mockResolvedValue({
      count: 2,
      next: null,
      previous: null,
      results: mockBookingApiResults,
    });

    const bookings = await getTherapistBookings();

    expect(bookings.length).toBe(2);
    expect(bookings[0].customerName).toBe("Nguyễn Văn A");
    expect(bookings[0].treatmentName).toBe("Massage cổ vai gáy");
    expect(bookings[0].status).toBe("pending");
  });

  it("approves a pending booking", async () => {
    vi.mocked(apiFetch).mockResolvedValue({
      id: "booking-1",
      code: "JVJ-0001",
      customer: "customer-uuid-1",
      customer_name: "Nguyễn Văn A",
      therapist: "therapist-uuid-1",
      therapist_name: "Trần Hoài Nam",
      treatment: "treatment-uuid-1",
      treatment_name: "Massage cổ vai gáy",
      treatment_price: "350000",
      timeslot: "slot-uuid-1",
      slot_date: "2026-06-10",
      slot_start_time: "09:00",
      slot_end_time: "10:00",
      address: "123 Đà Nẵng",
      contact_phone: "0901234567",
      total_amount: "350000",
      status: "confirmed",
      payment_status: "unpaid",
      note: null,
      rejection_reason: null,
      confirmed_at: "2026-06-10T08:00:00Z",
      completed_at: null,
      cancelled_at: null,
      created_at: "2026-06-01T08:00:00Z",
    });

    const booking = await approveBooking("booking-1");

    expect(booking.id).toBe("booking-1");
    expect(booking.status).toBe("confirmed");
  });

  it("rejects a booking with a reason", async () => {
    vi.mocked(apiFetch).mockResolvedValue({
      id: "booking-1",
      code: "JVJ-0001",
      customer: "customer-uuid-1",
      customer_name: "Nguyễn Văn A",
      therapist: "therapist-uuid-1",
      therapist_name: "Trần Hoài Nam",
      treatment: "treatment-uuid-1",
      treatment_name: "Massage cổ vai gáy",
      treatment_price: "350000",
      timeslot: "slot-uuid-1",
      slot_date: "2026-06-10",
      slot_start_time: "09:00",
      slot_end_time: "10:00",
      address: "123 Đà Nẵng",
      contact_phone: "0901234567",
      total_amount: "350000",
      status: "rejected",
      payment_status: "unpaid",
      note: null,
      rejection_reason: "Khung giờ không còn khả dụng",
      confirmed_at: null,
      completed_at: null,
      cancelled_at: null,
      created_at: "2026-06-01T08:00:00Z",
    });

    const booking = await rejectBooking("booking-1", "Khung giờ không còn khả dụng");

    expect(booking.id).toBe("booking-1");
    expect(booking.status).toBe("rejected");
    expect(booking.rejectionReason).toBe("Khung giờ không còn khả dụng");
  });

  it("requires a reason when rejecting booking", async () => {
    // Test không cần mock — validation throw trước khi gọi API
    await expect(rejectBooking("booking-1", " ")).rejects.toThrow("Reason required");
  });
});
