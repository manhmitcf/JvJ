import { type PaymentStatus } from "./booking";

export type PaymentMethod = "vnpay_qr" | "vnpay_card";
export type PaymentMethodMock = PaymentMethod; // Backward compat

export type PaymentActionResult = {
  bookingId: string;
  status: PaymentStatus;
  message: string;
  updatedAt: string;
};

export type PaymentTimeline = {
  id: string;
  label: string;
  occurredAt: string;
  tone: "neutral" | "success" | "warning";
};

export type PaymentTimelineItem = PaymentTimeline; // Backward compat

export type Payment = {
  id: string;
  bookingId: string;
  method: PaymentMethod;
  amount: number;
  status: PaymentStatus;
  vnpayTransactionId?: string;
  createdAt: string;
  completedAt?: string;
  timeline: PaymentTimeline[];
};

export type PaymentInitiateResult = Payment & {
  paymentUrl?: string;
  qrCodeUrl?: string;
};

export type PaymentSimulateResult = Payment & {
  callback: {
    success: boolean;
    vnpTransactionNo?: string;
    vnpResponseCode?: string;
  };
};
