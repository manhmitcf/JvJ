import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiClient } from "@/lib/api-client";
import { useAdminSpaStore } from "./admin-spa-store";

describe("admin spa store", () => {
  beforeEach(() => {
    useAdminSpaStore.setState({ spas: [], selectedSpa: null, isLoading: false, error: null });
  });

  it("fetches spas", async () => {
    vi.mocked(apiClient.get).mockResolvedValue({
      data: {
        results: [
          {
            id: "spa-1",
            name: "Sen Therapy Đà Nẵng",
            address: "123 Nguyễn Văn Linh",
            district: "Hải Châu",
            latitude: null,
            longitude: null,
            phone: "0901234567",
            email: "sen@jvj.vn",
            open_time: "08:00",
            close_time: "20:00",
            description: "Spa chất lượng cao",
            status: "active",
            image_urls: [],
            linked_treatment_count: 0,
          },
        ],
      },
      status: 200,
    });

    await useAdminSpaStore.getState().fetchSpas();

    expect(useAdminSpaStore.getState().spas.length).toBeGreaterThan(0);
  });

  it("creates spa into state", async () => {
    vi.mocked(apiClient.get).mockResolvedValue({
      data: { results: [] },
      status: 200,
    });
    vi.mocked(apiClient.post).mockResolvedValue({
      data: {
        id: "spa-new-1",
        name: "Lành Therapy Liên Chiểu",
        address: "20 Nguyễn Lương Bằng, Liên Chiểu, Đà Nẵng",
        district: "Liên Chiểu",
        latitude: null,
        longitude: null,
        phone: "0905888888",
        email: "lanh@jvj.vn",
        open_time: "08:00",
        close_time: "20:00",
        description: "Spa đối tác mock.",
        status: "active",
        image_urls: [],
        linked_treatment_count: 0,
      },
      status: 201,
    });

    await useAdminSpaStore.getState().createSpa({
      name: "Lành Therapy Liên Chiểu",
      address: "20 Nguyễn Lương Bằng, Liên Chiểu, Đà Nẵng",
      district: "Liên Chiểu",
      phone: "0905888888",
      email: "lanh@jvj.vn",
      openTime: "08:00",
      closeTime: "20:00",
      description: "Spa đối tác mock.",
      status: "active",
      imageUrls: [],
    });

    expect(useAdminSpaStore.getState().spas.some((spa) => spa.name.includes("Lành"))).toBe(true);
  });
});
