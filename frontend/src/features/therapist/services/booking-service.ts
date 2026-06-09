/**
 * Booking service — gọi API thật của backend therapist bookings.
 * Backend trả snake_case trong {data: ...} hoặc paginated JSON, FE dùng camelCase.
 * Backend lấy therapist từ JWT token — không cần truyền therapistId.
 */
import { apiFetch } from "@/lib/api-client";
import { type Booking } from "@/types/booking";

type BookingApiResponse = {
  id: string;
  code: string;
  customer: string;
  customer_name: string;
  therapist: string;
  therapist_name: string;
  treatment: string;
  treatment_name: string;
  treatment_price: string | number;
  timeslot: string;
  slot_date: string;
  slot_start_time: string;
  slot_end_time: string;
  address: string;
  contact_phone: string;
  total_amount: string | number;
  status: string;
  payment_status: string;
  note: string | null;
  rejection_reason: string | null;
  confirmed_at: string | null;
  completed_at: string | null;
  cancelled_at: string | null;
  created_at: string;
};

type BookingListApiResponse = {
  count: number;
  next: string | null;
  previous: string | null;
  results: BookingApiResponse[];
};

function mapBooking(api: BookingApiResponse): Booking {
  return {
    id: api.id,
    code: api.code,
    customerId: api.customer,
    therapistId: api.therapist,
    treatmentId: api.treatment,
    timeSlotId: api.timeslot,
    address: api.address,
    contactPhone: api.contact_phone,
    totalAmount: Number(api.total_amount),
    status: api.status as Booking["status"],
    paymentStatus: api.payment_status as Booking["paymentStatus"],
    note: api.note ?? undefined,
    rejectionReason: api.rejection_reason ?? undefined,
    customerName: api.customer_name,
    treatmentName: api.treatment_name,
    date: api.slot_date,
    startTime: api.slot_start_time,
    endTime: api.slot_end_time,
  };
}

export async function getTherapistBookings(): Promise<Booking[]> {
  const data = await apiFetch<BookingListApiResponse>("/bookings/therapist/bookings/");
  return (data.results || []).map(mapBooking);
}

export async function approveBooking(bookingId: string): Promise<Booking> {
  const result = await apiFetch<BookingApiResponse>(
    `/bookings/therapist/bookings/${bookingId}/confirm/`,
    { method: "POST", body: JSON.stringify({}) },
  );
  return mapBooking(result);
}

export async function rejectBooking(bookingId: string, reason: string): Promise<Booking> {
  if (!reason.trim()) throw new Error("Reason required");
  const result = await apiFetch<BookingApiResponse>(
    `/bookings/therapist/bookings/${bookingId}/reject/`,
    { method: "POST", body: JSON.stringify({ reason }) },
  );
  return mapBooking(result);
}

export async function startBooking(bookingId: string): Promise<Booking> {
  const result = await apiFetch<BookingApiResponse>(
    `/bookings/therapist/bookings/${bookingId}/start/`,
    { method: "POST", body: JSON.stringify({}) },
  );
  return mapBooking(result);
}

export async function completeBooking(bookingId: string): Promise<Booking> {
  const result = await apiFetch<BookingApiResponse>(
    `/bookings/therapist/bookings/${bookingId}/complete/`,
    { method: "POST", body: JSON.stringify({}) },
  );
  return mapBooking(result);
}
