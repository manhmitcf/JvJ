import { create } from "zustand";
import { treatmentService } from "@/services/treatment-service";
import { therapistService } from "@/services/therapist-service";
import { timeslotService } from "@/services/timeslot-service";
import { bookingService } from "@/services/booking-service";
import { updateProfile } from "@/features/customer/services/profile-service";
import { type Treatment } from "@/types/treatment";
import { type Therapist } from "@/types/therapist";
import { type TimeSlot } from "@/types/time-slot";
import { type Booking } from "@/types/booking";

type BookingWizardStep = 1 | 2 | 3 | 4 | 5;

type HealthInfo = {
  conditions: string[];
  notes: string;
};

type BookingWizardState = {
  // Current step
  currentStep: BookingWizardStep;
  completedSteps: number[];

  // Step 1: Treatment & Therapist
  selectedTreatment: Treatment | null;
  selectedTherapist: Therapist | null;
  treatments: Treatment[];
  treatmentPage: number;
  treatmentPageCount: number;
  treatmentTotalCount: number;
  treatmentSearch: string;
  therapists: Therapist[];

  // Step 2: Time slot
  selectedDate: string | null;
  selectedTimeSlot: TimeSlot | null;
  availableSlots: TimeSlot[];
  availableDates: string[];

  // Step 3: Address
  address: string;
  contactPhone: string;
  addressNote: string;
  saveAddress: boolean;

  // Step 4: Health
  healthInfo: HealthInfo;

  // Step 5: Confirmation
  createdBooking: Booking | null;

  // Loading states
  isLoadingTreatments: boolean;
  isLoadingTherapists: boolean;
  isLoadingSlots: boolean;
  isCreatingBooking: boolean;
  error: string | null;

  // Actions
  setCurrentStep: (step: BookingWizardStep) => void;
  loadTreatments: (opts?: { page?: number; search?: string }) => Promise<void>;
  loadTherapists: () => Promise<void>;
  selectTreatment: (treatment: Treatment) => void;
  selectTherapist: (therapist: Therapist) => void;
  loadAvailableSlots: (date: string) => Promise<void>;
  selectDate: (date: string) => void;
  selectTimeSlot: (slot: TimeSlot) => void;
  setAddress: (address: string, phone: string, note: string, save: boolean) => void;
  setHealthInfo: (info: HealthInfo) => void;
  createBooking: () => Promise<void>;
  reset: () => void;
};

const initialState = {
  currentStep: 1 as BookingWizardStep,
  completedSteps: [],
  selectedTreatment: null,
  selectedTherapist: null,
  treatments: [],
  treatmentPage: 1,
  treatmentPageCount: 1,
  treatmentTotalCount: 0,
  treatmentSearch: "",
  therapists: [],
  selectedDate: null,
  selectedTimeSlot: null,
  availableSlots: [],
  availableDates: [],
  address: "",
  contactPhone: "",
  addressNote: "",
  saveAddress: false,
  healthInfo: { conditions: [], notes: "" },
  createdBooking: null,
  isLoadingTreatments: false,
  isLoadingTherapists: false,
  isLoadingSlots: false,
  isCreatingBooking: false,
  error: null,
};

export const useBookingWizardStore = create<BookingWizardState>((set, get) => ({
  ...initialState,

  setCurrentStep: (step) => {
    const currentStep = get().currentStep;
    set({
      currentStep: step,
      completedSteps: Array.from(
        new Set([...get().completedSteps, ...Array.from({ length: currentStep }, (_, i) => i + 1)])
      ).filter((s) => s < step),
    });
  },

  loadTreatments: async (opts?: { page?: number; search?: string }) => {
    set({ isLoadingTreatments: true, error: null });
    try {
      const page = opts?.page ?? 1;
      const result = await treatmentService.listTreatments({
        page,
        pageSize: 10,
        search: opts?.search ?? get().treatmentSearch,
      });
      set({
        treatments: result.treatments,
        treatmentPage: page,
        treatmentPageCount: result.pageCount,
        treatmentTotalCount: result.totalCount,
        isLoadingTreatments: false,
      });
    } catch (error) {
      set({
        error: (error as Error).message,
        isLoadingTreatments: false,
      });
    }
  },

  loadTherapists: async () => {
    set({ isLoadingTherapists: true, error: null });
    try {
      const therapists = await therapistService.listApprovedTherapists();
      set({ therapists, isLoadingTherapists: false });
    } catch (error) {
      set({
        error: (error as Error).message,
        isLoadingTherapists: false,
      });
    }
  },

  selectTreatment: (treatment) => {
    set({
      selectedTreatment: treatment,
      selectedDate: null,
      selectedTimeSlot: null,
      availableSlots: [],
      createdBooking: null,
    });
    // Auto-select the therapist who owns this treatment
    const { therapists } = get();
    const owningTherapist = therapists.find((t) => t.id === treatment.therapistId);
    if (owningTherapist) {
      set({ selectedTherapist: owningTherapist });
    }
  },

  selectTherapist: (therapist) => {
    set({
      selectedTherapist: therapist,
      selectedDate: null,
      selectedTimeSlot: null,
      availableSlots: [],
      createdBooking: null,
    });
  },

  loadAvailableSlots: async (date) => {
    const { selectedTherapist, selectedTreatment } = get();

    if (!selectedTherapist || !selectedTreatment) {
      set({ error: "Vui lòng chọn liệu trình và kỹ thuật viên trước" });
      return;
    }

    set({ isLoadingSlots: true, error: null });
    try {
      const slots = await timeslotService.listAvailableTimeSlots({
        therapistId: selectedTherapist.id,
        treatmentId: selectedTreatment.id,
        date,
      });
      set({ availableSlots: slots, isLoadingSlots: false });
    } catch (error) {
      console.error('[BookingWizard] Error loading slots:', error);
      set({
        error: (error as Error).message,
        isLoadingSlots: false,
      });
    }
  },

  selectDate: (date) => {
    set({ selectedDate: date, selectedTimeSlot: null });
    void get().loadAvailableSlots(date);
  },

  selectTimeSlot: (slot) => {
    set({ selectedTimeSlot: slot });
  },

  setAddress: (address, phone, note, save) => {
    set({ address, contactPhone: phone, addressNote: note, saveAddress: save });
  },

  setHealthInfo: (info) => {
    set({ healthInfo: info });
  },

  createBooking: async () => {
    const { selectedTimeSlot, selectedTreatment, selectedTherapist, address, contactPhone, addressNote, healthInfo, saveAddress } = get();

    if (!selectedTimeSlot || !selectedTreatment || !selectedTherapist) {
      set({ error: "Thiếu thông tin đặt lịch" });
      return;
    }

    set({ isCreatingBooking: true, error: null });
    try {
      const healthNote = [
        healthInfo.conditions.length > 0 ? `Tình trạng: ${healthInfo.conditions.join(", ")}` : "",
        healthInfo.notes ? `Ghi chú: ${healthInfo.notes}` : "",
        addressNote ? `Lưu ý địa chỉ: ${addressNote}` : "",
      ]
        .filter(Boolean)
        .join(" | ");

      const booking = await bookingService.createBooking({
        timeslot_id: selectedTimeSlot.id,
        treatment_id: selectedTreatment.id,
        therapist_id: selectedTherapist.id,
        address,
        contact_phone: contactPhone,
        note: healthNote || undefined,
      });

      // Fire-and-forget: persist address to customer profile if requested
      if (saveAddress && address.trim()) {
        void updateProfile({ address });
      }

      set({
        createdBooking: booking,
        isCreatingBooking: false,
        currentStep: 5,
      });
    } catch (error) {
      set({
        error: (error as Error).message,
        isCreatingBooking: false,
      });
    }
  },

  reset: () => {
    set(initialState);
  },
}));
