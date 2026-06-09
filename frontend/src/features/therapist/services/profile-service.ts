/**
 * Profile service — gọi API thật của backend therapist profile.
 * Backend trả snake_case, apiFetch unwrap {data: ...} nên FE nhận object trực tiếp.
 * Backend lấy therapist từ JWT token — không cần truyền therapistId.
 */
import { apiFetch } from "@/lib/api-client";
import { type Therapist } from "@/types/therapist";
import { type TherapistProfileDto } from "@/types/api";

function mapProfileToTherapist(dto: TherapistProfileDto): Therapist {
  return {
    id: dto.email,
    role: "therapist",
    fullName: dto.full_name,
    email: dto.email,
    phone: dto.phone,
    avatarUrl: dto.avatar_url || undefined,
    portraitUrl: dto.portrait_url || undefined,
    yearsOfExperience: dto.years_of_experience,
    specialties: dto.specialties,
    rating: parseFloat(dto.rating) || 0,
    completedBookings: dto.completed_bookings,
    status: dto.status as "pending_approval" | "approved" | "rejected" | "suspended",
    certificateUrls: dto.certificate_urls,
    citizenId: dto.citizen_id || undefined,
    citizenIdFrontUrl: dto.citizen_id_front_url || undefined,
    citizenIdBackUrl: dto.citizen_id_back_url || undefined,
    bio: dto.bio || undefined,
    isOnline: dto.is_online,
  };
}

export type UpdateProfileInput = {
  full_name?: string;
  phone?: string;
  avatar_url?: string;
  portraitUrl?: string;
  bio?: string;
  years_of_experience?: number;
  specialties?: string[];
  citizenIdFrontUrl?: string;
  citizenIdBackUrl?: string;
  certificateUrls?: string[];
};

export async function getTherapistProfile(): Promise<Therapist> {
  const dto = await apiFetch<TherapistProfileDto>("/therapists/profile/");
  return mapProfileToTherapist(dto);
}

export async function updateTherapistProfile(input: UpdateProfileInput): Promise<Therapist> {
  const body: Record<string, unknown> = {};
  if (input.full_name !== undefined) body.full_name = input.full_name;
  if (input.phone !== undefined) body.phone = input.phone;
  if (input.avatar_url !== undefined) body.avatar_url = input.avatar_url;
  if (input.portraitUrl !== undefined) body.portrait_url = input.portraitUrl;
  if (input.bio !== undefined) body.bio = input.bio;
  if (input.years_of_experience !== undefined) body.years_of_experience = input.years_of_experience;
  if (input.specialties !== undefined) body.specialties = input.specialties;
  if (input.citizenIdFrontUrl !== undefined) body.citizen_id_front_url = input.citizenIdFrontUrl;
  if (input.citizenIdBackUrl !== undefined) body.citizen_id_back_url = input.citizenIdBackUrl;
  if (input.certificateUrls !== undefined) body.certificate_urls = input.certificateUrls;

  const dto = await apiFetch<TherapistProfileDto>("/therapists/profile/", {
    method: "PUT",
    body: JSON.stringify(body),
  });

  return mapProfileToTherapist(dto);
}

/**
 * Toggle therapist online status
 */
export async function toggleOnlineStatus(isOnline: boolean): Promise<boolean> {
  const response = await apiFetch<{ is_online: boolean }>("/therapists/profile/status/", {
    method: "PATCH",
    body: JSON.stringify({ is_online: isOnline }),
  });

  return response.is_online;
}
