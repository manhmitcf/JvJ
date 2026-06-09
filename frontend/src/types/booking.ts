export type BookingStatus =
  | "pending"
  | "confirmed"
  | "in_progress"
  | "completed"
  | "cancelled"
  | "rejected";

export type PaymentStatus = "unpaid" | "pending" | "paid" | "failed";

export type Booking = {
  id: string;
  code: string;
  customerId: string;
  therapistId: string;
  treatmentId: string;
  timeSlotId: string;
  address: string;
  contactPhone: string;
  totalAmount: number;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  note?: string;
  rejectionReason?: string;
  // Fields from backend serializer
  customerName?: string;
  treatmentName?: string;
  date?: string;
  startTime?: string;
  endTime?: string;
};
