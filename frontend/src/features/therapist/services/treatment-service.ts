/**
 * Treatment service — gọi API thật của backend.
 * Backend trả snake_case trong {data: ...}, FE dùng camelCase.
 */
import { apiFetch } from "@/lib/api-client";
import { type Treatment, type TreatmentCategory } from "@/types/treatment";

type TreatmentApiResponse = {
  id: string;
  therapist_id: string;
  therapist_name: string;
  name: string;
  category: string;
  description: string;
  price: number;
  duration_minutes: number;
  rating: number;
  review_count: number;
  image_url: string;
  images?: string[];
  is_available: boolean;
};

type TreatmentListApiResponse = {
  count: number;
  next: string | null;
  previous: string | null;
  results: TreatmentApiResponse[];
};

export type CreateTreatmentInput = {
  name: string;
  category: TreatmentCategory;
  description: string;
  price: number;
  durationMinutes: number;
  imageUrl: string;
  images?: string[];
  isAvailable: boolean;
};

export type UpdateTreatmentInput = Partial<CreateTreatmentInput>;

function mapApiToTreatment(item: TreatmentApiResponse): Treatment {
  return {
    id: item.id,
    therapistId: item.therapist_id,
    therapistName: item.therapist_name,
    name: item.name,
    category: item.category as TreatmentCategory,
    description: item.description,
    price: Number(item.price),
    durationMinutes: item.duration_minutes,
    rating: Number(item.rating),
    reviewCount: item.review_count,
    imageUrl: item.image_url,
    images: item.images || [],
    isAvailable: item.is_available,
  };
}

export async function getTreatments(): Promise<Treatment[]> {
  const data = await apiFetch<TreatmentListApiResponse>("/treatments/");
  return data.results.map(mapApiToTreatment);
}

export async function getTreatment(id: string): Promise<Treatment> {
  const data = await apiFetch<TreatmentApiResponse>(`/treatments/${id}/`);
  return mapApiToTreatment(data);
}

export async function createTreatment(input: CreateTreatmentInput): Promise<Treatment> {
  const data = await apiFetch<TreatmentApiResponse>("/treatments/", {
    method: "POST",
    body: JSON.stringify({
      name: input.name,
      category: input.category,
      description: input.description,
      price: input.price,
      duration_minutes: input.durationMinutes,
      image_url: input.imageUrl,
      images: input.images,
      is_available: input.isAvailable,
    }),
  });

  return mapApiToTreatment(data);
}

export async function updateTreatment(id: string, input: UpdateTreatmentInput): Promise<Treatment> {
  const body: Record<string, unknown> = {};

  if (input.name !== undefined) body.name = input.name;
  if (input.category !== undefined) body.category = input.category;
  if (input.description !== undefined) body.description = input.description;
  if (input.price !== undefined) body.price = input.price;
  if (input.durationMinutes !== undefined) body.duration_minutes = input.durationMinutes;
  if (input.imageUrl !== undefined) body.image_url = input.imageUrl;
  if (input.images !== undefined) body.images = input.images;
  if (input.isAvailable !== undefined) body.is_available = input.isAvailable;

  const data = await apiFetch<TreatmentApiResponse>(`/treatments/${id}/`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });

  return mapApiToTreatment(data);
}

export async function deleteTreatment(id: string): Promise<void> {
  await apiFetch<{ message: string }>(`/treatments/${id}/`, {
    method: "DELETE",
  });
}

/**
 * Lấy danh sách treatments của therapist hiện tại.
 * Gọi endpoint /treatments/ với auth header - BE tự filter theo therapist_id từ token.
 */
export async function getMyTreatments(therapistId: string): Promise<Treatment[]> {
  const data = await apiFetch<TreatmentListApiResponse>("/treatments/");
  return data.results.map(mapApiToTreatment);
}
