import { FileBadge, Mail, Phone, ShieldCheck } from "lucide-react";
import { type TherapistApproval } from "@/types/admin";
import { AdminEmptyState } from "./shared";

export function CredentialUpdateDetail({
  update,
}: {
  update: TherapistApproval | null;
}) {
  if (!update) {
    return (
      <AdminEmptyState
        title="Chọn yêu cầu cập nhật"
        description="Admin xem chi tiết CCCD và chứng chỉ mới trước khi duyệt hoặc hủy."
      />
    );
  }

  const hasNewCccdFront = Boolean(update.pendingCitizenIdFrontUrl);
  const hasNewCccdBack = Boolean(update.pendingCitizenIdBackUrl);
  const newCerts = update.pendingCertificateUrls;

  return (
    <aside className="rounded-[2rem] border border-botanical-border bg-white p-lg shadow-stitch-soft">
      <p className="text-label-caption font-black uppercase tracking-[0.2em] text-amber-600">Cập nhật giấy tờ KTV</p>
      <h2 className="mt-xs text-2xl font-black text-ink-primary">{update.fullName}</h2>

      <div className="mt-lg space-y-sm">
        {/* Current contact */}
        <div className="rounded-[1.5rem] bg-warm-bg p-md">
          <div className="flex items-center gap-xs text-body-sm font-black text-ink-primary">
            <Mail className="h-4 w-4 text-primary" />
            {update.email}
          </div>
          <div className="mt-xs flex items-center gap-xs text-body-sm font-black text-ink-primary">
            <Phone className="h-4 w-4 text-primary" />
            {update.phone}
          </div>
        </div>

        {/* CCCD updates */}
        {(hasNewCccdFront || hasNewCccdBack) && (
          <div className="rounded-[1.5rem] bg-amber-50 p-md">
            <p className="flex items-center gap-xs text-label-caption font-black uppercase tracking-[0.16em] text-amber-600">
              <ShieldCheck className="h-4 w-4" />CCCD mới
            </p>
            <div className="mt-sm grid gap-sm sm:grid-cols-2">
              {hasNewCccdFront && (
                <div>
                  <p className="text-label-caption font-black text-sage-secondary">Mặt trước</p>
                  <img
                    src={update.pendingCitizenIdFrontUrl}
                    alt="CCCD mặt trước"
                    className="mt-xs max-h-32 w-full rounded-2xl object-cover"
                  />
                </div>
              )}
              {hasNewCccdBack && (
                <div>
                  <p className="text-label-caption font-black text-sage-secondary">Mặt sau</p>
                  <img
                    src={update.pendingCitizenIdBackUrl}
                    alt="CCCD mặt sau"
                    className="mt-xs max-h-32 w-full rounded-2xl object-cover"
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* New certificates */}
        {newCerts.length > 0 && (
          <div className="rounded-[1.5rem] bg-teal-50 p-md">
            <p className="flex items-center gap-xs text-label-caption font-black uppercase tracking-[0.16em] text-teal-600">
              <FileBadge className="h-4 w-4" />Chứng chỉ mới ({newCerts.length})
            </p>
            <div className="mt-sm grid gap-sm sm:grid-cols-2">
              {newCerts.map((url, i) => (
                <div key={url + i} className="flex flex-col gap-xs">
                  <p className="text-label-caption font-black text-sage-secondary">Chứng chỉ #{i + 1}</p>
                  <img
                    src={url}
                    alt={`Chứng chỉ ${i + 1}`}
                    className="max-h-40 w-full rounded-2xl border border-teal-100 object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
