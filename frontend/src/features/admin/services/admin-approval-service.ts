import { apiClient } from "@/lib/api-client";
import { type TherapistApproval, type TherapistApprovalStatus } from "@/types/admin";

type TherapistApprovalDto = {
  id: string;
  user_full_name: string;
  user_email: string;
  user_phone: string;
  user_avatar_url?: string;
  years_of_experience: number;
  specialties: string[];
  certificate_urls: string[];
  created_at: string;
  status: TherapistApprovalStatus;
  rejection_reason?: string;
};

function mapTherapistApproval(t: TherapistApprovalDto): TherapistApproval {
  return {
    id: t.id,
    fullName: t.user_full_name,
    email: t.user_email,
    phone: t.user_phone,
    avatarUrl: t.user_avatar_url,
    yearsOfExperience: t.years_of_experience,
    specialties: t.specialties,
    certificateUrls: t.certificate_urls,
    submittedAt: t.created_at,
    status: t.status as TherapistApprovalStatus,
    rejectionReason: t.rejection_reason || undefined,
  };
}

export async function getTherapistApprovals(status: TherapistApprovalStatus | "all" = "all"): Promise<TherapistApproval[]> {
  const params = new URLSearchParams();
  if (status !== "all") {
    params.set("status", status);
  }
  const url = `/admin/therapists/pending/${params.toString() ? `?${params}` : ""}`;
  const res = await apiClient.get<{ results: TherapistApprovalDto[] }>(url);
  return (res.data.results ?? []).map(mapTherapistApproval);
}

async function fetchTherapistApproval(therapistId: string): Promise<TherapistApproval> {
  const res = await apiClient.get<TherapistApprovalDto>(`/admin/therapists/${therapistId}/`);
  return mapTherapistApproval(res.data);
}

export async function approveTherapistApplication(therapistId: string): Promise<TherapistApproval> {
  await apiClient.post(`/admin/therapists/${therapistId}/approve/`);
  return fetchTherapistApproval(therapistId);
}

export async function rejectTherapistApplication(therapistId: string, reason: string): Promise<TherapistApproval> {
  await apiClient.post(`/admin/therapists/${therapistId}/reject/`, { reason });
  return fetchTherapistApproval(therapistId);
}
