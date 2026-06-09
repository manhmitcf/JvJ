import { useEffect, useMemo, useState } from "react";
import { Building2, ClipboardList, Plus, ShieldCheck, UserCheck, Users } from "lucide-react";
import { type AdminAccountStatus, type TherapistApproval } from "@/types/admin";
import { type BookingStatus, type PaymentStatus } from "@/types/booking";
import { type Spa, type SpaFormInput } from "@/types/spa";
import { type UserRole } from "@/types/user";
import { AdminBookingDetailDrawer } from "../components/AdminBookingDetailDrawer";
import { AdminBookingTable } from "../components/AdminBookingTable";
import { AdminOverviewPanels } from "../components/AdminOverviewPanels";
import { RejectTherapistDialog } from "../components/RejectTherapistDialog";
import { SpaDetailDrawer } from "../components/SpaDetailDrawer";
import { SpaFormDialog } from "../components/SpaFormDialog";
import { SpaManagementTable } from "../components/SpaManagementTable";
import { TherapistApprovalCard } from "../components/TherapistApprovalCard";
import { TherapistApprovalDetail } from "../components/TherapistApprovalDetail";
import { UserDetailDrawer } from "../components/UserDetailDrawer";
import { UserManagementTable } from "../components/UserManagementTable";
import { AdminEmptyState, AdminPrimaryButton, AdminSearchBar, AdminSecondaryButton, AdminStatusBadge } from "../components/shared";
import { useAdminApprovalStore } from "../stores/admin-approval-store";
import { useAdminBookingStore } from "../stores/admin-booking-store";
import { useAdminOverviewStore } from "../stores/admin-overview-store";
import { useAdminSpaStore } from "../stores/admin-spa-store";
import { useAdminUserStore } from "../stores/admin-user-store";

function AdminPageHeader({ eyebrow, title, description, icon, action }: { eyebrow: string; title: string; description: string; icon: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="mb-lg flex flex-wrap items-start justify-between gap-md">
      <div className="flex items-start gap-md">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[1.5rem] bg-soft-mint text-primary">{icon}</div>
        <div>
          <p className="text-label-caption font-black uppercase tracking-[0.22em] text-primary">{eyebrow}</p>
          <h1 className="mt-xs text-3xl font-black text-ink-primary md:text-4xl">{title}</h1>
          <p className="mt-xs max-w-3xl text-body-md font-semibold text-sage-secondary">{description}</p>
        </div>
      </div>
      {action}
    </div>
  );
}

function LoadingState() {
  return <div className="rounded-[2rem] border border-botanical-border bg-white p-xl text-center text-body-md font-black text-primary shadow-stitch-soft">Đang tải dữ liệu quản trị...</div>;
}

function ErrorState({ message }: { message: string }) {
  return <div className="rounded-[2rem] border border-red-200 bg-red-50 p-lg text-body-sm font-black text-[#B91C1C]">{message}</div>;
}

export function AdminHomePage() {
  const { overview, isLoading, error, fetchOverview } = useAdminOverviewStore();

  useEffect(() => {
    void fetchOverview();
  }, [fetchOverview]);

  return (
    <section>
      <AdminPageHeader eyebrow="Admin Operations" title="Tổng quan quản trị" description="Theo dõi nhanh sức khỏe vận hành JvJ: người dùng, booking, hồ sơ KTV và các cảnh báo cần xử lý trong ngày." icon={<ShieldCheck className="h-7 w-7" />} />
      {isLoading && <LoadingState />}
      {error && <ErrorState message={error} />}
      {overview && <AdminOverviewPanels metrics={overview.metrics} chart={overview.chart} alerts={overview.alerts} />}
    </section>
  );
}

export function AdminUsersPage() {
  const { users, selectedUser, isLoading, error, fetchUsers, selectUser, toggleUserStatus } = useAdminUserStore();
  const [keyword, setKeyword] = useState("");
  const [role, setRole] = useState<UserRole | "all">("all");
  const [status, setStatus] = useState<AdminAccountStatus | "all">("all");

  useEffect(() => {
    void fetchUsers({ keyword, role, status });
  }, [fetchUsers, keyword, role, status]);

  return (
    <section>
      <AdminPageHeader eyebrow="User Management" title="Quản lý người dùng" description="Tìm kiếm, lọc và khóa/mở khóa tài khoản customer, therapist hoặc admin khi có rủi ro vận hành." icon={<Users className="h-7 w-7" />} />
      <div className="mb-md grid gap-sm lg:grid-cols-[1fr_180px_180px]">
        <AdminSearchBar value={keyword} onChange={setKeyword} placeholder="Tìm theo tên, email hoặc số điện thoại" />
        <select value={role} onChange={(event) => setRole(event.target.value as UserRole | "all")} className="h-12 rounded-2xl border border-botanical-border bg-white px-md text-body-sm font-black text-ink-primary outline-none focus:border-primary">
          <option value="all">Tất cả vai trò</option>
          <option value="customer">Customer</option>
          <option value="therapist">Therapist</option>
          <option value="admin">Admin</option>
        </select>
        <select value={status} onChange={(event) => setStatus(event.target.value as AdminAccountStatus | "all")} className="h-12 rounded-2xl border border-botanical-border bg-white px-md text-body-sm font-black text-ink-primary outline-none focus:border-primary">
          <option value="all">Tất cả trạng thái</option>
          <option value="active">Đang hoạt động</option>
          <option value="suspended">Tạm khóa</option>
          <option value="pending_approval">Chờ duyệt</option>
          <option value="rejected">Từ chối</option>
        </select>
      </div>
      {isLoading && <LoadingState />}
      {error && <ErrorState message={error} />}
      <div className="grid gap-lg xl:grid-cols-[1fr_360px]">
        {users.length ? <UserManagementTable users={users} selectedUserId={selectedUser?.id} onSelect={selectUser} onToggleStatus={(userId) => void toggleUserStatus(userId)} /> : <AdminEmptyState title="Không có người dùng phù hợp" description="Thử đổi bộ lọc hoặc từ khóa tìm kiếm." />}
        <UserDetailDrawer user={selectedUser} />
      </div>
    </section>
  );
}

export function AdminTherapistApprovalsPage() {
  const { approvals, selectedApproval, isLoading, error, fetchApprovals, selectApproval, approveApplication, rejectApplication } = useAdminApprovalStore();
  const [status, setStatus] = useState<TherapistApproval["status"] | "all">("pending_approval");
  const [rejectTarget, setRejectTarget] = useState<TherapistApproval | null>(null);

  useEffect(() => {
    void fetchApprovals(status);
  }, [fetchApprovals, status]);

  return (
    <section>
      <AdminPageHeader eyebrow="Therapist Approval" title="Duyệt hồ sơ kỹ thuật viên" description="Rà soát chứng chỉ, kinh nghiệm và chuyên môn của KTV trước khi mở quyền nhận booking trên JvJ." icon={<UserCheck className="h-7 w-7" />} />
      <div className="mb-md flex flex-wrap gap-sm">
        {(["pending_approval", "approved", "rejected", "all"] as const).map((item) => (
          <button key={item} type="button" onClick={() => setStatus(item)} className={`rounded-full px-md py-sm text-body-sm font-black transition-colors ${status === item ? "bg-primary text-white" : "bg-white text-sage-secondary hover:bg-soft-mint"}`}>
            {item === "pending_approval" ? "Chờ duyệt" : item === "approved" ? "Đã duyệt" : item === "rejected" ? "Từ chối" : "Tất cả"}
          </button>
        ))}
      </div>
      {isLoading && <LoadingState />}
      {error && <ErrorState message={error} />}
      <div className="grid gap-lg xl:grid-cols-[1fr_360px]">
        <div className="grid gap-md">
          {approvals.length ? (
            approvals.map((approval) => (
              <TherapistApprovalCard key={approval.id} approval={approval} isSelected={selectedApproval?.id === approval.id} onSelect={() => selectApproval(approval.id)} onApprove={() => void approveApplication(approval.id)} onReject={() => setRejectTarget(approval)} />
            ))
          ) : (
            <AdminEmptyState title="Không có hồ sơ trong nhóm này" description="Danh sách duyệt hiện đang trống, Admin có thể chuyển bộ lọc khác." />
          )}
        </div>
        <TherapistApprovalDetail approval={selectedApproval} />
      </div>
      <RejectTherapistDialog open={Boolean(rejectTarget)} therapistName={rejectTarget?.fullName} onClose={() => setRejectTarget(null)} onConfirm={(reason) => {
        if (rejectTarget) void rejectApplication(rejectTarget.id, reason);
        setRejectTarget(null);
      }} />
    </section>
  );
}

export function AdminBookingsPage() {
  const { bookings, selectedBooking, isLoading, error, fetchBookings, selectBooking } = useAdminBookingStore();
  const [keyword, setKeyword] = useState("");
  const [bookingStatus, setBookingStatus] = useState<BookingStatus | "all">("all");
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | "all">("all");

  useEffect(() => {
    void fetchBookings({ keyword, bookingStatus, paymentStatus });
  }, [bookingStatus, fetchBookings, keyword, paymentStatus]);

  return (
    <section>
      <AdminPageHeader eyebrow="Booking Oversight" title="Quản lý booking toàn hệ thống" description="Giám sát trạng thái lịch hẹn, thanh toán VNPAY và các booking có nguy cơ gián đoạn dịch vụ." icon={<ClipboardList className="h-7 w-7" />} />
      <div className="mb-md grid gap-sm lg:grid-cols-[1fr_190px_190px]">
        <AdminSearchBar value={keyword} onChange={setKeyword} placeholder="Tìm mã lịch, khách hàng hoặc KTV" />
        <select value={bookingStatus} onChange={(event) => setBookingStatus(event.target.value as BookingStatus | "all")} className="h-12 rounded-2xl border border-botanical-border bg-white px-md text-body-sm font-black text-ink-primary outline-none focus:border-primary">
          <option value="all">Tất cả booking</option>
          <option value="pending">Chờ xác nhận</option>
          <option value="confirmed">Đã xác nhận</option>
          <option value="in_progress">Đang thực hiện</option>
          <option value="completed">Hoàn tất</option>
          <option value="cancelled">Đã hủy</option>
          <option value="rejected">Từ chối</option>
        </select>
        <select value={paymentStatus} onChange={(event) => setPaymentStatus(event.target.value as PaymentStatus | "all")} className="h-12 rounded-2xl border border-botanical-border bg-white px-md text-body-sm font-black text-ink-primary outline-none focus:border-primary">
          <option value="all">Tất cả thanh toán</option>
          <option value="unpaid">Chưa thanh toán</option>
          <option value="pending">Đang xử lý</option>
          <option value="paid">Đã thanh toán</option>
          <option value="failed">Thất bại</option>
        </select>
      </div>
      {isLoading && <LoadingState />}
      {error && <ErrorState message={error} />}
      <div className="grid gap-lg xl:grid-cols-[1fr_360px]">
        {bookings.length ? <AdminBookingTable bookings={bookings} selectedBookingId={selectedBooking?.id} onSelect={(bookingId) => void selectBooking(bookingId)} /> : <AdminEmptyState title="Không có booking phù hợp" description="Thử đổi trạng thái hoặc từ khóa tìm kiếm." />}
        <AdminBookingDetailDrawer booking={selectedBooking} />
      </div>
    </section>
  );
}

export function AdminSpasPage() {
  const { spas, selectedSpa, isLoading, error, fetchSpas, selectSpa, createSpa, updateSpa, deleteSpa } = useAdminSpaStore();
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState<Spa["status"] | "all">("all");
  const [openForm, setOpenForm] = useState(false);
  const districts = useMemo(() => ["all", ...Array.from(new Set(spas.map((spa) => spa.district)))], [spas]);
  const [district, setDistrict] = useState("all");

  useEffect(() => {
    void fetchSpas({ keyword, status, district });
  }, [district, fetchSpas, keyword, status]);

  return (
    <section>
      <AdminPageHeader eyebrow="Spa Partner" title="Quản lý Spa đối tác" description="Thêm, ẩn/hiện và quản lý các cơ sở Spa đối tác phục vụ gói trị liệu tại Đà Nẵng." icon={<Building2 className="h-7 w-7" />} action={<AdminPrimaryButton onClick={() => setOpenForm(true)}><Plus className="h-4 w-4" />Thêm Spa</AdminPrimaryButton>} />
      <div className="mb-md grid gap-sm lg:grid-cols-[1fr_180px_180px]">
        <AdminSearchBar value={keyword} onChange={setKeyword} placeholder="Tìm Spa, địa chỉ hoặc số điện thoại" />
        <select value={district} onChange={(event) => setDistrict(event.target.value)} className="h-12 rounded-2xl border border-botanical-border bg-white px-md text-body-sm font-black text-ink-primary outline-none focus:border-primary">
          {districts.map((item) => <option key={item} value={item}>{item === "all" ? "Tất cả khu vực" : item}</option>)}
        </select>
        <select value={status} onChange={(event) => setStatus(event.target.value as Spa["status"] | "all")} className="h-12 rounded-2xl border border-botanical-border bg-white px-md text-body-sm font-black text-ink-primary outline-none focus:border-primary">
          <option value="all">Tất cả trạng thái</option>
          <option value="active">Đang hiển thị</option>
          <option value="hidden">Đã ẩn</option>
        </select>
      </div>
      {isLoading && <LoadingState />}
      {error && <ErrorState message={error} />}
      <div className="mb-md flex flex-wrap gap-sm">
        <AdminStatusBadge tone="teal">{spas.length} Spa trong bộ lọc</AdminStatusBadge>
        <AdminSecondaryButton onClick={() => void fetchSpas({ keyword, status, district })}>Làm mới</AdminSecondaryButton>
      </div>
      <div className="grid gap-lg xl:grid-cols-[1fr_360px]">
        {spas.length ? <SpaManagementTable spas={spas} selectedSpaId={selectedSpa?.id} onSelect={selectSpa} onHide={(spaId, currentStatus) => void updateSpa(spaId, { status: currentStatus === "active" ? "hidden" : "active" })} onDelete={(spaId) => void deleteSpa(spaId)} /> : <AdminEmptyState title="Không có Spa phù hợp" description="Thử đổi bộ lọc hoặc thêm Spa đối tác mới." />}
        <SpaDetailDrawer spa={selectedSpa} />
      </div>
      <SpaFormDialog open={openForm} onClose={() => setOpenForm(false)} onSubmit={(data: SpaFormInput) => {
        void createSpa(data);
        setOpenForm(false);
      }} />
    </section>
  );
}

