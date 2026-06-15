import { type User } from "./user";

export type TherapistStatus = "pending_approval" | "approved" | "rejected" | "suspended";

export type Therapist = User & {
  role: "therapist";
  status: TherapistStatus;
  yearsOfExperience: number;
  specialties: string[];
  rating: number;
  completedBookings: number;
  certificateUrls: string[];
  citizenId?: string;
  citizenIdFrontUrl?: string;
  citizenIdBackUrl?: string;
  pendingCitizenId?: string;
  pendingCitizenIdFrontUrl?: string;
  pendingCitizenIdBackUrl?: string;
  pendingCertificateUrls?: string[];
  serviceAreas?: string[];
};
