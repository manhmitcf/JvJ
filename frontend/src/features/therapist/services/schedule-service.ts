/**
 * Schedule service — gọi API thật của backend therapist timeslots.
 * Backend trả snake_case trong {data: ...}, FE dùng camelCase.
 * Backend lấy therapist từ JWT token — không cần truyền therapistId.
 */
import { apiFetch } from "@/lib/api-client";
import { type TimeSlot } from "@/types/schedule";

type TimeSlotApiResponse = {
  id: string;
  therapist: string;
  therapist_name: string;
  treatment: string;
  treatment_name: string;
  date: string;
  start_time: string;
  end_time: string;
  status: string;
  created_at: string;
  updated_at: string;
};

type TimeSlotListApiResponse = {
  count: number;
  next: string | null;
  previous: string | null;
  results: TimeSlotApiResponse[];
};

function mapApiToTimeSlot(api: TimeSlotApiResponse): TimeSlot {
  return {
    id: api.id,
    therapistId: api.therapist,
    date: api.date,
    startTime: api.start_time,
    endTime: api.end_time,
    isAvailable: api.status === "available",
    bookingId: api.status === "booked" ? api.id : undefined,
  };
}

export async function getTherapistSchedule(startDate: string, endDate: string): Promise<TimeSlot[]> {
  const data = await apiFetch<TimeSlotListApiResponse>(
    `/timeslots/therapist/timeslots/?date__gte=${startDate}&date__lte=${endDate}`,
  );
  return (data.results || []).map(mapApiToTimeSlot);
}

export async function createTimeSlot(data: { date: string; startTime: string; endTime: string; treatmentId?: string }): Promise<TimeSlot> {
  const body: Record<string, string> = {
    date: data.date,
    start_time: data.startTime,
    end_time: data.endTime,
  };
  if (data.treatmentId) {
    body.treatment = data.treatmentId;
  }

  const result = await apiFetch<TimeSlotApiResponse>("/timeslots/therapist/timeslots/create/", {
    method: "POST",
    body: JSON.stringify(body),
  });

  // Backend returns the created object directly
  return mapApiToTimeSlot(result);
}

export async function updateTimeSlot(
  slotId: string,
  updates: Partial<{ startTime: string; endTime: string; isAvailable: boolean }>,
): Promise<TimeSlot> {
  const body: Record<string, string> = {};
  if (updates.startTime) body.start_time = updates.startTime;
  if (updates.endTime) body.end_time = updates.endTime;
  if (updates.isAvailable !== undefined) {
    body.status = updates.isAvailable ? "available" : "disabled";
  }

  const result = await apiFetch<TimeSlotApiResponse>(`/timeslots/therapist/timeslots/${slotId}/`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
  return mapApiToTimeSlot(result);
}

export async function deleteTimeSlot(slotId: string): Promise<void> {
  await apiFetch(`/timeslots/therapist/timeslots/${slotId}/delete/`, { method: "DELETE" });
}
