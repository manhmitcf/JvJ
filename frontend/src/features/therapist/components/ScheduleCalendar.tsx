import { type TimeSlot } from "@/types/schedule";
import { StatusBadge } from "./shared";

const days = [
  { label: "Thứ 2", date: "2026-06-01", dayNumber: "01" },
  { label: "Thứ 3", date: "2026-06-02", dayNumber: "02" },
  { label: "Thứ 4", date: "2026-06-03", dayNumber: "03" },
  { label: "Thứ 5", date: "2026-06-04", dayNumber: "04" },
  { label: "Thứ 6", date: "2026-06-05", dayNumber: "05" },
  { label: "Thứ 7", date: "2026-06-06", dayNumber: "06" },
  { label: "Chủ nhật", date: "2026-06-07", dayNumber: "07" },
];

export function ScheduleCalendar({ slots }: { slots: TimeSlot[] }) {
  return (
    <section className="overflow-hidden rounded-[2rem] border border-botanical-border bg-white shadow-stitch-soft">
      <div className="grid min-w-[860px] grid-cols-7">
        {days.map((day) => {
          const daySlots = slots.filter((slot) => slot.date === day.date);

          return (
            <div key={day.date} className="min-h-[520px] border-r border-botanical-border p-md last:border-r-0">
              <div className="mb-md">
                <p className="text-label-caption font-black uppercase tracking-wider text-muted-text">{day.label}</p>
                <p className="text-2xl font-black text-ink-primary">{day.dayNumber}</p>
              </div>
              <div className="space-y-sm">
                {daySlots.map((slot) => (
                  <div key={slot.id} className="rounded-2xl border border-botanical-border bg-warm-bg p-sm">
                    <p className="text-body-sm font-black text-ink-primary">{slot.startTime}–{slot.endTime}</p>
                    <StatusBadge tone={slot.bookingId ? "teal" : slot.isAvailable ? "green" : "slate"}>{slot.bookingId ? "Đã có lịch" : slot.isAvailable ? "Khả dụng" : "Tạm khóa"}</StatusBadge>
                  </div>
                ))}
                {daySlots.length === 0 && <p className="rounded-2xl border border-dashed border-botanical-border bg-warm-bg/50 p-sm text-label-caption font-bold text-muted-text">Chưa có khung giờ</p>}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
