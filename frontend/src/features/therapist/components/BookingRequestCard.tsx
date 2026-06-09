import { CheckCircle2, Clock, MapPin, Wallet, XCircle } from "lucide-react";
import { type Booking } from "@/types/booking";
import { PrimaryButton, SecondaryButton, StatusBadge } from "./shared";

const money = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" });

export function BookingRequestCard({
  booking,
  image,
  customerName,
  treatmentName,
  onApprove,
  onReject,
}: {
  booking: Booking;
  image: string;
  customerName: string;
  treatmentName: string;
  onApprove: (bookingId: string) => void;
  onReject: (bookingId: string) => void;
}) {
  return (
    <article className="rounded-[2rem] border border-botanical-border bg-white p-lg shadow-stitch-soft transition hover:border-primary">
      <div className="flex flex-col gap-md lg:flex-row lg:items-start">
        <img src={image} alt="Khách hàng JvJ" className="h-20 w-20 rounded-3xl object-cover" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-sm">
            <h2 className="text-xl font-black text-ink-primary">{booking.code}</h2>
            <StatusBadge tone={statusTone(booking.status)}>{statusLabel(booking.status)}</StatusBadge>
            <StatusBadge tone={booking.paymentStatus === "paid" ? "green" : "amber"}>{booking.paymentStatus === "paid" ? "Đã thanh toán" : "Chưa thanh toán"}</StatusBadge>
          </div>
          <p className="mt-xs font-black text-ink-primary">{customerName}</p>
          <p className="mt-xs text-body-sm font-semibold text-sage-secondary">{treatmentName}</p>
          <div className="mt-sm flex flex-wrap gap-md text-label-caption font-bold text-muted-text">
            <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> 09:00, 27/05</span>
            <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {booking.address}</span>
            <span className="inline-flex items-center gap-1"><Wallet className="h-3.5 w-3.5" /> {money.format(booking.totalAmount)}</span>
          </div>
          {booking.note && <p className="mt-sm rounded-2xl bg-soft-mint p-sm text-body-sm font-medium text-sage-secondary">{booking.note}</p>}
          {booking.rejectionReason && <p className="mt-sm rounded-2xl bg-[#FEF2F2] p-sm text-body-sm font-medium text-[#B91C1C]">{booking.rejectionReason}</p>}
        </div>
        <div className="flex flex-wrap gap-sm lg:flex-col">
          {booking.status === "pending" && <PrimaryButton onClick={() => onApprove(booking.id)}><CheckCircle2 className="h-4 w-4" /> Xác nhận</PrimaryButton>}
          {booking.status === "pending" && <SecondaryButton onClick={() => onReject(booking.id)} className="text-[#B91C1C]"><XCircle className="h-4 w-4" /> Từ chối</SecondaryButton>}
          <SecondaryButton>Xem chi tiết</SecondaryButton>
        </div>
      </div>
    </article>
  );
}

function statusTone(status: string): "teal" | "green" | "amber" | "blue" | "red" | "slate" {
  if (status === "pending") return "amber";
  if (status === "confirmed" || status === "in_progress") return "teal";
  if (status === "completed") return "blue";
  if (status === "rejected") return "red";
  return "slate";
}

function statusLabel(status: string) {
  const labels: Record<string, string> = {
    pending: "Chờ xác nhận",
    confirmed: "Đã xác nhận",
    in_progress: "Đang thực hiện",
    completed: "Hoàn tất",
    rejected: "Đã từ chối",
    cancelled: "Đã hủy",
  };
  return labels[status] ?? status;
}
