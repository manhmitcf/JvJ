export type SpaStatus = "active" | "hidden";

export type SpaImage = {
  id: string;
  spaId: string;
  imageUrl: string;
  description?: string;
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
};

export type SpaFormInput = Omit<Spa, "id" | "linkedTreatmentCount" | "latitude" | "longitude"> & {
  linkedTreatmentCount?: number;
};
