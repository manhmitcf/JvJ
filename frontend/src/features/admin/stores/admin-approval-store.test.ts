import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiClient } from "@/lib/api-client";
import { useAdminApprovalStore } from "./admin-approval-store";

describe("admin approval store", () => {
  beforeEach(() => {
    useAdminApprovalStore.setState({ approvals: [], selectedApproval: null, isLoading: false, error: null });
  });

  it("fetches approvals", async () => {
    vi.mocked(apiClient.get).mockResolvedValue({
      data: {
        results: [
          {
            id: "therapist-pending-1",
            user_full_name: "Nguyễn Văn A",
            user_email: "a@test.com",
            user_phone: "0901234567",
            user_avatar_url: null,
            years_of_experience: 3,
            specialties: ["Massage"],
            certificate_urls: [],
            created_at: "2026-06-01T10:00:00Z",
            status: "pending_approval",
            rejection_reason: null,
          },
        ],
      },
      status: 200,
    });

    await useAdminApprovalStore.getState().fetchApprovals("pending_approval");

    expect(useAdminApprovalStore.getState().approvals.length).toBeGreaterThan(0);
  });

  it("stores validation error when rejection reason is empty", async () => {
    vi.mocked(apiClient.get).mockResolvedValue({
      data: {
        results: [
          {
            id: "therapist-pending-1",
            user_full_name: "Nguyễn Văn A",
            user_email: "a@test.com",
            user_phone: "0901234567",
            user_avatar_url: null,
            years_of_experience: 3,
            specialties: ["Massage"],
            certificate_urls: [],
            created_at: "2026-06-01T10:00:00Z",
            status: "pending_approval",
            rejection_reason: null,
          },
        ],
      },
      status: 200,
    });

    vi.mocked(apiClient.post).mockRejectedValue(new Error("Rejection reason is required"));

    await useAdminApprovalStore.getState().rejectApplication("therapist-pending-1", "");

    expect(useAdminApprovalStore.getState().error).toBe("Rejection reason is required");
  });
});
