import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Therapist } from "@/types/therapist";
import type { Treatment } from "@/types/treatment";
import { useSpaStore } from "@/features/spas/stores/spa-store";
import { useBookingWizardStore } from "./stores/booking-wizard-store";
import { BookingWizardPage } from "./BookingWizardPage";

const therapist: Therapist = {
  id: "therapist-1",
  role: "therapist",
  fullName: "Nguyen Thao Ly",
  email: "therapist@example.com",
  phone: "0900000000",
  status: "approved",
  yearsOfExperience: 5,
  specialties: ["Vật lý trị liệu"],
  rating: 5,
  completedBookings: 10,
  certificateUrls: [],
  bio: "",
  isOnline: true,
};

const treatment: Treatment = {
  id: "treatment-1",
  therapistId: therapist.id,
  name: "Vật lý trị liệu",
  category: "Vật lý trị liệu",
  description: "",
  price: 23444,
  durationMinutes: 45,
  rating: 0,
  images: [],
  imageUrl: "",
  isAvailable: true,
};

let root: Root | null = null;

async function renderWizard(path: string) {
  const container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);

  await act(async () => {
    root?.render(
      <MemoryRouter initialEntries={[path]}>
        <BookingWizardPage />
      </MemoryRouter>,
    );
    await Promise.resolve();
  });
}

describe("BookingWizardPage treatment links", () => {
  beforeEach(() => {
    useBookingWizardStore.getState().reset();
    useBookingWizardStore.setState({
      treatments: [treatment],
      therapists: [therapist],
      loadTreatments: vi.fn(async () => undefined),
      loadTherapists: vi.fn(async () => undefined),
    });
    useSpaStore.setState({
      spas: [],
      loadSpas: vi.fn(async () => undefined),
    });
  });

  afterEach(() => {
    act(() => root?.unmount());
    root = null;
    document.body.replaceChildren();
  });

  it("opens Step 2 with the exact treatment from the URL", async () => {
    await renderWizard(`/app/bookings/new?treatmentId=${treatment.id}`);

    const state = useBookingWizardStore.getState();
    expect(state.currentStep).toBe(2);
    expect(state.selectedTreatment?.id).toBe(treatment.id);
    expect(state.selectedTherapist?.id).toBe(therapist.id);
    expect(document.body.textContent).toContain("Chọn ngày và khung giờ");
  });

  it("shows only the selected treatment details and a change-treatment link on Step 1", async () => {
    await renderWizard(`/app/bookings/new?treatmentId=${treatment.id}`);

    act(() => useBookingWizardStore.getState().setCurrentStep(1));

    expect(document.body.textContent).toContain("Liệu trình đã chọn");
    expect(document.body.textContent).toContain(treatment.name);
    expect(document.querySelector('input[placeholder="Tìm kiếm liệu trình..."]')).toBeNull();
    const changeTreatmentLink = Array.from(document.querySelectorAll<HTMLAnchorElement>('a[href="/treatments"]'))
      .find((link) => link.textContent?.includes("Đổi liệu trình"));
    expect(changeTreatmentLink).toBeDefined();
  });

  it("asks the user to choose a treatment when opened without a treatment link", async () => {
    await renderWizard("/app/bookings/new");

    expect(useBookingWizardStore.getState().currentStep).toBe(1);
    expect(document.body.textContent).toContain("Chọn liệu trình");
  });
});
