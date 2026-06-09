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
  therapist_status?: "pending_approval" | "approved" | "rejected" | "suspended";
};

export async function getAdminUsers(filters: AdminUserFilters = {}): Promise<AdminUserRow[]> {
  const params = new URLSearchParams();
  if (filters.role && filters.role !== "all") params.set("role", filters.role);
  if (filters.status && filters.status !== "all") params.set("status", filters.status);
  if (filters.keyword?.trim()) params.set("search", filters.keyword.trim());

  const res = await apiClient.get<{ results: AdminUserDto[] }>(`/admin/users/?${params}`);
  return (res.data.results ?? []).map((u) => {
    // Map status based on is_active and therapist_status
    let status: AdminAccountStatus;
    if (u.role === "therapist" && u.therapist_status) {
      if (u.therapist_status === "pending_approval") {
        status = "pending_approval";
      } else if (u.therapist_status === "rejected") {
        status = "rejected";
      } else {
        // approved or suspended therapist
        status = u.is_active ? "active" : "suspended";
      }
    } else {
      // customer or admin
      status = u.is_active ? "active" : "suspended";
    }

    return {
      id: u.id,
      role: u.role as Exclude<UserRole, "guest">,
      fullName: u.full_name,
      email: u.email,
      phone: u.phone,
      avatarUrl: u.avatar_url,
      joinedAt: u.created_at,
      status,
    };
  });
}

export async function toggleAdminUserStatus(userId: string): Promise<AdminUserRow> {
  const res = await apiClient.get<AdminUserDto>(`/admin/users/${userId}/`);
  const u = res.data;
  const nextActive = !u.is_active;

  await apiClient.patch(`/admin/users/${userId}/update/`, { is_active: nextActive });

  // Map status based on is_active and therapist_status
  let status: AdminAccountStatus;
  if (u.role === "therapist" && u.therapist_status) {
    if (u.therapist_status === "pending_approval") {
      status = "pending_approval";
    } else if (u.therapist_status === "rejected") {
      status = "rejected";
    } else {
      status = nextActive ? "active" : "suspended";
    }
  } else {
    status = nextActive ? "active" : "suspended";
  }

  return {
    id: u.id,
    role: u.role as Exclude<UserRole, "guest">,
    fullName: u.full_name,
    email: u.email,
    phone: u.phone,
    avatarUrl: u.avatar_url,
    joinedAt: u.created_at,
    status,
  };
}
