import { create } from "zustand";
import {
  type WalletAppointment,
  type WalletMetrics,
  getWalletAppointments,
  getWalletMetrics,
} from "../services/wallet-service";

type WalletStore = {
  metrics: WalletMetrics | null;
  appointments: WalletAppointment[];
  isLoading: boolean;
  error: string | null;
  fetchWallet: () => Promise<void>;
};

export const useWalletStore = create<WalletStore>((set) => ({
  metrics: null,
  appointments: [],
  isLoading: false,
  error: null,

  fetchWallet: async () => {
    set({ isLoading: true, error: null });
    try {
      const [metrics, appointments] = await Promise.all([
        getWalletMetrics(),
        getWalletAppointments(),
      ]);
      set({ metrics, appointments, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },
}));
