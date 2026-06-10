import { Calendar, CheckCircle2, Clock, MapPin, Trash2, Lock, Unlock, X } from "lucide-react";
import { type TimeSlot } from "@/types/schedule";
import { type Booking } from "@/types/booking";
import { PrimaryButton, SecondaryButton, StatusBadge } from "./shared";

interface SlotDetailDialogProps {
  slot: TimeSlot | null;
  booking?: Booking;
  onClose: () => void;
  onToggleAvailability: (slotId: string, isAvailable: boolean) => void;
  onDelete: (slotId: string) => void;
}

export function SlotDetailDialog({ slot, booking, onClose, onToggleAvailability, onDelete }: SlotDetailDialogProps) {
  if (!slot) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink-primary/40 backdrop-blur-sm p-md"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="slot-detail-title"
    >
      <div
        className="w-full max-w-md rounded-[2rem] border border-botanical-border bg-white p-xl shadow-stitch-soft"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <p className="text-label-caption font-bold uppercase tracking-wider text-muted-text">Chi tiết khung giờ</p>
            <h2 id="slot-detail-title" className="mt-xs text-2xl font-black text-ink-primary">{slot.date}</h2>
          </div>
          <button
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-botanical-border bg-warm-bg transition hover:border-primary hover:bg-soft-mint"
          >
            <X className="h-5 w-5 text-ink-primary" />
          </button>
        </div>

        {/* Time & Status */}
        <div className="mt-lg space-y-sm">
          <div className="flex items-center gap-sm text-body-md font-semibold text-sage-secondary">
            <Calendar className="h-4 w-4 text-primary" />
            <span>{slot.date}</span>
          </div>
          <div className="flex items-center gap-sm text-body-md font-semibold text-sage-secondary">
            <Clock className="h-4 w-4 text-primary" />
            <span>{slot.startTime} – {slot.endTime}</span>
          </div>
          <div className="mt-sm">
            <StatusBadge tone={slot.bookingId ? "teal" : slot.isAvailable ? "green" : "red"}>
              {slot.bookingId ? "Đã có lịch hẹn" : slot.isAvailable ? "Khả dụng" : "Tạm khóa"}
            </StatusBadge>
          </div>
        </div>

        {/* Booking details */}
        {booking ? (
          <div className="mt-lg space-y-sm rounded-2xl border border-botanical-border bg-soft-mint/30 p-md">
            <div className="flex items-center gap-sm text-body-sm font-black text-ink-primary">
              <CheckCircle2 className="h-4 w-4 text-teal-primary" />
              <span>{booking.code}</span>
              <StatusBadge tone={booking.paymentStatus === "paid" ? "green" : "amber"}>
                {booking.paymentStatus === "paid" ? "Đã thanh toán" : "Chưa thanh toán"}
              </StatusBadge>
            </div>
            <p className="text-body-sm font-semibold text-sage-secondary">
              <span className="font-black text-ink-primary">{booking.customerName}</span>
              {" · "}
              {booking.treatmentName}
            </p>
            <p className="flex items-center gap-sm text-body-sm font-semibold text-sage-secondary">
              <MapPin className="h-3.5 w-3.5 text-primary" />
              {booking.address}
            </p>
            <p className="flex items-center gap-sm text-body-sm font-semibold text-sage-secondary">
              <Clock className="h-3.5 w-3.5 text-primary" />
              {booking.startTime} – {booking.endTime}
            </p>
            {booking.note && (
              <p className="rounded-xl bg-white/60 p-sm text-body-sm font-medium text-sage-secondary">
                {booking.note}
              </p>
            )}
          </div>
        ) : slot.bookingId ? (
          <div className="mt-lg rounded-2xl border border-botanical-border bg-warm-bg/50 p-md">
            <p className="text-label-caption font-bold uppercase tracking-wider text-muted-text">Đã có lịch hẹn</p>
            <p className="mt-xs text-body-sm font-medium text-sage-secondary">
              Mã booking: <span className="font-black text-ink-primary">{slot.bookingId.slice(0, 8)}...</span>
            </p>
          </div>
        ) : null}

        {/* Actions */}
        <div className="mt-xl flex flex-wrap gap-sm">
          <PrimaryButton
            onClick={() => { onToggleAvailability(slot.id, !slot.isAvailable); onClose(); }}
            className="flex-1"
          >
            {slot.isAvailable ? (
              <><Lock className="h-4 w-4" /> Khóa khung giờ</>
            ) : (
              <><Unlock className="h-4 w-4" /> Mở khóa</>
            )}
          </PrimaryButton>
          <SecondaryButton
            onClick={() => { onDelete(slot.id); onClose(); }}
            className="flex items-center gap-xs text-[#B91C1C]"
          >
            <Trash2 className="h-4 w-4" /> Xóa
          </SecondaryButton>
        </div>
      </div>
    </div>
  );
}
