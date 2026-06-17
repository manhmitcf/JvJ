import { CheckCircle2, FileBadge, ShieldCheck, XCircle } from "lucide-react";
import { type TherapistApproval } from "@/types/admin";
import { AdminPrimaryButton, AdminSecondaryButton, AdminStatusBadge } from "./shared";

export function CredentialUpdateCard({
  update,
  isSelected,
  onSelect,
  onApprove,
  onReject,
}: {
  update: TherapistApproval;
  isSelected: boolean;
  onSelect: () => void;
  onApprove: () => void;
  onReject: () => void;
}) {
  const hasNewCccd = Boolean(update.pendingCitizenIdFrontUrl || update.pendingCitizenIdBackUrl);
  const newCertCount = update.pendingCertificateUrls.length;
  const hasPendingCredentials = Boolean(update.pendingCitizenIdFrontUrl || update.pendingCitizenIdBackUrl || update.pendingCertificateUrls.length > 0);
  const isPending = update.status === "pending" || (update.status === "none" && hasPendingCredentials);
  const tone = update.status === "approved" ? "green" : update.status === "rejected" ? "red" : "amber";

  return (
    <article className={`rounded-[2rem] border bg-white p-lg shadow-stitch-soft transition-colors ${isSelected ? "border-primary" : "border-botanical-border"}`}>
      <button type="button" onClick={onSelect} className="w-full text-left">
        <div className="flex items-start gap-md">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[1.5rem] bg-amber-50 text-xl font-black text-amber-600">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-start justify-between gap-sm">
              <div>
                <h3 className="text-xl font-black text-ink-primary">{update.fullName}</h3>
                <p className="text-body-sm font-semibold text-sage-secondary">Cập nhật giấy tờ · {update.email}</p>
              </div>
              <AdminStatusBadge tone={tone}>
                {isPending ? "Chờ duyệt" : update.status === "approved" ? "Đã duyệt" : "Từ chối"}
              </AdminStatusBadge>
            </div>
            <div className="mt-sm flex flex-wrap gap-xs">
              {hasNewCccd && (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-sm py-1 text-label-caption font-black text-amber-600">
                  <ShieldCheck className="h-3 w-3" /> CCCD mới
                </span>
              )}
              {newCertCount > 0 && (
                <span className="inline-flex items-center gap-1 rounded-full bg-teal-50 px-sm py-1 text-label-caption font-black text-teal-600">
                  <FileBadge className="h-3 w-3" />+{newCertCount} chứng chỉ
                </span>
              )}
            </div>
          </div>
        </div>
      </button>

      {isPending && (
        <div className="mt-md flex flex-wrap gap-sm">
          <AdminPrimaryButton onClick={onApprove}>
            <CheckCircle2 className="h-4 w-4" />Duyệt cập nhật
          </AdminPrimaryButton>
          <AdminSecondaryButton tone="danger" onClick={onReject}>
            <XCircle className="h-4 w-4" />Hủy yêu cầu
          </AdminSecondaryButton>
        </div>
      )}
    </article>
  );
}
