import { create } from "zustand";
import { type TherapistApproval, type TherapistApprovalStatus } from "@/types/admin";
import {
  approveTherapistApplication,
  getTherapistApprovals,
  rejectTherapistApplication,
} from "../services/admin-approval-service";

type AdminApprovalStore = {
  approvals: TherapistApproval[];
  selectedApproval: TherapistApproval | null;
  isLoading: boolean;
  error: string | null;
  fetchApprovals: (status?: TherapistApprovalStatus | "all") => Promise<void>;
  selectApproval: (therapistId: string) => void;
  approveApplication: (therapistId: string) => Promise<void>;
  rejectApplication: (therapistId: string, reason: string) => Promise<void>;
};

export const useAdminApprovalStore = create<AdminApprovalStore>((set) => ({
  approvals: [],
  selectedApproval: null,
  isLoading: false,
  error: null,

  fetchApprovals: async (status = "all") => {
    set({ isLoading: true, error: null });
    try {
      const approvals = await getTherapistApprovals(status);
      set((state) => ({
        approvals,
        selectedApproval: approvals.find((item) => item.id === state.selectedApproval?.id) ?? approvals[0] ?? null,
        isLoading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  selectApproval: (therapistId) => {
    set((state) => ({ selectedApproval: state.approvals.find((item) => item.id === therapistId) ?? null }));
  },

  approveApplication: async (therapistId) => {
    set({ isLoading: true, error: null });
    try {
      const approval = await approveTherapistApplication(therapistId);
      set((state) => ({
        approvals: state.approvals.map((item) => (item.id === therapistId ? approval : item)),
        selectedApproval: state.selectedApproval?.id === therapistId ? approval : state.selectedApproval,
        isLoading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  rejectApplication: async (therapistId, reason) => {
    set({ isLoading: true, error: null });
    try {
      const approval = await rejectTherapistApplication(therapistId, reason);
      set((state) => ({
        approvals: state.approvals.map((item) => (item.id === therapistId ? approval : item)),
        selectedApproval: state.selectedApproval?.id === therapistId ? approval : state.selectedApproval,
        isLoading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },
}));
