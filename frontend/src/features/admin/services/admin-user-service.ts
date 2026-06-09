import { apiClient } from "@/lib/api-client";
import { type AdminAccountStatus, type AdminUserRow } from "@/types/admin";
import { type UserRole } from "@/types/user";

export type AdminUserFilters = {
  role?: UserRole | "all";
  status?: AdminAccountStatus | "all";
  keyword?: string;
};

type AdminUserDto = {
  id: string;
  role: Exclude<UserRole, "guest">;
  full_name: string;
  email: string;
  phone: string;
  avatar_url?: string;
  created_at: string;
  is_active: boolean;
};

export async function getAdminUsers(filters: AdminUserFilters = {}): Promise<AdminUserRow[]> {
  const params = new URLSearchParams();
  if (filters.role && filters.role !== "all") params.set("role", filters.role);
  if (filters.status && filters.status !== "all") params.set("status", filters.status);
  if (filters.keyword?.trim()) params.set("search", filters.keyword.trim());

  const res = await apiClient.get<{ results: AdminUserDto[] }>(`/admin/users/?${params}`);
  return (res.data.results ?? []).map((u) => ({
    id: u.id,
    role: u.role as Exclude<UserRole, "guest">,
    fullName: u.full_name,
    email: u.email,
    phone: u.phone,
    avatarUrl: u.avatar_url,
    joinedAt: u.created_at,
    status: (u.is_active ? "active" : "suspended") as AdminAccountStatus,
  }));
}

export async function toggleAdminUserStatus(userId: string): Promise<AdminUserRow> {
  const res = await apiClient.get<AdminUserDto>(`/admin/users/${userId}/`);
  const u = res.data;
  const nextActive = !u.is_active;

  await apiClient.patch(`/admin/users/${userId}/update/`, { is_active: nextActive });

  return {
    id: u.id,
    role: u.role as Exclude<UserRole, "guest">,
    fullName: u.full_name,
    email: u.email,
    phone: u.phone,
    avatarUrl: u.avatar_url,
    joinedAt: u.created_at,
    status: (nextActive ? "active" : "suspended") as AdminAccountStatus,
  };
}
