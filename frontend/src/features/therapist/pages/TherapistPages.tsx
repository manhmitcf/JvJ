import { useEffect, useState } from "react";
import {
  Activity,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock,
  EyeOff,
  FileText,
  HeartPulse,
  History,
  IdCard,
  MapPin,
  MessageSquare,
  MoreHorizontal,
  Image,
  Pencil,
  Plus,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Star,
  ToggleRight,
  Trash2,
  Upload,
  UserRound,
  Video,
  Wallet,
  XCircle,
} from "lucide-react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { cn } from "@/utils/cn";
import { BookingDetailDrawer } from "../components/BookingDetailDrawer";
import { BookingRequestCard } from "../components/BookingRequestCard";
import { DashboardMetrics } from "../components/DashboardMetrics";
import { OnlineToggle } from "../components/OnlineToggle";
import { RejectBookingDialog } from "../components/RejectBookingDialog";
import { ScheduleCalendar } from "../components/ScheduleCalendar";
import { SlotFormDialog } from "../components/SlotFormDialog";
import { TreatmentCard } from "../components/TreatmentCard";
import { TreatmentForm } from "../components/TreatmentForm";
import { AvailabilityToggle, FormSection, SelectField, TextArea, TextField, TreatmentMediaFields } from "../components/TreatmentFormFields";
import { TodayAppointments } from "../components/TodayAppointments";
import { MetricCard, PrimaryButton, SearchBar, SecondaryButton, StatusBadge } from "../components/shared";
import { useBookingStore } from "../stores/booking-store";
import { useDashboardStore } from "../stores/dashboard-store";
import { useProfileStore } from "../stores/profile-store";
import { useScheduleStore } from "../stores/schedule-store";
import { useTreatmentStore } from "../stores/treatment-store";
import { useWalletStore } from "../stores/wallet-store";
import { uploadFile } from "@/services/upload-service";
import { therapistAssets } from "@/features/public/lib/stitch-assets";

const SPECIALTIES = [
  "Cổ và gáy",
  "Vật lý trị liệu",
  "Phục hồi chức năng",
  "Ấn huyệt",
  "Đông y",
];

const SERVICE_AREAS = [
  "Hải Châu",
  "Thanh Khê",
  "Sơn Trà",
  "Ngũ Hành Sơn",
  "Cẩm Lệ",
  "Liên Chiểu",
  "Hòa Vang",
];

const money = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" });
const moneyCompact = new Intl.NumberFormat("vi-VN", { notation: "compact", maximumFractionDigits: 1 });

function PageShell({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto max-w-[1440px] space-y-xl pb-xl">{children}</div>;
}

function PageHeader({ eyebrow, title, description, action }: { eyebrow?: string; title: string; description: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-md rounded-[2rem] border border-botanical-border bg-white/80 p-xl shadow-stitch-soft backdrop-blur lg:flex-row lg:items-center lg:justify-between">
      <div>
        {eyebrow && <p className="mb-xs text-label-caption font-black uppercase tracking-[0.18em] text-primary">{eyebrow}</p>}
        <h1 className="text-3xl font-black tracking-tight text-ink-primary md:text-4xl">{title}</h1>
        <p className="mt-sm max-w-2xl text-body-sm font-medium text-sage-secondary md:text-body">{description}</p>
      </div>
      {action}
    </div>
  );
}

function getCustomerName(booking: { customerName?: string }): string {
  return booking?.customerName ?? "Khách hàng JvJ";
}

function getTreatmentName(booking: { treatmentName?: string }): string {
  return booking?.treatmentName ?? "Liệu trình JvJ";
}

function statusTone(status: string): "teal" | "green" | "amber" | "blue" | "red" | "slate" {
  if (status === "pending") return "amber";
  if (status === "confirmed" || status === "in_progress") return "teal";
  if (status === "completed") return "blue";
  if (status === "rejected") return "red";
  return "slate";
}

function statusLabel(status: string) {
  const labels: Record<string, string> = {
    pending: "Chờ xác nhận",
    confirmed: "Đã xác nhận",
    in_progress: "Đang thực hiện",
    completed: "Hoàn tất",
    rejected: "Đã từ chối",
    cancelled: "Đã hủy",
  };
  return labels[status] ?? status;
}

export function TherapistHomePage() {
  const { metrics, todayAppointments, isLoading, error, fetchDashboard, toggleOnline } = useDashboardStore();

  useEffect(() => {
    void fetchDashboard();

    // Auto-refresh mỗi 30 giây
    const interval = setInterval(() => {
      void fetchDashboard();
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchDashboard]);

  const todayAppointmentCount = metrics?.todayAppointmentCount ?? todayAppointments.length;
  const therapistName = "Nam";

  return (
    <PageShell>
      {error ? <p className="mt-md text-body-sm font-semibold text-red-600">{error}</p> : null}

      <DashboardMetrics metrics={metrics} />

      <div className="grid gap-lg xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.85fr)]">
        <TodayAppointments
          appointments={todayAppointments}
          images={[therapistAssets.dashboardCustomerA, therapistAssets.dashboardCustomerB, therapistAssets.bookingImageA, therapistAssets.bookingImageB]}
        />

        <section className="space-y-md">
          <div className="rounded-[2rem] border border-botanical-border bg-white p-lg shadow-stitch-soft">
            <h2 className="text-xl font-black text-ink-primary">Thao tác nhanh</h2>
            <div className="mt-md grid gap-sm">
              {[['Quản lý liệu trình', '/therapist/treatments', Sparkles], ['Cập nhật lịch rảnh', '/therapist/schedule', CalendarDays], ['Duyệt lịch mới', '/therapist/bookings', FileText]].map(([label, to, Icon]) => (
                <Link key={label as string} to={to as string} className="flex items-center justify-between rounded-2xl border border-botanical-border bg-warm-bg p-md font-black text-ink-primary transition hover:border-primary hover:bg-soft-mint">
                  <span className="inline-flex items-center gap-sm"><Icon className="h-5 w-5 text-primary" />{label as string}</span>
                  <ArrowRight className="h-4 w-4 text-primary" />
                </Link>
              ))}
            </div>
          </div>
          <div className="rounded-[2rem] border border-primary/20 bg-soft-mint p-lg shadow-stitch-soft">
            <h2 className="text-xl font-black text-ink-primary">Khu vực phục vụ</h2>
            <p className="mt-sm text-body-sm font-medium text-sage-secondary">Hải Châu, Thanh Khê, Sơn Trà và Ngũ Hành Sơn đang có nhu cầu cao hôm nay.</p>
          </div>
        </section>
      </div>
    </PageShell>
  );
}

export function TherapistTreatmentsPage() {
  const { treatments: storeTreatments, fetchTreatments, updateTreatment } = useTreatmentStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<"all" | "active" | "hidden" | "recent">("all");

  useEffect(() => {
    // Gọi với flag true để lấy treatments của therapist hiện tại
    void fetchTreatments(true);
  }, [fetchTreatments]);

  // Filter treatments dựa vào search query và active filter
  const filteredTreatments = storeTreatments.filter((treatment) => {
    // Search filter
    const matchesSearch = searchQuery.trim() === "" ||
      treatment.name.toLowerCase().includes(searchQuery.toLowerCase());

    // Status filter
    let matchesStatus = true;
    if (activeFilter === "active") {
      matchesStatus = treatment.isAvailable === true;
    } else if (activeFilter === "hidden") {
      matchesStatus = treatment.isAvailable === false;
    }
    // "all" và "recent" không filter theo status

    return matchesSearch && matchesStatus;
  });

  const pageTreatments = filteredTreatments;
  const activeCount = storeTreatments.filter((treatment) => treatment.isAvailable).length;
  const hiddenCount = storeTreatments.length - activeCount;
  const averagePrice = storeTreatments.length > 0 ? Math.round(storeTreatments.reduce((total, treatment) => total + treatment.price, 0) / storeTreatments.length / 1000) : 0;

  return (
    <PageShell>
      <PageHeader
        eyebrow="Therapist Services"
        title="Quản lý liệu trình"
        description="Quản lý danh sách dịch vụ, điều chỉnh giá trị liệu và trạng thái nhận lịch của bạn."
        action={<Link to="/therapist/treatments/new"><PrimaryButton><Plus className="h-5 w-5" /> Thêm liệu trình</PrimaryButton></Link>}
      />

      <div className="grid gap-lg md:grid-cols-3">
        <MetricCard icon={CheckCircle2} label="Đang hoạt động" value={String(activeCount).padStart(2, "0")} hint="Có thể nhận booking" />
        <MetricCard icon={EyeOff} label="Tạm ẩn" value={String(hiddenCount).padStart(2, "0")} hint="Chưa hiển thị với khách" tone="amber" />
        <MetricCard icon={Wallet} label="Giá trung bình" value={`${averagePrice}k`} hint="Mỗi liệu trình" tone="green" />
      </div>

      <div className="flex flex-col gap-md rounded-[2rem] border border-botanical-border bg-white p-md shadow-stitch-soft lg:flex-row lg:items-center">
        <SearchBar
          placeholder="Tìm theo tên liệu trình..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <div className="flex flex-wrap gap-sm">
          {[
            { label: 'Tất cả', value: 'all' as const },
            { label: 'Đang hoạt động', value: 'active' as const },
            { label: 'Tạm ẩn', value: 'hidden' as const },
            { label: 'Mới cập nhật', value: 'recent' as const }
          ].map(({ label, value }) => (
            <button
              key={value}
              onClick={() => setActiveFilter(value)}
              className={cn(
                "rounded-full px-md py-sm text-body-sm font-black transition-colors",
                activeFilter === value
                  ? "bg-primary text-on-primary"
                  : "bg-surface-container-low text-sage-secondary hover:bg-soft-mint hover:text-primary"
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-lg xl:grid-cols-2">
        {pageTreatments.map((treatment) => (
          <TreatmentCard
            key={treatment.id}
            treatment={treatment}
            image={treatment.imageUrl || treatment.images?.[0]}
            onToggleAvailability={(item) => void updateTreatment(item.id, { isAvailable: !item.isAvailable })}
          />
        ))}
      </div>
    </PageShell>
  );
}

export function TherapistTreatmentFormPage() {
  const { treatmentId } = useParams<{ treatmentId: string }>();
  const isEditMode = !!treatmentId;

  return (
    <PageShell>
      <PageHeader
        eyebrow={isEditMode ? "Liệu trình / Chỉnh sửa" : "Liệu trình / Thêm mới"}
        title={isEditMode ? "Chỉnh sửa liệu trình" : "Thêm liệu trình mới"}
        description="Mô tả rõ dịch vụ để khách hàng dễ chọn, hiểu giá và đặt lịch phù hợp."
        action={<Link to="/therapist/treatments"><SecondaryButton>Quay lại danh sách</SecondaryButton></Link>}
      />
      <TreatmentForm treatmentId={treatmentId} />
    </PageShell>
  );
}

export function TherapistSchedulePage() {
  const { slots, fetchSchedule, createSlot, deleteSlot } = useScheduleStore();

  useEffect(() => {
    void fetchSchedule("2026-06-01", "2026-06-07");
  }, [fetchSchedule]);

  const availableCount = slots.filter((slot) => slot.isAvailable && !slot.bookingId).length;
  const bookedCount = slots.filter((slot) => slot.bookingId).length;
  const lockedCount = slots.filter((slot) => !slot.isAvailable && !slot.bookingId).length;

  return (
    <PageShell>
      <PageHeader
        eyebrow="Time-slot Management"
        title="Lịch làm việc"
        description="Cập nhật khung giờ rảnh để khách hàng đặt lịch chính xác và hạn chế trùng lịch."
        action={<PrimaryButton><Plus className="h-5 w-5" /> Thêm khung giờ</PrimaryButton>}
      />

      <div className="grid gap-lg md:grid-cols-4">
        <MetricCard icon={CalendarDays} label="Slot khả dụng" value={String(availableCount).padStart(2, "0")} hint="Tuần này" />
        <MetricCard icon={Clock} label="Đã có lịch" value={String(bookedCount).padStart(2, "0")} hint="Cần chuẩn bị" tone="blue" />
        <MetricCard icon={EyeOff} label="Tạm khóa" value={String(lockedCount).padStart(2, "0")} hint="Không nhận lịch" tone="amber" />
        <MetricCard icon={Activity} label="Tổng giờ" value={`${slots.length}h`} hint="Làm việc tuần này" tone="green" />
      </div>

      <div className="flex flex-col gap-md rounded-[2rem] border border-botanical-border bg-white p-md shadow-stitch-soft lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-sm">
          {['Tuần trước', 'Hôm nay', 'Tuần sau'].map((item, index) => <SecondaryButton key={item} className={index === 1 ? "border-primary bg-soft-mint text-primary" : undefined}>{item}</SecondaryButton>)}
        </div>
        <p className="text-body-sm font-black text-ink-primary">Tuần 27/05 – 02/06</p>
      </div>

      <div className="grid gap-lg xl:grid-cols-[minmax(0,1fr)_360px]">
        <ScheduleCalendar slots={slots} />

        <aside className="space-y-lg">
          <SlotFormDialog
            image={therapistAssets.scheduleTherapistImage}
            onCreate={() => void createSlot({ date: "2026-06-03", startTime: "08:00", endTime: "09:00" })}
          />
          {slots.length > 0 && <SecondaryButton onClick={() => void deleteSlot(slots[0].id)}><Trash2 className="h-4 w-4" /> Xóa slot đầu</SecondaryButton>}
        </aside>
      </div>
    </PageShell>
  );
}

export function TherapistBookingsPage() {
  const { bookings: storeBookings, fetchBookings, approveBooking, rejectBooking } = useBookingStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "pending" | "confirmed" | "in_progress" | "completed">("pending");
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedBookingForReject, setSelectedBookingForReject] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    void fetchBookings();
  }, [fetchBookings]);

  // Filter bookings theo tab
  const tabFilteredBookings = storeBookings.filter((booking) => {
    if (activeTab === "all") return true;
    return booking.status === activeTab;
  });

  // Filter bookings theo search query
  const pageBookings = tabFilteredBookings.filter((booking) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      booking.code.toLowerCase().includes(query) ||
      getCustomerName(booking).toLowerCase().includes(query) ||
      getTreatmentName(booking).toLowerCase().includes(query) ||
      booking.address.toLowerCase().includes(query)
    );
  });

  const pendingCount = storeBookings.filter((booking) => booking.status === "pending").length;
  const confirmedCount = storeBookings.filter((booking) => booking.status === "confirmed").length;
  const inProgressCount = storeBookings.filter((booking) => booking.status === "in_progress").length;
  const completedCount = storeBookings.filter((booking) => booking.status === "completed").length;
  const selectedBooking = pageBookings[0];

  const handleReject = (reason: string) => {
    if (selectedBookingForReject) {
      void rejectBooking(selectedBookingForReject, reason);
      setRejectDialogOpen(false);
      setSelectedBookingForReject(null);
    }
  };

  const openRejectDialog = (bookingId: string) => {
    setSelectedBookingForReject(bookingId);
    setRejectDialogOpen(true);
  };

  return (
    <PageShell>
      <PageHeader
        eyebrow="Booking Approval"
        title="Quản lý lịch hẹn"
        description="Xác nhận lịch mới, theo dõi lịch đang diễn ra và cập nhật trạng thái dịch vụ."
        action={<PrimaryButton onClick={() => navigate("/therapist")}><CalendarDays className="h-5 w-5" /> Xem lịch hôm nay</PrimaryButton>}
      />

      <div className="grid gap-lg md:grid-cols-4">
        <MetricCard icon={Clock} label="Chờ xác nhận" value={String(pendingCount).padStart(2, "0")} hint="Cần phản hồi sớm" tone="amber" />
        <MetricCard icon={ShieldCheck} label="Đã xác nhận" value={String(confirmedCount).padStart(2, "0")} hint="Hôm nay" />
        <MetricCard icon={HeartPulse} label="Đang thực hiện" value={String(inProgressCount).padStart(2, "0")} hint="Theo dõi tiến độ" tone="green" />
        <MetricCard icon={CheckCircle2} label="Hoàn tất" value={String(completedCount).padStart(2, "0")} hint="Trong tháng" tone="blue" />
      </div>

      <div className="flex flex-col gap-md rounded-[2rem] border border-botanical-border bg-white p-md shadow-stitch-soft lg:flex-row lg:items-center">
        <SearchBar
          placeholder="Tìm mã booking, khách hàng, khu vực..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <div className="flex flex-wrap gap-sm">
          {[
            { key: "all", label: "Tất cả" },
            { key: "pending", label: "Chờ xác nhận" },
            { key: "confirmed", label: "Đã xác nhận" },
            { key: "in_progress", label: "Đang thực hiện" },
            { key: "completed", label: "Hoàn tất" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as typeof activeTab)}
              className={cn(
                "rounded-full px-md py-sm text-body-sm font-black transition",
                activeTab === tab.key
                  ? "bg-primary text-on-primary"
                  : "bg-surface-container-low text-sage-secondary hover:bg-soft-mint hover:text-primary"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-lg xl:grid-cols-[minmax(0,1fr)_390px]">
        <section className="space-y-md">
          {pageBookings.length === 0 ? (
            <div className="rounded-[2rem] border border-botanical-border bg-white p-xl text-center">
              <p className="text-body font-semibold text-sage-secondary">
                {searchQuery ? "Không tìm thấy lịch hẹn phù hợp" : "Chưa có lịch hẹn nào"}
              </p>
            </div>
          ) : (
            pageBookings.map((booking) => (
              <BookingRequestCard
                key={booking.id}
                booking={booking}
                customerName={getCustomerName(booking)}
                treatmentName={getTreatmentName(booking)}
                onApprove={(bookingId) => void approveBooking(bookingId)}
                onReject={(bookingId) => openRejectDialog(bookingId)}
              />
            ))
          )}
        </section>

        <div>
          <BookingDetailDrawer
            booking={selectedBooking}
            image={therapistAssets.bookingImageA}
            customerName={getCustomerName(selectedBooking)}
            treatmentName={getTreatmentName(selectedBooking)}
          />
          {rejectDialogOpen && (
            <RejectBookingDialog
              onReject={handleReject}
              onClose={() => {
                setRejectDialogOpen(false);
                setSelectedBookingForReject(null);
              }}
            />
          )}
        </div>
      </div>
    </PageShell>
  );
}

export function TherapistWalletPage() {
  const { metrics, appointments, isLoading, error, fetchWallet } = useWalletStore();

  useEffect(() => {
    void fetchWallet();
  }, [fetchWallet]);

  const monthlyRevenue = metrics?.monthlyRevenue ?? 0;
  const completedBookings = metrics?.completedBookings ?? 0;
  const pendingCount = metrics?.pendingCount ?? 0;
  const rating = metrics?.rating ?? 0;

  return (
    <PageShell>
      <PageHeader
        eyebrow="Earnings & Wallet"
        title="Ví và thu nhập"
        description="Theo dõi doanh thu, số buổi hoàn tất và các lịch hẹn trong ngày của bạn."
        action={
          <StatusBadge tone={metrics?.isOnline ? "green" : "amber"}>
            {metrics?.isOnline ? "Đang nhận lịch" : "Tạm ngưng"}
          </StatusBadge>
        }
      />

      {error ? (
        <div className="rounded-[2rem] border border-[#FEE2E2] bg-[#FEE2E2]/40 p-lg text-center">
          <p className="text-body font-semibold text-[#B91C1C]">{error}</p>
          <SecondaryButton onClick={() => void fetchWallet()} className="mt-md">Thử lại</SecondaryButton>
        </div>
      ) : null}

      <div className="grid gap-lg md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          icon={Wallet}
          label="Doanh thu tháng"
          value={monthlyRevenue > 0 ? `${moneyCompact.format(monthlyRevenue)}đ` : "0đ"}
          hint="Từ các buổi đã hoàn tất"
          tone="blue"
        />
        <MetricCard
          icon={CheckCircle2}
          label="Hoàn tất"
          value={String(completedBookings).padStart(2, "0")}
          hint="Tổng buổi phục vụ"
          tone="green"
        />
        <MetricCard
          icon={Clock}
          label="Chờ xác nhận"
          value={String(pendingCount).padStart(2, "0")}
          hint="Cần phản hồi sớm"
          tone="amber"
        />
        <MetricCard
          icon={Star}
          label="Đánh giá"
          value={rating > 0 ? rating.toFixed(1) : "0"}
          hint="Điểm trung bình hiện tại"
          tone="teal"
        />
      </div>

      <section className="rounded-[2rem] border border-primary/15 bg-soft-mint/70 p-lg shadow-stitch-soft">
        <div className="mb-md flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-ink-primary">Tóm tắt thu nhập</h2>
            <p className="text-body-sm font-medium text-sage-secondary">Dữ liệu trong tháng hiện tại</p>
          </div>
          <StatusBadge tone={monthlyRevenue > 0 ? "green" : "slate"}>
            {monthlyRevenue > 0 ? "Có doanh thu" : "Chưa có doanh thu"}
          </StatusBadge>
        </div>
        <div className="mt-md grid gap-md md:grid-cols-3">
          <div className="rounded-2xl border border-botanical-border bg-white p-md">
            <p className="text-label-caption font-black text-sage-secondary">Tổng doanh thu</p>
            <p className="text-2xl font-black text-primary">{money.format(monthlyRevenue)}</p>
          </div>
          <div className="rounded-2xl border border-botanical-border bg-white p-md">
            <p className="text-label-caption font-black text-sage-secondary">Số buổi</p>
            <p className="text-2xl font-black text-ink-primary">{completedBookings}</p>
          </div>
          <div className="rounded-2xl border border-botanical-border bg-white p-md">
            <p className="text-label-caption font-black text-sage-secondary">Đang chờ</p>
            <p className="text-2xl font-black text-pending-amber">{pendingCount}</p>
          </div>
        </div>
      </section>

      <section className="rounded-[2rem] border border-botanical-border bg-white p-lg shadow-stitch-soft">
        <div className="mb-lg flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-ink-primary">Dòng tiền hôm nay</h2>
            <p className="text-body-sm font-medium text-sage-secondary">Các lịch hẹn trong ngày</p>
          </div>
          <span className="text-label-caption font-black text-muted-text">{appointments.length} lịch</span>
        </div>

        {isLoading ? (
          <div className="grid gap-md">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse rounded-2xl border border-botanical-border bg-surface-container-low p-md">
                <div className="h-4 w-1/3 rounded bg-surface-container" />
                <div className="mt-sm h-3 w-1/2 rounded bg-surface-container" />
              </div>
            ))}
          </div>
        ) : appointments.length === 0 ? (
          <div className="py-xl text-center">
            <Wallet className="mx-auto h-12 w-12 text-surface-container" />
            <p className="mt-md font-black text-sage-secondary">Chưa có lịch hẹn nào hôm nay</p>
            <p className="text-body-sm font-medium text-muted-text">Bật nhận lịch để sẵn sàng cho khách mới.</p>
          </div>
        ) : (
          <div className="space-y-md">
            {appointments.map((apt) => (
              <div key={apt.id} className="flex items-center gap-md rounded-2xl border border-botanical-border bg-warm-bg p-md">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-soft-mint text-primary">
                  <Clock className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-sm">
                    <span className="font-black text-ink-primary">{apt.customerName}</span>
                    <StatusBadge tone={statusTone(apt.status)}>
                      {statusLabel(apt.status)}
                    </StatusBadge>
                  </div>
                  <p className="text-body-sm font-medium text-sage-secondary">{apt.treatmentName} · {apt.startTime}–{apt.endTime}</p>
                  <p className="text-label-caption font-semibold text-muted-text truncate">{apt.address}</p>
                </div>
                <span className="text-label-caption font-black text-muted-text">{apt.code}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-[2rem] border border-botanical-border bg-white p-lg shadow-stitch-soft">
        <h2 className="mb-lg text-xl font-black text-ink-primary">Lịch sử doanh thu gần đây</h2>
        <div className="space-y-sm text-body-sm font-medium text-sage-secondary">
          {completedBookings > 0 ? (
            <p>Đã hoàn tất <span className="font-black text-ink-primary">{completedBookings}</span> buổi phục vụ trong tháng này.</p>
          ) : (
            <p>Chưa có buổi phục vụ nào hoàn tất trong tháng này.</p>
          )}
          <p>Doanh thu tháng: <span className="font-black text-primary">{money.format(monthlyRevenue)}</span></p>
          <p>Đánh giá trung bình: <span className="font-black text-ink-primary">{rating > 0 ? rating.toFixed(1) : "0.0"} ★</span></p>
        </div>
      </section>
    </PageShell>
  );
}

export function TherapistProfilePage() {
  const { profile, fetchProfile, saveProfile, toggleOnline } = useProfileStore();

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [uploadingPortrait, setUploadingPortrait] = useState(false);
  const [uploadingCitizenId, setUploadingCitizenId] = useState<'front' | 'back' | null>(null);
  const [uploadingCertificate, setUploadingCertificate] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const [editForm, setEditForm] = useState({
    fullName: "",
    phone: "",
    bio: "",
    yearsOfExperience: 0,
    specialties: [] as string[],
    serviceAreas: [] as string[],
  });

  // Sync edit form when profile loads or edit mode starts
  useEffect(() => {
    if (profile) {
      setEditForm({
        fullName: profile.fullName ?? "",
        phone: profile.phone ?? "",
        bio: profile.bio ?? "",
        yearsOfExperience: profile.yearsOfExperience ?? 0,
        specialties: profile.specialties ?? [],
        serviceAreas: profile.serviceAreas ?? [],
      });
    }
  }, [profile]);

  useEffect(() => {
    void fetchProfile();
  }, [fetchProfile]);

  const hasChanges = profile && (
    editForm.fullName !== (profile.fullName ?? "") ||
    editForm.phone !== (profile.phone ?? "") ||
    editForm.bio !== (profile.bio ?? "") ||
    editForm.yearsOfExperience !== (profile.yearsOfExperience ?? 0) ||
    JSON.stringify(editForm.specialties) !== JSON.stringify(profile.specialties ?? []) ||
    JSON.stringify(editForm.serviceAreas) !== JSON.stringify(profile.serviceAreas ?? [])
  );

  const handleFieldChange = (field: keyof typeof editForm, value: typeof editForm[keyof typeof editForm]) => {
    setEditForm((prev) => ({ ...prev, [field]: value }));
    setSaveSuccess(false);
    setSaveError(null);
  };

  const handleSave = async () => {
    if (!profile || isSaving) return;
    setIsSaving(true);
    setSaveError(null);

    try {
      await saveProfile({
        full_name: editForm.fullName,
        phone: editForm.phone,
        bio: editForm.bio,
        years_of_experience: editForm.yearsOfExperience,
        specialties: editForm.specialties,
        serviceAreas: editForm.serviceAreas,
      });
      setIsEditing(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setSaveError((err as Error).message || "Không thể lưu thay đổi.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (profile) {
      setEditForm({
        fullName: profile.fullName ?? "",
        phone: profile.phone ?? "",
        bio: profile.bio ?? "",
        yearsOfExperience: profile.yearsOfExperience ?? 0,
        specialties: profile.specialties ?? [],
        serviceAreas: profile.serviceAreas ?? [],
      });
    }
    setIsEditing(false);
    setSaveError(null);
  };

  const handlePortraitUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingPortrait(true);
    setUploadError(null);
    try {
      const url = await uploadFile(file);
      await saveProfile({ portraitUrl: url });
      event.target.value = "";
    } catch (error) {
      const message = error instanceof Error ? error.message : "Upload thất bại";
      setUploadError(message);
      console.error("Portrait upload error:", error);
    } finally {
      setUploadingPortrait(false);
    }
  };

  const handleCitizenIdFrontUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingCitizenId('front');
    setUploadError(null);
    try {
      const url = await uploadFile(file);
      await saveProfile({ pending_citizen_id_front_url: url });
      event.target.value = "";
    } catch (error) {
      const message = error instanceof Error ? error.message : "Upload thất bại";
      setUploadError(message);
    } finally {
      setUploadingCitizenId(null);
    }
  };

  const handleCitizenIdBackUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingCitizenId('back');
    setUploadError(null);
    try {
      const url = await uploadFile(file);
      await saveProfile({ pending_citizen_id_back_url: url });
      event.target.value = "";
    } catch (error) {
      const message = error instanceof Error ? error.message : "Upload thất bại";
      setUploadError(message);
    } finally {
      setUploadingCitizenId(null);
    }
  };

  const handleCertificateUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploadingCertificate(true);
    setUploadError(null);
    try {
      const uploadPromises = Array.from(files).map(f => uploadFile(f));
      const urls = await Promise.all(uploadPromises);
      const existingCertificates = profile?.pendingCertificateUrls ?? [];
      const newCertificateUrls = [...existingCertificates, ...urls];
      await saveProfile({ pending_certificate_urls: newCertificateUrls });
      event.target.value = "";
    } catch (error) {
      const message = error instanceof Error ? error.message : "Upload thất bại";
      setUploadError(message);
    } finally {
      setUploadingCertificate(false);
    }
  };

  const rating = profile?.rating ?? 0;
  const completedBookings = profile?.completedBookings ?? 0;
  const isOnline = profile?.isOnline ?? true;
  const displayServiceAreas = isEditing ? editForm.serviceAreas : (profile?.serviceAreas ?? []);

  const pendingCertUrls = profile?.pendingCertificateUrls ?? [];

  const pendingCitizenFront = profile?.pendingCitizenIdFrontUrl;
  const pendingCitizenBack = profile?.pendingCitizenIdBackUrl;
  const hasPendingCredentials = !!(pendingCitizenFront || pendingCitizenBack || pendingCertUrls.length > 0);
  const hasApprovedCredentials = !!(profile?.citizenIdFrontUrl || profile?.citizenIdBackUrl || (profile?.certificateUrls?.length ?? 0) > 0);

  return (
    <PageShell>
      <PageHeader
        eyebrow="Therapist Profile"
        title="Hồ sơ kỹ thuật viên"
        description="Quản lý thông tin cá nhân, chuyên môn, giấy tờ xác minh và hồ sơ hiển thị với khách hàng."
        action={
          <div className="flex flex-wrap gap-sm">
            <SecondaryButton><EyeOff className="h-4 w-4" /> Xem hồ sơ công khai</SecondaryButton>
            {isEditing ? (
              <>
                <button
                  onClick={handleCancel}
                  disabled={isSaving}
                  className="inline-flex items-center gap-xs rounded-full border border-botanical-border bg-white px-md py-sm text-body-sm font-black text-sage-secondary transition hover:border-primary hover:text-primary disabled:opacity-50"
                >
                  Hủy
                </button>
                <PrimaryButton
                  onClick={() => void handleSave()}
                  disabled={isSaving || !hasChanges}
                >
                  {isSaving ? "Đang lưu..." : "Lưu thay đổi"}
                </PrimaryButton>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center gap-xs rounded-full bg-soft-mint px-md py-sm text-body-sm font-black text-primary transition hover:bg-primary hover:text-white"
              >
                <Pencil className="h-4 w-4" /> Chỉnh sửa hồ sơ
              </button>
            )}
          </div>
        }
      />

      {saveSuccess && (
        <div className="flex items-center gap-md rounded-2xl border border-success-leaf bg-[#DCFCE7] p-md text-body font-semibold text-success-leaf">
          <CheckCircle2 className="h-5 w-5" />
          Thay đổi đã được lưu thành công!
        </div>
      )}

      {saveError && (
        <div className="flex items-center gap-md rounded-2xl border border-red-200 bg-red-50 p-md text-body font-semibold text-red-700">
          {saveError}
        </div>
      )}

      <div className="grid gap-lg xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="space-y-lg">
          <section className="rounded-[2rem] border border-botanical-border bg-white p-lg shadow-stitch-soft">
            <div className="mb-lg flex items-center justify-between">
              <h2 className="inline-flex items-center gap-sm text-xl font-black text-ink-primary"><UserRound className="h-5 w-5 text-primary" /> Thông tin cá nhân</h2>
            </div>
            <div className="grid gap-lg lg:grid-cols-[160px_minmax(0,1fr)]">
              <div className="text-center">
                <label className={`relative mx-auto block h-32 w-32 overflow-hidden rounded-[1.5rem] border-2 border-botanical-border transition ${uploadingPortrait ? 'cursor-wait opacity-60' : isEditing ? 'cursor-pointer hover:border-primary' : 'cursor-not-allowed'}`}>
                  <img
                    src={profile?.portraitUrl || profile?.avatarUrl || "/placeholder-avatar.png"}
                    alt="Ảnh chân dung kỹ thuật viên"
                    className="h-full w-full object-cover"
                  />
                  {isEditing && (
                    <div className="absolute inset-x-0 bottom-0 bg-black/40 py-xs text-label-caption font-black text-white">
                      {uploadingPortrait ? "Đang tải..." : "Đổi ảnh"}
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handlePortraitUpload}
                    disabled={!isEditing || uploadingPortrait}
                    className="sr-only"
                  />
                </label>
                <p className="mt-sm text-label-caption font-bold text-sage-secondary">
                  {isEditing ? "Tải lên ảnh chân dung" : "Chỉnh sửa để đổi ảnh"}
                </p>
                {uploadError && (
                  <p className="mt-xs text-xs font-semibold text-red-600">{uploadError}</p>
                )}
              </div>
              <div className="grid gap-md md:grid-cols-2">
                {/* Họ và tên */}
                <div>
                  <label className="mb-xs block text-body-sm font-black text-ink-primary">Họ và tên</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editForm.fullName}
                      onChange={(e) => handleFieldChange("fullName", e.target.value)}
                      className="h-12 w-full rounded-2xl border border-botanical-border bg-white px-md text-body-sm font-semibold text-ink-primary outline-none focus:border-primary focus:ring-4 focus:ring-soft-mint"
                      placeholder="Nhập họ và tên"
                    />
                  ) : (
                    <div className="flex h-12 items-center rounded-2xl border border-botanical-border bg-warm-bg px-md text-body-sm font-semibold text-ink-primary">
                      {editForm.fullName || "—"}
                    </div>
                  )}
                </div>

                {/* Email — không sửa được */}
                <div>
                  <label className="mb-xs block text-body-sm font-black text-ink-primary">Email</label>
                  <div className="flex h-12 items-center rounded-2xl border border-botanical-border bg-warm-bg px-md text-body-sm font-semibold text-ink-primary">
                    {profile?.email || "—"}
                  </div>
                </div>

                {/* Số điện thoại */}
                <div>
                  <label className="mb-xs block text-body-sm font-black text-ink-primary">Số điện thoại</label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={editForm.phone}
                      onChange={(e) => handleFieldChange("phone", e.target.value)}
                      className="h-12 w-full rounded-2xl border border-botanical-border bg-white px-md text-body-sm font-semibold text-ink-primary outline-none focus:border-primary focus:ring-4 focus:ring-soft-mint"
                      placeholder="Nhập số điện thoại"
                    />
                  ) : (
                    <div className="flex h-12 items-center rounded-2xl border border-botanical-border bg-warm-bg px-md text-body-sm font-semibold text-ink-primary">
                      {editForm.phone || "—"}
                    </div>
                  )}
                </div>

                {/* Trạng thái online */}
                <div>
                  <label className="mb-xs block text-body-sm font-black text-ink-primary">Trạng thái online</label>
                  <div className="flex h-12 items-center gap-sm rounded-2xl border border-botanical-border bg-warm-bg px-md text-body-sm font-semibold text-ink-primary">
                    <span className={cn("h-2 w-2 rounded-full", isOnline ? "bg-success-leaf" : "bg-sage-secondary/40")} />
                    {isOnline ? "Đang nhận lịch" : "Tạm ngưng"}
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-[2rem] border border-botanical-border bg-white p-lg shadow-stitch-soft">
            <div className="mb-lg flex items-center justify-between">
              <h2 className="inline-flex items-center gap-sm text-xl font-black text-ink-primary"><HeartPulse className="h-5 w-5 text-primary" /> Thông tin chuyên môn</h2>
            </div>
            <div className="space-y-md">
              <div className="grid gap-md md:grid-cols-2">
                {/* Kinh nghiệm */}
                <div>
                  <label className="mb-xs block text-body-sm font-black text-ink-primary">Kinh nghiệm</label>
                  {isEditing ? (
                    <input
                      type="number"
                      min={0}
                      value={editForm.yearsOfExperience}
                      onChange={(e) => handleFieldChange("yearsOfExperience", parseInt(e.target.value) || 0)}
                      className="h-12 w-full rounded-2xl border border-botanical-border bg-white px-md text-body-sm font-semibold text-ink-primary outline-none focus:border-primary focus:ring-4 focus:ring-soft-mint"
                    />
                  ) : (
                    <div className="flex h-12 items-center gap-sm rounded-2xl border border-botanical-border bg-warm-bg px-md text-body-sm font-bold text-ink-primary">
                      <History className="h-5 w-5 text-primary" />
                      {editForm.yearsOfExperience} năm làm nghề
                    </div>
                  )}
                </div>

                {/* Chuyên môn chính */}
                <div>
                  <label className="mb-xs block text-body-sm font-black text-ink-primary">Chuyên môn chính</label>
                  {isEditing ? (
                    <div className="grid grid-cols-2 gap-2">
                      {SPECIALTIES.map((specialty) => (
                        <label
                          key={specialty}
                          className={`flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2 text-sm ${editForm.specialties.includes(specialty) ? "border-primary bg-soft-mint text-primary" : "border-botanical-border bg-background text-on-surface-variant"}`}
                        >
                          <input
                            className="sr-only"
                            type="checkbox"
                            checked={editForm.specialties.includes(specialty)}
                            onChange={() => {
                              const next = editForm.specialties.includes(specialty)
                                ? editForm.specialties.filter((s) => s !== specialty)
                                : [...editForm.specialties, specialty];
                              handleFieldChange("specialties", next);
                            }}
                          />
                          <span>{specialty}</span>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-sm rounded-2xl border border-botanical-border bg-warm-bg px-md py-sm">
                      {editForm.specialties.length > 0 ? editForm.specialties.map((item) => <StatusBadge key={item}>{item}</StatusBadge>) : (
                        <span className="text-body-sm font-semibold text-muted-text">—</span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Giới thiệu bản thân */}
              <div>
                <label className="mb-xs block text-body-sm font-black text-ink-primary">Giới thiệu bản thân</label>
                {isEditing ? (
                  <textarea
                    value={editForm.bio}
                    onChange={(e) => handleFieldChange("bio", e.target.value)}
                    rows={4}
                    className="min-h-28 w-full rounded-2xl border border-botanical-border bg-white px-md py-sm text-body-sm font-semibold text-ink-primary outline-none focus:border-primary focus:ring-4 focus:ring-soft-mint"
                    placeholder="Giới thiệu về bản thân, kinh nghiệm và phong cách làm việc..."
                  />
                ) : (
                  <div className="min-h-28 rounded-2xl border border-botanical-border bg-warm-bg px-md py-sm text-body-sm font-semibold text-ink-primary">
                    {editForm.bio || "—"}
                  </div>
                )}
              </div>
            </div>
          </section>

          <section className="rounded-[2rem] border border-botanical-border bg-white p-lg shadow-stitch-soft">
            <div className="mb-lg flex items-center justify-between">
              <h2 className="inline-flex items-center gap-sm text-xl font-black text-ink-primary"><ShieldCheck className="h-5 w-5 text-primary" /> Giấy tờ xác minh</h2>
              {hasPendingCredentials && !hasApprovedCredentials && (
                <StatusBadge tone="amber">Đang chờ duyệt</StatusBadge>
              )}
              {hasApprovedCredentials && (
                <StatusBadge tone="teal">Đã xác minh</StatusBadge>
              )}
            </div>

            {hasPendingCredentials && !hasApprovedCredentials && (
              <div className="mb-md rounded-2xl border border-pending-amber/30 bg-pending-amber/5 p-sm text-center text-body-sm font-semibold text-sage-secondary">
                Giấy tờ của bạn đang chờ Admin duyệt. Sau khi duyệt, thông tin sẽ hiển thị tại đây.
              </div>
            )}

            <div className="grid gap-md md:grid-cols-2 xl:grid-cols-3">
              {/* Citizen ID Front */}
              <div className="flex flex-col gap-sm">
                <label className={`relative block overflow-hidden rounded-3xl border border-botanical-border bg-warm-bg transition ${isEditing ? 'cursor-pointer hover:border-primary' : 'cursor-not-allowed'}`}>
                  {!isEditing && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/30 opacity-0 hover:opacity-100">
                      <div className="flex flex-col items-center gap-xs text-white">
                        <Pencil className="h-5 w-5" />
                        <span className="text-label-caption font-black">Bấm Chỉnh sửa để tải lên</span>
                      </div>
                    </div>
                  )}
                  {isEditing && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/30 opacity-0 hover:opacity-100">
                      <div className="flex flex-col items-center gap-xs text-white">
                        <Upload className="h-6 w-6" />
                        <span className="text-label-caption font-black">Tải ảnh lên</span>
                      </div>
                    </div>
                  )}
                  {pendingCitizenFront || profile?.citizenIdFrontUrl ? (
                    <img
                      src={pendingCitizenFront || profile?.citizenIdFrontUrl}
                      alt="CCCD Mặt trước"
                      className="h-40 w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-40 flex-col items-center justify-center gap-sm bg-surface-container-low">
                      <IdCard className="h-8 w-8 text-sage-secondary" />
                      <span className="text-label-caption font-semibold text-sage-secondary">Chưa có ảnh</span>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleCitizenIdFrontUpload}
                    disabled={!isEditing || uploadingCitizenId !== null}
                    className="sr-only"
                  />
                </label>
                <p className="text-center text-body-sm font-black text-ink-primary">CCCD Mặt trước</p>
                {uploadingCitizenId === 'front' && (
                  <p className="text-center text-label-caption font-semibold text-primary">Đang tải...</p>
                )}
              </div>

              {/* Citizen ID Back */}
              <div className="flex flex-col gap-sm">
                <label className={`relative block overflow-hidden rounded-3xl border border-botanical-border bg-warm-bg transition ${isEditing ? 'cursor-pointer hover:border-primary' : 'cursor-not-allowed'}`}>
                  {!isEditing && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/30 opacity-0 hover:opacity-100">
                      <div className="flex flex-col items-center gap-xs text-white">
                        <Pencil className="h-5 w-5" />
                        <span className="text-label-caption font-black">Bấm Chỉnh sửa để tải lên</span>
                      </div>
                    </div>
                  )}
                  {isEditing && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/30 opacity-0 hover:opacity-100">
                      <div className="flex flex-col items-center gap-xs text-white">
                        <Upload className="h-6 w-6" />
                        <span className="text-label-caption font-black">Tải ảnh lên</span>
                      </div>
                    </div>
                  )}
                  {pendingCitizenBack || profile?.citizenIdBackUrl ? (
                    <img
                      src={pendingCitizenBack || profile?.citizenIdBackUrl}
                      alt="CCCD Mặt sau"
                      className="h-40 w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-40 flex-col items-center justify-center gap-sm bg-surface-container-low">
                      <IdCard className="h-8 w-8 text-sage-secondary" />
                      <span className="text-label-caption font-semibold text-sage-secondary">Chưa có ảnh</span>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleCitizenIdBackUpload}
                    disabled={!isEditing || uploadingCitizenId !== null}
                    className="sr-only"
                  />
                </label>
                <p className="text-center text-body-sm font-black text-ink-primary">CCCD Mặt sau</p>
                {uploadingCitizenId === 'back' && (
                  <p className="text-center text-label-caption font-semibold text-primary">Đang tải...</p>
                )}
              </div>

              {/* Certificates */}
              <div className="flex flex-col gap-sm">
                <label className={`relative block overflow-hidden rounded-3xl border border-botanical-border bg-warm-bg transition ${isEditing ? 'cursor-pointer hover:border-primary' : 'cursor-not-allowed'}`}>
                  {!isEditing && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/30 opacity-0 hover:opacity-100">
                      <div className="flex flex-col items-center gap-xs text-white">
                        <Pencil className="h-5 w-5" />
                        <span className="text-label-caption font-black">Bấm Chỉnh sửa để tải lên</span>
                      </div>
                    </div>
                  )}
                  {isEditing && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/30 opacity-0 hover:opacity-100">
                      <div className="flex flex-col items-center gap-xs text-white">
                        <Upload className="h-6 w-6" />
                        <span className="text-label-caption font-black">Tải ảnh lên</span>
                      </div>
                    </div>
                  )}
                  {pendingCertUrls.length > 0 || (profile?.certificateUrls?.length ?? 0) > 0 ? (
                    <div className="grid grid-cols-2 gap-1">
                      {((pendingCertUrls.length > 0 ? pendingCertUrls : profile?.certificateUrls ?? []) as string[]).slice(0, 4).map((url, i) => (
                        <img key={i} src={url} alt={`Chứng chỉ ${i + 1}`} className="h-20 w-full object-cover" />
                      ))}
                    </div>
                  ) : (
                    <div className="flex h-40 flex-col items-center justify-center gap-sm bg-surface-container-low">
                      <FileText className="h-8 w-8 text-sage-secondary" />
                      <span className="text-label-caption font-semibold text-sage-secondary">Chưa có chứng chỉ</span>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    multiple
                    onChange={handleCertificateUpload}
                    disabled={!isEditing || uploadingCertificate}
                    className="sr-only"
                    aria-label="Tải lên chứng chỉ hành nghề"
                  />
                </label>
                <p className="text-center text-body-sm font-black text-ink-primary">Chứng chỉ hành nghề</p>
                {uploadingCertificate && (
                  <p className="text-center text-label-caption font-semibold text-primary">Đang tải...</p>
                )}
              </div>
            </div>
            {uploadError && (
              <p className="mt-sm text-xs font-semibold text-red-600">{uploadError}</p>
            )}
          </section>

          <section className="rounded-[2rem] border border-botanical-border bg-white p-lg shadow-stitch-soft">
            <div className="mb-lg flex items-center justify-between">
              <h2 className="inline-flex items-center gap-sm text-xl font-black text-ink-primary"><MapPin className="h-5 w-5 text-primary" /> Khu vực phục vụ</h2>
            </div>
            <div className="space-y-md">
              <div>
                <p className="mb-sm text-body-sm font-black text-ink-primary">Các quận hỗ trợ</p>
                {isEditing ? (
                  <div className="grid grid-cols-2 gap-2">
                    {SERVICE_AREAS.map((area) => (
                      <label
                        key={area}
                        className={`flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2 text-sm ${displayServiceAreas.includes(area) ? "border-primary bg-soft-mint text-primary" : "border-botanical-border bg-background text-on-surface-variant"}`}
                      >
                        <input
                          className="sr-only"
                          type="checkbox"
                          checked={displayServiceAreas.includes(area)}
                          onChange={() => {
                            const next = displayServiceAreas.includes(area)
                              ? displayServiceAreas.filter((s) => s !== area)
                              : [...displayServiceAreas, area];
                            handleFieldChange("serviceAreas", next);
                          }}
                        />
                        <span>{area}</span>
                      </label>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-sm">
                    {displayServiceAreas.length > 0 ? displayServiceAreas.map((area) => (
                      <span key={area} className="rounded-full bg-surface-container-low px-md py-xs text-label-caption font-black text-sage-secondary">{area}</span>
                    )) : (
                      <span className="text-body-sm font-semibold text-muted-text">—</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>

        <aside className="space-y-lg xl:sticky xl:top-24 xl:self-start">
          <section className="overflow-hidden rounded-[2rem] border border-botanical-border bg-white shadow-stitch-soft">
            <div className="border-b border-botanical-border bg-soft-mint p-md text-label-caption font-black uppercase tracking-wider text-primary">Xem trước hồ sơ</div>
            <div className="p-lg text-center">
              <div className="mx-auto mb-md h-24 w-24">
                <img src={profile?.portraitUrl || profile?.avatarUrl || "/placeholder-avatar.png"} alt="Ảnh xem trước hồ sơ" className="h-24 w-24 rounded-full border-4 border-soft-mint object-cover shadow-lg" />
              </div>
              <h2 className="text-2xl font-black text-ink-primary">{editForm.fullName || "Kỹ thuật viên"}</h2>
              <p className="mt-xs text-body-sm font-bold text-sage-secondary">Chuyên gia massage trị liệu</p>
              <div className="my-md grid grid-cols-2 divide-x divide-botanical-border border-y border-botanical-border py-sm">
                <div><p className="text-xl font-black text-ink-primary">{rating.toFixed(1)} ★</p><p className="text-label-caption font-black uppercase text-muted-text">Đánh giá</p></div>
                <div><p className="text-xl font-black text-ink-primary">{completedBookings}</p><p className="text-label-caption font-black uppercase text-muted-text">Buổi hoàn thành</p></div>
              </div>
              <button className="mt-lg w-full rounded-2xl bg-soft-mint px-md py-sm text-body-sm font-black text-primary transition hover:bg-primary hover:text-white">Xem đầy đủ hồ sơ</button>
            </div>
          </section>

          <section className="rounded-[2rem] border border-botanical-border bg-white p-lg shadow-stitch-soft">
            <h2 className="mb-md inline-flex items-center gap-sm text-xl font-black text-ink-primary"><SlidersHorizontal className="h-5 w-5 text-primary" /> Trạng thái hiển thị</h2>
            <div className="flex items-center justify-between border-b border-botanical-border py-md">
              <div><p className="font-black text-ink-primary">Đang nhận lịch mới</p><p className="text-label-caption font-semibold text-sage-secondary">Cho phép đặt lịch ngay bây giờ</p></div>
              <button
                onClick={async (e) => {
                  e.preventDefault();
                  try {
                    await toggleOnline(!isOnline);
                  } catch (error) {
                    console.error("Toggle failed:", error);
                    alert("Không thể cập nhật trạng thái. Vui lòng đăng nhập lại.");
                  }
                }}
                className="cursor-pointer"
                type="button"
                aria-label="Toggle online status"
              >
                <div className={cn(
                  "relative inline-flex h-8 w-14 items-center rounded-full transition-colors",
                  isOnline ? "bg-primary" : "bg-sage-secondary/30"
                )}>
                  <span className={cn(
                    "inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform",
                    isOnline ? "translate-x-7" : "translate-x-1"
                  )} />
                </div>
              </button>
            </div>
            <p className="mt-md rounded-2xl border border-primary/10 bg-primary/5 p-sm text-center text-label-caption font-bold italic text-primary">Trạng thái sẽ được cập nhật tức thì trên ứng dụng khách hàng.</p>
          </section>
        </aside>
      </div>
    </PageShell>
  );
}
