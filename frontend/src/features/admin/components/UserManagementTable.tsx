import { type AdminAccountStatus, type AdminUserRow } from "@/types/admin";
import { type UserRole } from "@/types/user";
import { AdminSecondaryButton, AdminStatusBadge, AdminTableShell } from "./shared";

const roleLabels: Record<Exclude<UserRole, "guest">, string> = {
  customer: "Customer",
  therapist: "Therapist",
  admin: "Admin",
};

const statusLabels: Record<AdminAccountStatus, string> = {
  active: "Đang hoạt động",
  suspended: "Tạm khóa",
  pending_approval: "Chờ duyệt",
  rejected: "Từ chối",
};

const statusTone: Record<AdminAccountStatus, "green" | "red" | "amber" | "slate"> = {
  active: "green",
  suspended: "red",
  pending_approval: "amber",
  rejected: "slate",
};

export function UserManagementTable({ users, selectedUserId, onSelect, onToggleStatus }: { users: AdminUserRow[]; selectedUserId?: string; onSelect: (userId: string) => void; onToggleStatus: (userId: string) => void }) {
  return (
    <AdminTableShell>
      <div className="grid min-w-[760px] grid-cols-[1.4fr_0.8fr_1fr_0.8fr_0.8fr] gap-md border-b border-botanical-border bg-soft-mint/60 px-lg py-md text-label-caption font-black uppercase tracking-[0.16em] text-sage-secondary">
        <span>Người dùng</span>
        <span>Vai trò</span>
        <span>Liên hệ</span>
        <span>Trạng thái</span>
        <span className="text-right">Thao tác</span>
      </div>
      <div className="divide-y divide-botanical-border overflow-x-auto">
        {users.map((user) => (
          <div key={user.id} className={`grid min-w-[760px] grid-cols-[1.4fr_0.8fr_1fr_0.8fr_0.8fr] items-center gap-md px-lg py-md ${selectedUserId === user.id ? "bg-soft-mint/50" : "bg-white"}`}>
            <button type="button" onClick={() => onSelect(user.id)} className="flex items-center gap-sm text-left">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-soft-mint text-base font-black text-primary">{user.fullName.charAt(0)}</div>
              <div>
                <p className="text-body-sm font-black text-ink-primary">{user.fullName}</p>
                <p className="text-label-caption font-semibold text-sage-secondary">Tham gia {user.joinedAt}</p>
              </div>
            </button>
            <span className="text-body-sm font-bold text-ink-primary">{roleLabels[user.role]}</span>
            <div>
              <p className="text-body-sm font-semibold text-ink-primary">{user.phone}</p>
              <p className="text-label-caption font-semibold text-sage-secondary">{user.email}</p>
            </div>
            <AdminStatusBadge tone={statusTone[user.status]}>{statusLabels[user.status]}</AdminStatusBadge>
            <div className="flex justify-end">
              <AdminSecondaryButton tone={user.status === "suspended" ? "default" : "danger"} onClick={() => onToggleStatus(user.id)}>
                {user.status === "suspended" ? "Mở khóa" : "Tạm khóa"}
              </AdminSecondaryButton>
            </div>
          </div>
        ))}
      </div>
    </AdminTableShell>
  );
}
