import { registerCustomer as registerCustomerWithApi, registerTherapist as registerTherapistWithApi } from "./auth-service";
import { uploadTherapistDocuments } from "@/services/upload-service";
import type { Therapist } from "@/types/therapist";
import type { User } from "@/types/user";

export type CustomerRegistrationData = {
  fullName: string;
  phone: string;
  email: string;
  username: string;
  password: string;
};

export type TherapistRegistrationData = CustomerRegistrationData & {
  yearsOfExperience: number;
  specialties: string | string[];
  bio: string;
  serviceAreas: string[];
  hasTransport: boolean;
  hasEquipment: boolean;
  portrait: File;
  citizenId: string;
  citizenIdFront: File;
  citizenIdBack: File;
  certificates: File[];
};

export async function registerCustomer(data: CustomerRegistrationData): Promise<User> {
  const response = await registerCustomerWithApi({
    email: data.email.trim(),
    password: data.password,
    full_name: data.fullName.trim(),
    phone: data.phone.trim(),
  });

  return response.user as User;
}

export async function registerTherapist(data: TherapistRegistrationData): Promise<Therapist> {
  // Bước 1: Upload files trước
  const uploadedUrls = await uploadTherapistDocuments({
    portrait: data.portrait,
    citizenIdFront: data.citizenIdFront,
    citizenIdBack: data.citizenIdBack,
    certificates: data.certificates,
  });

  // Bước 2: Gọi register API với đầy đủ data
  const response = await registerTherapistWithApi({
    email: data.email.trim(),
    password: data.password,
    full_name: data.fullName.trim(),
    phone: data.phone.trim(),
    years_of_experience: data.yearsOfExperience,
    specialties: Array.isArray(data.specialties)
      ? data.specialties
      : data.specialties.split(",").map((specialty) => specialty.trim()).filter(Boolean),
    bio: data.bio.trim(),

    // 4 fields mới
    citizen_id: data.citizenId.trim(),
    service_areas: data.serviceAreas,
    has_transport: data.hasTransport,
    has_equipment: data.hasEquipment,

    // URLs từ upload
    portrait_url: uploadedUrls.portraitUrl,
    citizen_id_front_url: uploadedUrls.citizenIdFrontUrl,
    citizen_id_back_url: uploadedUrls.citizenIdBackUrl,
    certificate_urls: uploadedUrls.certificateUrls,
  });

  return response.user as Therapist;
}
