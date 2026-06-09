import { describe, expect, it, vi } from "vitest";
import { apiClient } from "@/lib/api-client";
import { getAdminOverview } from "./admin-overview-service";

describe("admin overview service", () => {
  it("returns admin metrics, chart points, and alerts", async () => {
    vi.mocked(apiClient.get).mockResolvedValue({
      data: {
        total_customers: 10,
        active_therapists: 5,
        new_bookings_today: 3,
        pending_therapist_approvals: 2,
      },
      status: 200,
    });

    const overview = await getAdminOverview();

    expect(overview.metrics.totalCustomers).toBeGreaterThan(0);
    expect(overview.metrics.pendingTherapistApprovals).toBeGreaterThanOrEqual(1);
    expect(overview.alerts.some((alert) => alert.href === "/admin/therapist-approvals")).toBe(true);
  });
});
