import { type AdminBookingRow } from "@/types/admin";
import { AdminStatusBadge, AdminTableShell } from "./shared";

const currency = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" });

const bookingLabels: Record<AdminBookingRow["bookingStatus"], string> = {
  pending: "Chờ xác nhận",
  confirmed: "Đã xác nhận",
  in_progress: "Đang thực hiện",
  completed: "Hoàn tất",
  cancelled: "Đã hủy",
  rejected: "Từ chối",
};

const paymentLabels: Record<AdminBookingRow["paymentStatus"], string> = {
  unpaid: "Chưa thanh toán",
  pending: "Đang xử lý",
  paid: "Đã thanh toán",
  failed: "Thất bại",
};

const bookingTone: Record<AdminBookingRow["bookingStatus"], "amber" | "blue" | "teal" | "green" | "red" | "slate"> = {
  pending: "amber",
  confirmed: "blue",
  in_progress: "teal",
  completed: "green",
  cancelled: "slate",
  rejected: "red",
};

const paymentTone: Record<AdminBookingRow["paymentStatus"], "amber" | "green" | "red" | "slate"> = {
  unpaid: "slate",
  pending: "amber",
  paid: "green",
  failed: "red",
};

export function AdminBookingTable({ bookings, selectedBookingId, onSelect }: { bookings: AdminBookingRow[]; selectedBookingId?: string; onSelect: (bookingId: string) => void }) {
  return (
    <AdminTableShell>
      <div className="overflow-x-auto">
        <div className="grid min-w-[980px] grid-cols-[0.7fr_1.25fr_1.25fr_1fr_1fr_1fr] gap-md border-b border-botanical-border bg-soft-mint/60 px-lg py-md text-label-caption font-black uppercase tracking-[0.16em] text-sage-secondary">
          <span>Mã lịch</span>
          <span>Khách hàng</span>
          <span>KTV & liệu trình</span>
          <span>Thời gian</span>
          <span>Thanh toán</span>
          <span>Trạng thái</span>
        </div>
        <div className="divide-y divide-botanical-border">
          {bookings.map((booking) => (
            <button key={booking.id} type="button" onClick={() => onSelect(booking.id)} className={`grid min-w-[980px] w-full grid-cols-[0.7fr_1.25fr_1.25fr_1fr_1fr_1fr] items-center gap-md px-lg py-md text-left ${selectedBookingId === booking.id ? "bg-soft-mint/50" : "bg-white hover:bg-warm-bg"}`}>
            <span className="text-body-sm font-black text-primary">{booking.code}</span>
            <span>
              <span className="block text-body-sm font-black text-ink-primary">{booking.customerName}</span>
              <span className="block text-label-caption font-semibold text-sage-secondary">{booking.address}</span>
            </span>
            <span>
              <span className="block text-body-sm font-black text-ink-primary">{booking.therapistName}</span>
              <span className="block text-label-caption font-semibold text-sage-secondary">{booking.treatmentName}</span>
            </span>
            <span className="text-body-sm font-bold text-ink-primary">{booking.scheduledAt}</span>
            <span>
              <span className="block text-body-sm font-black text-ink-primary">{currency.format(booking.totalAmount)}</span>
              <AdminStatusBadge tone={paymentTone[booking.paymentStatus]}>{paymentLabels[booking.paymentStatus]}</AdminStatusBadge>
            </span>
            <AdminStatusBadge tone={bookingTone[booking.bookingStatus]}>{bookingLabels[booking.bookingStatus]}</AdminStatusBadge>
            </button>
          ))}
        </div>
      </div>
    </AdminTableShell>
  );
}
