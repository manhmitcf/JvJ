import { apiClient, type PaginatedData } from "@/lib/api-client";
import { type Spa } from "@/types/spa";
import { type SpaDto } from "@/types/api";
import { mapSpa } from "@/services/mappers/spa-mapper";

export const spaService = {
  async listPublicSpas(): Promise<Spa[]> {
    const response = await apiClient.get<PaginatedData<SpaDto>>("/spas/");
    return response.data.results.map(mapSpa);
  },

  async getSpaById(id: string): Promise<Spa | null> {
    try {
      const response = await apiClient.get<SpaDto>(`/spas/${id}/`);
      return mapSpa(response.data);
    } catch (error) {
      if (error instanceof Error && error.message.includes("404")) {
        return null;
      }
      throw error;
    }
  },
};
