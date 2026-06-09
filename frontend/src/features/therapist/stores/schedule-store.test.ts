import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiFetch } from "@/lib/api-client";
import { useScheduleStore } from "./schedule-store";

const mockSlotResults = [
  {
    id: "slot-1",
    therapist: "therapist-1",
    therapist_name: "Nguyen Van A",
    treatment: "treatment-1",
    treatment_name: "Massage vai gáy",
    date: "2026-06-01",
    start_time: "08:00",
    end_time: "09:00",
    status: "available",
    created_at: "2026-06-01T08:00:00Z",
    updated_at: "2026-06-01T08:00:00Z",
  },
  {
    id: "slot-2",
    therapist: "therapist-1",
    therapist_name: "Nguyen Van A",
    treatment: "treatment-1",
    treatment_name: "Massage vai gáy",
    date: "2026-06-01",
    start_time: "09:00",
    end_time: "10:00",
    status: "available",
    created_at: "2026-06-01T09:00:00Z",
    updated_at: "2026-06-01T09:00:00Z",
  },
  {
    id: "slot-3",
    therapist: "therapist-1",
    therapist_name: "Nguyen Van A",
    treatment: "treatment-2",
    treatment_name: "Vật lý trị liệu",
    date: "2026-06-02",
    start_time: "08:00",
    end_time: "09:00",
    status: "booked",
    created_at: "2026-06-02T08:00:00Z",
    updated_at: "2026-06-02T08:00:00Z",
  },
];

describe("schedule-store", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useScheduleStore.setState({
      slots: [],
      isLoading: false,
      error: null,
    });
  });

  it("initializes with empty schedule state", () => {
    const state = useScheduleStore.getState();

    expect(state.slots).toEqual([]);
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();
  });

  it("fetches schedule into state", async () => {
    vi.mocked(apiFetch).mockResolvedValueOnce({
      count: 3,
      next: null,
      previous: null,
      results: mockSlotResults,
    });

    await useScheduleStore.getState().fetchSchedule("2026-06-01", "2026-06-07");

    const state = useScheduleStore.getState();
    expect(state.slots.length).toBe(3);
    expect(state.slots[2].bookingId).toBe("slot-3");
  });

  it("keeps booked slot delete errors in state", async () => {
    vi.mocked(apiFetch).mockRejectedValueOnce(
      new Error("Cannot delete slot with booking"),
    );

    await useScheduleStore.getState().deleteSlot("slot-with-booking");

    expect(useScheduleStore.getState().error).toBe("Cannot delete slot with booking");
  });
});
