import { create } from "zustand";
import { type Treatment } from "@/types/treatment";
import {
  createTreatment as createTreatmentService,
  deleteTreatment as deleteTreatmentService,
  getTreatments,
  getMyTreatments,
  updateTreatment as updateTreatmentService,
} from "../services/treatment-service";
import { useAuthStore } from "@/features/auth/auth-store";

type TreatmentStore = {
  treatments: Treatment[];
  isLoading: boolean;
  error: string | null;
  fetchTreatments: (filterByCurrentTherapist?: boolean) => Promise<void>;
  createTreatment: (data: Omit<Treatment, "id" | "rating" | "reviewCount" | "therapistId" | "therapistName">) => Promise<void>;
  updateTreatment: (treatmentId: string, updates: Partial<Omit<Treatment, "id" | "therapistId" | "therapistName">>) => Promise<void>;
  deleteTreatment: (treatmentId: string) => Promise<void>;
};

export const useTreatmentStore = create<TreatmentStore>((set) => ({
  treatments: [],
  isLoading: false,
  error: null,

  fetchTreatments: async (filterByCurrentTherapist = false) => {
    set({ isLoading: true, error: null });
    try {
      // Nếu cần lấy treatments của therapist hiện tại, dùng endpoint therapist-specific
      if (filterByCurrentTherapist) {
        const currentUser = useAuthStore.getState().user;
        const currentTherapistId = currentUser?.id;

        if (!currentTherapistId) {
          set({ error: "Không tìm thấy thông tin therapist", isLoading: false });
          return;
        }

        const myTreatments = await getMyTreatments(currentTherapistId);
        set({ treatments: myTreatments, isLoading: false });
        return;
      }

      // Nếu không, lấy tất cả treatments (public)
      const allTreatments = await getTreatments();
      set({ treatments: allTreatments, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  createTreatment: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const treatment = await createTreatmentService(data);
      set((state) => ({ treatments: [...state.treatments, treatment], isLoading: false }));
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  updateTreatment: async (treatmentId, updates) => {
    set({ isLoading: true, error: null });
    try {
      const treatment = await updateTreatmentService(treatmentId, updates);
      set((state) => ({
        treatments: state.treatments.map((item) => (item.id === treatmentId ? treatment : item)),
        isLoading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  deleteTreatment: async (treatmentId) => {
    set({ isLoading: true, error: null });
    try {
      await deleteTreatmentService(treatmentId);
      set((state) => ({
        treatments: state.treatments.filter((treatment) => treatment.id !== treatmentId),
        isLoading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },
}));
