import { describe, expect, it, vi, beforeEach } from "vitest";
import { apiClient } from "@/lib/api-client";
import {
  approveTherapistApplication,
  getTherapistApprovals,
  rejectTherapistApplication,
} from "./admin-approval-service";

const mockPendingResults = [
  {
    id: "therapist-pending-1",
    user_full_name: "Nguyen Van A",
    user_email: "a@example.com",
    user_phone: "0901000001",
    user_avatar_url: null,
    years_of_experience: 5,
    specialties: "Massage tri lieu",
    certificate_urls: ["https://example.com/cert1.pdf"],
    created_at: "2026-06-01T10:00:00Z",
    status: "pending_approval",
    rejection_reason: null,
  },
  {
    id: "therapist-pending-2",
    user_full_name: "Tran Thi B",
    user_email: "b@example.com",
    user_phone: "0901000002",
    user_avatar_url: null,
    years_of_experience: 3,
    specialties: "Vat ly tri lieu",
    certificate_urls: ["https://example.com/cert2.pdf"],
    created_at: "2026-06-02T10:00:00Z",
    status: "pending_approval",
    rejection_reason: null,
  },
];

const mockApprovedItem = {
  id: "therapist-pending-1",
  user_full_name: "Nguyen Van A",
  user_email: "a@example.com",
  user_phone: "0901000001",
  user_avatar_url: null,
  years_of_experience: 5,
  specialties: "Massage tri lieu",
  certificate_urls: ["https://example.com/cert1.pdf"],
  created_at: "2026-06-01T10:00:00Z",
  status: "approved",
  rejection_reason: null,
};

describe("admin approval service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns pending therapist approvals", async () => {
    vi.mocked(apiClient.get).mockResolvedValueOnce({
      data: { results: mockPendingResults },
      status: 200,
    });

    const approvals = await getTherapistApprovals("pending_approval");

    expect(approvals.every((item) => item.status === "pending_approval")).toBe(true);
  });

  it("approves therapist application", async () => {
    vi.mocked(apiClient.post).mockResolvedValueOnce({ data: null, status: 200 });
    vi.mocked(apiClient.get).mockResolvedValueOnce({
      data: mockApprovedItem,
      status: 200,
    });

    const updated = await approveTherapistApplication("therapist-pending-1");

    expect(updated.status).toBe("approved");
  });

  it("requires reason when rejecting", async () => {
    vi.mocked(apiClient.post).mockRejectedValueOnce(
      new Error("Rejection reason is required"),
    );

    await expect(
      rejectTherapistApplication("therapist-pending-1", ""),
    ).rejects.toThrow("Rejection reason is required");
  });
});
