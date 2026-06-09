import { apiClient, type PaginatedData } from "@/lib/api-client";
import { type Therapist } from "@/types/therapist";
import { type TherapistDto } from "@/types/api";
import { mapTherapist } from "@/services/mappers/therapist-mapper";

export const therapistService = {
  async listTherapists(): Promise<Therapist[]> {
    const response = await apiClient.get<PaginatedData<TherapistDto>>("/therapists/");
    return response.data.results.map(mapTherapist);
  },

  async listApprovedTherapists(): Promise<Therapist[]> {
    // Backend /therapists/ đã filter status=approved theo default
    return this.listTherapists();
  },

  async getTherapist(id: string): Promise<Therapist | null> {
    try {
      const response = await apiClient.get<TherapistDto>(`/therapists/${id}/`);
      return mapTherapist(response.data);
    } catch (error) {
      if (error instanceof Error && error.message.includes("404")) {
        return null;
      }
      throw error;
    }
  },
};
