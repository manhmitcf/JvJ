import { create } from "zustand";
import { type TherapistApproval, type TherapistApprovalStatus } from "@/types/admin";
import {
  approveTherapistApplication,
  getTherapistApprovals,
  rejectTherapistApplication,
  approveCredentialUpdate,
  getCredentialUpdates,
  rejectCredentialUpdate,
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
  // Credential update tab
  credentialUpdates: TherapistApproval[];
  selectedCredentialUpdate: TherapistApproval | null;
  fetchCredentialUpdates: () => Promise<void>;
  selectCredentialUpdate: (therapistId: string) => void;
  approveCredential: (therapistId: string) => Promise<void>;
  rejectCredential: (therapistId: string) => Promise<void>;
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

  // Credential update tab
  credentialUpdates: [],
  selectedCredentialUpdate: null,

  fetchCredentialUpdates: async (status = "pending") => {
    set({ isLoading: true, error: null });
    try {
      const updates = await getCredentialUpdates(status);
      set({ credentialUpdates: updates, selectedCredentialUpdate: updates[0] ?? null, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  selectCredentialUpdate: (therapistId) => {
    set((state) => ({ selectedCredentialUpdate: state.credentialUpdates.find((item) => item.id === therapistId) ?? null }));
  },

  approveCredential: async (therapistId) => {
    set({ isLoading: true, error: null });
    try {
      const updated = await approveCredentialUpdate(therapistId);
      set((state) => ({
        credentialUpdates: state.credentialUpdates.filter((item) => item.id !== therapistId),
        selectedCredentialUpdate: state.selectedCredentialUpdate?.id === therapistId ? null : state.selectedCredentialUpdate,
        isLoading: false,
      }));
      void updated; // consumed; server already synced fields
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  rejectCredential: async (therapistId) => {
    set({ isLoading: true, error: null });
    try {
      await rejectCredentialUpdate(therapistId);
      set((state) => ({
        credentialUpdates: state.credentialUpdates.filter((item) => item.id !== therapistId),
        selectedCredentialUpdate: state.selectedCredentialUpdate?.id === therapistId ? null : state.selectedCredentialUpdate,
        isLoading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },
}));
