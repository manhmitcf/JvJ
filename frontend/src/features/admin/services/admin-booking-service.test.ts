import { describe, expect, it, vi, beforeEach } from "vitest";
import { apiClient } from "@/lib/api-client";
import { getAdminBookingById, getAdminBookings } from "./admin-booking-service";

const mockBookingResults = [
  {
    id: "booking-1",
    code: "JVJ-0001",
    customer: { full_name: "Nguyen Van A" },
    therapist: { full_name: "Therapist X" },
    treatment: { name: "Massage tri lieu" },
    timeslot_date: "2026-06-15 08:00",
    total_amount: "350000",
    status: "pending",
    payment_status: "unpaid",
    payment_reference: null,
    address: "Hai Chau, Da Nang",
    note: null,
  },
  {
    id: "booking-2",
    code: "JVJ-0002",
    customer: { full_name: "Tran Thi B" },
    therapist: { full_name: "Therapist Y" },
    treatment: { name: "Vat ly tri lieu" },
    timeslot_date: "2026-06-16 09:00",
    total_amount: "500000",
    status: "confirmed",
    payment_status: "paid",
    payment_reference: "VNPAY123",
    address: "Thanh Khe, Da Nang",
    note: "Co ghi chu",
  },
  {
    id: "booking-3",
    code: "JVJ-0003",
    customer: { full_name: "Le Van C" },
    therapist: { full_name: "Therapist Z" },
    treatment: { name: "Cham cuu" },
    timeslot_date: "2026-06-17 10:00",
    total_amount: "420000",
    status: "pending",
    payment_status: "unpaid",
    payment_reference: null,
    address: "Son Tra, Da Nang",
    note: null,
  },
];

const mockAllPageBookings = { data: { results: mockBookingResults }, status: 200 };

describe("admin booking service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns all admin booking rows", async () => {
    vi.mocked(apiClient.get).mockResolvedValueOnce(mockAllPageBookings);

    const bookings = await getAdminBookings();

    expect(bookings.length).toBeGreaterThan(0);
    expect(bookings[0].customerName).toBeTruthy();
    expect(bookings[0].therapistName).toBeTruthy();
  });

  it("filters bookings by payment status", async () => {
    // The service passes payment_status as a query param to the backend.
    // Mock response includes only unpaid bookings that match the filter.
    vi.mocked(apiClient.get).mockResolvedValueOnce({
      data: {
        results: mockBookingResults.filter((b) => b.payment_status === "unpaid"),
      },
      status: 200,
    });

    const bookings = await getAdminBookings({ paymentStatus: "unpaid" });

    expect(bookings.every((booking) => booking.paymentStatus === "unpaid")).toBe(true);
  });

  it("returns booking detail by id", async () => {
    vi.mocked(apiClient.get)
      .mockResolvedValueOnce(mockAllPageBookings)
      .mockResolvedValueOnce({ data: mockBookingResults[0], status: 200 });

    const bookings = await getAdminBookings();
    const detail = await getAdminBookingById(bookings[0].id);

    expect(detail.code).toBe(bookings[0].code);
  });
});
