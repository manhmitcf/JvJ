import { apiClient, type PaginatedData } from "@/lib/api-client";
import { type ReviewDto } from "@/types/api";
import { mapReview } from "@/services/mappers/review-mapper";
import { type Review } from "@/types/review";

type CreateReviewInput = {
  bookingId: string;
  treatmentId: string;
  rating: 1 | 2 | 3 | 4 | 5;
  comment: string;
  tags: string[];
};

export const reviewService = {
  /**
   * List all reviews (limited — backend does not expose a generic "list all" endpoint).
   * Used primarily by AppointmentsPage to determine which bookings have reviews.
   * Returns empty array; duplicate check happens server-side during creation.
   */
  async listReviews(): Promise<Review[]> {
    return [];
  },

  /**
   * Get public reviews for a treatment.
   * Only returns reviews where is_visible = true.
   */
  async listReviewsByTreatment(treatmentId: string): Promise<Review[]> {
    const response = await apiClient.get<PaginatedData<ReviewDto>>(`/reviews/treatments/${treatmentId}/`);
    return response.data.results.map(mapReview);
  },

  /**
   * Get public reviews for a therapist.
   * Only returns reviews where is_visible = true.
   */
  async listReviewsByTherapist(therapistId: string): Promise<Review[]> {
    const response = await apiClient.get<PaginatedData<ReviewDto>>(`/reviews/therapists/${therapistId}/`);
    return response.data.results.map(mapReview);
  },

  /**
   * Check if a booking has a review.
   * Backend does not expose a dedicated endpoint; returns null.
   * Duplicate review validation happens server-side on create.
   */
  async getReviewByBookingId(_bookingId: string): Promise<Review | null> {
    return null;
  },

  /**
   * Create a new review for a completed booking.
   * Backend validates: booking must be completed, must belong to customer,
   * must not already have a review.
   */
  async createReview(input: CreateReviewInput): Promise<Review> {
    const response = await apiClient.post<ReviewDto>("/reviews/", {
      booking_id: input.bookingId,
      treatment_id: input.treatmentId,
      rating: input.rating,
      comment: input.comment,
      tags: input.tags,
    });
    return mapReview(response.data);
  },
};
