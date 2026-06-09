import { apiClient } from "@/lib/api-client";
import { type AdminAlert, type AdminChartPoint, type AdminOverviewMetrics } from "@/types/admin";

export type AdminOverview = {
  metrics: AdminOverviewMetrics;
  chart: AdminChartPoint[];
  alerts: AdminAlert[];
};

export async function getAdminOverview(): Promise<AdminOverview> {
  const res = await apiClient.get<Record<string, unknown>>("/admin/stats/overview/");
  const d = res.data as Record<string, unknown>;

  return {
    metrics: {
      totalCustomers: d.total_customers as number,
      activeTherapists: d.active_therapists as number,
      newBookingsToday: d.new_bookings_today as number,
      pendingTherapistApprovals: d.pending_therapist_approvals as number,
      unresolvedComplaints: 0,
    },
    chart: [],
    alerts: [
      {
        id: "alert-approvals",
        title: "Hồ sơ kỹ thuật viên chờ duyệt",
        description: `${d.pending_therapist_approvals} hồ sơ cần Admin kiểm tra chứng chỉ.`,
        tone: "amber" as const,
        href: "/admin/therapist-approvals",
      },
    ],
  };
}
