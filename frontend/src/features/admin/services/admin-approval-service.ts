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
  pending_citizen_id_front_url?: string;
  pending_citizen_id_back_url?: string;
  pending_certificate_urls: string[];
  credential_update_status?: "pending" | "approved" | "rejected" | "none";
};

function mapTherapistApproval(t: TherapistApprovalDto, isCredentialUpdate = false): TherapistApproval {
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
    // Credential updates use credential_update_status; therapist applications use status
    status: isCredentialUpdate && t.credential_update_status ? t.credential_update_status : (t.status as TherapistApprovalStatus),
    rejectionReason: t.rejection_reason || undefined,
    pendingCitizenIdFrontUrl: t.pending_citizen_id_front_url || undefined,
    pendingCitizenIdBackUrl: t.pending_citizen_id_back_url || undefined,
    pendingCertificateUrls: t.pending_certificate_urls ?? [],
    hasPendingCredentialUpdate: Boolean(
      t.pending_citizen_id_front_url || t.pending_citizen_id_back_url || (t.pending_certificate_urls?.length ?? 0) > 0,
    ),
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

// ── Credential Update (credential_update tab) ──

export async function getCredentialUpdates(status: string = "pending"): Promise<TherapistApproval[]> {
  const params = new URLSearchParams();
  if (status && status !== "pending") {
    params.set("status", status);
  }
  const url = `/admin/therapists/credential-updates/${params.toString() ? `?${params}` : ""}`;
  const res = await apiClient.get<{ results: TherapistApprovalDto[] }>(url);
  return (res.data.results ?? []).map((t) => mapTherapistApproval(t, true));
}

export async function approveCredentialUpdate(therapistId: string): Promise<TherapistApproval> {
  await apiClient.post(`/admin/therapists/${therapistId}/approve-credentials/`);
  return fetchTherapistApproval(therapistId);
}

export async function rejectCredentialUpdate(therapistId: string): Promise<TherapistApproval> {
  await apiClient.post(`/admin/therapists/${therapistId}/reject-credentials/`);
  return fetchTherapistApproval(therapistId);
}
