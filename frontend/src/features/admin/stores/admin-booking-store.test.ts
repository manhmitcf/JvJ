import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiClient } from "@/lib/api-client";
import { useAdminBookingStore } from "./admin-booking-store";

describe("admin booking store", () => {
  beforeEach(() => {
    useAdminBookingStore.setState({ bookings: [], selectedBooking: null, isLoading: false, error: null });
  });

  it("fetches bookings", async () => {
    vi.mocked(apiClient.get).mockResolvedValue({
      data: {
        results: [
          {
            id: "booking-1",
            code: "JVJ-0001",
            customer_name: "Nguyễn Văn A",
            therapist_name: "Therapist A",
            treatment_name: "Massage cổ vai gáy",
            timeslot_date: "2026-06-10",
            total_amount: 500000,
            status: "confirmed",
            payment_status: "unpaid",
            payment_reference: null,
            address: "123 Đà Nẵng",
            note: null,
          },
        ],
      },
      status: 200,
    });

    await useAdminBookingStore.getState().fetchBookings();

    expect(useAdminBookingStore.getState().bookings.length).toBeGreaterThan(0);
  });

  it("selects booking detail", async () => {
    vi.mocked(apiClient.get).mockResolvedValueOnce({
      data: {
        results: [
          {
            id: "booking-1",
            code: "JVJ-0001",
            customer_name: "Nguyễn Văn A",
            therapist_name: "Therapist A",
            treatment_name: "Massage cổ vai gáy",
            timeslot_date: "2026-06-10",
            total_amount: 500000,
            status: "confirmed",
            payment_status: "unpaid",
            payment_reference: null,
            address: "123 Đà Nẵng",
            note: null,
          },
        ],
      },
      status: 200,
    }).mockResolvedValueOnce({
      data: {
        id: "booking-1",
        code: "JVJ-0001",
        customer_name: "Nguyễn Văn A",
        therapist_name: "Therapist A",
        treatment_name: "Massage cổ vai gáy",
        timeslot_date: "2026-06-10",
        total_amount: 500000,
        status: "confirmed",
        payment_status: "unpaid",
        payment_reference: null,
        address: "123 Đà Nẵng",
        note: null,
      },
      status: 200,
    });

    await useAdminBookingStore.getState().fetchBookings();
    const booking = useAdminBookingStore.getState().bookings[0];

    await useAdminBookingStore.getState().selectBooking(booking.id);

    expect(useAdminBookingStore.getState().selectedBooking?.id).toBe(booking.id);
  });
});
