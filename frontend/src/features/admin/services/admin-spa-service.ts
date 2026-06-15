import { apiClient } from "@/lib/api-client";
import { type Treatment } from "@/features/therapist/services/therapist-treatment-service";
import { type Spa, type SpaFormInput } from "@/types/spa";

export type AdminSpaFilters = {
  status?: Spa["status"] | "all";
  district?: string;
  keyword?: string;
};

type SpaDto = {
  id: string;
  name: string;
  address: string;
  district: string;
  latitude?: number;
  longitude?: number;
  phone: string;
  email: string;
  open_time: string;
  close_time: string;
  description?: string;
  status: Spa["status"];
  image_urls: string[];
  linked_treatment_count?: number;
  linked_treatments?: SpaDtoTreatment[];
};

type SpaDtoTreatment = {
  id: string;
  therapist_id: string;
  therapist_name: string;
  name: string;
  category: string;
  description: string;
  price: string;
  duration_minutes: number;
  rating: number;
  images: string[];
  image_url: string;
  is_available: boolean;
};

function mapSpa(s: SpaDto): Spa {
  return {
    id: s.id,
    name: s.name,
    address: s.address,
    district: s.district,
    latitude: s.latitude,
    longitude: s.longitude,
    phone: s.phone,
    email: s.email,
    openTime: s.open_time,
    closeTime: s.close_time,
    description: s.description ?? "",
    status: s.status,
    imageUrls: s.image_urls,
    linkedTreatmentCount: s.linked_treatment_count ?? 0,
    linkedTreatments: (s.linked_treatments ?? []).map((t) => ({
      id: t.id,
      therapistId: t.therapist_id,
      therapistName: t.therapist_name,
      name: t.name,
      category: t.category,
      description: t.description,
      price: Number(t.price),
      durationMinutes: t.duration_minutes,
      rating: t.rating,
      images: t.images,
      imageUrl: t.image_url,
      isAvailable: t.is_available,
    })),
  };
}

export async function getAdminSpas(_filters: AdminSpaFilters = {}): Promise<Spa[]> {
  const res = await apiClient.get<{ results: SpaDto[] }>("/admin/spas/");
  return (res.data.results ?? []).map(mapSpa);
}

export async function getAdminSpaDetail(spaId: string): Promise<Spa> {
  const res = await apiClient.get<SpaDto>(`/admin/spas/${spaId}/`);
  return mapSpa(res.data);
}

export async function createSpa(data: SpaFormInput): Promise<Spa> {
  const res = await apiClient.post<SpaDto>("/admin/spas/", {
    name: data.name,
    address: data.address,
    district: data.district,
    phone: data.phone,
    email: data.email,
    open_time: data.openTime,
    close_time: data.closeTime,
    description: data.description,
    image_urls: data.imageUrls,
  });
  return mapSpa(res.data);
}

export async function updateSpa(spaId: string, updates: Partial<SpaFormInput>): Promise<Spa> {
  const body: Record<string, unknown> = {};
  if (updates.name !== undefined) body.name = updates.name;
  if (updates.address !== undefined) body.address = updates.address;
  if (updates.district !== undefined) body.district = updates.district;
  if (updates.phone !== undefined) body.phone = updates.phone;
  if (updates.email !== undefined) body.email = updates.email;
  if (updates.openTime !== undefined) body.open_time = updates.openTime;
  if (updates.closeTime !== undefined) body.close_time = updates.closeTime;
  if (updates.description !== undefined) body.description = updates.description;
  if (updates.status !== undefined) body.status = updates.status;
  if (updates.imageUrls !== undefined) body.image_urls = updates.imageUrls;

  const res = await apiClient.patch<SpaDto>(`/admin/spas/${spaId}/`, body);
  return mapSpa(res.data);
}

export async function deleteSpa(spaId: string): Promise<void> {
  await apiClient.delete(`/admin/spas/${spaId}/`);
}

export async function getAvailableTreatments(): Promise<Treatment[]> {
  const res = await apiClient.get<{ results: Treatment[] }>("/treatments/?is_available=true");
  return res.data.results ?? [];
}

export async function linkTreatmentsToSpa(spaId: string, treatmentIds: string[]): Promise<void> {
  await apiClient.post(`/admin/spas/${spaId}/link-treatments/`, { treatment_ids: treatmentIds });
}

export async function unlinkTreatmentsFromSpa(spaId: string, treatmentIdsToRemove: string[], currentLinkedIds: string[]): Promise<void> {
  const remaining = currentLinkedIds.filter((id) => !treatmentIdsToRemove.includes(id));
  await apiClient.post(`/admin/spas/${spaId}/link-treatments/`, { treatment_ids: remaining });
}

export async function refreshSpaDetail(spaId: string): Promise<Spa> {
  return getAdminSpaDetail(spaId);
}
