import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiClient } from "@/lib/api-client";
import { useAdminOverviewStore } from "./admin-overview-store";

describe("admin overview store", () => {
  beforeEach(() => {
    useAdminOverviewStore.setState({ overview: null, isLoading: false, error: null });
  });

  it("fetches overview into state", async () => {
    vi.mocked(apiClient.get).mockResolvedValue({
      data: {
        total_customers: 10,
        active_therapists: 5,
        new_bookings_today: 3,
        pending_therapist_approvals: 2,
      },
      status: 200,
    });

    await useAdminOverviewStore.getState().fetchOverview();

    const state = useAdminOverviewStore.getState();
    expect(state.overview?.metrics.totalCustomers).toBeGreaterThan(0);
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();
  });
});
