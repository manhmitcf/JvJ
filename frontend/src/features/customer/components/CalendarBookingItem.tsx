import { CalendarDays, Clock3, CreditCard, MapPin, UserRound } from "lucide-react";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { type Booking, type PaymentStatus } from "@/types/booking";

export type CalendarBookingDisplay = {
  treatmentName: string;
  therapistName: string;
  dateLabel: string;
  timeLabel: string;
};

type CalendarBookingItemProps = {
  booking: Booking;
  display: CalendarBookingDisplay;
  onClick: () => void;
};

const paymentStatusLabels: Record<PaymentStatus, string> = {
  unpaid: "Chưa thanh toán",
  pending: "Đang xử lý",
  paid: "Đã thanh toán",
  failed: "Thanh toán lỗi",
};

const paymentStatusClassNames: Record<PaymentStatus, string> = {
  unpaid: "border-amber-200 bg-amber-50 text-amber-700",
  pending: "border-blue-200 bg-blue-50 text-blue-700",
  paid: "border-emerald-200 bg-emerald-50 text-emerald-700",
  failed: "border-red-200 bg-red-50 text-red-700",
};

function formatCurrency(amount: number) {
  return amount.toLocaleString("vi-VN") + " ₫";
}

export function CalendarBookingItem({ booking, display, onClick }: CalendarBookingItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full rounded-2xl border border-botanical-border bg-surface p-lg text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary hover:shadow-[0_10px_30px_rgba(15,118,110,0.08)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
    >
      <div className="grid gap-lg xl:grid-cols-[minmax(0,1.25fr)_minmax(220px,0.85fr)_auto] xl:items-start">
        <div className="min-w-0 space-y-sm">
          <p className="text-label-caption font-bold uppercase tracking-[0.16em] text-primary">{booking.code}</p>
          <h3 className="text-lg font-black leading-snug text-ink-primary">{display.treatmentName}</h3>
          <div className="flex items-center gap-sm text-body-sm text-sage-secondary">
            <UserRound className="h-4 w-4 shrink-0 text-primary" />
            <span className="min-w-0 truncate">{display.therapistName}</span>
          </div>
        </div>

        <div className="grid gap-sm text-body-sm text-sage-secondary sm:grid-cols-2 xl:grid-cols-1">
          <InfoLine icon={<CalendarDays className="h-4 w-4" />} value={display.dateLabel} />
          <InfoLine icon={<Clock3 className="h-4 w-4" />} value={display.timeLabel} />
          <InfoLine icon={<MapPin className="h-4 w-4" />} value={booking.address} />
          <InfoLine icon={<CreditCard className="h-4 w-4" />} value={formatCurrency(booking.totalAmount)} strong />
        </div>

        <div className="flex flex-wrap gap-xs xl:max-w-36 xl:flex-col xl:items-end">
          <StatusBadge status={booking.status} />
          <span className={`rounded-full border px-sm py-1 text-[11px] font-semibold ${paymentStatusClassNames[booking.paymentStatus]}`}>
            {paymentStatusLabels[booking.paymentStatus]}
          </span>
        </div>
      </div>
    </button>
  );
}

function InfoLine({ icon, value, strong = false }: { icon: React.ReactNode; value: string; strong?: boolean }) {
  return (
    <div className="flex min-w-0 items-center gap-sm">
      <span className="shrink-0 text-primary">{icon}</span>
      <span className={strong ? "min-w-0 truncate font-black text-ink-primary" : "min-w-0 truncate"}>{value}</span>
    </div>
  );
}
