import { MapPin, MessageSquare, Wallet } from "lucide-react";
import { type Booking } from "@/types/booking";
import { PrimaryButton, SecondaryButton, StatusBadge } from "./shared";

const money = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" });

export function BookingDetailDrawer({
  booking,
  image,
  customerName,
  treatmentName,
  onStart,
  onComplete,
}: {
  booking: Booking | undefined;
  image: string;
  customerName: string;
  treatmentName: string;
  onStart?: (bookingId: string) => void;
  onComplete?: (bookingId: string) => void;
}) {
  if (!booking) return null;

  return (
    <aside className="rounded-[2rem] border border-botanical-border bg-white p-lg shadow-stitch-soft xl:sticky xl:top-24 xl:self-start">
      <img src={image} alt="Chi tiết booking" className="h-44 w-full rounded-3xl object-cover" />
      <div className="mt-lg space-y-sm">
        <div className="flex flex-wrap gap-sm">
          <StatusBadge tone={statusTone(booking.status)}>{statusLabel(booking.status)}</StatusBadge>
          <StatusBadge tone={booking.paymentStatus === "paid" ? "green" : "amber"}>
            {booking.paymentStatus === "paid" ? "Đã thanh toán" : "Chưa thanh toán"}
          </StatusBadge>
        </div>
        <h2 className="text-2xl font-black text-ink-primary">{booking.code}</h2>
        <p className="text-body-sm font-semibold text-sage-secondary">{customerName} · {treatmentName}</p>
      </div>
      <div className="mt-lg space-y-sm text-body-sm font-semibold text-sage-secondary">
        <p className="flex items-center gap-sm"><MapPin className="h-4 w-4 text-primary shrink-0" /> {booking.address}</p>
        <p className="flex items-center gap-sm"><Wallet className="h-4 w-4 text-primary shrink-0" /> {money.format(booking.totalAmount)}</p>
        <p className="flex items-start gap-sm"><MessageSquare className="h-4 w-4 text-primary shrink-0 mt-0.5" /> {booking.note ?? "Không có ghi chú."}</p>
      </div>
      <div className="mt-lg flex flex-col gap-sm">
        {booking.status === "confirmed" && onStart && (
          <PrimaryButton onClick={() => onStart(booking.id)}>
            Bắt đầu buổi trị liệu
          </PrimaryButton>
        )}
        {booking.status === "in_progress" && onComplete && (
          <PrimaryButton onClick={() => onComplete(booking.id)}>
            Hoàn tất buổi trị liệu
          </PrimaryButton>
        )}
        {(booking.status === "pending" || booking.status === "completed" || booking.status === "rejected" || booking.status === "cancelled") && (
          <div className="space-y-sm rounded-2xl bg-soft-mint/60 p-md text-center">
            <p className="text-body-sm font-semibold text-sage-secondary">
              {booking.status === "pending" && "Lịch hẹn đang chờ bạn xác nhận."}
              {booking.status === "completed" && "Buổi trị liệu đã hoàn tất."}
              {booking.status === "rejected" && "Lịch hẹn đã bị từ chối."}
              {booking.status === "cancelled" && "Lịch hẹn đã bị hủy."}
            </p>
            {(booking.status === "pending") && (
              <p className="text-label-caption font-medium text-muted-text">
                Chuyển sang tab "Đã xác nhận" hoặc "Đang thực hiện" để thấy nút hành động.
              </p>
            )}
          </div>
        )}
      </div>
    </aside>
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
