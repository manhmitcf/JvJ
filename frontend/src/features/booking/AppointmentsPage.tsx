import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CalendarDays,
  Car,
  CheckCircle2,
  Clock3,
  CreditCard,
  List,
  MapPin,
  Search,
  Sparkles,
  Stethoscope,
  User,
  UserRound,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { bookingService } from "@/services/booking-service";
import { reviewService } from "@/services/review-service";
import { type Review } from "@/types/review";
import { type BookingWithDisplay } from "@/services/mappers/booking-mapper";
import { type BookingStatus, type PaymentStatus } from "@/types/booking";
import { cn } from "@/utils/cn";

type AppointmentTab = "all" | "upcoming" | BookingStatus;

type AppointmentDisplay = {
  title: string;
  icon: "medical" | "relax" | "care";
  therapistName: string;
  dateTime: string;
};

function getAppointmentDisplay(booking: BookingWithDisplay): AppointmentDisplay {
  // Use backend data directly
  return {
    title: booking.treatmentName,
    icon: "medical", // Default icon, can be enhanced later based on treatment category
    therapistName: booking.therapistName,
    dateTime: `${formatShortDate(booking.slotDate)} - ${booking.slotStartTime}`,
  };
}

function formatShortDate(isoDate: string): string {
  const date = new Date(isoDate);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${day}/${month}`;
}

const statusLabels: Record<BookingStatus, string> = {
  pending: "Chờ xác nhận",
  confirmed: "Đã xác nhận",
  in_progress: "Đang thực hiện",
  completed: "Hoàn tất",
  cancelled: "Đã hủy",
  rejected: "Bị từ chối",
};

const statusClassNames: Record<BookingStatus, string> = {
  pending: "border-amber-700/20 bg-amber-700/10 text-amber-700",
  confirmed: "border-[#005c55]/20 bg-[#005c55]/10 text-[#005c55]",
  in_progress: "border-[#005c55]/20 bg-[#005c55]/10 text-[#005c55]",
  completed: "border-[#bdc9c6] bg-[#e0e3e1] text-[#3e4947]",
  cancelled: "border-[#bdc9c6] bg-[#e0e3e1] text-[#3e4947]",
  rejected: "border-red-700/20 bg-red-700/10 text-red-700",
};

const iconClassNames: Record<AppointmentDisplay["icon"], string> = {
  medical: "bg-[#F3E9E0] text-[#C6530A]",
  relax: "bg-[#E4EFEC] text-[#2C8A80]",
  care: "bg-[#ECEFEE] text-[#34423F]",
};

const iconByType: Record<AppointmentDisplay["icon"], typeof Stethoscope> = {
  medical: Stethoscope,
  relax: Sparkles,
  care: UserRound,
};

const paymentStatusLabels: Record<PaymentStatus, string> = {
  unpaid: "Chưa thanh toán",
  pending: "Chờ thanh toán",
  paid: "Đã thanh toán",
  failed: "Thanh toán thất bại",
};

const paymentStatusToneClassNames: Record<PaymentStatus, string> = {
  unpaid: "text-red-700",
  pending: "text-amber-700",
  paid: "text-green-700",
  failed: "text-red-700",
};

function canPay(booking: BookingWithDisplay) {
  return booking.paymentStatus !== "paid" && booking.status !== "cancelled";
}

function canReview(booking: BookingWithDisplay, reviewsByBookingId: Record<string, Review | null>) {
  const review = reviewsByBookingId[booking.id];
  return booking.status === "completed" && booking.paymentStatus === "paid" && !review;
}

function getPaymentText(paymentStatus: PaymentStatus) {
  return paymentStatusLabels[paymentStatus];
}

function formatCurrency(amount: number) {
  return amount.toLocaleString("vi-VN") + "đ";
}

export function AppointmentsPage() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<BookingWithDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<AppointmentTab>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [reviewsByBookingId, setReviewsByBookingId] = useState<Record<string, Review | null>>({});

  useEffect(() => {
    loadBookings();
  }, []);

  async function loadBookings() {
    setLoading(true);
    try {
      const [bookingData] = await Promise.all([
        bookingService.listBookingsByCustomer("customer-1"),
      ]);
      setBookings(bookingData);

      const completedBookings = bookingData.filter(
        (b) => b.status === "completed" && b.paymentStatus === "paid",
      );
      console.log("[AppointmentsPage] Completed bookings:", completedBookings.map((b) => ({ id: b.id, code: b.code })));
      const reviewsResult: Record<string, Review | null> = {};
      for (const booking of completedBookings) {
        try {
          const review = await reviewService.getReviewByBookingId(booking.id);
          reviewsResult[booking.id] = review;
          console.log(`[AppointmentsPage] Review for booking ${booking.id}:`, review);
        } catch (err) {
          console.warn(`[AppointmentsPage] getReviewByBookingId(${booking.id}) failed:`, err);
          reviewsResult[booking.id] = null;
        }
      }
      console.log("[AppointmentsPage] Final reviewsByBookingId:", reviewsResult);
      setReviewsByBookingId(reviewsResult);
    } finally {
      setLoading(false);
    }
  }

  const upcomingCount = bookings.filter((booking) => booking.status === "pending" || booking.status === "confirmed").length;
  const pendingCount = bookings.filter((booking) => booking.status === "pending").length;
  const completedCount = bookings.filter((booking) => booking.status === "completed").length;

  const filteredBookings = useMemo(() => {
    return bookings.filter((booking) => {
      const display = getAppointmentDisplay(booking);
      const matchesTab =
        activeTab === "all" ||
        (activeTab === "upcoming" && (booking.status === "pending" || booking.status === "confirmed")) ||
        booking.status === activeTab;
      const normalizedSearch = searchTerm.trim().toLowerCase();
      const matchesSearch =
        !normalizedSearch ||
        booking.code.toLowerCase().includes(normalizedSearch) ||
        display.title.toLowerCase().includes(normalizedSearch) ||
        display.therapistName.toLowerCase().includes(normalizedSearch);
      return matchesTab && matchesSearch;
    });
  }, [activeTab, bookings, searchTerm]);

  async function handleCancelBooking() {
    if (!selectedBookingId) return;
    setCancelling(true);
    try {
      await bookingService.cancelBooking(selectedBookingId);
      await loadBookings();
      setCancelModalOpen(false);
      setSelectedBookingId(null);
    } finally {
      setCancelling(false);
    }
  }

  function openCancelModal(bookingId: string) {
    setSelectedBookingId(bookingId);
    setCancelModalOpen(true);
  }

  function closeCancelModal() {
    setCancelModalOpen(false);
    setSelectedBookingId(null);
  }

  const tabs: Array<{ key: AppointmentTab; label: string }> = [
    { key: "all", label: "Tất cả" },
    { key: "upcoming", label: `Sắp tới (${upcomingCount})` },
    { key: "pending", label: `Chờ xác nhận (${pendingCount})` },
    { key: "confirmed", label: "Đã xác nhận" },
    { key: "completed", label: "Hoàn tất" },
    { key: "cancelled", label: "Đã hủy" },
  ];

  return (
    <div className="min-h-screen bg-[#f7faf8] text-[#181c1c]">
      <main className="mx-auto max-w-[1400px]">
        <section className="mb-8 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-[#181c1c]">Lịch hẹn của tôi</h1>
            <p className="max-w-2xl text-[#3e4947]">Theo dõi lịch trị liệu tại nhà, trạng thái xác nhận và thông tin kỹ thuật viên.</p>
          </div>
          <div className="flex gap-4">
            <SummaryCard icon={CalendarDays} label="Sắp tới" value={upcomingCount} iconClassName="bg-[#005c55]/10 text-[#005c55]" />
            <SummaryCard icon={Clock3} label="Chờ xác nhận" value={pendingCount} iconClassName="bg-amber-700/10 text-amber-700" />
            <SummaryCard icon={CheckCircle2} label="Hoàn tất" value={completedCount} iconClassName="bg-green-700/10 text-green-700" />
          </div>
        </section>

        <section className="mb-10 flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex flex-wrap gap-2 rounded-2xl border border-[#bdc9c6]/30 bg-[#ebefed] p-1">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  "rounded-xl px-5 py-2.5 text-sm font-medium transition-all",
                  activeTab === tab.key
                    ? "bg-[#E6F4F1] font-semibold text-[#005c55]"
                    : "text-[#3e4947] hover:bg-[#e5e9e7]",
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <label className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#3e4947]" />
            <input
              className="w-full rounded-xl border border-[#bdc9c6] bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition-colors focus:border-[#005c55]"
              placeholder="Tìm mã đặt lịch..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </label>
        </section>

        {upcomingCount > 0 && <HighlightedAppointment bookings={bookings} />}

        <section className="space-y-4">
          <h2 className="mb-6 flex items-center gap-2 text-xl font-semibold text-[#181c1c]">
            <List className="h-5 w-5 text-[#005c55]" />
            Danh sách lịch hẹn
          </h2>

          {loading ? (
            <LoadingSkeleton variant="list" count={5} />
          ) : filteredBookings.length === 0 ? (
            <Card className="rounded-2xl border-[#bdc9c6] bg-white p-12 text-center">
              <CalendarDays className="mx-auto mb-4 h-12 w-12 text-[#6e7977]" />
              <h3 className="mb-2 text-lg font-semibold text-[#181c1c]">Chưa có lịch hẹn</h3>
              <p className="mb-5 text-[#3e4947]">Bạn chưa có lịch hẹn nào trong danh mục này.</p>
              <Button onClick={() => navigate("/app/bookings/new")}>Đặt lịch ngay</Button>
            </Card>
          ) : (
            filteredBookings.map((booking) => (
              <AppointmentCard key={booking.id} booking={booking} reviewsByBookingId={reviewsByBookingId} onCancel={openCancelModal} />
            ))
          )}
        </section>

        <footer className="mt-20 flex flex-col items-center justify-between gap-4 border-t border-[#bdc9c6] pb-10 pt-10 text-sm text-[#3e4947] md:flex-row">
          <p>© 2026 JvJ Wellness - Nền tảng chăm sóc sức khỏe tại nhà Đà Nẵng.</p>
          <div className="flex gap-6">
            <span>Điều khoản dịch vụ</span>
            <span>Chính sách bảo mật</span>
            <span>Trung tâm hỗ trợ</span>
          </div>
        </footer>
      </main>

      {cancelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-md rounded-2xl border-[#bdc9c6] bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-[#181c1c]">Xác nhận hủy lịch</h2>
              <button onClick={closeCancelModal} className="rounded-full p-1 text-[#3e4947] hover:bg-[#ebefed]">
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="mb-6 text-[#3e4947]">Bạn có chắc chắn muốn hủy lịch hẹn này? Hành động này không thể hoàn tác.</p>
            <div className="flex gap-3">
              <Button variant="secondary" onClick={closeCancelModal} disabled={cancelling} className="flex-1">
                Không
              </Button>
              <Button variant="destructive" onClick={handleCancelBooking} disabled={cancelling} className="flex-1">
                {cancelling ? "Đang hủy..." : "Xác nhận hủy"}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

function SummaryCard({ icon: Icon, label, value, iconClassName }: { icon: typeof CalendarDays; label: string; value: number; iconClassName: string }) {
  return (
    <div className="flex min-w-[160px] items-center gap-4 rounded-2xl border border-[#bdc9c6] bg-white p-4 shadow-sm">
      <div className={cn("flex h-10 w-10 items-center justify-center rounded-full", iconClassName)}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-xs font-medium text-[#3e4947]">{label}</p>
        <p className="text-xl font-bold text-[#181c1c]">{value}</p>
      </div>
    </div>
  );
}

function HighlightedAppointment({ bookings }: { bookings: BookingWithDisplay[] }) {
  const highlighted = bookings.find((booking) => booking.status === "confirmed") ?? bookings.find((booking) => booking.status === "pending");
  if (!highlighted) return null;
  const display = getAppointmentDisplay(highlighted);

  return (
    <section className="mb-12 overflow-hidden rounded-3xl bg-[#005c55] text-white shadow-xl shadow-[#005c55]/10 lg:flex">
      <div className="flex flex-col justify-between p-8 lg:w-1/2">
        <div>
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5">
            <span className="h-2 w-2 animate-pulse rounded-full bg-white" />
            <span className="text-xs font-bold uppercase tracking-widest">Lịch hẹn sắp tới</span>
          </div>
          <h2 className="mb-2 text-3xl font-bold">{display.title}</h2>
          <p className="mb-6 flex items-center gap-2 text-white/80">
            <Clock3 className="h-4 w-4" />
            Hôm nay, lúc 14:00 • 01/06/2026
          </p>
          <div className="mb-8 flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-6">
            <div>
              <p className="mb-1 text-sm uppercase tracking-tight text-white/60">Kỹ thuật viên sẽ đến sau</p>
              <p className="text-4xl font-bold tracking-tight">02g 15p</p>
            </div>
            <div className="flex -space-x-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-[#005c55] bg-[#E6F4F1] font-bold text-[#005c55]">{display.therapistName.charAt(0)}</div>
              <div className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-[#005c55] bg-white font-bold text-xl text-[#005c55]">TV</div>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-4">
          <button className="rounded-xl bg-white px-6 py-3 font-bold text-[#005c55] transition-all hover:bg-white/95 active:scale-95">Xem vị trí KTV</button>
          <button className="rounded-xl border border-white/30 px-6 py-3 font-medium text-white transition-all hover:bg-white/10 active:scale-95">Liên hệ ngay</button>
        </div>
      </div>
      <div className="relative min-h-[300px] overflow-hidden bg-[#e5e9e7] lg:w-1/2">
        <div className="absolute inset-0 opacity-60 [background-image:radial-gradient(circle_at_20%_20%,#bdc9c6_0_2px,transparent_3px),linear-gradient(135deg,transparent_0_42%,#bdc9c6_43%_44%,transparent_45%),linear-gradient(45deg,transparent_0_48%,#bdc9c6_49%_50%,transparent_51%)] [background-size:32px_32px,180px_180px,220px_220px]" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative">
            <div className="absolute -inset-2 h-16 w-16 animate-ping rounded-full bg-[#005c55]/20" />
            <div className="relative flex h-12 w-12 items-center justify-center rounded-full border-2 border-white bg-[#005c55] text-white shadow-lg">
              <Car className="h-6 w-6" />
            </div>
          </div>
          <div className="absolute bottom-8 right-8 max-w-xs animate-bounce rounded-2xl border border-[#bdc9c6]/30 bg-white/90 p-4 shadow-xl backdrop-blur-sm">
            <p className="mb-1 text-sm font-bold text-[#005c55]">Đang trên đường đến</p>
            <p className="text-xs text-[#3e4947]">KTV Trần Vy đang di chuyển qua Cầu Rồng.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function AppointmentCard({ booking, reviewsByBookingId, onCancel }: { booking: BookingWithDisplay; reviewsByBookingId: Record<string, Review | null>; onCancel: (bookingId: string) => void }) {
  const navigate = useNavigate();
  const display = getAppointmentDisplay(booking);
  const Icon = iconByType[display.icon];
  const isDimmed = booking.status === "completed" || booking.status === "cancelled";
  const paymentText = getPaymentText(booking.paymentStatus);
  const paymentToneClassName = paymentStatusToneClassNames[booking.paymentStatus];
  const showPayCta = canPay(booking);
  const showReviewCta = canReview(booking, reviewsByBookingId);
  const existingReview = reviewsByBookingId[booking.id];
  const isReviewed = !!existingReview;
  const canCancel = booking.status === "pending";

  return (
    <div className={cn("rounded-2xl border border-[#bdc9c6] p-6 transition-all hover:shadow-md", isDimmed ? "bg-[#f1f4f3]/50 opacity-80 hover:opacity-100" : "bg-white")}>
      <div className="flex flex-col gap-6 xl:flex-row xl:items-center">
        <div className="flex-shrink-0">
          <p className="mb-2 text-xs font-bold tracking-widest text-[#6e7977]">{booking.code}</p>
          <div className={cn("flex h-16 w-16 items-center justify-center rounded-[1.25rem]", iconClassNames[display.icon])}>
            <Icon className="h-8 w-8 stroke-[2.4]" />
          </div>
        </div>
        <div className="flex-1">
          <div className="mb-2 flex flex-wrap items-center gap-3">
            <h3 className="text-lg font-bold text-[#181c1c] transition-colors group-hover:text-[#005c55]">{display.title}</h3>
            <span className={cn("rounded-full border px-3 py-1 text-xs font-semibold", statusClassNames[booking.status])}>{statusLabels[booking.status]}</span>
          </div>
          <div className="grid grid-cols-1 gap-x-8 gap-y-3 md:grid-cols-2 lg:grid-cols-3">
            <InfoItem icon={CalendarDays} text={display.dateTime} />
            <InfoItem icon={MapPin} text={booking.address} />
            <InfoItem icon={User} text={`KTV: ${display.therapistName}`} />
            <div className="flex items-center gap-2 text-[#3e4947]">
              <CreditCard className="h-[18px] w-[18px]" />
              <span className="text-sm">
                {formatCurrency(booking.totalAmount)} • <span className={cn("font-medium", paymentToneClassName)}>{paymentText}</span>
              </span>
            </div>
          </div>
          {booking.rejectionReason && <p className="mt-3 text-sm font-medium text-red-700">{booking.rejectionReason}</p>}
        </div>
        <div className="flex flex-wrap items-center gap-3 xl:border-l xl:border-[#bdc9c6] xl:pl-6">
          {showPayCta ? (
            <button
              onClick={() => navigate(`/app/payments/${booking.id}`)}
              className="rounded-xl bg-[#005c55] px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-[#014a45]"
            >
              Thanh toán
            </button>
          ) : null}
          {showReviewCta ? (
            <button
              onClick={() => navigate(`/app/appointments/${booking.id}?action=review`)}
              className="rounded-xl border border-[#005c55]/20 bg-[#E6F4F1] px-5 py-2.5 text-sm font-semibold text-[#005c55] transition-all hover:bg-[#d9efe9]"
            >
              Đánh giá
            </button>
          ) : null}
          {isReviewed ? (
            <button
              onClick={() => navigate(`/app/appointments/${booking.id}`)}
              className="flex items-center gap-1.5 rounded-xl bg-[#aef35e] px-5 py-2.5 text-sm font-bold text-[#426e00] transition-all hover:shadow-md"
            >
              Cập nhật đánh giá
            </button>
          ) : null}
          {canCancel ? (
            <button onClick={() => onCancel(booking.id)} className="rounded-xl border border-[#bdc9c6] px-5 py-2.5 text-sm font-medium text-[#3e4947] transition-all hover:bg-[#ebefed]">
              Hủy lịch
            </button>
          ) : null}
          <button onClick={() => navigate(`/app/appointments/${booking.id}`)} className="rounded-xl border border-[#bdc9c6] px-5 py-2.5 text-sm font-medium text-[#3e4947] transition-all hover:bg-[#ebefed]">
            Xem chi tiết
          </button>
        </div>
      </div>
    </div>
  );
}

function InfoItem({ icon: Icon, text }: { icon: typeof CalendarDays; text: string }) {
  return (
    <div className="flex items-center gap-2 text-[#3e4947]">
      <Icon className="h-[18px] w-[18px]" />
      <span className="max-w-[200px] truncate text-sm">{text}</span>
    </div>
  );
}
