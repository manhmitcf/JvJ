import { describe, it, expect, vi, beforeEach } from "vitest";
import { apiFetch } from "@/lib/api-client";
import {
  getWalletAppointments,
  getWalletMetrics,
} from "./wallet-service";

describe("wallet-service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should fetch wallet metrics from dashboard/profile endpoints", async () => {
    vi.mocked(apiFetch).mockResolvedValueOnce({
      pending_count: 3,
      completed_count: 12,
      today_appointments: [],
      monthly_revenue: 4200000,
      rating: 4.7,
    }).mockResolvedValueOnce({
      is_online: true,
    });

    const metrics = await getWalletMetrics();

    expect(metrics).toEqual({
      monthlyRevenue: 4200000,
      completedBookings: 12,
      pendingCount: 3,
      rating: 4.7,
      isOnline: true,
      todayAppointmentCount: 0,
    });
  });

  it("should map wallet appointments from dashboard response", async () => {
    vi.mocked(apiFetch).mockResolvedValueOnce({
      pending_count: 1,
      completed_count: 2,
      today_appointments: [
        {
          id: "apt-1",
          code: "BK-001",
          customer_name: "Nguyễn Văn A",
          treatment_name: "Massage trị liệu",
          start_time: "09:00",
          end_time: "10:00",
          address: "123 Hải Châu, Đà Nẵng",
          status: "confirmed",
        },
      ],
      monthly_revenue: 500000,
      rating: 4.2,
    });

    const appointments = await getWalletAppointments();

    expect(appointments).toEqual([
      {
        id: "apt-1",
        code: "BK-001",
        customerName: "Nguyễn Văn A",
        treatmentName: "Massage trị liệu",
        startTime: "09:00",
        endTime: "10:00",
        address: "123 Hải Châu, Đà Nẵng",
        status: "confirmed",
      },
    ]);
  });
});
