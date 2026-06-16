import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CalendarClock, ChevronLeft, ChevronRight, ClipboardList, Clock3, CreditCard, Sparkles } from "lucide-react";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { useAuthStore } from "@/features/auth/auth-store";
import { StitchButtonLink, StitchContainer, StitchEyebrow } from "@/features/public/components/StitchPublicPrimitives";
import { CalendarWeekView, type CalendarDay } from "@/features/customer/components/CalendarWeekView";
import { type CalendarBookingDisplay } from "@/features/customer/components/CalendarBookingItem";
import { bookingService } from "@/services/booking-service";
import { type BookingWithDisplay } from "@/services/mappers/booking-mapper";

const dayLabels = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

function toIsoDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseLocalDate(isoDate: string) {
  const [year, month, day] = isoDate.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function formatShortDate(isoDate: string) {
  const date = parseLocalDate(isoDate);
  return date.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });
}

function formatFullDate(isoDate: string) {
  const date = parseLocalDate(isoDate);
  return date.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function formatMonthYear(date: Date) {
  return date.toLocaleDateString("vi-VN", { month: "long", year: "numeric" });
}

function getMonthLabel(monthStr: string) {
  const [year, month] = monthStr.split("-").map(Number);
  return formatMonthYear(new Date(year, month - 1));
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month - 1, 1).getDay();
}

function buildMonthDays(year: number, month: number): CalendarDay[] {
  const daysInMonth = getDaysInMonth(year, month);
  const firstDayOfWeek = getFirstDayOfMonth(year, month);

  const days: CalendarDay[] = [];

  // Fill leading empty days (from previous month)
  for (let i = 0; i < firstDayOfWeek; i++) {
    const date = new Date(year, month - 1, -firstDayOfWeek + i + 1);
    days.push({
      isoDate: toIsoDate(date),
      shortLabel: dayLabels[date.getDay()],
      fullLabel: formatShortDate(toIsoDate(date)),
    });
  }

  // Fill current month days
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month - 1, day);
    days.push({
      isoDate: toIsoDate(date),
      shortLabel: dayLabels[date.getDay()],
      fullLabel: formatShortDate(toIsoDate(date)),
    });
  }

  // Fill trailing empty days to complete the grid (multiple of 7)
  while (days.length % 7 !== 0) {
    const date = new Date(year, month, days.length - firstDayOfWeek - daysInMonth + 1);
    days.push({
      isoDate: toIsoDate(date),
      shortLabel: dayLabels[date.getDay()],
      fullLabel: formatShortDate(toIsoDate(date)),
    });
  }

  return days;
}

function addMonths(monthStr: string, offset: number) {
  const [year, month] = monthStr.split("-").map(Number);
  const date = new Date(year, month - 1 + offset, 1);
  const y = date.getFullYear();
  const m = date.getMonth() + 1;
  return `${y}-${String(m).padStart(2, "0")}`;
}

function buildBookingDisplay(booking: BookingWithDisplay): CalendarBookingDisplay {
  return {
    treatmentName: booking.treatmentName,
    therapistName: booking.therapistName,
    dateLabel: formatDateLabel(booking.slotDate),
    timeLabel: `${booking.slotStartTime} - ${booking.slotEndTime}`,
  };
}

function formatDateLabel(date: string) {
  return formatFullDate(date);
}

function getCurrentMonthStr() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

export function CalendarPage() {
  const navigate = useNavigate();
  const authUser = useAuthStore((state) => state.user);

  useEffect(() => {
    if (!authUser || authUser.role !== "customer") {
      navigate("/auth/login");
    }
  }, [authUser, navigate]);

  const [bookings, setBookings] = useState<BookingWithDisplay[]>([]);
  const [currentMonth, setCurrentMonth] = useState<string>(getCurrentMonthStr());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [year, month] = useMemo(() => currentMonth.split("-").map(Number) as [number, number], [currentMonth]);
  const calendarDays = useMemo(() => buildMonthDays(year, month), [year, month]);
  const monthLabel = useMemo(() => getMonthLabel(currentMonth), [currentMonth]);

  useEffect(() => {
    if (authUser?.id) {
      void loadBookings();
    }
  }, [authUser?.id]);

  async function loadBookings() {
    if (!authUser?.id) return;

    setIsLoading(true);
    setError(null);

    try {
      const data = await bookingService.listBookingsByCustomer(authUser.id);
      setBookings(data.filter((booking) => booking.slotDate));
    } catch (nextError) {
      setError((nextError as Error).message);
    } finally {
      setIsLoading(false);
    }
  }

  const displayByBookingId = useMemo(() => {
    return bookings.reduce<Record<string, CalendarBookingDisplay>>((accumulator, booking) => {
      accumulator[booking.id] = buildBookingDisplay(booking);
      return accumulator;
    }, {});
  }, [bookings]);

  const bookingsByDay = useMemo(() => {
    return bookings.reduce<Record<string, BookingWithDisplay[]>>((accumulator, booking) => {
      const date = booking.slotDate;
      if (!date) return accumulator;
      accumulator[date] = [...(accumulator[date] ?? []), booking];
      return accumulator;
    }, {});
  }, [bookings]);

  const visibleMonthBookings = useMemo(() => {
    const visibleDates = new Set(calendarDays.map((day) => day.isoDate));
    return bookings.filter((booking) => visibleDates.has(booking.slotDate));
  }, [bookings, calendarDays]);

  const upcomingCount = visibleMonthBookings.filter((booking) => booking.status === "pending" || booking.status === "confirmed").length;
  const completedCount = visibleMonthBookings.filter((booking) => booking.status === "completed").length;
  const unpaidCount = visibleMonthBookings.filter((booking) => booking.paymentStatus !== "paid").length;

  return (
    <StitchContainer className="py-xl pb-section-gap">
      <section className="mb-xl rounded-[28px] border border-botanical-border bg-gradient-to-br from-surface-container-lowest via-surface to-soft-mint p-xl shadow-stitch-soft">
        <div className="flex flex-col gap-lg xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl space-y-sm">
            <StitchEyebrow>Lịch chăm sóc khách hàng</StitchEyebrow>
            <h1 className="text-3xl font-black leading-tight text-ink-primary md:text-4xl">Lịch tháng {monthLabel}</h1>
            <p className="text-body text-sage-secondary">
              Theo dõi lịch hẹn của bạn, quét nhanh ngày có lịch và mở chi tiết booking chỉ với một cú nhấn.
            </p>
          </div>
          <div className="grid gap-md sm:grid-cols-3 xl:min-w-[420px]">
            <StatCard label="Tổng lịch" value={String(visibleMonthBookings.length)} helper="trong tháng" />
            <StatCard label="Sắp tới" value={String(upcomingCount)} helper="cần theo dõi" />
            <StatCard label="Đã xong" value={String(completedCount)} helper="hoàn tất" />
          </div>
        </div>
      </section>

      <section className="mb-lg rounded-2xl border border-botanical-border bg-surface-container-lowest p-lg shadow-stitch-soft">
        <div className="flex flex-col gap-md lg:flex-row lg:items-center lg:justify-between">
          <div className="inline-flex items-center gap-sm text-body-sm font-semibold text-sage-secondary">
            <CalendarClock className="h-5 w-5 text-primary" />
            Đang xem tháng <span className="text-ink-primary">{monthLabel}</span>
          </div>
          <div className="flex w-fit items-center gap-sm rounded-full border border-botanical-border bg-surface px-sm py-xs text-body-sm text-sage-secondary">
            <button
              type="button"
              onClick={() => setCurrentMonth((m) => addMonths(m, -1))}
              className="rounded-full p-sm transition-colors hover:bg-soft-mint hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              aria-label="Xem tháng trước"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setCurrentMonth(getCurrentMonthStr())}
              className="rounded-full px-md py-sm font-semibold transition-colors hover:bg-soft-mint hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              Hiện tại
            </button>
            <button
              type="button"
              onClick={() => setCurrentMonth((m) => addMonths(m, 1))}
              className="rounded-full p-sm transition-colors hover:bg-soft-mint hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              aria-label="Xem tháng sau"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Day-of-week header */}
        <div className="mt-md grid grid-cols-7 gap-sm">
          {dayLabels.map((label) => (
            <div key={label} className="rounded-xl bg-surface-container-low py-sm text-center text-label-caption font-black uppercase tracking-widest text-sage-secondary">
              {label}
            </div>
          ))}
        </div>

        {/* Month grid */}
        <div className="mt-sm grid grid-cols-7 gap-sm">
          {calendarDays.map((day) => {
            const count = bookingsByDay[day.isoDate]?.length ?? 0;
            const hasBookings = count > 0;
            const isCurrentMonth = (() => {
              const d = parseLocalDate(day.isoDate);
              return d.getFullYear() === year && d.getMonth() + 1 === month;
            })();

            return (
              <div
                key={day.isoDate}
                className={`min-h-16 rounded-2xl border px-md py-sm ${hasBookings ? "border-primary bg-soft-mint" : "border-botanical-border bg-surface"} ${!isCurrentMonth ? "opacity-40" : ""}`}
              >
                <div className="flex items-center justify-between">
                  <span className={`rounded-full px-sm py-0.5 text-xs font-black ${hasBookings ? "bg-primary text-on-primary" : "bg-surface-container-low text-sage-secondary"}`}>
                    {day.fullLabel.split("/")[0]}
                  </span>
                  {hasBookings && (
                    <span className="rounded-full bg-white/80 px-sm py-0.5 text-[10px] font-bold text-primary">
                      {count}
                    </span>
                  )}
                </div>
                {hasBookings && (
                  <div className="mt-xs text-label-caption font-semibold text-primary">
                    {count} lịch
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {isLoading ? (
        <LoadingSkeleton variant="card" count={3} />
      ) : error ? (
        <ErrorState message={error} onRetry={() => void loadBookings()} />
      ) : visibleMonthBookings.length === 0 ? (
        <EmptyState
          title="Tháng này chưa có lịch hẹn"
          description="Anh Mạnh có thể đặt lịch mới để bắt đầu kế hoạch chăm sóc trong tháng nhé."
          action={<StitchButtonLink to="/app/bookings/new">Đặt lịch ngay</StitchButtonLink>}
        />
      ) : (
        <section className="grid gap-xl xl:grid-cols-[minmax(0,1fr)_320px]">
          <CalendarWeekView days={calendarDays} bookingsByDay={bookingsByDay} displayByBookingId={displayByBookingId} onSelectBooking={(bookingId) => navigate(`/app/appointments/${bookingId}`)} />

          <aside className="space-y-lg xl:sticky xl:top-24 xl:self-start">
            <SummaryPanel total={visibleMonthBookings.length} upcoming={upcomingCount} completed={completedCount} unpaid={unpaidCount} />
            <QuickActions />
          </aside>
        </section>
      )}
    </StitchContainer>
  );
}

function StatCard({ label, value, helper }: { label: string; value: string; helper: string }) {
  return (
    <div className="rounded-2xl border border-botanical-border bg-white/80 p-md shadow-sm">
      <p className="text-label-caption font-bold uppercase tracking-[0.14em] text-sage-secondary">{label}</p>
      <p className="mt-xs text-3xl font-black text-ink-primary">{value}</p>
      <p className="text-label-caption font-semibold text-primary">{helper}</p>
    </div>
  );
}

function SummaryPanel({ total, upcoming, completed, unpaid }: { total: number; upcoming: number; completed: number; unpaid: number }) {
  return (
    <div className="rounded-2xl border border-botanical-border bg-surface-container-lowest p-lg shadow-stitch-soft">
      <div className="mb-md flex items-center gap-sm">
        <ClipboardList className="h-5 w-5 text-primary" />
        <h2 className="text-h3 font-h3 text-ink-primary">Tóm tắt tháng</h2>
      </div>
      <div className="space-y-sm text-body-sm">
        <SummaryRow label="Tổng lịch trong tháng" value={`${total} lịch`} />
        <SummaryRow label="Cần theo dõi" value={`${upcoming} lịch`} />
        <SummaryRow label="Đã hoàn tất" value={`${completed} lịch`} />
        <SummaryRow label="Chưa thanh toán" value={`${unpaid} lịch`} accent={unpaid > 0} />
      </div>
      <div className="mt-lg rounded-2xl bg-gentle-wash p-md text-body-sm text-on-secondary-container">
        Lịch được nhóm theo ngày và sắp theo luồng agenda để Anh Mạnh kiểm tra nhanh hơn, không còn phải đọc từng ô lịch bị ép chữ.
      </div>
    </div>
  );
}

function SummaryRow({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-md rounded-xl border border-botanical-border bg-surface px-md py-sm">
      <span className="text-sage-secondary">{label}</span>
      <span className={accent ? "font-black text-pending-amber" : "font-black text-ink-primary"}>{value}</span>
    </div>
  );
}

function QuickActions() {
  return (
    <div className="rounded-2xl border border-botanical-border bg-surface-container-lowest p-lg shadow-stitch-soft">
      <div className="mb-md flex items-center gap-sm">
        <Sparkles className="h-5 w-5 text-primary" />
        <h2 className="text-h3 font-h3 text-ink-primary">Thao tác nhanh</h2>
      </div>
      <div className="grid gap-sm">
        <StitchButtonLink to="/app/appointments">Xem toàn bộ lịch hẹn</StitchButtonLink>
        <StitchButtonLink to="/spas" variant="secondary">Khám phá spa đối tác</StitchButtonLink>
        <StitchButtonLink to="/app/bookings/new" variant="secondary">Đặt lịch mới</StitchButtonLink>
      </div>
      <div className="mt-lg flex items-start gap-sm rounded-2xl bg-soft-mint p-md text-body-sm text-primary">
        <Clock3 className="mt-0.5 h-4 w-4 shrink-0" />
        <span>Nhấn vào từng booking trong agenda để mở chi tiết, trạng thái và thanh toán.</span>
      </div>
    </div>
  );
}
