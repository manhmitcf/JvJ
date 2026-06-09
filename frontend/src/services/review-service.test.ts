import { describe, expect, it, vi, afterEach } from "vitest";
import { apiClient } from "@/lib/api-client";

vi.mock("@/lib/api-client", () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
  API_BASE_URL: "http://localhost:8000/api/v1",
  PaginatedData: class {},
}));

import { reviewService } from "./review-service";

describe("reviewService", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("listReviewsByTreatment calls the correct endpoint", async () => {
    const mockResponse = {
      data: {
        count: 1,
        next: null,
        previous: null,
        results: [
          {
            id: "r-1",
            customer_name: "Nguyen Van A",
            customer_avatar: null,
            treatment_name: "Massage cổ vai gáy",
            rating: 5,
            comment: "Tuyệt vời",
            tags: ["Đúng giờ"],
            is_visible: true,
            created_at: "2026-06-01T10:00:00Z",
          },
        ],
      },
      status: 200,
    };
    vi.mocked(apiClient.get).mockResolvedValue(mockResponse);

    const reviews = await reviewService.listReviewsByTreatment("treatment-1");
    expect(apiClient.get).toHaveBeenCalledWith("/reviews/treatments/treatment-1/");
    expect(reviews).toHaveLength(1);
    expect(reviews[0].customerName).toBe("Nguyen Van A");
    expect(reviews[0].rating).toBe(5);
  });

  it("listReviewsByTherapist calls the correct endpoint", async () => {
    const mockResponse = {
      data: { count: 0, next: null, previous: null, results: [] },
      status: 200,
    };
    vi.mocked(apiClient.get).mockResolvedValue(mockResponse);

    const reviews = await reviewService.listReviewsByTherapist("therapist-1");
    expect(apiClient.get).toHaveBeenCalledWith("/reviews/therapists/therapist-1/");
    expect(reviews).toEqual([]);
  });

  it("createReview posts to /reviews/ and maps response", async () => {
    const mockResponse = {
      data: {
        id: "r-new",
        customer_name: "Nguyen Van A",
        customer_avatar: null,
        treatment_name: "Massage cổ vai gáy",
        rating: 4,
        comment: "Dịch vụ tốt",
        tags: ["Tận tâm"],
        is_visible: true,
        created_at: "2026-06-03T12:00:00Z",
      },
      status: 201,
    };
    vi.mocked(apiClient.post).mockResolvedValue(mockResponse);

    const result = await reviewService.createReview({
      bookingId: "booking-1",
      treatmentId: "treatment-1",
      rating: 4,
      comment: "Dịch vụ tốt",
      tags: ["Tận tâm"],
    });

    expect(apiClient.post).toHaveBeenCalledWith("/reviews/", {
      booking_id: "booking-1",
      treatment_id: "treatment-1",
      rating: 4,
      comment: "Dịch vụ tốt",
      tags: ["Tận tâm"],
    });
    expect(result.id).toBe("r-new");
    expect(result.customerName).toBe("Nguyen Van A");
  });

  it("listReviews returns empty array (no generic list endpoint)", async () => {
    const reviews = await reviewService.listReviews();
    expect(reviews).toEqual([]);
  });
});
