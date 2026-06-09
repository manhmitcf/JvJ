import { CreditCard, Home, NotebookText } from "lucide-react";
import { type AdminBookingRow } from "@/types/admin";
import { AdminEmptyState, AdminStatusBadge } from "./shared";

const currency = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" });

export function AdminBookingDetailDrawer({ booking }: { booking: AdminBookingRow | null }) {
  if (!booking) {
    return <AdminEmptyState title="Chọn một booking" description="Chi tiết vận hành, thanh toán và ghi chú booking sẽ hiển thị tại đây." />;
  }

  return (
    <aside className="rounded-[2rem] border border-botanical-border bg-white p-lg shadow-stitch-soft">
      <div className="flex items-start justify-between gap-md">
        <div>
          <p className="text-label-caption font-black uppercase tracking-[0.2em] text-primary">Booking</p>
          <h2 className="mt-xs text-2xl font-black text-ink-primary">{booking.code}</h2>
          <p className="mt-xs text-body-sm font-semibold text-sage-secondary">{booking.scheduledAt}</p>
        </div>
        <AdminStatusBadge tone={booking.bookingStatus === "completed" ? "green" : booking.bookingStatus === "cancelled" || booking.bookingStatus === "rejected" ? "red" : "amber"}>{booking.bookingStatus}</AdminStatusBadge>
      </div>

      <div className="mt-lg space-y-sm">
        <div className="rounded-[1.5rem] bg-warm-bg p-md">
          <p className="text-body-sm font-black text-ink-primary">{booking.customerName}</p>
          <p className="mt-xs text-body-sm font-semibold text-sage-secondary">Khách hàng</p>
        </div>
        <div className="rounded-[1.5rem] bg-warm-bg p-md">
          <p className="text-body-sm font-black text-ink-primary">{booking.therapistName}</p>
          <p className="mt-xs text-body-sm font-semibold text-sage-secondary">{booking.treatmentName}</p>
        </div>
        <div className="rounded-[1.5rem] bg-warm-bg p-md">
          <p className="flex items-center gap-xs text-body-sm font-black text-ink-primary"><Home className="h-4 w-4 text-primary" />{booking.address}</p>
        </div>
        <div className="rounded-[1.5rem] bg-soft-mint p-md">
          <p className="flex items-center gap-xs text-body-sm font-black text-primary"><CreditCard className="h-4 w-4" />{currency.format(booking.totalAmount)}</p>
          <p className="mt-xs text-body-sm font-semibold text-sage-secondary">{booking.paymentStatus}{booking.paymentReference ? ` · ${booking.paymentReference}` : ""}</p>
        </div>
        {booking.note && (
          <div className="rounded-[1.5rem] bg-warm-bg p-md">
            <p className="flex items-center gap-xs text-body-sm font-black text-ink-primary"><NotebookText className="h-4 w-4 text-primary" />Ghi chú</p>
            <p className="mt-xs text-body-sm font-semibold text-sage-secondary">{booking.note}</p>
          </div>
        )}
      </div>
    </aside>
  );
}
