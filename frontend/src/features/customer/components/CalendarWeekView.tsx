import { type Booking } from "@/types/booking";
import { CalendarBookingItem, type CalendarBookingDisplay } from "@/features/customer/components/CalendarBookingItem";

export type CalendarDay = {
  isoDate: string;
  shortLabel: string;
  fullLabel: string;
};

type CalendarWeekViewProps = {
  days: CalendarDay[];
  bookingsByDay: Record<string, Booking[]>;
  displayByBookingId: Record<string, CalendarBookingDisplay>;
  onSelectBooking: (bookingId: string) => void;
};

export function CalendarWeekView({ days, bookingsByDay, displayByBookingId, onSelectBooking }: CalendarWeekViewProps) {
  return (
    <section className="space-y-md">
      <div>
        <p className="text-label-caption font-bold uppercase tracking-[0.16em] text-primary">Agenda theo ngày</p>
        <h2 className="mt-xs text-h2 font-h2 text-ink-primary">Lịch hẹn trong tuần</h2>
      </div>

      <div className="space-y-md">
        {days.map((day) => {
          const dayBookings = bookingsByDay[day.isoDate] ?? [];
          const hasBookings = dayBookings.length > 0;

          return (
            <article key={day.isoDate} className="rounded-2xl border border-botanical-border bg-surface-container-lowest shadow-stitch-soft">
              <header className="flex flex-col gap-sm border-b border-botanical-border px-lg py-md sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-md">
                  <div className={hasBookings ? "flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-sm font-black text-on-primary" : "flex h-12 w-12 items-center justify-center rounded-2xl bg-surface-container-low text-sm font-black text-sage-secondary"}>
                    {day.shortLabel}
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-ink-primary">{day.fullLabel}</h3>
                    <p className="text-body-sm text-sage-secondary">{hasBookings ? "Có lịch hẹn cần theo dõi" : "Không có lịch trong ngày"}</p>
                  </div>
                </div>
                <span className={hasBookings ? "w-fit rounded-full bg-soft-mint px-md py-xs text-label-caption font-black text-primary" : "w-fit rounded-full bg-surface-container-low px-md py-xs text-label-caption font-semibold text-sage-secondary"}>
                  {dayBookings.length} lịch
                </span>
              </header>

              <div className="p-lg">
                {hasBookings ? (
                  <div className="space-y-md">
                    {dayBookings.map((booking) => {
                      const display = displayByBookingId[booking.id];
                      if (!display) return null;
                      return <CalendarBookingItem key={booking.id} booking={booking} display={display} onClick={() => onSelectBooking(booking.id)} />;
                    })}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-botanical-border bg-surface-container-low px-lg py-md text-body-sm text-sage-secondary">
                    Chưa có lịch hẹn trong ngày này
                  </div>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
