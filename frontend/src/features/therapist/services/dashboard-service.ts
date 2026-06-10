import { apiFetch } from "@/lib/api-client";

export type DashboardMetrics = {
  completedBookings: number;
  pendingCount: number;
  rating: number;
  isOnline: boolean;
  monthlyRevenue: number;
  paidRevenue: number;
  todayAppointmentCount: number;
};

export type TodayAppointment = {
  id: string;
  code: string;
  customerName: string;
  treatmentName: string;
  startTime: string;
  endTime: string;
  address: string;
  status: string;
};

export type DashboardApiResponse = {
  pending_count: number;
  completed_count: number;
  today_appointments: Array<{
    id: string;
    code: string;
    customer_name: string;
    treatment_name: string;
    start_time: string;
    end_time: string;
    address: string;
    status: string;
  }>;
  monthly_revenue: number;
  paid_revenue: number;
  rating: number;
};

export type ProfileApiResponse = {
  is_online: boolean;
};

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  const [dashboard, profile] = await Promise.all([
    apiFetch<DashboardApiResponse>("/therapists/dashboard/"),
    fetchProfileIsOnline(),
  ]);
  return {
    completedBookings: dashboard.completed_count,
    pendingCount: dashboard.pending_count,
    rating: dashboard.rating,
    isOnline: profile,
    monthlyRevenue: dashboard.monthly_revenue,
    paidRevenue: dashboard.paid_revenue,
    todayAppointmentCount: dashboard.today_appointments.length,
  };
}

export async function getTodayAppointments(): Promise<TodayAppointment[]> {
  const data = await apiFetch<DashboardApiResponse>("/therapists/dashboard/");
  return data.today_appointments.map((apt) => ({
    id: apt.id,
    code: apt.code,
    customerName: apt.customer_name,
    treatmentName: apt.treatment_name,
    startTime: apt.start_time,
    endTime: apt.end_time,
    address: apt.address,
    status: apt.status,
  }));
}

export async function toggleOnlineStatus(isOnline: boolean): Promise<boolean> {
  await apiFetch<ProfileApiResponse>("/therapists/profile/status/", {
    method: "PATCH",
    body: JSON.stringify({ is_online: isOnline }),
  });
  return isOnline;
}

async function fetchProfileIsOnline(): Promise<boolean> {
  try {
    const profile = await apiFetch<ProfileApiResponse>("/therapists/profile/");
    return profile.is_online;
  } catch {
    return false;
  }
}
