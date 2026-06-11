import { apiClient, apiFetch, type PaginatedData } from "@/lib/api-client";
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
   * Get review for a booking (customer only).
   * GET /api/v1/reviews/bookings/:bookingId/
   * Returns null if no review exists.
   */
  async getReviewByBookingId(bookingId: string): Promise<Review | null> {
    try {
      const response = await apiFetch<ReviewDto | null>(`/reviews/bookings/${bookingId}/`);
      if (!response) return null;
      return mapReview(response);
    } catch (err) {
      console.warn(`[ReviewService] getReviewByBookingId(${bookingId}) error:`, err);
      return null;
    }
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

  /**
   * Get review status for multiple bookings in one call (customer only).
   * POST /api/v1/reviews/my/
   * Body: { booking_ids: string[] }
   * Returns: { data: { [bookingId]: ReviewDto | null } }
   */
  async getMyReviews(bookingIds: string[]): Promise<Record<string, Review | null>> {
    type MyReviewsResponse = { data: Record<string, ReviewDto | null> };
    const response = await apiFetch<MyReviewsResponse>("/reviews/my/", {
      method: "POST",
      body: JSON.stringify({ booking_ids: bookingIds }),
    });
    const result: Record<string, Review | null> = {};
    for (const [bookingId, dto] of Object.entries(response.data)) {
      result[bookingId] = dto ? mapReview(dto) : null;
    }
    return result;
  },

  /**
   * Update an existing review.
   * PATCH /api/v1/reviews/:id/
   * Only the review owner can update.
   */
  async updateReview(input: {
    id: string;
    rating: 1 | 2 | 3 | 4 | 5;
    comment: string;
    tags: string[];
  }): Promise<Review> {
    const response = await apiClient.patch<ReviewDto>(`/reviews/${input.id}/`, {
      rating: input.rating,
      comment: input.comment,
      tags: input.tags,
    });
    return mapReview(response.data);
  },

  /**
   * Delete an existing review.
   * DELETE /api/v1/reviews/:id/
   * Only the review owner can delete.
   */
  async deleteReview(id: string): Promise<void> {
    await apiClient.delete(`/reviews/${id}/`);
  },
};
