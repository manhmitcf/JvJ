import { Mail, Phone, ShieldCheck, UserRound } from "lucide-react";
import { type AdminUserRow } from "@/types/admin";
import { AdminEmptyState, AdminStatusBadge } from "./shared";

export function UserDetailDrawer({ user }: { user: AdminUserRow | null }) {
  if (!user) {
    return <AdminEmptyState title="Chọn một người dùng" description="Thông tin chi tiết tài khoản sẽ hiển thị tại đây để Admin rà soát nhanh." />;
  }

  return (
    <aside className="rounded-[2rem] border border-botanical-border bg-white p-lg shadow-stitch-soft">
      <div className="flex items-start gap-md">
        <div className="flex h-16 w-16 items-center justify-center rounded-[1.5rem] bg-soft-mint text-2xl font-black text-primary">{user.fullName.charAt(0)}</div>
        <div>
          <h2 className="text-2xl font-black text-ink-primary">{user.fullName}</h2>
          <p className="text-body-sm font-semibold text-sage-secondary">ID: {user.id}</p>
          <div className="mt-sm">
            <AdminStatusBadge tone={user.status === "active" ? "green" : user.status === "suspended" ? "red" : "amber"}>{user.status}</AdminStatusBadge>
          </div>
        </div>
      </div>

      <div className="mt-lg space-y-sm">
        <div className="rounded-[1.5rem] bg-warm-bg p-md">
          <p className="text-label-caption font-black uppercase tracking-[0.16em] text-sage-secondary">Vai trò</p>
          <p className="mt-xs flex items-center gap-xs text-body-sm font-black text-ink-primary"><UserRound className="h-4 w-4 text-primary" />{user.role}</p>
        </div>
        <div className="rounded-[1.5rem] bg-warm-bg p-md">
          <p className="text-label-caption font-black uppercase tracking-[0.16em] text-sage-secondary">Email</p>
          <p className="mt-xs flex items-center gap-xs text-body-sm font-black text-ink-primary"><Mail className="h-4 w-4 text-primary" />{user.email}</p>
        </div>
        <div className="rounded-[1.5rem] bg-warm-bg p-md">
          <p className="text-label-caption font-black uppercase tracking-[0.16em] text-sage-secondary">Số điện thoại</p>
          <p className="mt-xs flex items-center gap-xs text-body-sm font-black text-ink-primary"><Phone className="h-4 w-4 text-primary" />{user.phone}</p>
        </div>
        <div className="rounded-[1.5rem] bg-soft-mint p-md">
          <p className="flex items-center gap-xs text-body-sm font-black text-primary"><ShieldCheck className="h-4 w-4" />Theo dõi vận hành</p>
          <p className="mt-xs text-body-sm font-semibold text-sage-secondary">Tài khoản được giám sát trong phạm vi bảo mật, lịch sử booking và trạng thái duyệt hồ sơ.</p>
        </div>
      </div>
    </aside>
  );
}
