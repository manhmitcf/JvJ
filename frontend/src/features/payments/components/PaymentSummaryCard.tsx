import { CalendarDays, CreditCard, MapPin, Receipt, Stethoscope, UserRound } from "lucide-react";
import { Card } from "@/components/ui/card";
import { type Booking } from "@/types/booking";

export interface PaymentSummaryCardProps {
  readonly booking: Booking;
}

function formatCurrency(amount: number) {
  return amount.toLocaleString("vi-VN") + "đ";
}

function getScheduleText(booking: Booking) {
  return booking.timeSlotId || "Lịch hẹn sẽ được cập nhật sau";
}

function SummaryItem({
  icon: Icon,
  label,
  value,
}: {
  readonly icon: typeof Receipt;
  readonly label: string;
  readonly value: string;
}) {
  return (
    <div className="flex items-start gap-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#ebefed] text-[#005c55]">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-[#6e7977]">{label}</p>
        <p className="mt-1 text-sm font-medium text-[#181c1c]">{value}</p>
      </div>
    </div>
  );
}

export function PaymentSummaryCard({ booking }: PaymentSummaryCardProps) {
  return (
    <Card className="relative overflow-hidden rounded-2xl border-[#bdc9c6] bg-white p-6 shadow-[0_4px_20px_rgba(15,118,110,0.04)]">
      <div className="absolute inset-y-0 left-0 w-1.5 bg-[#0f766e]" />
      <div className="mb-6 flex items-start justify-between gap-4 pl-2">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#6e7977]">Mã booking</p>
          <p className="mt-2 text-lg font-bold text-[#005c55]">{booking.code}</p>
        </div>
        <span className="rounded-full bg-[#E6F4F1] px-3 py-1 text-xs font-semibold text-[#005c55]">Thanh toán demo</span>
      </div>

      <div className="space-y-4 pl-2">
        <SummaryItem icon={Receipt} label="Mã booking nội bộ" value={booking.id} />
        <SummaryItem icon={Stethoscope} label="Mã liệu trình" value={booking.treatmentId} />
        <SummaryItem icon={UserRound} label="Mã KTV" value={booking.therapistId} />
        <SummaryItem icon={CalendarDays} label="Mã khung giờ / lịch hẹn" value={getScheduleText(booking)} />
        <SummaryItem icon={MapPin} label="Địa chỉ" value={booking.address} />
      </div>

      <div className="mt-8 rounded-2xl border border-dashed border-[#bdc9c6] bg-[#f7faf8] p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-[#3e4947]">
            <CreditCard className="h-5 w-5 text-[#005c55]" />
            <span className="text-sm font-medium">Tổng thanh toán</span>
          </div>
          <span className="text-2xl font-extrabold text-[#005c55]">{formatCurrency(booking.totalAmount)}</span>
        </div>
      </div>
    </Card>
  );
}
