import { useState } from "react";
import { Trash2, X } from "lucide-react";
import { PrimaryButton, SecondaryButton, StatusBadge } from "./shared";
import { TextField } from "./TreatmentFormFields";
import { type TimeSlot } from "@/types/schedule";

type SlotFormProps = {
  image: string;
  slots: TimeSlot[];
  onCreate: (slot: { date: string; startTime: string; endTime: string }) => Promise<void>;
  onDelete: (slotId: string) => Promise<void>;
  onToggleAvailability: (slotId: string, isAvailable: boolean) => Promise<void>;
  onSuccess?: () => void;
};

function validateTimeFormat(time: string): boolean {
  return /^\d{2}:\d{2}$/.test(time);
}

function isEndAfterStart(start: string, end: string): boolean {
  if (!validateTimeFormat(start) || !validateTimeFormat(end)) return false;
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  const startMinutes = sh * 60 + sm;
  const endMinutes = eh * 60 + em;
  return endMinutes > startMinutes;
}

export function SlotFormDialog({ image, slots, onCreate, onDelete, onToggleAvailability, onSuccess }: SlotFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [startTime, setStartTime] = useState("08:00");
  const [endTime, setEndTime] = useState("09:00");
  const [error, setError] = useState("");

  const validate = (): string | null => {
    if (!selectedDate) return "Vui lòng chọn ngày";
    if (!/^\d{4}-\d{2}-\d{2}$/.test(selectedDate)) return "Ngày phải theo định dạng YYYY-MM-DD";
    if (!validateTimeFormat(startTime)) return "Giờ bắt đầu không hợp lệ (HH:MM)";
    if (!validateTimeFormat(endTime)) return "Giờ kết thúc không hợp lệ (HH:MM)";
    if (!isEndAfterStart(startTime, endTime)) return "Giờ kết thúc phải sau giờ bắt đầu";
    return null;
  };

  const handleCreate = async () => {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setError("");
    setIsSubmitting(true);
    try {
      await onCreate({ date: selectedDate, startTime, endTime });
      setIsOpen(false);
      setSelectedDate("");
      setStartTime("08:00");
      setEndTime("09:00");
      onSuccess?.();
    } catch (err) {
      setError((err as Error).message || "Đã xảy ra lỗi khi tạo khung giờ");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="overflow-hidden rounded-[2rem] border border-botanical-border bg-white shadow-stitch-soft">
        <img src={image} alt="Quản lý lịch làm việc" className="h-40 w-full object-cover" />
        <div className="p-lg">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-ink-primary">Thêm khung giờ</h2>
            <span className="rounded-full bg-soft-mint px-sm text-label-caption font-black text-primary">{slots.length} khung giờ</span>
          </div>
          <p className="mt-xs text-body-sm font-medium text-sage-secondary">Tạo khung giờ rảnh để khách hàng đặt lịch.</p>
          <PrimaryButton onClick={() => setIsOpen(true)} className="mt-md w-full">
            + Thêm khung giờ
          </PrimaryButton>
        </div>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-md">
          <div className="w-full max-w-md overflow-hidden rounded-[2rem] border border-botanical-border bg-white shadow-stitch-soft">
            <div className="flex items-center justify-between border-b border-botanical-border p-lg">
              <h2 className="text-xl font-black text-ink-primary">Thêm khung giờ mới</h2>
              <button onClick={() => { setIsOpen(false); setError(""); }} className="flex h-10 w-10 items-center justify-center rounded-xl border border-botanical-border transition hover:bg-warm-bg">
                <X className="h-5 w-5 text-ink-primary" />
              </button>
            </div>
            <div className="space-y-md p-lg">
              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-sm text-body-sm font-medium text-red-600">
                  {error}
                </div>
              )}
              <TextField
                label="Ngày (YYYY-MM-DD)"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                placeholder="2026-06-10"
              />
              <div className="grid grid-cols-2 gap-sm">
                <TextField
                  label="Bắt đầu (HH:MM)"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  placeholder="08:00"
                />
                <TextField
                  label="Kết thúc (HH:MM)"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  placeholder="09:00"
                />
              </div>
            </div>
            <div className="flex gap-sm border-t border-botanical-border p-lg">
              <SecondaryButton onClick={() => { setIsOpen(false); setError(""); }} className="flex-1">Hủy</SecondaryButton>
              <PrimaryButton onClick={handleCreate} disabled={isSubmitting} className="flex-1">
                {isSubmitting ? "Đang lưu..." : "Lưu"}
              </PrimaryButton>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export function SlotList({ slots, onDelete, onToggleAvailability }: {
  slots: TimeSlot[];
  onDelete: (slotId: string) => Promise<void>;
  onToggleAvailability: (slotId: string, isAvailable: boolean) => Promise<void>;
}) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (slotId: string) => {
    if (deletingId) return;
    setDeletingId(slotId);
    try {
      await onDelete(slotId);
    } finally {
      setDeletingId(null);
    }
  };

  if (slots.length === 0) {
    return (
      <div className="rounded-[2rem] border border-botanical-border bg-white p-lg text-center">
        <p className="text-body-sm font-medium text-sage-secondary">Chưa có khung giờ nào.</p>
      </div>
    );
  }

  return (
    <div className="space-y-sm">
      {slots.slice(0, 5).map((slot) => (
        <div key={slot.id} className="flex items-center justify-between rounded-2xl border border-botanical-border bg-warm-bg p-sm">
          <div>
            <p className="text-body-sm font-black text-ink-primary">{slot.date} · {slot.startTime}–{slot.endTime}</p>
            <StatusBadge tone={slot.bookingId ? "teal" : slot.isAvailable ? "green" : "slate"}>
              {slot.bookingId ? "Đã có lịch" : slot.isAvailable ? "Khả dụng" : "Tạm khóa"}
            </StatusBadge>
          </div>
          <div className="flex gap-xs">
            <button
              onClick={() => onToggleAvailability(slot.id, !slot.isAvailable)}
              className="flex h-8 w-8 items-center justify-center rounded-xl border border-botanical-border bg-white transition hover:border-primary"
              title={slot.isAvailable ? "Khóa" : "Mở khóa"}
            >
              {slot.isAvailable ? "🔒" : "🔓"}
            </button>
            <button
              onClick={() => handleDelete(slot.id)}
              disabled={deletingId === slot.id}
              className="flex h-8 w-8 items-center justify-center rounded-xl border border-red-200 bg-red-50 text-red-600 transition hover:bg-red-100 disabled:opacity-50"
              title="Xóa"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      ))}
      {slots.length > 5 && (
        <p className="text-center text-label-caption font-bold text-muted-text">+{slots.length - 5} khung giờ khác</p>
      )}
    </div>
  );
}
