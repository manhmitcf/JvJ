export type TreatmentCategory =
  | "neck_shoulder"
  | "physical_therapy"
  | "recovery"
  | "acupressure"
  | "traditional_medicine";

export type Treatment = {
  id: string;
  therapistId: string;
  therapistName?: string; // Có trong API response, optional vì không phải lúc nào cũng cần
  name: string;
  category: TreatmentCategory;
  description: string;
  price: number;
  durationMinutes: number;
  rating: number;
  reviewCount?: number; // Có trong API response
  images: string[]; // Array of image URLs, max 5
  imageUrl: string; // First image for backward compatibility
  isAvailable: boolean;
};
