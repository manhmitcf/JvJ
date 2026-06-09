import { type Treatment } from "@/types/treatment";
import { type TreatmentDto } from "@/types/api";

/**
 * Map backend DTO (snake_case) to frontend domain (camelCase).
 */
export function mapTreatment(dto: TreatmentDto): Treatment {
  return {
    id: dto.id,
    name: dto.name,
    description: dto.description,
    category: dto.category as Treatment["category"],
    durationMinutes: dto.duration_minutes,
    price: parseFloat(dto.price),
    images: dto.images || [],
    imageUrl: dto.image_url || "",
    therapistId: dto.therapist_id,
    therapistName: dto.therapist_name,
    rating: parseFloat(dto.rating),
    reviewCount: dto.review_count,
    isAvailable: dto.is_available,
  };
}
