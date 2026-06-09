import { vi } from "vitest";

// Global mock for @/lib/api-client — tất cả service/store tests đều dùng
vi.mock("@/lib/api-client", () => ({
  apiFetch: vi.fn(),
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
  API_BASE_URL: "http://localhost:8000/api/v1",
}));
