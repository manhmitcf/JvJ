import { type Booking, type BookingStatus, type PaymentStatus } from "@/types/booking";
import { type BookingDto } from "@/types/api";

/**
 * Map backend DTO (snake_case) to frontend domain (camelCase).
 * Backend BookingDetailSerializer includes nested data:
 * - customer_name, therapist_name, treatment_name, treatment_price
 * - slot_date, slot_start_time, slot_end_time
 */
export function mapBooking(dto: BookingDto): Booking {
  return {
    id: dto.id,
    code: dto.code,
    customerId: dto.customer,
    therapistId: dto.therapist,
    treatmentId: dto.treatment,
    timeSlotId: dto.timeslot,
    address: dto.address,
    contactPhone: dto.contact_phone,
    totalAmount: parseFloat(dto.total_amount),
    status: dto.status as BookingStatus,
    paymentStatus: dto.payment_status as PaymentStatus,
    note: dto.note || undefined,
    rejectionReason: dto.rejection_reason || undefined,
  };
}

/**
 * Extended booking with display data from backend.
 * Used for calendar/list views to avoid extra queries.
 */
export type BookingWithDisplay = Booking & {
  customerName: string;
  therapistName: string;
  treatmentName: string;
  treatmentPrice: number;
  slotDate: string;
  slotStartTime: string;
  slotEndTime: string;
};

export function mapBookingWithDisplay(dto: BookingDto): BookingWithDisplay {
  return {
    ...mapBooking(dto),
    customerName: dto.customer_name,
    therapistName: dto.therapist_name,
    treatmentName: dto.treatment_name,
    treatmentPrice: parseFloat(dto.treatment_price),
    slotDate: dto.slot_date,
    slotStartTime: dto.slot_start_time,
    slotEndTime: dto.slot_end_time,
  };
}
