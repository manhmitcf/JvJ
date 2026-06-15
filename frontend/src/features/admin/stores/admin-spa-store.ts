import { create } from "zustand";
import { type Spa, type SpaFormInput } from "@/types/spa";
import { createSpa, deleteSpa, getAdminSpas, updateSpa as updateSpaService, type AdminSpaFilters } from "../services/admin-spa-service";

type AdminSpaStore = {
  spas: Spa[];
  selectedSpa: Spa | null;
  isLoading: boolean;
  error: string | null;
  fetchSpas: (filters?: AdminSpaFilters) => Promise<void>;
  selectSpa: (spaId: string) => void;
  createSpa: (data: SpaFormInput) => Promise<void>;
  updateSpa: (spaId: string, updates: Partial<SpaFormInput>) => Promise<void>;
  deleteSpa: (spaId: string) => Promise<void>;
};

export const useAdminSpaStore = create<AdminSpaStore>((set) => ({
  spas: [],
  selectedSpa: null,
  isLoading: false,
  error: null,

  fetchSpas: async (filters = {}) => {
    set({ isLoading: true, error: null });
    try {
      const spas = await getAdminSpas(filters);
      set((state) => ({
        spas,
        selectedSpa: spas.find((spa) => spa.id === state.selectedSpa?.id) ?? spas[0] ?? null,
        isLoading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  selectSpa: (spaId) => {
    set((state) => ({ selectedSpa: state.spas.find((spa) => spa.id === spaId) ?? null }));
  },

  createSpa: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const spa = await createSpa(data);
      set((state) => ({ spas: [...state.spas, spa], selectedSpa: spa, isLoading: false }));
      return spa;
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
      throw error;
    }
  },

  updateSpa: async (spaId, updates) => {
    set({ isLoading: true, error: null });
    try {
      const spa = await updateSpaService(spaId, updates);
      set((state) => ({
        spas: state.spas.map((item) => (item.id === spaId ? spa : item)),
        selectedSpa: state.selectedSpa?.id === spaId ? spa : state.selectedSpa,
        isLoading: false,
      }));
      return spa;
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
      throw error;
    }
  },

  deleteSpa: async (spaId) => {
    set({ isLoading: true, error: null });
    try {
      await deleteSpa(spaId);
      set((state) => {
        const spas = state.spas.filter((spa) => spa.id !== spaId);
        return { spas, selectedSpa: state.selectedSpa?.id === spaId ? spas[0] ?? null : state.selectedSpa, isLoading: false };
      });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },
}));
