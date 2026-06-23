import { beforeEach, describe, expect, it } from "vitest";
import type { Booking } from "@/types/booking";
import type { Therapist } from "@/types/therapist";
import type { TimeSlot } from "@/types/time-slot";
import type { Treatment } from "@/types/treatment";
import { useBookingWizardStore } from "./booking-wizard-store";

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

const timeSlot: TimeSlot = {
  id: "slot-1",
  therapistId: therapist.id,
  treatmentId: treatment.id,
  date: "2026-06-24",
  startTime: "09:00",
  endTime: "09:45",
  status: "available",
};

const booking = { id: "booking-1" } as Booking;

describe("booking-wizard-store selection invariants", () => {
  beforeEach(() => {
    useBookingWizardStore.getState().reset();
    useBookingWizardStore.setState({
      therapists: [therapist],
      selectedDate: timeSlot.date,
      selectedTimeSlot: timeSlot,
      availableSlots: [timeSlot],
      createdBooking: booking,
    });
  });

  it("selects the treatment owner and clears stale booking-dependent state", () => {
    useBookingWizardStore.getState().selectTreatment(treatment);

    const state = useBookingWizardStore.getState();
    expect(state.selectedTreatment).toEqual(treatment);
    expect(state.selectedTherapist).toEqual(therapist);
    expect(state.selectedDate).toBeNull();
    expect(state.selectedTimeSlot).toBeNull();
    expect(state.availableSlots).toEqual([]);
    expect(state.createdBooking).toBeNull();
  });

  it("clears stale slot state when the therapist changes", () => {
    useBookingWizardStore.getState().selectTherapist(therapist);

    const state = useBookingWizardStore.getState();
    expect(state.selectedTherapist).toEqual(therapist);
    expect(state.selectedDate).toBeNull();
    expect(state.selectedTimeSlot).toBeNull();
    expect(state.availableSlots).toEqual([]);
    expect(state.createdBooking).toBeNull();
  });
});
