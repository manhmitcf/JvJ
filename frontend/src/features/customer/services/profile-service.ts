/**
 * Profile service - Customer profile API.
 * GET /auth/me/ returns user info for current authenticated customer.
 * PATCH /auth/me/update/ updates user profile.
 */
import { apiFetch } from "@/lib/api-client";
import type { CustomerProfileDto } from "@/types/api";
import type { User } from "@/types/user";

export type UpdateProfileInput = {
  full_name?: string;
  phone?: string;
  avatar_url?: string;
};

function mapDtoToUser(dto: CustomerProfileDto): User {
  return {
    id: dto.id,
    role: "customer",
    fullName: dto.full_name,
    email: dto.email,
    phone: dto.phone,
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
  if (input.avatar_url !== undefined) body.avatar_url = input.avatar_url;

  const dto = await apiFetch<CustomerProfileDto>("/auth/me/update/", {
    method: "PATCH",
    body: JSON.stringify(body),
  });

  return mapDtoToUser(dto);
}