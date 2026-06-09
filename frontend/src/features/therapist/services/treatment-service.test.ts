import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiFetch } from "@/lib/api-client";
import {
  createTreatment,
  deleteTreatment,
  getTreatments,
  getTreatment,
  updateTreatment,
} from "./treatment-service";

const mockTreatmentResults = [
  {
    id: "treatment-1",
    therapist_id: "therapist-1",
    therapist_name: "Nguyen Van A",
    name: "Massage vai gáy",
    description: "Giảm đau vai gáy chuyên sâu",
    price: 350000,
    duration_minutes: 60,
    category: "neck_shoulder",
    image_url: "/mock/t1.jpg",
    is_available: true,
    rating: 4.5,
    review_count: 10,
  },
  {
    id: "treatment-2",
    therapist_id: "therapist-1",
    therapist_name: "Nguyen Van A",
    name: "Vật lý trị liệu",
    description: "Phục hồi chức năng toàn thân",
    price: 500000,
    duration_minutes: 90,
    category: "physical_therapy",
    image_url: "/mock/t2.jpg",
    is_available: true,
    rating: 4.8,
    review_count: 5,
  },
];

describe("treatment-service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fetches treatments list from API", async () => {
    vi.mocked(apiFetch).mockResolvedValue({
      count: 2,
      next: null,
      previous: null,
      results: mockTreatmentResults,
    });

    const treatments = await getTreatments();

    expect(treatments.length).toBe(2);
    expect(treatments[0].name).toBe("Massage vai gáy");
    expect(treatments[0].therapistId).toBe("therapist-1");
    expect(treatments[0].category).toBe("neck_shoulder");
    expect(treatments[0].isAvailable).toBe(true);
  });

  it("fetches single treatment detail", async () => {
    vi.mocked(apiFetch).mockResolvedValue(mockTreatmentResults[0]);

    const treatment = await getTreatment("treatment-1");

    expect(treatment.id).toBe("treatment-1");
    expect(treatment.name).toBe("Massage vai gáy");
  });

  it("creates a new treatment", async () => {
    vi.mocked(apiFetch).mockResolvedValue({
      id: "treatment-new-abc",
      therapist_id: "therapist-1",
      therapist_name: "Nguyen Van A",
      name: "Liệu trình test",
      description: "Mô tả liệu trình test",
      price: 390000,
      duration_minutes: 60,
      category: "recovery",
      image_url: "/mock/test.jpg",
      is_available: true,
      rating: 0,
      review_count: 0,
    });

    const created = await createTreatment({
      name: "Liệu trình test",
      category: "recovery",
      description: "Mô tả liệu trình test",
      price: 390000,
      durationMinutes: 60,
      imageUrl: "/mock/test.jpg",
      isAvailable: true,
    });

    expect(created.id).toBe("treatment-new-abc");
    expect(created.rating).toBe(0);
    expect(created.name).toBe("Liệu trình test");
  });

  it("updates treatment fields", async () => {
    vi.mocked(apiFetch).mockResolvedValue({
      id: "treatment-1",
      therapist_id: "therapist-1",
      therapist_name: "Nguyen Van A",
      name: "Massage vai gáy",
      description: "Giảm đau vai gáy chuyên sâu",
      price: 360000,
      duration_minutes: 60,
      category: "neck_shoulder",
      image_url: "/mock/t1.jpg",
      is_available: false,
      rating: 4.5,
      review_count: 10,
    });

    const updated = await updateTreatment("treatment-1", {
      price: 360000,
      isAvailable: false,
    });

    expect(updated.id).toBe("treatment-1");
    expect(updated.price).toBe(360000);
    expect(updated.isAvailable).toBe(false);
  });

  it("deletes a treatment", async () => {
    vi.mocked(apiFetch)
      // createTreatment → POST /treatments/
      .mockResolvedValueOnce({
        id: "treatment-delete-1",
        therapist_id: "therapist-1",
        therapist_name: "Nguyen Van A",
        name: "Liệu trình để xóa",
        description: "Dùng để kiểm tra xóa liệu trình",
        price: 420000,
        duration_minutes: 75,
        category: "acupressure",
        image_url: "/mock/delete.jpg",
        is_available: true,
        rating: 0,
        review_count: 0,
      })
      // deleteTreatment → DELETE /treatments/treatment-delete-1/
      .mockResolvedValueOnce({ message: "Dịch vụ đã được ẩn" })
      // getTreatments → GET /treatments/
      .mockResolvedValueOnce({
        count: 1,
        next: null,
        previous: null,
        results: [mockTreatmentResults[0]],
      });

    const created = await createTreatment({
      name: "Liệu trình để xóa",
      category: "acupressure",
      description: "Dùng để kiểm tra xóa liệu trình",
      price: 420000,
      durationMinutes: 75,
      imageUrl: "/mock/delete.jpg",
      isAvailable: true,
    });

    await deleteTreatment(created.id);

    const remaining = await getTreatments();
    expect(remaining.some((t) => t.id === created.id)).toBe(false);
  });
});