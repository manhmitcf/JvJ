const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";

function getAuthHeaders(endpoint: string): Record<string, string> {
  const publicAuthEndpoints = [
    "/auth/login/",
    "/auth/google/",
    "/auth/register/customer/",
    "/auth/register/therapist/",
    "/auth/refresh/",
  ];

  if (publicAuthEndpoints.includes(endpoint)) {
    return {};
  }

  const token = localStorage.getItem("access_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

type ApiResult<T> = {
  data: T;
  status: number;
};

type PaginatedData<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

async function apiFetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...getAuthHeaders(endpoint),
    ...(options?.headers as Record<string, string> || {}),
  };

  const response = await fetch(url, { ...options, headers });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: { message: response.statusText } }));
    const errorMessage = error.error?.message || `Lỗi API: ${response.status}`;
    throw new Error(errorMessage);
  }

  const json = await response.json();
  // Auth endpoints không wrap trong {data: ...}, trả về trực tiếp
  return (json.data !== undefined ? json.data : json) as T;
}

async function request<T>(method: string, endpoint: string, body?: unknown): Promise<ApiResult<T>> {
  const data = await apiFetch<T>(endpoint, {
    method,
    body: body ? JSON.stringify(body) : undefined,
  });
  return { data, status: 200 };
}

const apiClient = {
  get: <T>(endpoint: string) => request<T>("GET", endpoint),
  post: <T>(endpoint: string, body?: unknown) => request<T>("POST", endpoint, body),
  put: <T>(endpoint: string, body?: unknown) => request<T>("PUT", endpoint, body),
  patch: <T>(endpoint: string, body?: unknown) => request<T>("PATCH", endpoint, body),
  delete: <T>(endpoint: string) => request<T>("DELETE", endpoint),
};

export { apiFetch, API_BASE_URL, apiClient };
export type { ApiResult, PaginatedData };
