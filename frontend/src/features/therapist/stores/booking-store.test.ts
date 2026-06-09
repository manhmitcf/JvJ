import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiFetch } from "@/lib/api-client";
import { useBookingStore } from "./booking-store";

const mockBookingApiResults = [
  {
    id: "booking-1",
    code: "JVJ-0001",
    customer: "customer-uuid-1",
    customer_name: "Nguyễn Văn A",
    therapist: "therapist-uuid-1",
    therapist_name: "Trần Hoài Nam",
    treatment: "treatment-uuid-1",
    treatment_name: "Massage vai gáy",
    treatment_price: "350000",
    timeslot: "slot-uuid-1",
    slot_date: "2026-06-15",
    slot_start_time: "08:00",
    slot_end_time: "09:00",
    address: "Hải Châu, Đà Nẵng",
    contact_phone: "0901000001",
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
    address: "Thanh Khê, Đà Nẵng",
    contact_phone: "0901000002",
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

const mockApprovedBooking = {
  id: "booking-1",
  code: "JVJ-0001",
  customer: "customer-uuid-1",
  customer_name: "Nguyễn Văn A",
  therapist: "therapist-uuid-1",
  therapist_name: "Trần Hoài Nam",
  treatment: "treatment-uuid-1",
  treatment_name: "Massage vai gáy",
  treatment_price: "350000",
  timeslot: "slot-uuid-1",
  slot_date: "2026-06-15",
  slot_start_time: "08:00",
  slot_end_time: "09:00",
  address: "Hải Châu, Đà Nẵng",
  contact_phone: "0901000001",
  total_amount: "350000",
  status: "confirmed",
  payment_status: "unpaid",
  note: null,
  rejection_reason: null,
  confirmed_at: "2026-06-15T08:00:00Z",
  completed_at: null,
  cancelled_at: null,
  created_at: "2026-06-01T08:00:00Z",
};

describe("booking-store", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useBookingStore.setState({
      bookings: [],
      isLoading: false,
      error: null,
    });
  });

  it("initializes with empty booking state", () => {
    const state = useBookingStore.getState();

    expect(state.bookings).toEqual([]);
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();
  });

  it("fetches bookings into state", async () => {
    vi.mocked(apiFetch).mockResolvedValueOnce({
      count: 2,
      next: null,
      previous: null,
      results: mockBookingApiResults,
    });

    await useBookingStore.getState().fetchBookings();

    const state = useBookingStore.getState();
    expect(state.bookings.length).toBe(2);
    expect(state.bookings[0].customerName).toBe("Nguyễn Văn A");
  });

  it("approves booking in state", async () => {
    vi.mocked(apiFetch)
      .mockResolvedValueOnce({
        count: 1,
        next: null,
        previous: null,
        results: [mockBookingApiResults[0]],
      })
      .mockResolvedValueOnce(mockApprovedBooking);

    await useBookingStore.getState().fetchBookings();
    await useBookingStore.getState().approveBooking("booking-1");

    expect(
      useBookingStore.getState().bookings.find((booking) => booking.id === "booking-1")?.status,
    ).toBe("confirmed");
  });
});
