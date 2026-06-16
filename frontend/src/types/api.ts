export type TherapistProfileDto = {
  id: string;
  email: string;
  phone: string;
  full_name: string;
  avatar_url: string;
  portrait_url?: string;
  bio: string;
  years_of_experience: number;
  specialties: string[];
  is_online: boolean;
  status: string;
  rating: string;
  completed_bookings: number;
  certificate_urls: string[];
  citizen_id?: string;
  citizen_id_front_url?: string;
  citizen_id_back_url?: string;
  rejection_reason: string;
  service_areas: string[];
  pending_citizen_id?: string;
  pending_citizen_id_front_url?: string;
  pending_citizen_id_back_url?: string;
  pending_certificate_urls: string[];
};

export type ReviewDto = {
  id: string;
  customer_name: string;
  customer_avatar: string | null;
  treatment_name: string;
  rating: number;
  comment: string;
  tags: string[];
  is_visible: boolean;
  created_at: string;
};

export type TreatmentDto = {
  id: string;
  therapist_id: string;
  therapist_name: string;
  name: string;
  category: string;
  description: string;
  price: string;
  duration_minutes: number;
  rating: string;
  review_count: number;
  images: string[];
  image_url: string;
  is_available: boolean;
};
