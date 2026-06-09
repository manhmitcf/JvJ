/**
 * Wallet service — lấy dữ liệu thu nhập từ dashboard API đã wire.
 * Backend trả snake_case trong {data: ...}, FE dùng camelCase.
 */
import { apiFetch } from "@/lib/api-client";
import { type DashboardApiResponse, type ProfileApiResponse } from "./dashboard-service";

export type WalletMetrics = {
  monthlyRevenue: number;
  completedBookings: number;
  pendingCount: number;
  rating: number;
  isOnline: boolean;
  todayAppointmentCount: number;
};

export type WalletAppointment = {
  id: string;
  code: string;
  customerName: string;
  treatmentName: string;
  startTime: string;
  endTime: string;
  address: string;
  status: string;
};

export async function getWalletMetrics(): Promise<WalletMetrics> {
  const [dashboard, profile] = await Promise.all([
    apiFetch<DashboardApiResponse>("/therapists/dashboard/"),
    fetchProfileIsOnline(),
  ]);
  return {
    monthlyRevenue: dashboard.monthly_revenue,
    completedBookings: dashboard.completed_count,
    pendingCount: dashboard.pending_count,
    rating: dashboard.rating,
    isOnline: profile,
    todayAppointmentCount: dashboard.today_appointments.length,
  };
}

export async function getWalletAppointments(): Promise<WalletAppointment[]> {
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

async function fetchProfileIsOnline(): Promise<boolean> {
  try {
    const profile = await apiFetch<ProfileApiResponse>("/therapists/profile/");
    return profile.is_online;
  } catch {
    return false;
  }
}