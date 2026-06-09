import { create } from "zustand";
import { spaService } from "@/services/spa-service";
import { type Spa } from "@/types/spa";

type SpaStore = {
  spas: Spa[];
  selectedSpa: Spa | null;
  isLoading: boolean;
  error: string | null;
  searchQuery: string;
  districtFilter: string;
  loadSpas: () => Promise<void>;
  loadSpaById: (id: string) => Promise<void>;
  setSearchQuery: (query: string) => void;
  setDistrictFilter: (district: string) => void;
};

export const useSpaStore = create<SpaStore>((set) => ({
  spas: [],
  selectedSpa: null,
  isLoading: false,
  error: null,
  searchQuery: "",
  districtFilter: "all",

  loadSpas: async () => {
    set({ isLoading: true, error: null });

    try {
      const spas = await spaService.listPublicSpas();
      set((state) => ({
        spas,
        selectedSpa: spas.find((spa) => spa.id === state.selectedSpa?.id) ?? state.selectedSpa,
        isLoading: false,
        error: null,
      }));
    } catch (error) {
      set({
        spas: [],
        selectedSpa: null,
        error: (error as Error).message,
        isLoading: false,
      });
    }
  },

  loadSpaById: async (id) => {
    set({ isLoading: true, error: null, selectedSpa: null });

    try {
      const spa = await spaService.getSpaById(id);

      if (!spa) {
        set({
          selectedSpa: null,
          error: "Spa không tồn tại",
          isLoading: false,
        });
        return;
      }

      set((state) => ({
        selectedSpa: spa,
        spas: state.spas.some((item) => item.id === spa.id) ? state.spas : [...state.spas, spa],
        isLoading: false,
        error: null,
      }));
    } catch (error) {
      set({
        selectedSpa: null,
        error: (error as Error).message,
        isLoading: false,
      });
    }
  },

  setSearchQuery: (searchQuery) => {
    set({ searchQuery });
  },

  setDistrictFilter: (districtFilter) => {
    set({ districtFilter });
  },
}));
