import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Bike,
  CalendarDays,
  Check,
  Clock3,
  CreditCard,
  Edit3,
  HeartPulse,
  HelpCircle,
  Home,
  Info,
  Map,
  MapPin,
  MessageCircle,
  Navigation,
  Phone,
  RotateCw,
  Route,
  ShieldCheck,
  Sparkles,
  Star,
  Stethoscope,
  Timer,
  User,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BookingReviewForm } from "@/features/reviews/components/BookingReviewForm";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { bookingService } from "@/services/booking-service";
import { reviewService } from "@/services/review-service";
import { type Booking, type BookingStatus, type PaymentStatus } from "@/types/booking";
import { type Review, type ReviewTag } from "@/types/review";
import { cn } from "@/utils/cn";

type DetailDisplay = {
  treatmentName: string;
  duration: string;
  schedule: string;
  therapistName: string;
  therapistRole: string;
  therapistRating: number;
  therapistBookings: number;
  therapistInitials: string;
  therapistId: string;
  tags: string[];
  distance: string;
  eta: string;
  mapStatus: string;
  note: string;
  healthNote: string;
  paymentMethod: string;
  paymentDescription: string;
};

const detailDisplayById: Record<string, DetailDisplay> = {
  "booking-1": {
    treatmentName: "Massage phục hồi cổ vai gáy",
    duration: "60 phút",
    schedule: "31/05/2026 • 09:30 - 10:30",
    therapistName: "Nguyễn An",
    therapistRole: "Kỹ thuật viên massage trị liệu",
    therapistRating: 4.8,
    therapistBookings: 128,
    therapistInitials: "NA",
    therapistId: "therapist-1",
    tags: ["Cổ vai gáy", "Thư giãn", "Tại nhà"],
    distance: "4,2 km",
    eta: "18 phút",
    mapStatus: "KTV đang chờ xác nhận lịch",
    note: "Đau vùng cổ vai gáy sau khi ngồi làm việc lâu, không dị ứng dầu xoa bóp.",
    healthNote: "Đau vùng cổ vai gáy sau khi ngồi làm việc lâu, không dị ứng dầu xoa bóp.",
    paymentMethod: "Thanh toán sau",
    paymentDescription: "Bạn sẽ thanh toán trực tiếp cho KTV sau khi hoàn tất buổi trị liệu.",
  },
  "booking-2": {
    treatmentName: "Trị liệu thư giãn toàn thân",
    duration: "90 phút",
    schedule: "01/06/2026 • 14:00 - 15:30",
    therapistName: "Trần Vy",
    therapistRole: "Kỹ thuật viên chăm sóc phục hồi",
    therapistRating: 4.9,
    therapistBookings: 96,
    therapistInitials: "TV",
    therapistId: "therapist-1",
    tags: ["Thư giãn", "Phục hồi", "Tại nhà"],
    distance: "2,8 km",
    eta: "Đã hoàn tất",
    mapStatus: "Buổi trị liệu đã hoàn tất",
    note: "Khách muốn tư vấn liệu trình duy trì hằng tuần",
    healthNote: "Mỏi lưng nhẹ, cần thư giãn toàn thân sau giờ làm.",
    paymentMethod: "Đã thanh toán",
    paymentDescription: "Giao dịch đã được ghi nhận trên hệ thống JvJ.",
  },
  "booking-3": {
    treatmentName: "Chăm sóc mẹ sau sinh",
    duration: "75 phút",
    schedule: "21/05/2026 • 10:00 - 11:15",
    therapistName: "Lê Hạnh",
    therapistRole: "Kỹ thuật viên chăm sóc tại nhà",
    therapistRating: 4.7,
    therapistBookings: 74,
    therapistInitials: "LH",
    therapistId: "therapist-1",
    tags: ["Sau sinh", "Nhẹ nhàng", "Tại nhà"],
    distance: "5,1 km",
    eta: "Không áp dụng",
    mapStatus: "Lịch hẹn đã bị từ chối",
    note: "Cần xác nhận lại khung giờ phù hợp",
    healthNote: "Cần kỹ thuật nhẹ và ưu tiên tư thế thoải mái.",
    paymentMethod: "Thanh toán thất bại",
    paymentDescription: "Bạn có thể đặt lại lịch hoặc chọn phương thức thanh toán khác.",
  },
};

const statusLabels: Record<BookingStatus, string> = {
  pending: "Chờ xác nhận",
  confirmed: "Đã xác nhận",
  in_progress: "Đang thực hiện",
  completed: "Hoàn tất",
  cancelled: "Đã hủy",
  rejected: "Bị từ chối",
};

const statusClassNames: Record<BookingStatus, string> = {
  pending: "border-[#FEF3C7] bg-[#FEF3C7] text-[#A16207]",
  confirmed: "border-[#005c55]/15 bg-[#E6F4F1] text-[#005c55]",
  in_progress: "border-[#005c55]/15 bg-[#E6F4F1] text-[#005c55]",
  completed: "border-green-700/15 bg-green-50 text-green-700",
  cancelled: "border-[#bdc9c6] bg-[#e0e3e1] text-[#3e4947]",
  rejected: "border-red-700/15 bg-red-50 text-red-700",
};

const timelineSteps = [
  { status: "created", title: "Đã tạo yêu cầu", description: "Lúc 08:45, 31/05/2026", icon: Check },
  { status: "pending", title: "Chờ kỹ thuật viên xác nhận", description: "Hệ thống đã gửi thông báo đến kỹ thuật viên", icon: RotateCw },
  { status: "moving", title: "Kỹ thuật viên di chuyển", description: "Đang cập nhật...", icon: Bike },
  { status: "active", title: "Đang thực hiện", description: "Dự kiến hoàn thành sau 60 phút", icon: HeartPulse },
  { status: "done", title: "Hoàn tất", description: "Lịch sử sẽ được lưu vào hồ sơ của bạn", icon: Check },
] as const;

const progressIndexByStatus: Record<BookingStatus, number> = {
  pending: 1,
  confirmed: 2,
  in_progress: 3,
  completed: 4,
  cancelled: 0,
  rejected: 0,
};

const paymentDisplayByStatus: Record<PaymentStatus, { method: string; description: string; badge: string }> = {
  unpaid: {
    method: "Chưa thanh toán",
    description: "Bạn có thể thanh toán demo bằng VNPAY/QR trước khi JvJ xử lý các bước tiếp theo.",
    badge: "CHƯA THANH TOÁN",
  },
  pending: {
    method: "Đang chờ thanh toán",
    description: "Giao dịch demo đang chờ xác nhận. Bạn có thể quay lại trang thanh toán để hoàn tất.",
    badge: "ĐANG CHỜ THANH TOÁN",
  },
  paid: {
    method: "Đã thanh toán",
    description: "Giao dịch đã được ghi nhận trên hệ thống JvJ.",
    badge: "ĐÃ THANH TOÁN",
  },
  failed: {
    method: "Thanh toán thất bại",
    description: "Giao dịch demo chưa thành công. Bạn có thể thử lại ở trang thanh toán.",
    badge: "THANH TOÁN THẤT BẠI",
  },
};

function getDetailDisplay(booking: Booking): DetailDisplay {
  return (
    detailDisplayById[booking.id] ?? {
      treatmentName: "Dịch vụ chăm sóc sức khỏe tại nhà",
      duration: "60 phút",
      schedule: "Đang cập nhật",
      therapistName: "Kỹ thuật viên JvJ",
      therapistRole: "Kỹ thuật viên chăm sóc tại nhà",
      therapistRating: 4.8,
      therapistBookings: 80,
      therapistInitials: "JV",
      therapistId: booking.therapistId,
      tags: ["Tại nhà", "Đà Nẵng", "JvJ"],
      distance: "Đang cập nhật",
      eta: "Đang cập nhật",
      mapStatus: "JvJ đang cập nhật trạng thái lịch hẹn",
      note: booking.note ?? "Không có ghi chú thêm",
      healthNote: "Thông tin sức khỏe sẽ được kỹ thuật viên xác nhận trước buổi trị liệu.",
      paymentMethod: booking.paymentStatus === "paid" ? "Đã thanh toán" : "Thanh toán sau",
      paymentDescription: booking.paymentStatus === "paid" ? "Giao dịch đã được ghi nhận trên hệ thống JvJ." : "Bạn sẽ thanh toán sau khi lịch hẹn hoàn tất.",
    }
  );
}

function formatCurrency(amount: number) {
  return amount.toLocaleString("vi-VN") + "đ";
}

export function AppointmentDetailPage() {
  const { bookingId = "" } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [existingReview, setExistingReview] = useState<Review | null>(null);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);

  useEffect(() => {
    loadBooking();
  }, [bookingId]);

  useEffect(() => {
    if (!booking) return;
    if (new URLSearchParams(location.search).get("action") === "review" && booking.status === "completed" && booking.paymentStatus === "paid" && !existingReview) {
      setReviewModalOpen(true);
    }
  }, [booking, existingReview, location.search]);

  async function loadBooking() {
    setLoading(true);
    setReviewError(null);
    try {
      const data = await bookingService.getBooking(bookingId);
      setBooking(data);
      setExistingReview(data ? await reviewService.getReviewByBookingId(data.id) : null);
    } finally {
      setLoading(false);
    }
  }

  async function handleCancelBooking() {
    if (!booking) return;
    setCancelling(true);
    try {
      const updatedBooking = await bookingService.cancelBooking(booking.id);
      setBooking({ ...updatedBooking });
      setCancelModalOpen(false);
    } finally {
      setCancelling(false);
    }
  }

  async function handleSubmitReview(payload: { rating: 1 | 2 | 3 | 4 | 5; comment: string; tags: ReviewTag[] }) {
    if (!booking) return;
    setSubmittingReview(true);
    setReviewError(null);
    try {
      const createdReview = await reviewService.createReview({
        bookingId: booking.id,
        treatmentId: booking.treatmentId,
        rating: payload.rating,
        comment: payload.comment,
        tags: payload.tags,
      });
      setExistingReview(createdReview);
    } catch (error) {
      setReviewError((error as Error).message);
    } finally {
      setSubmittingReview(false);
    }
  }

  const display = useMemo(() => (booking ? getDetailDisplay(booking) : null), [booking]);

  if (loading) {
    return <LoadingSkeleton variant="card" count={1} />;
  }

  if (!booking || !display) {
    return (
      <Card className="rounded-2xl border-[#bdc9c6] bg-white p-12 text-center">
        <CalendarDays className="mx-auto mb-4 h-12 w-12 text-[#6e7977]" />
        <h1 className="mb-2 text-xl font-bold text-[#181c1c]">Không tìm thấy lịch hẹn</h1>
        <p className="mb-5 text-[#3e4947]">Lịch hẹn này có thể không tồn tại hoặc đã được cập nhật.</p>
        <Button onClick={() => navigate("/app/appointments")}>Quay lại lịch hẹn</Button>
      </Card>
    );
  }

  const isPending = booking.status === "pending";
  const isCompleted = booking.status === "completed";
  const paymentPaid = booking.paymentStatus === "paid";
  const paymentDisplay = paymentDisplayByStatus[booking.paymentStatus];
  const canReviewBooking = isCompleted && paymentPaid && !existingReview;

  return (
    <div className="mx-auto max-w-[1400px] pb-12 text-[#181c1c]">
      <nav className="mb-6 flex flex-wrap items-center gap-2 text-sm">
        <Link to="/app/appointments" className="flex items-center gap-1 font-medium text-[#005c55] transition-colors hover:underline">
          <ArrowLeft className="h-4 w-4" />
          Quay lại lịch hẹn
        </Link>
        <span className="text-[#6e7977]">/</span>
        <span className="text-[#3e4947]">Chi tiết {booking.code}</span>
      </nav>

      <section className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#181c1c]">Chi tiết lịch hẹn</h1>
          <p className="mt-1 text-[#3e4947]">Theo dõi thông tin đặt lịch, kỹ thuật viên và trạng thái di chuyển.</p>
        </div>
        <span className={cn("inline-flex w-fit items-center rounded-full border px-4 py-2 text-sm font-semibold", statusClassNames[booking.status])}>
          <Clock3 className={cn("mr-2 h-4 w-4", booking.status === "pending" && "animate-pulse")} />
          {statusLabels[booking.status]}
        </span>
      </section>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <div className="space-y-8 lg:col-span-8">
          <section className="rounded-2xl border border-[#bdc9c6] bg-white p-8 shadow-[0_4px_20px_rgba(15,118,110,0.04)]">
            <div className="mb-6 flex flex-wrap items-start justify-between gap-6">
              <div className="flex gap-5">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#E6F4F1] text-[#005c55]">
                  <Stethoscope className="h-8 w-8 stroke-[2.4]" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-[#181c1c]">{display.treatmentName}</h2>
                  <div className="mt-2 flex flex-wrap items-center gap-4 text-[#3e4947]">
                    <span className="flex items-center gap-1 text-sm"><Clock3 className="h-4 w-4" /> {display.duration}</span>
                    <span className="flex items-center gap-1 text-sm"><CalendarDays className="h-4 w-4" /> {display.schedule}</span>
                  </div>
                </div>
              </div>
              <div className="text-left md:text-right">
                <p className="text-3xl font-bold text-[#005c55]">{formatCurrency(booking.totalAmount)}</p>
                <span className={cn("mt-2 inline-block rounded px-3 py-1 text-[10px] font-bold uppercase tracking-wider", paymentPaid ? "bg-green-50 text-green-700" : "bg-[#ebefed] text-[#3e4947]")}>{paymentDisplay.badge}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 border-y border-[#bdc9c6] py-6 md:grid-cols-2">
              <DetailInfo icon={MapPin} label="Địa điểm thực hiện" value={booking.address} />
              <DetailInfo icon={Phone} label="Số điện thoại liên hệ" value={booking.contactPhone} />
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <button className="flex items-center gap-2 rounded-xl bg-[#005c55] px-6 py-3 font-semibold text-white shadow-lg shadow-[#005c55]/10 transition-all hover:bg-[#0f766e] active:scale-95">
                <Navigation className="h-5 w-5" />
                Xem vị trí KTV
              </button>
              <button className="flex items-center gap-2 rounded-xl border-2 border-[#005c55] bg-white px-6 py-3 font-semibold text-[#005c55] transition-all hover:bg-[#E6F4F1]">
                <Phone className="h-5 w-5" />
                Liên hệ kỹ thuật viên
              </button>
              {isPending && (
                <button onClick={() => setCancelModalOpen(true)} className="rounded-xl border border-red-700 px-6 py-3 font-semibold text-red-700 transition-all hover:bg-red-50 md:ml-auto">
                  Hủy lịch
                </button>
              )}
              {canReviewBooking && (
                <button onClick={() => setReviewModalOpen(true)} className="flex items-center gap-2 rounded-xl bg-[#aef35e] px-6 py-3 font-bold text-[#426e00] transition-all hover:shadow-md md:ml-auto">
                  <Star className="h-5 w-5" />
                  Đánh giá buổi trị liệu
                </button>
              )}
              {existingReview ? (
                <span className="flex items-center gap-2 rounded-xl border border-green-700/15 bg-green-50 px-6 py-3 font-bold text-green-700 md:ml-auto">
                  <Star className="h-5 w-5 fill-green-700" />
                  Đã đánh giá
                </span>
              ) : null}
            </div>
          </section>

          <section className="relative h-[450px] overflow-hidden rounded-2xl border border-[#bdc9c6] bg-white">
            <div className="absolute inset-0 bg-[#f0f4f2] opacity-95 [background-image:radial-gradient(circle_at_18%_24%,#bdc9c6_0_2px,transparent_3px),linear-gradient(35deg,transparent_0_44%,#80d5cb_45%_46%,transparent_47%),linear-gradient(135deg,transparent_0_38%,#bdc9c6_39%_40%,transparent_41%),linear-gradient(75deg,transparent_0_52%,#bdc9c6_53%_54%,transparent_55%)] [background-size:34px_34px,320px_240px,260px_220px,380px_280px]" />
            <div className="absolute inset-0">
              <div className="absolute left-1/4 top-1/3 flex h-12 w-12 animate-bounce items-center justify-center rounded-full border-4 border-white bg-[#005c55] text-white shadow-xl">
                <Bike className="h-6 w-6" />
              </div>
              <div className="absolute bottom-1/4 right-1/3 flex h-12 w-12 items-center justify-center rounded-full border-4 border-white bg-[#3f6a00] text-white shadow-xl">
                <Home className="h-6 w-6" />
              </div>
            </div>
            <div className="absolute left-6 top-6 flex flex-col gap-3">
              <MapChip icon={Route} label="Khoảng cách" value={display.distance} iconClassName="bg-[#005c55]/10 text-[#005c55]" />
              <MapChip icon={Timer} label="Dự kiến đến" value={display.eta} iconClassName="bg-[#3f6a00]/10 text-[#3f6a00]" />
            </div>
            <div className="absolute bottom-6 left-6 right-6">
              <div className="flex flex-col justify-between gap-4 rounded-2xl border border-[#bdc9c6] bg-white/95 p-4 shadow-xl backdrop-blur-md md:flex-row md:items-center">
                <div className="flex items-center gap-4">
                  <span className={cn("h-2 w-2 rounded-full", isPending ? "animate-ping bg-[#A16207]" : isCompleted ? "bg-green-700" : "bg-[#6e7977]")} />
                  <p className="text-sm font-semibold text-[#181c1c]">{display.mapStatus}</p>
                </div>
                <div className="flex gap-2">
                  <button className="rounded-lg bg-[#ebefed] px-4 py-2 text-sm font-bold text-[#3e4947] transition-all hover:bg-[#e5e9e7]">Mở bản đồ</button>
                  <button className="rounded-lg bg-[#005c55] px-4 py-2 text-sm font-bold text-white shadow-md shadow-[#005c55]/20 transition-all hover:scale-[1.02]">Gửi vị trí của tôi</button>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-[#bdc9c6] bg-white p-8">
            <h2 className="mb-8 text-lg font-bold text-[#181c1c]">Tiến độ lịch hẹn</h2>
            <div className="relative space-y-12">
              <div className="absolute bottom-2 left-[15px] top-2 w-0.5 bg-[#bdc9c6]" />
              {timelineSteps.map((step, index) => {
                const Icon = step.icon;
                const currentIndex = progressIndexByStatus[booking.status];
                const isDone = booking.status === "completed" ? index <= currentIndex : index < currentIndex;
                const isActive = index === currentIndex && !["completed", "cancelled", "rejected"].includes(booking.status);
                const isDisabled = index > currentIndex || booking.status === "cancelled" || booking.status === "rejected";

                return (
                  <div key={step.status} className={cn("relative flex gap-6", isDisabled && "opacity-40")}>
                    <div className={cn("z-10 flex h-8 w-8 items-center justify-center rounded-full text-white ring-4 ring-white", isDone ? "bg-green-700" : isActive ? "bg-[#A16207] shadow-lg shadow-[#A16207]/30" : "bg-[#e0e3e1] text-[#6e7977]")}>
                      <Icon className={cn("h-4 w-4", isActive && step.status === "pending" && "animate-spin")} />
                    </div>
                    <div>
                      <h3 className={cn("font-bold", isActive ? "text-[#005c55]" : "text-[#181c1c]")}>{step.title}</h3>
                      <p className="text-sm text-[#3e4947]">{step.status === "pending" ? `Hệ thống đã gửi thông báo đến ${display.therapistName}` : step.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        <aside className="space-y-6 lg:col-span-4">
          <section className="rounded-2xl border border-[#bdc9c6] bg-white p-6 shadow-[0_4px_20px_rgba(15,118,110,0.04)]">
            <div className="mb-6 flex items-center gap-4">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-[#E6F4F1] text-xl font-black text-[#005c55] ring-4 ring-[#E6F4F1]">
                {display.therapistInitials}
              </div>
              <div>
                <h2 className="text-lg font-bold text-[#181c1c]">{display.therapistName}</h2>
                <p className="text-sm leading-tight text-[#3e4947]">{display.therapistRole}</p>
                <div className="mt-1 flex items-center gap-1 text-[#005c55]">
                  <Star className="h-4 w-4 fill-[#005c55]" />
                  <span className="text-sm font-bold">{display.therapistRating.toFixed(1)}</span>
                  <span className="ml-1 text-xs font-normal text-[#6e7977]">({display.therapistBookings} buổi)</span>
                </div>
              </div>
            </div>
            <div className="mb-6 flex flex-wrap gap-2">
              {display.tags.map((tag) => (
                <span key={tag} className="rounded-full border border-[#005c55]/10 bg-[#E6F4F1] px-3 py-1 text-xs font-semibold text-[#005c55]">{tag}</span>
              ))}
            </div>
            <div className="space-y-3">
              <Link to={`/therapists/${display.therapistId}`} className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#005c55] py-3 font-semibold text-white transition-all hover:bg-[#0f766e]">
                <User className="h-5 w-5" />
                Xem hồ sơ kỹ thuật viên
              </Link>
              <button className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-[#bdc9c6] py-3 font-semibold text-[#3e4947] transition-all hover:bg-[#f1f4f3]">
                <MessageCircle className="h-5 w-5" />
                Nhắn tin
              </button>
            </div>
          </section>

          <section className="rounded-2xl border border-[#bdc9c6] bg-white p-6">
            <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-[#6e7977]">Chi tiết thanh toán</h2>
            <div className="mb-6 space-y-3">
              <PaymentRow label={`${display.treatmentName} (${display.duration})`} value={formatCurrency(booking.totalAmount)} />
              <PaymentRow label="Phí di chuyển" value="Miễn phí" valueClassName="text-green-700" />
              <div className="flex justify-between border-t border-dashed border-[#bdc9c6] pt-3">
                <span className="font-bold text-[#181c1c]">Tổng cộng</span>
                <span className="text-xl font-bold text-[#005c55]">{formatCurrency(booking.totalAmount)}</span>
              </div>
            </div>
            <div className="mb-6 rounded-xl border border-[#bdc9c6]/50 bg-[#f1f4f3] p-4">
              <div className="mb-1 flex items-center gap-3">
                <CreditCard className="h-5 w-5 text-[#005c55]" />
                <p className="text-sm font-bold text-[#181c1c]">{paymentDisplay.method}</p>
              </div>
              <p className="pl-8 text-xs text-[#3e4947]">{paymentDisplay.description}</p>
              {!paymentPaid ? (
                <Link to={`/app/payments/${booking.id}`} className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-[#005c55] py-3 text-sm font-semibold text-white transition-colors hover:bg-[#0f766e]">
                  Thanh toán ngay
                </Link>
              ) : null}
            </div>
            {isPending && (
              <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-100 bg-red-50 p-3">
                <Info className="h-5 w-5 shrink-0 text-red-700" />
                <p className="text-xs text-[#3e4947]">Hủy lịch miễn phí 100% trước khi kỹ thuật viên xác nhận. Xem <span className="font-semibold text-red-700 underline underline-offset-2">Chính sách hủy</span>.</p>
              </div>
            )}
            <button className="w-full py-2 text-sm font-bold text-[#005c55] hover:underline">Xem chính sách dịch vụ</button>
          </section>

          <section className="group relative rounded-2xl border border-[#bdc9c6] bg-white p-6">
            <button className="absolute right-4 top-4 rounded-full p-2 text-[#6e7977] opacity-0 transition-all hover:text-[#005c55] group-hover:opacity-100">
              <Edit3 className="h-4 w-4" />
            </button>
            <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-[#6e7977]">Thông tin thêm</h2>
            <div>
              <p className="mb-1 text-[10px] font-bold uppercase text-[#6e7977]">Ghi chú sức khỏe cho kỹ thuật viên</p>
              <p className="text-sm font-medium leading-6 text-[#181c1c]">{booking.note ?? display.healthNote}</p>
            </div>
          </section>

          <section className="relative overflow-hidden rounded-2xl bg-[#0f766e] p-6 text-[#a3faef]">
            <HelpCircle className="absolute -bottom-4 -right-4 h-24 w-24 opacity-10" />
            <h2 className="mb-2 font-bold text-white">Cần hỗ trợ?</h2>
            <p className="mb-4 text-sm opacity-80">Nếu bạn gặp bất kỳ vấn đề gì, đội ngũ JvJ luôn sẵn sàng giúp đỡ.</p>
            <button className="w-full rounded-xl bg-white py-3 text-sm font-bold text-[#005c55] shadow-lg shadow-black/5 transition-transform hover:scale-[1.02]">Liên hệ Tổng đài 1900 xxxx</button>
          </section>
        </aside>
      </div>

      {cancelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-md rounded-2xl border-[#bdc9c6] bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-[#181c1c]">Xác nhận hủy lịch</h2>
              <button onClick={() => setCancelModalOpen(false)} className="rounded-full p-1 text-[#3e4947] hover:bg-[#ebefed]">
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="mb-6 text-[#3e4947]">Bạn có chắc chắn muốn hủy lịch hẹn này? Hành động này không thể hoàn tác.</p>
            <div className="flex gap-3">
              <Button variant="secondary" onClick={() => setCancelModalOpen(false)} disabled={cancelling} className="flex-1">Không</Button>
              <Button variant="destructive" onClick={handleCancelBooking} disabled={cancelling} className="flex-1">{cancelling ? "Đang hủy..." : "Xác nhận hủy"}</Button>
            </div>
          </Card>
        </div>
      )}

      {reviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-md rounded-2xl border-[#bdc9c6] bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-[#181c1c]">Đánh giá buổi trị liệu</h2>
              <button onClick={() => setReviewModalOpen(false)} className="rounded-full p-1 text-[#3e4947] hover:bg-[#ebefed]">
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="mb-4 text-[#3e4947]">Chia sẻ cảm nhận để JvJ cải thiện trải nghiệm chăm sóc tại nhà.</p>
            {existingReview ? (
              <ReviewSummary review={existingReview} />
            ) : (
              <BookingReviewForm
                submitting={submittingReview}
                error={reviewError}
                onSubmit={async (payload) => {
                  await handleSubmitReview(payload);
                }}
              />
            )}
          </Card>
        </div>
      )}
    </div>
  );
}

function ReviewSummary({ review }: { review: Review }) {
  return (
    <div className="rounded-xl border border-[#bdc9c6] bg-[#f1f4f3] p-4 text-sm text-[#3e4947]">
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="font-bold text-[#181c1c]">Đánh giá của bạn</p>
        <div className="flex items-center gap-1 text-[#A16207]">
          <Star className="h-4 w-4 fill-[#A16207]" />
          <span className="font-bold">{review.rating}/5</span>
        </div>
      </div>
      <p className="leading-6 text-[#181c1c]">{review.comment}</p>
      {review.tags.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {review.tags.map((tag) => (
            <span key={tag} className="rounded-full border border-[#005c55]/10 bg-[#E6F4F1] px-2.5 py-1 text-xs font-semibold text-[#005c55]">
              {tag}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function DetailInfo({ icon: Icon, label, value }: { icon: typeof MapPin; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="mt-0.5 h-5 w-5 text-[#005c55]" />
      <div>
        <p className="text-xs font-semibold uppercase tracking-tight text-[#6e7977]">{label}</p>
        <p className="mt-0.5 text-sm font-medium text-[#181c1c]">{value}</p>
      </div>
    </div>
  );
}

function MapChip({ icon: Icon, label, value, iconClassName }: { icon: typeof Map; label: string; value: string; iconClassName: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-[#bdc9c6] bg-white/90 px-4 py-3 shadow-lg backdrop-blur-md">
      <div className={cn("flex h-8 w-8 items-center justify-center rounded-full", iconClassName)}>
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <p className="text-[10px] font-bold uppercase text-[#6e7977]">{label}</p>
        <p className="text-sm font-bold text-[#181c1c]">{value}</p>
      </div>
    </div>
  );
}

function PaymentRow({ label, value, valueClassName }: { label: string; value: string; valueClassName?: string }) {
  return (
    <div className="flex justify-between gap-4 text-sm">
      <span className="text-[#3e4947]">{label}</span>
      <span className={cn("font-medium text-[#181c1c]", valueClassName)}>{value}</span>
    </div>
  );
}
