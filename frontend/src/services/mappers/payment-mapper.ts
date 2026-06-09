import { type PaymentDto, type PaymentTimelineDto } from "@/types/api";
import { type Payment, type PaymentTimeline, type PaymentMethod } from "@/types/payment";
import { type PaymentStatus } from "@/types/booking";

/**
 * Map backend payment status to frontend PaymentStatus.
 * Backend uses: pending | success | failed
 * Frontend uses: unpaid | pending | paid | failed
 */
function mapPaymentStatus(backendStatus: string): PaymentStatus {
  if (backendStatus === "success") return "paid";
  if (backendStatus === "pending") return "pending";
  if (backendStatus === "failed") return "failed";
  return "unpaid"; // fallback
}

/**
 * Map PaymentTimelineDto (snake_case) to PaymentTimeline (camelCase).
 */
export function mapPaymentTimeline(dto: PaymentTimelineDto): PaymentTimeline {
  return {
    id: dto.id,
    label: dto.label,
    tone: dto.tone,
    occurredAt: dto.occurred_at,
  };
}

/**
 * Map PaymentDto (snake_case) to Payment (camelCase).
 */
export function mapPayment(dto: PaymentDto): Payment {
  return {
    id: dto.id,
    bookingId: dto.booking,
    method: dto.method as PaymentMethod,
    amount: parseFloat(dto.amount),
    status: mapPaymentStatus(dto.status),
    vnpayTransactionId: dto.vnpay_transaction_id || undefined,
    createdAt: dto.created_at,
    completedAt: dto.completed_at || undefined,
    timeline: dto.timeline.map(mapPaymentTimeline),
  };
}
