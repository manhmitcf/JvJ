import { create } from "zustand";
import { getAdminOverview, type AdminOverview } from "../services/admin-overview-service";

type AdminOverviewStore = {
  overview: AdminOverview | null;
  isLoading: boolean;
  error: string | null;
  fetchOverview: () => Promise<void>;
};

export const useAdminOverviewStore = create<AdminOverviewStore>((set) => ({
  overview: null,
  isLoading: false,
  error: null,

  fetchOverview: async () => {
    set({ isLoading: true, error: null });
    try {
      const overview = await getAdminOverview();
      set({ overview, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },
}));
