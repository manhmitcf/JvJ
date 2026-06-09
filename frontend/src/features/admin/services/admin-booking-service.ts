import { apiClient } from "@/lib/api-client";
import { type AdminBookingRow } from "@/types/admin";
import { type BookingStatus, type PaymentStatus } from "@/types/booking";

export type AdminBookingFilters = {
  bookingStatus?: BookingStatus | "all";
  paymentStatus?: PaymentStatus | "all";
  keyword?: string;
};

type AdminBookingDto = {
  id: string;
  code: string;
  customer_name?: string;
  therapist_name?: string;
  treatment_name?: string;
  timeslot_date: string;
  total_amount: string | number;
  status: BookingStatus;
  payment_status: PaymentStatus;
  payment_reference?: string;
  address?: string;
  note?: string;
};

export async function getAdminBookings(filters: AdminBookingFilters = {}): Promise<AdminBookingRow[]> {
  const params = new URLSearchParams();
  if (filters.bookingStatus && filters.bookingStatus !== "all") params.set("status", filters.bookingStatus);
  if (filters.paymentStatus && filters.paymentStatus !== "all") params.set("payment_status", filters.paymentStatus);

  const res = await apiClient.get<{ results: AdminBookingDto[] }>(`/admin/bookings/?${params}`);
  return (res.data.results ?? []).map((b) => ({
    id: b.id,
    code: b.code,
    customerName: b.customer_name ?? "",
    therapistName: b.therapist_name ?? "",
    treatmentName: b.treatment_name ?? "",
    scheduledAt: b.timeslot_date,
    totalAmount: Number(b.total_amount),
    bookingStatus: b.status as BookingStatus,
    paymentStatus: b.payment_status as PaymentStatus,
    paymentReference: b.payment_reference,
    address: b.address,
    note: b.note,
  }));
}

export async function getAdminBookingById(bookingId: string): Promise<AdminBookingRow> {
  const res = await apiClient.get<AdminBookingDto>(`/admin/bookings/${bookingId}/`);
  const b = res.data;
  return {
    id: b.id,
    code: b.code,
    customerName: b.customer_name ?? "",
    therapistName: b.therapist_name ?? "",
    treatmentName: b.treatment_name ?? "",
    scheduledAt: b.timeslot_date,
    totalAmount: Number(b.total_amount),
    bookingStatus: b.status as BookingStatus,
    paymentStatus: b.payment_status as PaymentStatus,
    paymentReference: b.payment_reference,
    address: b.address,
    note: b.note,
  };
}

export async function forceCancelBooking(bookingId: string, reason: string): Promise<void> {
  await apiClient.post(`/admin/bookings/${bookingId}/force-cancel/`, { reason });
}
