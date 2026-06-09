import { type Spa } from "@/types/spa";
import { type SpaDto } from "@/types/api";

/**
 * Map backend spa DTO to frontend domain.
 */
export function mapSpa(dto: SpaDto): Spa {
  return {
    id: dto.id,
    name: dto.name,
    address: dto.address,
    district: dto.district,
    latitude: dto.latitude ? parseFloat(dto.latitude) : undefined,
    longitude: dto.longitude ? parseFloat(dto.longitude) : undefined,
    phone: dto.phone,
    email: dto.email,
    openTime: dto.open_time,
    closeTime: dto.close_time,
    description: dto.description,
    status: dto.status as "active" | "hidden",
    imageUrls: dto.image_urls,
    linkedTreatmentCount: dto.linked_treatment_count,
  };
}
