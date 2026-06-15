import { AlertTriangle } from "lucide-react";
import { AdminPrimaryButton, AdminSecondaryButton } from "./shared";

interface DeleteSpaDialogProps {
  open: boolean;
  spaName: string;
  onClose: () => void;
  onConfirm: () => void;
}

export function DeleteSpaDialog({ open, spaName, onClose, onConfirm }: DeleteSpaDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-primary/35 px-md backdrop-blur-sm">
      <div className="w-full max-w-md rounded-[2rem] border border-botanical-border bg-white p-lg shadow-stitch-soft">
        <div className="mb-md flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <p className="text-label-caption font-black uppercase tracking-[0.2em] text-[#B91C1C]">Xóa Spa</p>
        <h2 className="mt-xs text-2xl font-black text-ink-primary">Bạn có chắc muốn xóa Spa này?</h2>
        <p className="mt-sm text-body-sm font-semibold text-sage-secondary">
          Spa <strong className="font-black text-ink-primary">{spaName}</strong> sẽ bị xóa vĩnh viễn khỏi hệ thống. Hành động này không thể hoàn tác.
        </p>
        <div className="mt-lg flex justify-end gap-sm">
          <AdminSecondaryButton onClick={onClose}>Hủy</AdminSecondaryButton>
          <AdminPrimaryButton onClick={onConfirm} className="!bg-red-600 !text-white hover:!bg-red-700">Xóa vĩnh viễn</AdminPrimaryButton>
        </div>
      </div>
    </div>
  );
}
