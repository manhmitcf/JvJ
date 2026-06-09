import { useState } from "react";
import { AdminPrimaryButton, AdminSecondaryButton } from "./shared";

export function RejectTherapistDialog({ open, therapistName, onClose, onConfirm }: { open: boolean; therapistName?: string; onClose: () => void; onConfirm: (reason: string) => void }) {
  const [reason, setReason] = useState("Thiếu chứng chỉ hành nghề hoặc thông tin kinh nghiệm chưa đủ rõ.");

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-primary/35 px-md backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-[2rem] border border-botanical-border bg-white p-lg shadow-stitch-soft">
        <p className="text-label-caption font-black uppercase tracking-[0.2em] text-[#B91C1C]">Từ chối hồ sơ</p>
        <h2 className="mt-xs text-2xl font-black text-ink-primary">{therapistName ?? "Kỹ thuật viên"}</h2>
        <label className="mt-lg block">
          <span className="text-body-sm font-black text-ink-primary">Lý do gửi cho KTV</span>
          <textarea value={reason} onChange={(event) => setReason(event.target.value)} rows={4} className="mt-xs w-full rounded-2xl border border-botanical-border bg-warm-bg px-md py-sm text-body-sm font-semibold text-ink-primary outline-none focus:border-primary" />
        </label>
        <div className="mt-lg flex justify-end gap-sm">
          <AdminSecondaryButton onClick={onClose}>Hủy</AdminSecondaryButton>
          <AdminPrimaryButton onClick={() => onConfirm(reason)}>Xác nhận từ chối</AdminPrimaryButton>
        </div>
      </div>
    </div>
  );
}
