import { apiClient } from "@/lib/api-client";

type DashboardSummary = {
  totalCustomers: number;
  activeTherapists: number;
  pendingTherapistApprovals: number;
  newBookings: number;
};

type TherapistApproval = {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  phone: string;
  yearsOfExperience: number;
  specialties: string;
  status: string;
  certificateUrls: string[];
  createdAt: string;
};

export const adminService = {
  async getDashboardSummary(): Promise<DashboardSummary> {
    const response = await apiClient.get<DashboardSummary>("/admin/dashboard/summary/");
    return response.data;
  },

  async listPendingTherapistApprovals(): Promise<TherapistApproval[]> {
    const response = await apiClient.get<{ data: TherapistApproval[] }>("/admin/therapists/pending/");
    return response.data;
  },

  async approveTherapist(therapistId: string): Promise<void> {
    await apiClient.post(`/admin/therapists/${therapistId}/approve/`, {});
  },

  async rejectTherapist(therapistId: string, reason: string): Promise<void> {
    await apiClient.post(`/admin/therapists/${therapistId}/reject/`, { reason });
  },

  async suspendTherapist(therapistId: string, reason: string): Promise<void> {
    await apiClient.post(`/admin/therapists/${therapistId}/suspend/`, { reason });
  },
};
