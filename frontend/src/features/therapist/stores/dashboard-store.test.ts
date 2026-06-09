import { describe, it, expect, beforeEach } from "vitest";
import { useDashboardStore } from "./dashboard-store";

describe("dashboard-store", () => {
  beforeEach(() => {
    useDashboardStore.setState({
      metrics: null,
      todayAppointments: [],
      isLoading: false,
      error: null,
    });
  });

  it("should initialize with null metrics", () => {
    const state = useDashboardStore.getState();
    expect(state.metrics).toBeNull();
    expect(state.todayAppointments).toEqual([]);
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();
  });

  it("should have fetchDashboard action", () => {
    const state = useDashboardStore.getState();
    expect(typeof state.fetchDashboard).toBe("function");
  });

  it("should have toggleOnline action", () => {
    const state = useDashboardStore.getState();
    expect(typeof state.toggleOnline).toBe("function");
  });
});
