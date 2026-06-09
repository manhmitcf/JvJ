import { useState } from "react";

export function RejectBookingDialog({
  onReject,
  onClose
}: {
  onReject: (reason: string) => void;
  onClose: () => void;
}) {
  const [reason, setReason] = useState("Khung giờ này không còn khả dụng, vui lòng chọn lịch khác.");

  const handleSubmit = () => {
    if (reason.trim()) {
      onReject(reason);
    }
  };

  return (
    <div className="mt-lg rounded-2xl border border-[#FECACA] bg-[#FEF2F2] p-md">
      <label className="text-body-sm font-black text-[#B91C1C]">Lý do từ chối</label>
      <textarea
        className="mt-sm min-h-24 w-full rounded-2xl border border-[#FECACA] bg-white p-sm text-body-sm outline-none focus:border-[#B91C1C] focus:ring-2 focus:ring-[#FEE2E2]"
        placeholder="Ví dụ: Khung giờ này không còn khả dụng…"
        value={reason}
        onChange={(e) => setReason(e.target.value)}
      />
      <div className="mt-sm flex gap-sm">
        <button
          onClick={handleSubmit}
          disabled={!reason.trim()}
          className="flex-1 rounded-2xl bg-[#B91C1C] px-md py-sm text-body-sm font-black text-white transition hover:bg-[#991B1B] disabled:cursor-not-allowed disabled:opacity-60"
        >
          Gửi từ chối
        </button>
        <button
          onClick={onClose}
          className="rounded-2xl border border-[#FECACA] bg-white px-md py-sm text-body-sm font-black text-[#B91C1C] transition hover:bg-[#FEF2F2]"
        >
          Hủy
        </button>
      </div>
    </div>
  );
}
