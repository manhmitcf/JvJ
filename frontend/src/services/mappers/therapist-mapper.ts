import { type Therapist } from "@/types/therapist";
import { type TherapistDto, type TherapistProfileDto } from "@/types/api";

/**
 * Map backend therapist DTO to frontend domain.
 */
export function mapTherapist(dto: TherapistDto): Therapist {
  return {
    id: dto.id,
    role: "therapist",
    fullName: dto.full_name,
    email: dto.email,
    phone: dto.phone,
    avatarUrl: dto.avatar_url || undefined,
    yearsOfExperience: dto.years_of_experience,
    specialties: Array.isArray(dto.specialties)
      ? dto.specialties
      : dto.specialties.split(",").map((s) => s.trim()).filter(Boolean),
    rating: parseFloat(dto.rating),
    completedBookings: dto.completed_bookings,
    status: dto.status as "pending_approval" | "approved" | "rejected" | "suspended",
    certificateUrls: dto.certificate_urls,
    bio: dto.bio,
    isOnline: dto.is_online,
  };
}

export function mapTherapistProfile(dto: TherapistProfileDto, therapistId: string): Therapist {
  return {
    id: therapistId,
    role: "therapist",
    fullName: dto.full_name,
    email: dto.email,
    phone: dto.phone,
    avatarUrl: dto.avatar_url || undefined,
    yearsOfExperience: dto.years_of_experience,
    specialties: dto.specialties,
    rating: parseFloat(dto.rating),
    completedBookings: dto.completed_bookings,
    status: dto.status as "pending_approval" | "approved" | "rejected" | "suspended",
    certificateUrls: dto.certificate_urls,
    bio: dto.bio,
    isOnline: dto.is_online,
  };
}
