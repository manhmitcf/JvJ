import { apiClient, type PaginatedData } from "@/lib/api-client";
import { type Treatment } from "@/types/treatment";
import { type TreatmentDto } from "@/types/api";
import { mapTreatment } from "@/services/mappers/treatment-mapper";

export type TreatmentListResult = {
  treatments: Treatment[];
  totalCount: number;
  pageCount: number;
};

export const treatmentService = {
  async listTreatments(options?: {
    search?: string;
    page?: number;
    pageSize?: number;
  }): Promise<TreatmentListResult> {
    const params = new URLSearchParams();
    if (options?.search) params.append("search", options.search);
    if (options?.page) params.append("page", String(options.page));
    if (options?.pageSize) params.append("page_size", String(options.pageSize));

    const url = `/treatments/?${params.toString()}`;
    const response = await apiClient.get<PaginatedData<TreatmentDto>>(url);
    return {
      treatments: response.data.results.map(mapTreatment),
      totalCount: response.data.count,
      pageCount: Math.ceil(response.data.count / (options?.pageSize ?? 10)),
    };
  },

  async listTreatmentsByTherapist(therapistId: string): Promise<Treatment[]> {
    const response = await apiClient.get<PaginatedData<TreatmentDto>>(
      `/therapists/${therapistId}/treatments/`
    );
    return response.data.results.map(mapTreatment);
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
};
