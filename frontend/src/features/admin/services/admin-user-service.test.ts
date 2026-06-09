import { describe, expect, it, vi, beforeEach } from "vitest";
import { apiClient } from "@/lib/api-client";
import { getAdminUsers, toggleAdminUserStatus } from "./admin-user-service";

const mockUserResults = [
  {
    id: "customer-1",
    role: "customer",
    full_name: "Nguyen Van Minh",
    email: "minh@example.com",
    phone: "0901000001",
    avatar_url: null,
    created_at: "2026-01-01T00:00:00Z",
    is_active: true,
  },
  {
    id: "customer-2",
    role: "customer",
    full_name: "Tran Thi Minh",
    email: "tran@example.com",
    phone: "0901000002",
    avatar_url: null,
    created_at: "2026-01-02T00:00:00Z",
    is_active: true,
  },
];

const mockActiveUser = {
  id: "customer-1",
  role: "customer",
  full_name: "Nguyen Van Minh",
  email: "minh@example.com",
  phone: "0901000001",
  avatar_url: null,
  created_at: "2026-01-01T00:00:00Z",
  is_active: true,
};

const mockSuspendedUser = {
  ...mockActiveUser,
  is_active: false,
};

describe("admin user service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns users filtered by role and keyword", async () => {
    vi.mocked(apiClient.get).mockResolvedValueOnce({
      data: { results: mockUserResults },
      status: 200,
    });

    const result = await getAdminUsers({ role: "customer", keyword: "minh" });

    expect(result.every((user) => user.role === "customer")).toBe(true);
    expect(result.some((user) => user.fullName.toLowerCase().includes("minh"))).toBe(true);
  });

  it("toggles account between active and suspended", async () => {
    // First toggle: user is currently active -> suspended
    vi.mocked(apiClient.get).mockResolvedValueOnce({
      data: mockActiveUser,
      status: 200,
    });
    vi.mocked(apiClient.patch).mockResolvedValueOnce({ data: null, status: 200 });

    const updated = await toggleAdminUserStatus("customer-1");
    expect(updated.status).toBe("suspended");

    // Second toggle: user is currently suspended -> active
    vi.mocked(apiClient.get).mockResolvedValueOnce({
      data: mockSuspendedUser,
      status: 200,
    });
    vi.mocked(apiClient.patch).mockResolvedValueOnce({ data: null, status: 200 });

    const restored = await toggleAdminUserStatus("customer-1");
    expect(restored.status).toBe("active");
  });
});
