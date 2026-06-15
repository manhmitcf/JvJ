import { AlertTriangle } from "lucide-react";
import { AdminPrimaryButton, AdminSecondaryButton } from "./shared";

interface UnlinkTreatmentDialogProps {
  open: boolean;
  treatmentName: string;
  onClose: () => void;
  onConfirm: () => void;
}

export function UnlinkTreatmentDialog({ open, treatmentName, onClose, onConfirm }: UnlinkTreatmentDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-primary/35 px-md backdrop-blur-sm">
      <div className="w-full max-w-md rounded-[2rem] border border-botanical-border bg-white p-lg shadow-stitch-soft">
        <div className="mb-md flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 text-amber-600">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <p className="text-label-caption font-black uppercase tracking-[0.2em] text-amber-600">Bỏ liên kết</p>
        <h2 className="mt-xs text-2xl font-black text-ink-primary">Bỏ liên kết liệu trình?</h2>
        <p className="mt-sm text-body-sm font-semibold text-sage-secondary">
          Liệu trình <strong className="font-black text-ink-primary">{treatmentName}</strong> sẽ không còn hiển thị tại Spa này. Bạn có thể liên kết lại bất kỳ lúc nào.
        </p>
        <div className="mt-lg flex justify-end gap-sm">
          <AdminSecondaryButton onClick={onClose}>Hủy</AdminSecondaryButton>
          <AdminPrimaryButton onClick={onConfirm} className="!bg-amber-600 !text-white hover:!bg-amber-700">Bỏ liên kết</AdminPrimaryButton>
        </div>
      </div>
    </div>
  );
}
