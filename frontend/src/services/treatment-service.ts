import { apiClient, type PaginatedData } from "@/lib/api-client";
import { type Treatment } from "@/types/treatment";
import { type TreatmentDto } from "@/types/api";
import { mapTreatment } from "@/services/mappers/treatment-mapper";

export const treatmentService = {
  async listTreatments(): Promise<Treatment[]> {
    try {
      const response = await apiClient.get<PaginatedData<TreatmentDto>>("/treatments/");
      const mapped = response.data.results.map(mapTreatment);
      return mapped;
    } catch (error) {
      console.error('[treatmentService] API Error:', error);
      throw error;
    }
  },

  async getTreatment(id: string): Promise<Treatment | null> {
    try {
      const response = await apiClient.get<TreatmentDto>(`/treatments/${id}/`);
      return mapTreatment(response.data);
    } catch (error) {
      if (error instanceof Error && error.message.includes("404")) {
        return null;
      }
      throw error;
    }
  },

  async listTreatmentsByTherapist(therapistId: string): Promise<Treatment[]> {
    const response = await apiClient.get<PaginatedData<TreatmentDto>>(
      `/therapists/${therapistId}/treatments/`
    );
    return response.data.results.map(mapTreatment);
  },
};
