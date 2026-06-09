import { Trash2 } from "lucide-react";
import { type TimeSlot } from "@/types/schedule";
import { SecondaryButton, StatusBadge } from "./shared";

export function SlotList({ slots, onDelete }: { slots: TimeSlot[]; onDelete: (slotId: string) => void }) {
  return (
    <div className="space-y-sm">
      {slots.map((slot) => (
        <div key={slot.id} className="flex items-center justify-between gap-sm rounded-2xl border border-botanical-border bg-warm-bg p-sm">
          <div>
            <p className="font-black text-ink-primary">{slot.date} · {slot.startTime}–{slot.endTime}</p>
            <StatusBadge tone={slot.bookingId ? "teal" : slot.isAvailable ? "green" : "slate"}>{slot.bookingId ? "Đã có lịch" : slot.isAvailable ? "Khả dụng" : "Tạm khóa"}</StatusBadge>
          </div>
          <SecondaryButton onClick={() => onDelete(slot.id)} className="px-sm"><Trash2 className="h-4 w-4" /></SecondaryButton>
        </div>
      ))}
    </div>
  );
}
