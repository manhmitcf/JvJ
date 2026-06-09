import { CheckCircle2, Loader2, ToggleRight } from "lucide-react";
import { PrimaryButton } from "./shared";

export function OnlineToggle({
  isOnline,
  onToggle,
  isLoading = false,
}: {
  isOnline: boolean;
  onToggle: () => void;
  isLoading?: boolean;
}) {
  return (
    <div className="relative z-10 mt-xl flex flex-col gap-md md:flex-row md:items-center md:justify-between">
      <button
        onClick={onToggle}
        disabled={isLoading}
        className="flex items-center gap-md rounded-2xl border border-white/20 bg-white/10 p-md text-left backdrop-blur disabled:cursor-not-allowed disabled:opacity-70"
      >
        <div>
          <p className="text-label-caption font-black uppercase tracking-wider text-on-primary-container/80">Trạng thái hiện tại</p>
          <p className="text-xl font-black">{isOnline ? "Đang nhận lịch" : "Tạm ngưng nhận lịch"}</p>
        </div>
        {isLoading ? <Loader2 className="h-8 w-8 animate-spin text-secondary-container" /> : <ToggleRight className="h-10 w-10 text-secondary-container" />}
      </button>
      <PrimaryButton
        onClick={onToggle}
        disabled={isLoading}
        className="bg-secondary-container text-on-secondary-container hover:bg-secondary-container/90 disabled:opacity-70"
      >
        {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <CheckCircle2 className="h-5 w-5" />} {isOnline ? "Tạm dừng nhận lịch" : "Bật nhận lịch"}
      </PrimaryButton>
    </div>
  );
}
