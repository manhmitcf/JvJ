import { useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { type TimeSlot } from "@/types/schedule";
import { SecondaryButton, StatusBadge } from "./shared";

function getDayLabel(dateStr: string): { label: string; dayNumber: string } {
  const date = new Date(dateStr + "T00:00:00");
  const days = ["Chủ nhật", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"];
  const dayIndex = date.getDay();
  return {
    label: days[dayIndex],
    dayNumber: String(date.getDate()).padStart(2, "0"),
  };
}

export function ScheduleCalendar({ slots, weekDates, onWeekChange, currentWeekOffset, onSlotClick }: {
  slots: TimeSlot[];
  weekDates: string[];
  onWeekChange?: (direction: "prev" | "next" | "today") => void;
  currentWeekOffset?: number;
  onSlotClick?: (slot: TimeSlot) => void;
}) {
  const today = new Date().toISOString().split("T")[0];

  return (
    <section className="overflow-hidden rounded-[2rem] border border-botanical-border bg-white shadow-stitch-soft">
      {/* Week Navigation */}
      <div className="flex items-center justify-between border-b border-botanical-border bg-warm-bg/50 p-md">
        <div className="flex items-center gap-sm">
          <button
            onClick={() => onWeekChange?.("prev")}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-botanical-border bg-white transition hover:border-primary hover:bg-soft-mint"
          >
            <ChevronLeft className="h-5 w-5 text-ink-primary" />
          </button>
          <button
            onClick={() => onWeekChange?.("next")}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-botanical-border bg-white transition hover:border-primary hover:bg-soft-mint"
          >
            <ChevronRight className="h-5 w-5 text-ink-primary" />
          </button>
        </div>
        <span className="text-body-sm font-black text-ink-primary">
          Tuần {weekDates[0]?.split("-").slice(1).join("/")} – {weekDates[6]?.split("-").slice(1).join("/")}
        </span>
        <SecondaryButton
          onClick={() => onWeekChange?.("today")}
          className={`h-10 px-md ${currentWeekOffset === 0 ? "border-primary bg-soft-mint text-primary" : ""}`}
        >
          Hôm nay
        </SecondaryButton>
      </div>

      {/* Calendar Grid */}
      <div className="grid min-w-[860px] grid-cols-7">
        {weekDates.map((date) => {
          const daySlots = slots.filter((slot) => slot.date === date);
          const { label, dayNumber } = getDayLabel(date);
          const isToday = date === today;

          return (
            <div
              key={date}
              className={`min-h-[400px] border-r border-botanical-border p-sm last:border-r-0 ${isToday ? "bg-soft-mint/20" : ""}`}
            >
              <div className="mb-sm text-center">
                <p className={`text-label-caption font-black uppercase tracking-wider ${isToday ? "text-primary" : "text-muted-text"}`}>{label}</p>
                <p className={`text-2xl font-black ${isToday ? "text-primary" : "text-ink-primary"}`}>{dayNumber}</p>
              </div>
              <div className="space-y-sm">
                {daySlots.length === 0 ? (
                  <p className="rounded-2xl border border-dashed border-botanical-border bg-warm-bg/50 p-sm text-center text-label-caption font-bold text-muted-text">Chưa có khung giờ</p>
                ) : (
                  daySlots.map((slot) => (
                    <div
                      key={slot.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => onSlotClick?.(slot)}
                      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") onSlotClick?.(slot); }}
                      className="w-full cursor-pointer rounded-2xl border border-botanical-border bg-warm-bg p-sm text-left transition hover:border-primary hover:shadow-md"
                    >
                      <p className="text-body-sm font-black text-ink-primary">{slot.startTime}–{slot.endTime}</p>
                      <StatusBadge tone={slot.bookingId ? "teal" : slot.isAvailable ? "green" : "slate"}>
                        {slot.bookingId ? "Đã có lịch" : slot.isAvailable ? "Khả dụng" : "Tạm khóa"}
                      </StatusBadge>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
