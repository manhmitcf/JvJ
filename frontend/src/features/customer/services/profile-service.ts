/**
 * Profile service - Customer profile API.
 * GET /auth/me/ returns user info for current authenticated customer.
 * PUT /auth/me/ updates user profile.
 */
import { apiFetch } from "@/lib/api-client";
import type { User } from "@/types/user";

export type CustomerProfileDto = {
  id: string;
  email: string;
  phone: string;
  full_name: string;
  avatar_url?: string;
  address?: string;
};

export type UpdateProfileInput = {
  full_name?: string;
  phone?: string;
  address?: string;
  avatar_url?: string;
};

function mapDtoToUser(dto: CustomerProfileDto): User {
  return {
    id: dto.id,
    role: "customer",
    fullName: dto.full_name,
    email: dto.email,
    phone: dto.phone,
    address: dto.address || undefined,
    avatarUrl: dto.avatar_url ?? undefined,
  };
}

export async function getCurrentUser(): Promise<User> {
  const dto = await apiFetch<CustomerProfileDto>("/auth/me/");
  return mapDtoToUser(dto);
}

export async function updateProfile(input: UpdateProfileInput): Promise<User> {
  const body: Record<string, unknown> = {};
  if (input.full_name !== undefined) body.full_name = input.full_name;
  if (input.phone !== undefined) body.phone = input.phone;
  if (input.address !== undefined) body.address = input.address;
  if (input.avatar_url !== undefined) body.avatar_url = input.avatar_url;

  const dto = await apiFetch<CustomerProfileDto>("/auth/me/", {
    method: "PUT",
    body: JSON.stringify(body),
  });

  return mapDtoToUser(dto);
}
