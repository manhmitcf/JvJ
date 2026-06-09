import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiClient } from "@/lib/api-client";
import { useAdminUserStore } from "./admin-user-store";

describe("admin user store", () => {
  beforeEach(() => {
    useAdminUserStore.setState({ users: [], selectedUser: null, isLoading: false, error: null });
  });

  it("fetches customer users", async () => {
    vi.mocked(apiClient.get).mockResolvedValue({
      data: {
        results: [
          {
            id: "customer-1",
            role: "customer",
            full_name: "Nguyễn Văn A",
            email: "a@test.com",
            phone: "0901234567",
            avatar_url: null,
            created_at: "2026-01-01T00:00:00Z",
            is_active: true,
          },
        ],
      },
      status: 200,
    });

    await useAdminUserStore.getState().fetchUsers({ role: "customer" });

    expect(useAdminUserStore.getState().users.every((user) => user.role === "customer")).toBe(true);
  });

  it("updates user status after toggle", async () => {
    vi.mocked(apiClient.get)
      .mockResolvedValueOnce({
        data: {
          results: [
            {
              id: "customer-1",
              role: "customer",
              full_name: "Nguyễn Văn A",
              email: "a@test.com",
              phone: "0901234567",
              avatar_url: null,
              created_at: "2026-01-01T00:00:00Z",
              is_active: true,
            },
          ],
        },
        status: 200,
      })
      .mockResolvedValueOnce({
        data: {
          id: "customer-1",
          role: "customer",
          full_name: "Nguyễn Văn A",
          email: "a@test.com",
          phone: "0901234567",
          avatar_url: null,
          created_at: "2026-01-01T00:00:00Z",
          is_active: true,
        },
        status: 200,
      });
    vi.mocked(apiClient.patch).mockResolvedValue({
      data: {},
      status: 200,
    });

    await useAdminUserStore.getState().fetchUsers({ role: "customer" });
    const user = useAdminUserStore.getState().users[0];

    await useAdminUserStore.getState().toggleUserStatus(user.id);

    expect(useAdminUserStore.getState().users.find((item) => item.id === user.id)?.status).toBe("suspended");
  });
});
