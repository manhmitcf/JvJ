import { describe, expect, it, vi, beforeEach } from "vitest";
import { apiClient } from "@/lib/api-client";
import { createSpa, deleteSpa, getAdminSpas, updateSpa } from "./admin-spa-service";

const mockSpaResults = [
  {
    id: "spa-1",
    name: "Spa A",
    address: "Address A",
    district: "Hai Chau",
    latitude: null,
    longitude: null,
    phone: "0901000001",
    email: "a@spa.vn",
    open_time: "08:00",
    close_time: "20:00",
    description: "Spa A desc",
    status: "active",
    image_urls: [],
    linked_treatment_count: 3,
  },
  {
    id: "spa-2",
    name: "Spa B",
    address: "Address B",
    district: "Thanh Khe",
    latitudeiy: null,
    longitude: null,
    phone: "0901000002",
    email: "b@spa.vn",
    open_time: "09:00",
    close_time: "21:00",
    description: "Spa B desc",
    status: "active",
    image_urls: [],
    linked_treatment_count: 5,
  },
];

const mockCreatedSpa = {
  id: "spa-3",
  name: "Sen Therapy Cam Le",
  address: "09 Ong Ich Duong, Cam Le, Da Nang",
  district: "Cam Le",
  latitude: null,
  longitude: null,
  phone: "0905999999",
  email: "sen@jvj.vn",
  open_time: "08:00",
  close_time: "20:00",
  description: "Spa doi tac moi cho khu vuc Cam Le.",
  status: "active",
  image_urls: [],
  linked_treatment_count: 0,
};

describe("admin spa service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns spa list", async () => {
    vi.mocked(apiClient.get).mockResolvedValueOnce({
      data: { results: mockSpaResults },
      status: 200,
    });

    const spas = await getAdminSpas();

    expect(spas.length).toBeGreaterThan(0);
  });

  it("creates, updates, and deletes a spa", async () => {
    vi.mocked(apiClient.post).mockResolvedValueOnce({
      data: mockCreatedSpa,
      status: 201,
    });

    const created = await createSpa({
      name: "Sen Therapy Cam Le",
      address: "09 Ong Ich Duong, Cam Le, Da Nang",
      district: "Cam Le",
      phone: "0905999999",
      email: "sen@jvj.vn",
      openTime: "08:00",
      closeTime: "20:00",
      description: "Spa doi tac moi cho khu vuc Cam Le.",
      status: "active",
      imageUrls: [],
    });

    expect(created.id).toContain("spa-");

    vi.mocked(apiClient.put).mockResolvedValueOnce({
      data: { ...mockCreatedSpa, status: "hidden" },
      status: 200,
    });

    const updated = await updateSpa(created.id, { status: "hidden" });
    expect(updated.status).toBe("hidden");

    vi.mocked(apiClient.delete).mockResolvedValueOnce({ data: null, status: 204 });
    await deleteSpa(created.id);

    vi.mocked(apiClient.get).mockResolvedValueOnce({
      data: { results: [mockSpaResults[0]] },
      status: 200,
    });

    const spas = await getAdminSpas();
    expect(spas.some((spa) => spa.id === created.id)).toBe(false);
  });
});
