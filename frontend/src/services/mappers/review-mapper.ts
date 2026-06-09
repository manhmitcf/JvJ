import { type ReviewDto } from "@/types/api";
import { type Review } from "@/types/review";

/**
 * Map backend ReviewDto (snake_case) to frontend domain (camelCase).
 */
export function mapReview(dto: ReviewDto): Review {
  return {
    id: dto.id,
    customerName: dto.customer_name,
    customerAvatar: dto.customer_avatar,
    treatmentName: dto.treatment_name,
    rating: dto.rating,
    comment: dto.comment,
    tags: dto.tags,
    isVisible: dto.is_visible,
    createdAt: dto.created_at,
  };
}
