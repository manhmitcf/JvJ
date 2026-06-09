import { describe, it, expect, vi, beforeEach } from "vitest";
import { apiFetch } from "@/lib/api-client";
import {
  getDashboardMetrics,
  getTodayAppointments,
  toggleOnlineStatus,
} from "./dashboard-service";

describe("dashboard-service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should fetch dashboard metrics for therapist", async () => {
    vi.mocked(apiFetch).mockResolvedValueOnce({
      pending_count: 2,
      completed_count: 15,
      today_appointments: [],
      monthly_revenue: 5000000,
      rating: 4.5,
    }).mockResolvedValueOnce({
      is_online: true,
    });

    const metrics = await getDashboardMetrics();

    expect(metrics.completedBookings).toBeGreaterThanOrEqual(0);
    expect(metrics.rating).toBeGreaterThanOrEqual(0);
    expect(metrics.rating).toBeLessThanOrEqual(5);
    expect(typeof metrics.isOnline).toBe("boolean");
  });

  it("should fetch today appointments", async () => {
    vi.mocked(apiFetch).mockResolvedValueOnce({
      pending_count: 1,
      completed_count: 3,
      today_appointments: [
        {
          id: "apt-1",
          code: "AP001",
          customer_name: "Nguyen Van A",
          treatment_name: "Massage trị liệu",
          start_time: "09:00",
          end_time: "10:00",
          address: "123 Đà Nẵng",
          status: "confirmed",
        },
      ],
      monthly_revenue: 500000,
      rating: 4.0,
    }).mockResolvedValueOnce({
      is_online: false,
    });

    const appointments = await getTodayAppointments();

    expect(Array.isArray(appointments)).toBe(true);
    expect(appointments.length).toBe(1);
    expect(appointments[0].customerName).toBe("Nguyen Van A");
  });

  it("should toggle online status", async () => {
    vi.mocked(apiFetch).mockResolvedValue({ is_online: true });

    const newStatus = await toggleOnlineStatus(true);

    expect(newStatus).toBe(true);
  });
});
