import { create } from "zustand";
import {
  type DashboardMetrics,
  type TodayAppointment,
  getDashboardMetrics,
  getTodayAppointments,
  toggleOnlineStatus,
} from "../services/dashboard-service";

type DashboardStore = {
  metrics: DashboardMetrics | null;
  todayAppointments: TodayAppointment[];
  isLoading: boolean;
  error: string | null;
  fetchDashboard: () => Promise<void>;
  toggleOnline: (isOnline: boolean) => Promise<void>;
};

export const useDashboardStore = create<DashboardStore>((set) => ({
  metrics: null,
  todayAppointments: [],
  isLoading: false,
  error: null,

  fetchDashboard: async () => {
    set({ isLoading: true, error: null });
    try {
      const [metrics, appointments] = await Promise.all([
        getDashboardMetrics(),
        getTodayAppointments(),
      ]);
      set({ metrics, todayAppointments: appointments, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  toggleOnline: async (isOnline) => {
    set({ isLoading: true, error: null });
    try {
      const newStatus = await toggleOnlineStatus(isOnline);
      set((state) => ({
        metrics: state.metrics ? { ...state.metrics, isOnline: newStatus } : null,
        isLoading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },
}));
