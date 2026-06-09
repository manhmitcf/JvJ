import { Award, CheckCircle2, XCircle } from "lucide-react";
import { type TherapistApproval } from "@/types/admin";
import { AdminPrimaryButton, AdminSecondaryButton, AdminStatusBadge } from "./shared";

export function TherapistApprovalCard({ approval, isSelected, onSelect, onApprove, onReject }: { approval: TherapistApproval; isSelected: boolean; onSelect: () => void; onApprove: () => void; onReject: () => void }) {
  const tone = approval.status === "approved" ? "green" : approval.status === "rejected" ? "red" : "amber";

  return (
    <article className={`rounded-[2rem] border bg-white p-lg shadow-stitch-soft transition-colors ${isSelected ? "border-primary" : "border-botanical-border"}`}>
      <button type="button" onClick={onSelect} className="w-full text-left">
        <div className="flex items-start gap-md">
          <div className="flex h-14 w-14 items-center justify-center rounded-[1.5rem] bg-soft-mint text-xl font-black text-primary">{approval.fullName?.charAt(0) || "?"}</div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-start justify-between gap-sm">
              <div>
                <h3 className="text-xl font-black text-ink-primary">{approval.fullName}</h3>
                <p className="text-body-sm font-semibold text-sage-secondary">Nộp hồ sơ {approval.submittedAt}</p>
              </div>
              <AdminStatusBadge tone={tone}>{approval.status === "pending_approval" ? "Chờ duyệt" : approval.status === "approved" ? "Đã duyệt" : "Từ chối"}</AdminStatusBadge>
            </div>
            <div className="mt-md flex flex-wrap gap-xs">
              {approval.specialties.map((specialty) => (
                <span key={specialty} className="rounded-full bg-warm-bg px-sm py-1 text-label-caption font-black text-sage-secondary">{specialty}</span>
              ))}
            </div>
          </div>
        </div>
      </button>

      <div className="mt-md grid gap-sm rounded-[1.5rem] bg-warm-bg p-md text-body-sm font-semibold text-sage-secondary sm:grid-cols-2">
        <span className="flex items-center gap-xs"><Award className="h-4 w-4 text-primary" />{approval.yearsOfExperience} năm kinh nghiệm</span>
        <span>{approval.certificateUrls.length} chứng chỉ đã tải lên</span>
      </div>

      {approval.status === "pending_approval" && (
        <div className="mt-md flex flex-wrap gap-sm">
          <AdminPrimaryButton onClick={onApprove}><CheckCircle2 className="h-4 w-4" />Duyệt hồ sơ</AdminPrimaryButton>
          <AdminSecondaryButton tone="danger" onClick={onReject}><XCircle className="h-4 w-4" />Từ chối</AdminSecondaryButton>
        </div>
      )}
    </article>
  );
}
