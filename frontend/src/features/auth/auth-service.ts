import { apiClient } from "@/lib/api-client";
import type { Therapist } from "@/types/therapist";
import type { User } from "@/types/user";

export type AuthUser = User | Therapist;

type BackendAuthUser = {
  id: string;
  email: string;
  phone: string;
  full_name: string;
  avatar_url?: string;
  role: "customer" | "therapist" | "admin";
  status?: Therapist["status"] | null;
  years_of_experience?: number | null;
  specialties?: string[];
  rating?: number | null;
  completed_bookings?: number | null;
  certificate_urls?: string[];
  portrait_url?: string | null;
};

type BackendAuthResponse = {
  access: string;
  refresh: string;
  user: BackendAuthUser;
};

type AuthResponse = {
  access: string;
  refresh: string;
  user: AuthUser;
};

type RegisterCustomerRequest = {
  email: string;
  password: string;
  full_name: string;
  phone: string;
};

type RegisterTherapistRequest = {
  email: string;
  password: string;
  full_name: string;
  phone: string;
  years_of_experience: number;
  specialties: string[];
  certificate_urls: string[];
  bio?: string;

  // Fields mới
  citizen_id: string;
  service_areas: string[];
  has_transport: boolean;
  has_equipment: boolean;
  portrait_url: string;
  citizen_id_front_url: string;
  citizen_id_back_url: string;
};

type RegisterAdminRequest = {
  email: string;
  password: string;
  full_name: string;
  otp: string;
};

function mapAuthUser(user: BackendAuthUser): AuthUser {
  const avatarUrl =
    user.avatar_url || undefined;

  const baseUser: User = {
    id: user.id,
    role: user.role,
    fullName: user.full_name,
    email: user.email,
    phone: user.phone,
    avatarUrl,
  };

  if (user.role !== "therapist") {
    return baseUser;
  }

  return {
    ...baseUser,
    role: "therapist",
    status: user.status ?? "pending_approval",
    yearsOfExperience: user.years_of_experience ?? 0,
    specialties: user.specialties ?? [],
    rating: user.rating ?? 0,
    completedBookings: user.completed_bookings ?? 0,
    certificateUrls: user.certificate_urls ?? [],
    // For therapists, portrait_url from TherapistProfile serves as avatar
    avatarUrl: avatarUrl || user.portrait_url,
  };
}

function mapAuthResponse(response: BackendAuthResponse): AuthResponse {
  return {
    access: response.access,
    refresh: response.refresh,
    user: mapAuthUser(response.user),
  };
}

function storeTokens(response: AuthResponse) {
  localStorage.setItem("access_token", response.access);
  localStorage.setItem("refresh_token", response.refresh);
}

export async function loginWithEmail(email: string, password: string): Promise<AuthResponse> {
  const result = await apiClient.post<BackendAuthResponse>("/auth/login/", {
    email,
    password,
  });
  const authResponse = mapAuthResponse(result.data);
  storeTokens(authResponse);
  return authResponse;
}

export async function loginWithGoogle(credential: string): Promise<AuthResponse> {
  const result = await apiClient.post<BackendAuthResponse>("/auth/google/", {
    credential,
  });
  const authResponse = mapAuthResponse(result.data);
  storeTokens(authResponse);
  return authResponse;
}

export async function registerCustomer(data: RegisterCustomerRequest): Promise<AuthResponse> {
  const result = await apiClient.post<BackendAuthResponse>("/auth/register/customer/", data);
  const authResponse = mapAuthResponse(result.data);
  storeTokens(authResponse);
  return authResponse;
}

export async function registerTherapist(data: RegisterTherapistRequest): Promise<AuthResponse> {
  const result = await apiClient.post<BackendAuthResponse>("/auth/register/therapist/", data);
  const authResponse = mapAuthResponse(result.data);
  storeTokens(authResponse);
  return authResponse;
}

export async function registerAdmin(data: RegisterAdminRequest): Promise<AuthResponse> {
  const result = await apiClient.post<BackendAuthResponse>("/auth/register/admin/", data);
  const authResponse = mapAuthResponse(result.data);
  storeTokens(authResponse);
  return authResponse;
}

export async function refreshToken(): Promise<{ access: string; refresh: string }> {
  const refresh = localStorage.getItem("refresh_token");
  if (!refresh) {
    throw new Error("Không tìm thấy refresh token");
  }

  const result = await apiClient.post<{ access: string; refresh: string }>("/auth/refresh/", {
    refresh,
  });

  // Cập nhật tokens
  localStorage.setItem("access_token", result.data.access);
  localStorage.setItem("refresh_token", result.data.refresh);

  return result.data;
}

export async function logout(): Promise<void> {
  const refresh = localStorage.getItem("refresh_token");

  if (refresh) {
    try {
      await apiClient.post("/auth/logout/", { refresh });
    } catch (error) {
      console.error("Logout API failed:", error);
    }
  }

  // Xóa tokens khỏi localStorage
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");

  // Xóa auth state trong Zustand store
  useAuthStore.getState().logout();
}

export async function getMe(): Promise<AuthUser> {
  const result = await apiClient.get<BackendAuthUser>("/auth/me/");
  return mapAuthUser(result.data);
}

export async function loginAsAdmin(email: string, password: string): Promise<AuthResponse> {
  const result = await apiClient.post<BackendAuthResponse>("/auth/login/", {
    email,
    password,
  });

  // Verify role
  if (result.data.user.role !== "admin") {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    throw new Error("Bạn không có quyền truy cập admin");
  }

  const authResponse = mapAuthResponse(result.data);
  storeTokens(authResponse);
  return authResponse;
}

// Roles come from API response — no hardcoded mock roles
