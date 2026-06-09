import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiFetch } from "@/lib/api-client";
import { useTreatmentStore } from "./treatment-store";
import { useAuthStore } from "@/features/auth/auth-store";

const mockTherapist = {
  id: "therapist-1",
  role: "therapist" as const,
  fullName: "Nguyen Van A",
  email: "therapist@example.com",
  phone: "0912345678",
  status: "approved" as const,
  yearsOfExperience: 5,
  specialties: ["massage"],
  rating: 4.8,
  completedBookings: 100,
  certificateUrls: [],
};

const mockTreatmentResults = [
  {
    id: "treatment-1",
    name: "Massage",
    description: "Massage tri lieu mo vai gay",
    price: 350000,
    duration_minutes: 60,
    category: "neck_shoulder",
    image_url: "",
    is_available: true,
    rating: 4.5,
    review_count: 10,
    therapist_id: "therapist-1",
    therapist_name: "Nguyen Van A",
  },
  {
    id: "treatment-2",
    name: "Vat ly tri lieu",
    description: "Vat ly tri lieu toan than",
    price: 500000,
    duration_minutes: 90,
    category: "physical_therapy",
    image_url: "",
    is_available: true,
    rating: 4.8,
    review_count: 5,
    therapist_id: "therapist-2", // Khác therapist
    therapist_name: "Tran Van B",
  },
];

const mockUpdatedTreatment = {
  id: "treatment-1",
  name: "Massage",
  description: "Massage tri lieu mo vai gay",
  price: 350000,
  duration_minutes: 60,
  category: "neck_shoulder",
  image_url: "",
  is_available: false,
  rating: 4.5,
  review_count: 10,
  therapist_id: "therapist-1",
  therapist_name: "Nguyen Van A",
};

describe("treatment-store", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useTreatmentStore.setState({
      treatments: [],
      isLoading: false,
      error: null,
    });
    // Reset auth store với therapist đang login
    useAuthStore.setState({
      user: mockTherapist,
      isInitialized: true,
    });
  });

  it("initializes with empty treatment state", () => {
    const state = useTreatmentStore.getState();

    expect(state.treatments).toEqual([]);
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();
  });

  it("fetches all treatments without filter", async () => {
    vi.mocked(apiFetch).mockResolvedValueOnce({
      count: 2,
      next: null,
      previous: null,
      results: mockTreatmentResults,
    });

    await useTreatmentStore.getState().fetchTreatments(false);

    const state = useTreatmentStore.getState();
    expect(state.treatments.length).toBe(2);
  });

  it("fetches and filters treatments by current therapist", async () => {
    vi.mocked(apiFetch).mockResolvedValueOnce({
      count: 2,
      next: null,
      previous: null,
      results: mockTreatmentResults,
    });

    await useTreatmentStore.getState().fetchTreatments(true);

    const state = useTreatmentStore.getState();
    expect(state.treatments.length).toBe(1);
    expect(state.treatments[0].id).toBe("treatment-1");
    expect(state.treatments.every((treatment) => treatment.therapistId === "therapist-1")).toBe(true);
  });

  it("updates treatment availability in state", async () => {
    vi.mocked(apiFetch)
      .mockResolvedValueOnce({
        count: 1,
        next: null,
        previous: null,
        results: [mockTreatmentResults[0]],
      })
      .mockResolvedValueOnce(mockUpdatedTreatment);

    await useTreatmentStore.getState().fetchTreatments(true);
    await useTreatmentStore.getState().updateTreatment("treatment-1", { isAvailable: false });

    expect(
      useTreatmentStore.getState().treatments.find((treatment) => treatment.id === "treatment-1")
        ?.isAvailable,
    ).toBe(false);
  });

  it("handles no current user when filtering", async () => {
    // Không có user login
    useAuthStore.setState({ user: null });

    vi.mocked(apiFetch).mockResolvedValueOnce({
      count: 2,
      next: null,
      previous: null,
      results: mockTreatmentResults,
    });

    await useTreatmentStore.getState().fetchTreatments(true);

    const state = useTreatmentStore.getState();
    // Khi không có user, vẫn trả về tất cả treatments
    expect(state.treatments.length).toBe(2);
  });
});
