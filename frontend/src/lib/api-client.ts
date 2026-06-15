const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";

let isRefreshing = false;
let refreshPromise: Promise<string> | null = null;

async function refreshAccessToken(): Promise<string> {
  const refresh = localStorage.getItem("refresh_token");
  if (!refresh) {
    localStorage.removeItem("access_token");
    window.location.href = "/login";
    throw new Error("Không tìm thấy refresh token");
  }

  const url = `${API_BASE_URL}/auth/refresh/`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ refresh }),
  });

  if (!response.ok) {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    window.location.href = "/login";
    throw new Error("Token refresh failed");
  }

  const json = await response.json();
  const tokenData = json.data !== undefined ? json.data : json;
  localStorage.setItem("access_token", tokenData.access);
  localStorage.setItem("refresh_token", tokenData.refresh);
  return tokenData.access;
}

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
  console.debug("[API] getAuthHeaders for", endpoint, { hasToken: !!token, tokenPreview: token ? token.substring(0, 20) + "..." : null });
  if (!token) {
    console.error("[API] No access token found for", endpoint, "- user may not be logged in");
  }
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
  const initialAuthHeaders = getAuthHeaders(endpoint);

  const makeRequest = async (authHeaders: Record<string, string>, isRetry = false): Promise<T> => {
    // Always include initial auth headers, merge with additional headers
    // On retry (after token refresh), only use the new auth headers from refresh
    const mergedHeaders: Record<string, string> = {
      "Content-Type": "application/json",
      ...(isRetry ? {} : initialAuthHeaders),
      ...authHeaders,
    };

    // Add any custom headers from options
    if (options?.headers) {
      Object.assign(mergedHeaders, options.headers as Record<string, string>);
    }

    const authHeader = mergedHeaders.Authorization;
    console.debug(`[API] ${options?.method || "GET"} ${url}`, { authHeader, authHeaderLength: authHeader?.length });
    console.debug("[API] Sending Authorization:", authHeader ? `Bearer ${authHeader.split(' ')[1]?.substring(0, 20)}...` : "NONE");

    const fetchOptions: RequestInit = {
      ...options,
      headers: mergedHeaders,
    };

    const response = await fetch(url, fetchOptions);

    if (response.status === 401) {
      if (!isRefreshing) {
        isRefreshing = true;
        refreshPromise = refreshAccessToken()
          .then((token) => {
            isRefreshing = false;
            return token;
          })
          .catch((err) => {
            isRefreshing = false;
            refreshPromise = null;
            throw err;
          });
      }

      if (refreshPromise) {
        try {
          const newToken = await refreshPromise;
          console.debug("[API] Retrying with new token:", endpoint);
          return makeRequest({ Authorization: `Bearer ${newToken}` }, true);
        } catch {
          const error = await response.json().catch(() => ({ error: { message: "Authentication failed" } }));
          const errorMessage = error.error?.message || "Lỗi xác thực";
          throw new Error(errorMessage);
        }
      }
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: { message: response.statusText } }));
      const errorMessage = error.error?.message || `Lỗi API: ${response.status}`;
      throw new Error(errorMessage);
    }

    const text = await response.text();
    if (!text.trim()) {
      return undefined as T;
    }
    const json = JSON.parse(text) as T;
    return (json.data !== undefined ? json.data : json) as T;
  };

  return makeRequest({}, false);
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
