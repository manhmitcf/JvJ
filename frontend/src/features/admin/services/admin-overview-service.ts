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
      pendingCredentialUpdates: (d.pending_credential_updates as number) ?? 0,
      totalRevenueMonth: d.total_revenue_month as number,
      completedBookingsMonth: d.completed_bookings_month as number,
    },
    chart: (d.chart_7_days as Array<Record<string, unknown>>).map((item) => ({
      date: item.date as string,
      label: item.day_of_week as string,
      revenue: item.revenue as number,
      bookings: item.bookings as number,
    })),
    alerts: (d.alerts as Array<Record<string, unknown>>).map((item) => ({
      id: item.id as string,
      title: item.title as string,
      description: item.description as string,
      tone: item.tone as "amber" | "red" | "teal",
      href: item.href as string,
    })),
  };
}
