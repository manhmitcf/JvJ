import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiFetch } from "@/lib/api-client";
import { createTimeSlot, deleteTimeSlot, getTherapistSchedule, updateTimeSlot } from "./schedule-service";

const mockSlots = [
  {
    id: "slot-1",
    therapist: "therapist-1",
    therapist_name: "Nguyen Van A",
    treatment: "treatment-1",
    treatment_name: "Massage vai gáy",
    date: "2026-06-01",
    start_time: "09:00",
    end_time: "10:00",
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
    date: "2026-06-03",
    start_time: "14:00",
    end_time: "15:00",
    status: "booked",
    created_at: "2026-06-03T13:00:00Z",
    updated_at: "2026-06-03T13:00:00Z",
  },
];

describe("schedule-service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fetches therapist slots inside a date range", async () => {
    vi.mocked(apiFetch).mockResolvedValue({
      count: 2,
      next: null,
      previous: null,
      results: mockSlots,
    });

    const slots = await getTherapistSchedule("2026-06-01", "2026-06-07");

    expect(slots.length).toBe(2);
    expect(slots.every((slot) => slot.therapistId === "therapist-1")).toBe(true);
    expect(slots[1].bookingId).toBe("slot-2");
  });

  it("creates a time slot", async () => {
    vi.mocked(apiFetch).mockResolvedValue({
      id: "slot-new-abc",
      therapist: "therapist-1",
      therapist_name: "Nguyen Van A",
      treatment: "treatment-1",
      treatment_name: "Massage vai gáy",
      date: "2026-06-10",
      start_time: "09:00",
      end_time: "10:00",
      status: "available",
      created_at: "2026-06-10T08:00:00Z",
      updated_at: "2026-06-10T08:00:00Z",
    });

    const created = await createTimeSlot({
      date: "2026-06-10",
      startTime: "09:00",
      endTime: "10:00",
      treatmentId: "treatment-1",
    });

    expect(created.id).toBe("slot-new-abc");
    expect(created.date).toBe("2026-06-10");
    expect(created.isAvailable).toBe(true);
  });

  it("updates a time slot", async () => {
    vi.mocked(apiFetch).mockResolvedValue({
      id: "slot-1",
      therapist: "therapist-1",
      therapist_name: "Nguyen Van A",
      treatment: "treatment-1",
      treatment_name: "Massage vai gáy",
      date: "2026-06-01",
      start_time: "10:00",
      end_time: "11:00",
      status: "available",
      created_at: "2026-06-01T08:00:00Z",
      updated_at: "2026-06-01T09:00:00Z",
    });

    const updated = await updateTimeSlot("slot-1", { startTime: "10:00", endTime: "11:00" });

    expect(updated.id).toBe("slot-1");
    expect(updated.startTime).toBe("10:00");
    expect(updated.endTime).toBe("11:00");
  });

  it("does not delete a booked time slot", async () => {
    vi.mocked(apiFetch).mockRejectedValue(new Error("Cannot delete slot with booking"));

    await expect(deleteTimeSlot("slot-with-booking")).rejects.toThrow("Cannot delete slot with booking");
  });
});
