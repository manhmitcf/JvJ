import { FileBadge, Mail, Phone } from "lucide-react";
import { type TherapistApproval } from "@/types/admin";
import { AdminEmptyState, AdminStatusBadge } from "./shared";

export function TherapistApprovalDetail({ approval }: { approval: TherapistApproval | null }) {
  if (!approval) {
    return <AdminEmptyState title="Chọn hồ sơ KTV" description="Admin có thể xem thông tin, chuyên môn và chứng chỉ trước khi duyệt." />;
  }

  return (
    <aside className="rounded-[2rem] border border-botanical-border bg-white p-lg shadow-stitch-soft">
      <div className="flex items-start justify-between gap-md">
        <div>
          <p className="text-label-caption font-black uppercase tracking-[0.2em] text-primary">Chi tiết hồ sơ</p>
          <h2 className="mt-xs text-2xl font-black text-ink-primary">{approval.fullName}</h2>
          <p className="mt-xs text-body-sm font-semibold text-sage-secondary">{approval.yearsOfExperience} năm kinh nghiệm · {approval.specialties.join(", ")}</p>
        </div>
        <AdminStatusBadge tone={approval.status === "approved" ? "green" : approval.status === "rejected" ? "red" : "amber"}>{approval.status}</AdminStatusBadge>
      </div>

      <div className="mt-lg space-y-sm">
        <div className="rounded-[1.5rem] bg-warm-bg p-md">
          <p className="flex items-center gap-xs text-body-sm font-black text-ink-primary"><Mail className="h-4 w-4 text-primary" />{approval.email}</p>
          <p className="mt-xs flex items-center gap-xs text-body-sm font-black text-ink-primary"><Phone className="h-4 w-4 text-primary" />{approval.phone}</p>
        </div>
        <div className="rounded-[1.5rem] bg-warm-bg p-md">
          <p className="text-label-caption font-black uppercase tracking-[0.16em] text-sage-secondary">Chứng chỉ</p>
          <div className="mt-sm space-y-xs">
            {approval.certificateUrls.map((certificate, index) => (
              <div key={certificate} className="flex items-center gap-xs rounded-2xl bg-white px-sm py-xs text-body-sm font-bold text-ink-primary">
                <FileBadge className="h-4 w-4 text-primary" /> Chứng chỉ #{index + 1}
              </div>
            ))}
          </div>
        </div>
        {approval.rejectionReason && (
          <div className="rounded-[1.5rem] border border-red-200 bg-red-50 p-md">
            <p className="text-body-sm font-black text-[#B91C1C]">Lý do từ chối</p>
            <p className="mt-xs text-body-sm font-semibold text-[#B91C1C]">{approval.rejectionReason}</p>
          </div>
        )}
      </div>
    </aside>
  );
}
