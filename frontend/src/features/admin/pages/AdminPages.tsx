import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Building2, ClipboardList, Link2, Pencil, Plus, ShieldCheck, Sparkles, Star, User, UserCheck, Users, X } from "lucide-react";
import { type AdminAccountStatus, type TherapistApproval } from "@/types/admin";
import { type BookingStatus, type PaymentStatus } from "@/types/booking";
import { type Spa, type SpaFormInput } from "@/types/spa";
import { type UserRole } from "@/types/user";
import { AdminBookingDetailDrawer } from "../components/AdminBookingDetailDrawer";
import { AdminBookingTable } from "../components/AdminBookingTable";
import { AdminOverviewPanels } from "../components/AdminOverviewPanels";
import { CredentialUpdateCard } from "../components/CredentialUpdateCard";
import { CredentialUpdateDetail } from "../components/CredentialUpdateDetail";
import { DeleteSpaDialog } from "../components/DeleteSpaDialog";
import { LinkTreatmentsDialog } from "../components/LinkTreatmentsDialog";
import { RejectTherapistDialog } from "../components/RejectTherapistDialog";
import { SpaDetailDrawer } from "../components/SpaDetailDrawer";
import { SpaFormDialog } from "../components/SpaFormDialog";
import { SpaGallery } from "@/features/spas/components/SpaGallery";
import { SpaManagementCard } from "../components/SpaManagementCard";
import { TherapistApprovalCard } from "../components/TherapistApprovalCard";
import { TherapistApprovalDetail } from "../components/TherapistApprovalDetail";
import { UnlinkTreatmentDialog } from "../components/UnlinkTreatmentDialog";
import { UserDetailDrawer } from "../components/UserDetailDrawer";
import { UserManagementTable } from "../components/UserManagementTable";
import { AdminEmptyState, AdminPrimaryButton, AdminSearchBar, AdminSecondaryButton, AdminStatusBadge } from "../components/shared";
import { useAdminApprovalStore } from "../stores/admin-approval-store";
import { useAdminBookingStore } from "../stores/admin-booking-store";
import { useAdminOverviewStore } from "../stores/admin-overview-store";
import { useAdminSpaStore } from "../stores/admin-spa-store";
import { useAdminUserStore } from "../stores/admin-user-store";
import { formatRating } from "@/features/public/lib/formatters";
import { createSpa, getAdminSpaDetail, getAvailableTreatments, linkTreatmentsToSpa, refreshSpaDetail, unlinkTreatmentsFromSpa, updateSpa } from "../services/admin-spa-service";

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
  const { approvals, selectedApproval, isLoading, error, fetchApprovals, selectApproval, approveApplication, rejectApplication, credentialUpdates, selectedCredentialUpdate, fetchCredentialUpdates, selectCredentialUpdate, approveCredential, rejectCredential } = useAdminApprovalStore();
  const [approvalStatus, setApprovalStatus] = useState<TherapistApproval["status"] | "all">("pending_approval");
  const [activeTab, setActiveTab] = useState<"approvals" | "credential_update">("approvals");
  const [rejectTarget, setRejectTarget] = useState<TherapistApproval | null>(null);
  const [credentialUpdateStatus, setCredentialUpdateStatus] = useState<string>("pending");

  useEffect(() => {
    void fetchApprovals(approvalStatus);
  }, [fetchApprovals, approvalStatus]);

  useEffect(() => {
    if (activeTab === "credential_update") {
      void fetchCredentialUpdates(credentialUpdateStatus);
    }
  }, [activeTab, fetchCredentialUpdates, credentialUpdateStatus]);

  return (
    <section>
      <AdminPageHeader eyebrow="Therapist Approval" title="Duyệt hồ sơ kỹ thuật viên" description="Rà soát chứng chỉ, kinh nghiệm và chuyên môn của KTV trước khi mở quyền nhận booking trên JvJ." icon={<UserCheck className="h-7 w-7" />} />
      {/* Tab switcher */}
      <div className="mb-md flex flex-wrap gap-sm">
        <button type="button" onClick={() => setActiveTab("approvals")} className={`rounded-full px-md py-sm text-body-sm font-black transition-colors ${activeTab === "approvals" ? "bg-primary text-white" : "bg-white text-sage-secondary hover:bg-soft-mint"}`}>
          Hồ sơ đăng ký
        </button>
        <button type="button" onClick={() => setActiveTab("credential_update")} className={`rounded-full px-md py-sm text-body-sm font-black transition-colors ${activeTab === "credential_update" ? "bg-primary text-white" : "bg-white text-sage-secondary hover:bg-soft-mint"}`}>
          Cập nhật giấy tờ
        </button>
      </div>

      {activeTab === "approvals" ? (
        <>
          <div className="mb-md flex flex-wrap gap-sm">
            {(["pending_approval", "approved", "rejected", "all"] as const).map((item) => (
              <button key={item} type="button" onClick={() => setApprovalStatus(item)} className={`rounded-full px-md py-sm text-body-sm font-black transition-colors ${approvalStatus === item ? "bg-primary text-white" : "bg-white text-sage-secondary hover:bg-soft-mint"}`}>
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
        </>
      ) : (
        <>
          <div className="mb-md flex flex-wrap gap-sm">
            {(["pending", "approved", "rejected", "all"] as const).map((item) => (
              <button key={item} type="button" onClick={() => setCredentialUpdateStatus(item)} className={`rounded-full px-md py-sm text-body-sm font-black transition-colors ${credentialUpdateStatus === item ? "bg-primary text-white" : "bg-white text-sage-secondary hover:bg-soft-mint"}`}>
                {item === "pending" ? "Chờ duyệt" : item === "approved" ? "Đã duyệt" : item === "rejected" ? "Từ chối" : "Tất cả"}
              </button>
            ))}
          </div>
          {isLoading && <LoadingState />}
          {error && <ErrorState message={error} />}
          <div className="grid gap-lg xl:grid-cols-[1fr_360px]">
            <div className="grid gap-md">
              {credentialUpdates.length ? (
                credentialUpdates.map((update) => (
                  <CredentialUpdateCard key={update.id} update={update} isSelected={selectedCredentialUpdate?.id === update.id} onSelect={() => selectCredentialUpdate(update.id)} onApprove={() => void approveCredential(update.id)} onReject={() => void rejectCredential(update.id)} />
                ))
              ) : (
                <AdminEmptyState title="Không có yêu cầu cập nhật" description="Danh sách cập nhật giấy tờ đang trống." />
              )}
            </div>
            <CredentialUpdateDetail update={selectedCredentialUpdate} />
          </div>
        </>
      )}
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
  const { spas, selectedSpa, isLoading, error, fetchSpas, selectSpa, updateSpa, deleteSpa } = useAdminSpaStore();
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState<Spa["status"] | "all">("all");
  const districts = useMemo(() => ["all", ...Array.from(new Set(spas.map((spa) => spa.district)))], [spas]);
  const [district, setDistrict] = useState("all");
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

  useEffect(() => {
    void fetchSpas({ keyword, status, district });
  }, [district, fetchSpas, keyword, status]);

  const handleOpenEdit = (spa: Spa) => {
    navigate(`/admin/spas/${spa.id}`);
  };

  return (
    <section>
      <AdminPageHeader eyebrow="Spa Partner" title="Quản lý Spa đối tác" description="Thêm, ẩn/hiện và quản lý các cơ sở Spa đối tác phục vụ gói trị liệu tại Đà Nẵng." icon={<Building2 className="h-7 w-7" />} action={<AdminPrimaryButton onClick={() => navigate("/admin/spas/new")}><Plus className="h-4 w-4" />Thêm Spa</AdminPrimaryButton>} />
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
        <div className="grid gap-md">
          {spas.length ? (
            spas.map((spa) => (
              <SpaManagementCard
                key={spa.id}
                spa={spa}
                isSelected={selectedSpa?.id === spa.id}
                onSelect={() => selectSpa(spa.id)}
                onHide={() => void updateSpa(spa.id, { status: spa.status === "active" ? "hidden" : "active" })}
                onDelete={() => setDeleteTarget({ id: spa.id, name: spa.name })}
                onEdit={handleOpenEdit}
              />
            ))
          ) : (
            <AdminEmptyState title="Không có Spa phù hợp" description="Thử đổi bộ lọc hoặc thêm Spa đối tác mới." />
          )}
        </div>
        <SpaDetailDrawer spa={selectedSpa} />
      </div>
      <DeleteSpaDialog
        open={Boolean(deleteTarget)}
        spaName={deleteTarget?.name ?? ""}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) void deleteSpa(deleteTarget.id);
          setDeleteTarget(null);
        }}
      />
    </section>
  );
}

export function AdminSpaDetailPage() {
  const { spaId } = useParams<{ spaId: string }>();
  const navigate = useNavigate();
  const [spa, setSpa] = useState<Spa | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [openLinkDialog, setOpenLinkDialog] = useState(false);
  const [unlinkTarget, setUnlinkTarget] = useState<{ id: string; name: string } | null>(null);

  useEffect(() => {
    if (!spaId) return;
    setIsLoading(true);
    setError(null);
    refreshSpaDetail(spaId)
      .then(setSpa)
      .catch((err) => setError((err as Error).message))
      .finally(() => setIsLoading(false));
  }, [spaId]);

  const handleUpdate = async (data: SpaFormInput) => {
    if (!spaId) return;
    const updated = await updateSpa(spaId, data);
    setSpa(updated);
    setIsEditing(false);
  };

  const handleUnlink = async (treatmentId: string) => {
    if (!spaId || !spa) return;
    await unlinkTreatmentsFromSpa(spaId, [treatmentId], spa.linkedTreatments.map((t) => t.id));
    const refreshed = await refreshSpaDetail(spaId);
    setSpa(refreshed);
    setUnlinkTarget(null);
  };

  const handleLink = async (treatmentIds: string[]) => {
    if (!spaId) return;
    await linkTreatmentsToSpa(spaId, treatmentIds);
    const refreshed = await refreshSpaDetail(spaId);
    setSpa(refreshed);
    setOpenLinkDialog(false);
  };

  if (isLoading) {
    return <div className="rounded-[2rem] border border-botanical-border bg-white p-xl text-center text-body-md font-black text-primary shadow-stitch-soft">Đang tải thông tin Spa...</div>;
  }

  if (error || !spa) {
    return (
      <div className="space-y-md">
        <div className="rounded-[2rem] border border-red-200 bg-red-50 p-lg text-body-sm font-black text-[#B91C1C]">{error ?? "Không tìm thấy Spa"}</div>
        <AdminSecondaryButton onClick={() => navigate("/admin/spas")}>← Quay lại danh sách</AdminSecondaryButton>
      </div>
    );
  }

  const rating = spa.linkedTreatmentCount > 0
    ? (spa.linkedTreatments.reduce((sum, t) => sum + t.rating, 0) / spa.linkedTreatmentCount).toFixed(1)
    : "—";

  return (
    <PageShell>
      <PageHeader
        eyebrow="Spa Partner"
        title={spa.name}
        description="Thông tin chi tiết, quản lý trạng thái và liên kết liệu trình của Spa đối tác."
        action={
          <div className="flex flex-wrap gap-sm">
            <AdminSecondaryButton onClick={() => navigate("/admin/spas")}>← Quay lại</AdminSecondaryButton>
            <AdminPrimaryButton onClick={() => setIsEditing(true)}>
              <Pencil className="h-4 w-4" /> Chỉnh sửa hồ sơ
            </AdminPrimaryButton>
          </div>
        }
      />

      <div className="grid gap-lg xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="space-y-lg">
          {/* Gallery */}
          {spa.imageUrls.length > 0 && (
            <SpaGallery images={spa.imageUrls} spaName={spa.name} />
          )}

          {/* Basic info */}
          <section className="rounded-[2rem] border border-botanical-border bg-white p-lg shadow-stitch-soft">
            <h2 className="mb-lg flex items-center gap-sm text-xl font-black text-ink-primary"><Building2 className="h-5 w-5 text-primary" /> Thông tin cơ bản</h2>
            <div className="grid gap-lg lg:grid-cols-[160px_minmax(0,1fr)]">
              <div className="flex flex-col items-center gap-xs text-center">
                <div className="flex h-32 w-32 items-center justify-center rounded-[1.5rem] bg-soft-mint text-primary">
                  <Building2 className="h-14 w-14" />
                </div>
                <AdminStatusBadge tone={spa.status === "active" ? "green" : "slate"}>
                  {spa.status === "active" ? "Đang hiển thị" : "Đã ẩn"}
                </AdminStatusBadge>
              </div>
              <div className="grid gap-md md:grid-cols-2">
                <div>
                  <label className="mb-xs block text-body-sm font-black text-ink-primary">Tên Spa</label>
                  <div className="flex h-12 items-center rounded-2xl border border-botanical-border bg-warm-bg px-md text-body-sm font-semibold text-ink-primary">{spa.name}</div>
                </div>
                <div>
                  <label className="mb-xs block text-body-sm font-black text-ink-primary">Khu vực</label>
                  <div className="flex h-12 items-center rounded-2xl border border-botanical-border bg-warm-bg px-md text-body-sm font-semibold text-ink-primary">{spa.district}</div>
                </div>
                <div>
                  <label className="mb-xs block text-body-sm font-black text-ink-primary">Điện thoại</label>
                  <div className="flex h-12 items-center rounded-2xl border border-botanical-border bg-warm-bg px-md text-body-sm font-semibold text-ink-primary">{spa.phone}</div>
                </div>
                <div>
                  <label className="mb-xs block text-body-sm font-black text-ink-primary">Email</label>
                  <div className="flex h-12 items-center rounded-2xl border border-botanical-border bg-warm-bg px-md text-body-sm font-semibold text-ink-primary">{spa.email}</div>
                </div>
                <div>
                  <label className="mb-xs block text-body-sm font-black text-ink-primary">Giờ mở cửa</label>
                  <div className="flex h-12 items-center gap-sm rounded-2xl border border-botanical-border bg-warm-bg px-md text-body-sm font-semibold text-ink-primary">
                    {spa.openTime} – {spa.closeTime}
                  </div>
                </div>
                <div>
                  <label className="mb-xs block text-body-sm font-black text-ink-primary">Địa chỉ</label>
                  <div className="flex h-12 items-center rounded-2xl border border-botanical-border bg-warm-bg px-md text-body-sm font-semibold text-ink-primary">{spa.address}</div>
                </div>
              </div>
            </div>
            <div className="mt-lg">
              <label className="mb-xs block text-body-sm font-black text-ink-primary">Mô tả</label>
              <div className="whitespace-pre-wrap rounded-2xl border border-botanical-border bg-warm-bg px-md py-sm text-body-sm font-semibold text-sage-secondary">{spa.description}</div>
            </div>
          </section>

          {/* Linked treatments */}
          <section className="rounded-[2rem] border border-botanical-border bg-white p-lg shadow-stitch-soft">
            <div className="mb-lg flex items-center justify-between">
              <h2 className="inline-flex items-center gap-sm text-xl font-black text-ink-primary">
                <Sparkles className="h-5 w-5 text-primary" /> Liệu trình liên kết
              </h2>
              <AdminSecondaryButton onClick={() => setOpenLinkDialog(true)}>
                <Link2 className="h-4 w-4" /> Liên kết liệu trình
              </AdminSecondaryButton>
            </div>

            {spa.linkedTreatments.length === 0 ? (
              <div className="flex flex-col items-center gap-sm rounded-2xl border-2 border-dashed border-botanical-border bg-warm-bg py-xl text-center">
                <Sparkles className="h-8 w-8 text-sage-secondary" />
                <p className="text-body-sm font-bold text-sage-secondary">Chưa có liệu trình nào được liên kết</p>
                <p className="text-label-caption font-semibold text-sage-secondary">Bấm "Liên kết liệu trình" để thêm liệu trình phục vụ tại Spa này.</p>
              </div>
            ) : (
              <div className="grid gap-sm md:grid-cols-2">
                {spa.linkedTreatments.map((treatment) => (
                  <div key={treatment.id} className="flex gap-sm rounded-2xl border border-botanical-border bg-warm-bg p-sm">
                    <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-surface-container-low">
                      {treatment.imageUrl ? (
                        <img src={treatment.imageUrl} alt={treatment.name} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-sage-secondary"><Sparkles className="h-6 w-6" /></div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-body-sm font-black text-ink-primary">{treatment.name}</p>
                      <p className="truncate text-label-caption font-semibold text-sage-secondary">{treatment.therapistName}</p>
                      <div className="mt-xs flex items-center gap-sm text-label-caption font-bold text-sage-secondary">
                        <span>{treatment.durationMinutes} phút</span>
                        <span>·</span>
                        <span>{treatment.price.toLocaleString()}đ</span>
                        <span>·</span>
                        <span className="flex items-center gap-1"><Star className="h-3 w-3 text-amber-400 fill-amber-400" />{formatRating(Number(treatment.rating))}</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setUnlinkTarget({ id: treatment.id, name: treatment.name })}
                      className="shrink-0 flex h-8 w-8 items-center justify-center rounded-full text-sage-secondary transition-colors hover:bg-red-50 hover:text-red-500"
                      title="Bỏ liên kết"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Sticky sidebar */}
        <aside className="space-y-lg xl:sticky xl:top-24 xl:self-start">
          {/* Profile preview */}
          <section className="overflow-hidden rounded-[2rem] border border-botanical-border bg-white shadow-stitch-soft">
            <div className="border-b border-botanical-border bg-soft-mint p-md text-label-caption font-black uppercase tracking-wider text-primary">Xem trước</div>
            <div className="p-lg text-center">
              <div className="mx-auto mb-md flex h-24 w-24 items-center justify-center rounded-full bg-soft-mint">
                <Building2 className="h-12 w-12 text-primary" />
              </div>
              <h2 className="text-2xl font-black text-ink-primary">{spa.name}</h2>
              <p className="mt-xs text-body-sm font-bold text-sage-secondary">Spa đối tác JvJ</p>
              <div className="my-md grid grid-cols-2 divide-x divide-botanical-border border-y border-botanical-border py-sm">
                <div>
                  <p className="text-xl font-black text-ink-primary">{spa.linkedTreatmentCount}</p>
                  <p className="text-label-caption font-black uppercase text-muted-text">Liệu trình</p>
                </div>
                <div>
                  <p className="text-xl font-black text-ink-primary">{rating}</p>
                  <p className="text-label-caption font-black uppercase text-muted-text">Đánh giá TB</p>
                </div>
              </div>
              <AdminSecondaryButton onClick={() => navigate(`/spas/${spa.id}`)}>Xem trên trang công khai</AdminSecondaryButton>
            </div>
          </section>

          {/* Status toggle */}
          <section className="rounded-[2rem] border border-botanical-border bg-white p-lg shadow-stitch-soft">
            <h2 className="mb-md inline-flex items-center gap-sm text-xl font-black text-ink-primary"><User className="h-5 w-5 text-primary" /> Trạng thái hiển thị</h2>
            <div className="flex items-center justify-between border-b border-botanical-border py-md">
              <div>
                <p className="font-black text-ink-primary">{spa.status === "active" ? "Đang hiển thị" : "Đã ẩn"}</p>
                <p className="text-label-caption font-semibold text-sage-secondary">
                  {spa.status === "active" ? "Khách hàng có thể nhìn thấy Spa này" : "Spa bị ẩn khỏi trang công khai"}
                </p>
              </div>
              <button
                type="button"
                onClick={async () => {
                  if (!spaId) return;
                  const updated = await updateSpa(spaId, { status: spa.status === "active" ? "hidden" : "active" });
                  setSpa(updated);
                }}
                className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${spa.status === "active" ? "bg-primary" : "bg-sage-secondary/30"}`}
              >
                <span className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform ${spa.status === "active" ? "translate-x-7" : "translate-x-1"}`} />
              </button>
            </div>
          </section>
        </aside>
      </div>

      {/* Edit form dialog */}
      <SpaFormDialog open={isEditing} onClose={() => setIsEditing(false)} onSubmit={handleUpdate} spa={spa} />

      {/* Link treatments dialog */}
      <LinkTreatmentsDialog
        open={openLinkDialog}
        spaId={spaId ?? ""}
        currentLinkedIds={spa.linkedTreatments.map((t) => t.id)}
        onClose={() => setOpenLinkDialog(false)}
        onLink={handleLink}
      />

      {/* Unlink confirmation */}
      <UnlinkTreatmentDialog
        open={Boolean(unlinkTarget)}
        treatmentName={unlinkTarget?.name ?? ""}
        onClose={() => setUnlinkTarget(null)}
        onConfirm={() => {
          if (unlinkTarget) void handleUnlink(unlinkTarget.id);
        }}
      />
    </PageShell>
  );
}

const emptySpaForm = (): SpaFormInput => ({
  name: "",
  address: "",
  district: "Hải Châu",
  phone: "",
  email: "",
  openTime: "08:00",
  closeTime: "20:00",
  description: "",
  status: "active",
  imageUrls: [],
});

export function AdminSpaAddPage() {
  const navigate = useNavigate();
  const { fetchSpas } = useAdminSpaStore();
  const [step, setStep] = useState<1 | 2>(1);
  const [credentials, setCredentials] = useState<SpaFormInput>(emptySpaForm());
  const [selectedTreatmentIds, setSelectedTreatmentIds] = useState<Set<string>>(new Set());
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [loadingTreatments, setLoadingTreatments] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const fileInputRef = { current: null as HTMLInputElement | null };
  const [uploading, setUploading] = useState(false);

  const currency = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" });

  const update = (field: keyof SpaFormInput, value: string | number) =>
    setCredentials((c) => ({ ...c, [field]: value }));

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const { uploadFile } = await import("@/services/upload-service");
      const urls: string[] = [];
      for (const file of Array.from(files)) {
        urls.push(await uploadFile(file));
      }
      setCredentials((c) => ({ ...c, imageUrls: [...c.imageUrls, ...urls] }));
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index: number) =>
    setCredentials((c) => ({ ...c, imageUrls: c.imageUrls.filter((_, i) => i !== index) }));

  const toggleTreatment = (id: string) =>
    setSelectedTreatmentIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const handleNextStep = async () => {
    setLoadingTreatments(true);
    try {
      const data = await getAvailableTreatments();
      setTreatments(data);
      setStep(2);
    } finally {
      setLoadingTreatments(false);
    }
  };

  const handleFinish = async () => {
    setSubmitting(true);
    setSubmitError(null);
    try {
      const spa = await createSpa(credentials);
      if (selectedTreatmentIds.size > 0) {
        await linkTreatmentsToSpa(spa.id, Array.from(selectedTreatmentIds));
      }
      await fetchSpas();
      navigate("/admin/spas");
    } catch (err) {
      setSubmitError((err as Error).message);
      setSubmitting(false);
    }
  };

  return (
    <section>
      <div className="mb-lg flex items-center gap-md">
        <AdminSecondaryButton onClick={() => navigate("/admin/spas")}>← Quay lại</AdminSecondaryButton>
        <div className="flex-1">
          <p className="text-label-caption font-black uppercase tracking-[0.22em] text-primary">Spa Partner</p>
          <h1 className="text-3xl font-black text-ink-primary">Thêm Spa mới</h1>
        </div>
      </div>

      {/* Stepper */}
      <div className="mb-lg flex items-center gap-sm">
        <div className={`flex h-10 w-10 items-center justify-center rounded-full text-body-sm font-black transition-colors ${step === 1 ? "bg-primary text-white" : "bg-soft-mint text-primary"}`}>1</div>
        <div className={`h-1 flex-1 rounded-full transition-colors ${step === 2 ? "bg-primary" : "bg-botanical-border"}`} />
        <div className={`flex h-10 w-10 items-center justify-center rounded-full text-body-sm font-black transition-colors ${step === 2 ? "bg-primary text-white" : "bg-botanical-border text-sage-secondary"}`}>2</div>
      </div>
      <div className="mb-xl flex gap-lg">
        <span className={`text-body-sm font-black ${step === 1 ? "text-primary" : "text-sage-secondary"}`}>Thông tin Spa</span>
        <span className="flex-1" />
        <span className={`text-body-sm font-black ${step === 2 ? "text-primary" : "text-sage-secondary"}`}>Liên kết liệu trình</span>
      </div>

      {submitError && (
        <div className="mb-md rounded-[2rem] border border-red-200 bg-red-50 p-md text-body-sm font-black text-[#B91C1C]">{submitError}</div>
      )}

      {/* Step 1: Credentials */}
      {step === 1 && (
        <div className="rounded-[2rem] border border-botanical-border bg-white p-lg shadow-stitch-soft">
          <h2 className="mb-lg text-xl font-black text-ink-primary">Thông tin đăng nhập Spa</h2>
          <div className="grid gap-sm md:grid-cols-2">
            <label className="flex flex-col gap-xs">
              <span className="text-label-caption font-black uppercase tracking-[0.14em] text-sage-secondary">Tên Spa</span>
              <input required value={credentials.name} onChange={(e) => update("name", e.target.value)} placeholder="Nhập tên Spa" className="rounded-2xl border border-botanical-border bg-warm-bg px-md py-sm text-body-sm font-semibold outline-none focus:border-primary" />
            </label>
            <label className="flex flex-col gap-xs">
              <span className="text-label-caption font-black uppercase tracking-[0.14em] text-sage-secondary">Quận/Huyện</span>
              <input required value={credentials.district} onChange={(e) => update("district", e.target.value)} placeholder="Nhập quận/huyện" className="rounded-2xl border border-botanical-border bg-warm-bg px-md py-sm text-body-sm font-semibold outline-none focus:border-primary" />
            </label>
            <label className="flex flex-col gap-xs">
              <span className="text-label-caption font-black uppercase tracking-[0.14em] text-sage-secondary">Số điện thoại</span>
              <input required value={credentials.phone} onChange={(e) => update("phone", e.target.value)} placeholder="Nhập số điện thoại" className="rounded-2xl border border-botanical-border bg-warm-bg px-md py-sm text-body-sm font-semibold outline-none focus:border-primary" />
            </label>
            <label className="flex flex-col gap-xs">
              <span className="text-label-caption font-black uppercase tracking-[0.14em] text-sage-secondary">Email</span>
              <input required type="email" value={credentials.email} onChange={(e) => update("email", e.target.value)} placeholder="Nhập email" className="rounded-2xl border border-botanical-border bg-warm-bg px-md py-sm text-body-sm font-semibold outline-none focus:border-primary" />
            </label>
            <label className="flex flex-col gap-xs">
              <span className="text-label-caption font-black uppercase tracking-[0.14em] text-sage-secondary">Giờ mở</span>
              <input required value={credentials.openTime} onChange={(e) => update("openTime", e.target.value)} className="rounded-2xl border border-botanical-border bg-warm-bg px-md py-sm text-body-sm font-semibold outline-none focus:border-primary" />
            </label>
            <label className="flex flex-col gap-xs">
              <span className="text-label-caption font-black uppercase tracking-[0.14em] text-sage-secondary">Giờ đóng</span>
              <input required value={credentials.closeTime} onChange={(e) => update("closeTime", e.target.value)} className="rounded-2xl border border-botanical-border bg-warm-bg px-md py-sm text-body-sm font-semibold outline-none focus:border-primary" />
            </label>
          </div>
          <label className="mt-sm flex flex-col gap-xs">
            <span className="text-label-caption font-black uppercase tracking-[0.14em] text-sage-secondary">Địa chỉ</span>
            <input required value={credentials.address} onChange={(e) => update("address", e.target.value)} placeholder="Nhập địa chỉ đầy đủ" className="rounded-2xl border border-botanical-border bg-warm-bg px-md py-sm text-body-sm font-semibold outline-none focus:border-primary" />
          </label>
          <label className="mt-sm flex flex-col gap-xs">
            <span className="text-label-caption font-black uppercase tracking-[0.14em] text-sage-secondary">Mô tả ngắn</span>
            <textarea required value={credentials.description} onChange={(e) => update("description", e.target.value)} placeholder="Nhập mô tả ngắn" rows={3} className="rounded-2xl border border-botanical-border bg-warm-bg px-md py-sm text-body-sm font-semibold outline-none focus:border-primary" />
          </label>
          <label className="mt-sm flex flex-col gap-xs">
            <span className="text-label-caption font-black uppercase tracking-[0.14em] text-sage-secondary">Hình ảnh Spa</span>
            <div className="flex flex-wrap gap-sm">
              {credentials.imageUrls.map((url, i) => (
                <div key={i} className="relative h-24 w-24 overflow-hidden rounded-2xl border border-botanical-border">
                  <img src={url} alt="" className="h-full w-full object-cover" />
                  <button type="button" onClick={() => removeImage(i)} className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-ink-primary/70 text-white hover:bg-red-500">✕</button>
                </div>
              ))}
              <label className={`relative flex h-24 w-24 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-botanical-border bg-warm-bg transition ${uploading ? "cursor-wait opacity-60" : "hover:border-primary hover:bg-soft-mint"}`}>
                {uploading ? (
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                ) : (
                  <span className="text-2xl text-primary">+</span>
                )}
                <input ref={fileInputRef as React.RefObject<HTMLInputElement>} type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={handleFileSelect} disabled={uploading} className="hidden" />
              </label>
            </div>
          </label>
          <div className="mt-lg flex justify-end">
            <AdminPrimaryButton onClick={handleNextStep}>Tiếp theo →</AdminPrimaryButton>
          </div>
        </div>
      )}

      {/* Step 2: Link Treatments */}
      {step === 2 && (
        <div className="space-y-lg">
          <div className="rounded-[2rem] border border-botanical-border bg-white p-lg shadow-stitch-soft">
            <div className="mb-md flex items-center justify-between">
              <h2 className="text-xl font-black text-ink-primary">Liên kết liệu trình</h2>
              <AdminStatusBadge tone="teal">{selectedTreatmentIds.size} đã chọn</AdminStatusBadge>
            </div>
            {loadingTreatments ? (
              <div className="py-xl text-center text-body-sm font-black text-primary">Đang tải liệu trình...</div>
            ) : treatments.length === 0 ? (
              <div className="py-xl text-center text-body-sm font-black text-sage-secondary">Không có liệu trình nào khả dụng.</div>
            ) : (
              <div className="grid gap-sm md:grid-cols-2">
                {treatments.map((t) => {
                  const checked = selectedTreatmentIds.has(t.id);
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => toggleTreatment(t.id)}
                      className={`flex items-center gap-md rounded-2xl border p-md text-left transition-colors ${checked ? "border-primary bg-soft-mint" : "border-botanical-border bg-warm-bg hover:border-primary"}`}
                    >
                      <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 text-xs font-black transition-colors ${checked ? "border-primary bg-primary text-white" : "border-botanical-border text-transparent"}`}>
                        ✓
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-body-sm font-black text-ink-primary truncate">{t.name}</p>
                        <p className="text-label-caption font-semibold text-sage-secondary">{currency.format(t.price)} · {t.duration_minutes} phút</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
          <div className="flex justify-between gap-sm">
            <AdminSecondaryButton onClick={() => setStep(1)}>← Quay lại</AdminSecondaryButton>
            <AdminPrimaryButton onClick={handleFinish} disabled={submitting}>
              {submitting ? "Đang lưu..." : "Hoàn tất"}
            </AdminPrimaryButton>
          </div>
        </div>
      )}
    </section>
  );
}
