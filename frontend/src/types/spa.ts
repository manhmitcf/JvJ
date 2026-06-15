export type SpaStatus = "active" | "hidden";

export type SpaImage = {
  id: string;
  spaId: string;
  imageUrl: string;
  description?: string;
};

export type SpaTreatment = {
  id: string;
  therapistId: string;
  therapistName: string;
  name: string;
  category: string;
  description: string;
  price: number;
  durationMinutes: number;
  rating: number;
  images: string[];
  imageUrl: string;
  isAvailable: boolean;
};

export type Spa = {
  id: string;
  name: string;
  address: string;
  district: string;
  latitude?: number;
  longitude?: number;
  phone: string;
  email: string;
  openTime: string;
  closeTime: string;
  description: string;
  status: SpaStatus;
  imageUrls: string[];
  linkedTreatmentCount: number;
  linkedTreatments: SpaTreatment[];
};

export type SpaFormInput = Omit<Spa, "id" | "linkedTreatmentCount" | "latitude" | "longitude" | "linkedTreatments"> & {
  linkedTreatmentCount?: number;
};
