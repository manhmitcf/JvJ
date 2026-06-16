export type TreatmentCategory =
  | "Cổ vai gáy"
  | "Vật lý trị liệu"
  | "Phục hồi chức năng"
  | "Ấn huyệt"
  | "Đông y";

export type Treatment = {
  id: string;
  therapistId: string;
  therapistName?: string;
  name: string;
  category: TreatmentCategory;
  description: string;
  price: number;
  durationMinutes: number;
  rating: number;
  reviewCount?: number;
  images: string[];
  imageUrl: string;
  isAvailable: boolean;
};
