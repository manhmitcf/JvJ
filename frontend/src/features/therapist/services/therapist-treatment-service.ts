import { apiClient } from "@/lib/api-client";

export type TreatmentCategory = "neck_shoulder" | "physical_therapy" | "recovery" | "acupressure" | "traditional_medicine";

export const TREATMENT_CATEGORIES: { value: TreatmentCategory; label: string }[] = [
  { value: "neck_shoulder", label: "Cổ vai gáy" },
  { value: "physical_therapy", label: "Vật lý trị liệu" },
  { value: "recovery", label: "Phục hồi chức năng" },
  { value: "acupressure", label: "Ấn huyệt" },
  { value: "traditional_medicine", label: "Đông y" },
];

export const DURATION_OPTIONS = [
  { value: 30, label: "30 phút" },
  { value: 45, label: "45 phút" },
  { value: 60, label: "60 phút" },
  { value: 90, label: "90 phút" },
  { value: 120, label: "120 phút" },
];

export type TreatmentFormInput = {
  name: string;
  category: TreatmentCategory;
  description: string;
  price: number;
  duration_minutes: number;
  images: string[];
  is_available: boolean;
};

export type Treatment = {
  id: string;
  therapist_id: string;
  therapist_name: string;
  name: string;
  category: TreatmentCategory;
  description: string;
  price: number;
  duration_minutes: number;
  rating: number;
  review_count: number;
  images: string[];
  image_url: string; // First image for backward compatibility
  is_available: boolean;
};

export async function createTreatment(data: TreatmentFormInput): Promise<Treatment> {
  const res = await apiClient.post<Treatment>("/treatments/", data);
  return res.data;
}

export async function getMyTreatments(): Promise<Treatment[]> {
  // Endpoint sẽ tự filter theo user hiện tại
  const res = await apiClient.get<{ results: Treatment[] }>("/treatments/?therapist=me");
  return res.data.results ?? [];
}
