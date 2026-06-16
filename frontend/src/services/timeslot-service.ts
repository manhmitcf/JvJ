import { apiClient, type PaginatedData } from "@/lib/api-client";
import { type TimeSlot } from "@/types/time-slot";

type TimeSlotDto = {
  id: string;
  therapist: string;
  treatment: string;
  date: string;
  start_time: string;
  end_time: string;
  status: "available" | "booked" | "disabled";
  created_at: string;
  updated_at: string;
};

function mapTimeSlot(dto: TimeSlotDto): TimeSlot {
  return {
    id: dto.id,
    therapistId: dto.therapist,
    treatmentId: dto.treatment,
    date: dto.date,
    startTime: dto.start_time,
    endTime: dto.end_time,
    status: dto.status,
  };
}

export const timeslotService = {
  async listTimeSlots(filters?: {
    therapistId?: string;
    treatmentId?: string;
    date?: string;
    status?: string;
  }): Promise<TimeSlot[]> {
    const params = new URLSearchParams();
    if (filters?.therapistId) params.append("therapist", filters.therapistId);
    if (filters?.treatmentId) params.append("treatment", filters.treatmentId);
    if (filters?.date) params.append("date", filters.date);
    if (filters?.status) params.append("status", filters.status);

    const url = `/timeslots/?${params.toString()}`;

    const response = await apiClient.get<PaginatedData<TimeSlotDto>>(url);

    return response.data.results.map(mapTimeSlot);
  },

  async listAvailableTimeSlots(filters?: {
    therapistId?: string;
    treatmentId?: string;
    date?: string;
  }): Promise<TimeSlot[]> {
    return this.listTimeSlots({ ...filters, status: "available" });
  },

  async getTimeSlot(id: string): Promise<TimeSlot | null> {
    try {
      const response = await apiClient.get<TimeSlotDto>(`/timeslots/${id}/`);
      return mapTimeSlot(response.data);
    } catch (error) {
      if (error instanceof Error && error.message.includes("404")) {
        return null;
      }
      throw error;
    }
  },
};
