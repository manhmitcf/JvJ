import { AlertTriangle, CheckCircle2, Clock3, Wallet } from "lucide-react";
import { Card } from "@/components/ui/card";
import { type PaymentStatus } from "@/types/booking";
import { cn } from "@/utils/cn";

export interface PaymentStatusCardProps {
  readonly paymentStatus: PaymentStatus;
  readonly actionMessage?: string | null;
}

const paymentStatusMap: Record<
  PaymentStatus,
  {
    label: string;
    description: string;
    icon: typeof Wallet;
    toneClassName: string;
    iconClassName: string;
  }
> = {
  unpaid: {
    label: "Chưa thanh toán",
    description: "Lịch hẹn đang chờ Anh Mạnh hoàn tất bước thanh toán demo.",
    icon: Wallet,
    toneClassName: "border-[#bdc9c6] bg-[#f1f4f3] text-[#3e4947]",
    iconClassName: "bg-[#ebefed] text-[#3e4947]",
  },
  pending: {
    label: "Chờ thanh toán",
    description: "Giao dịch đang ở trạng thái chờ xử lý. Anh Mạnh có thể tiếp tục quét mã để hoàn tất.",
    icon: Clock3,
    toneClassName: "border-[#FEF3C7] bg-[#FEF3C7] text-[#A16207]",
    iconClassName: "bg-[#FEF3C7] text-[#A16207]",
  },
  paid: {
    label: "Đã thanh toán",
    description: "JvJ đã ghi nhận thanh toán thành công và sẵn sàng tiếp tục xử lý lịch hẹn.",
    icon: CheckCircle2,
    toneClassName: "border-green-700/15 bg-green-50 text-green-700",
    iconClassName: "bg-green-50 text-green-700",
  },
  failed: {
    label: "Thanh toán thất bại",
    description: "Giao dịch demo chưa thành công. Anh Mạnh có thể thử lại để đưa booking về trạng thái chờ thanh toán.",
    icon: AlertTriangle,
    toneClassName: "border-red-700/15 bg-red-50 text-red-700",
    iconClassName: "bg-red-50 text-red-700",
  },
};

export function PaymentStatusCard({ paymentStatus, actionMessage }: PaymentStatusCardProps) {
  const config = paymentStatusMap[paymentStatus];
  const Icon = config.icon;

  return (
    <Card className="rounded-2xl border-[#bdc9c6] bg-white p-5 shadow-[0_4px_20px_rgba(15,118,110,0.04)]">
      <div className="flex items-start gap-4">
        <div className={cn("flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl", config.iconClassName)}>
          <Icon className="h-6 w-6" />
        </div>
        <div className="min-w-0 flex-1">
          <span className={cn("inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold", config.toneClassName)}>{config.label}</span>
          <p className="mt-3 text-sm leading-6 text-[#3e4947]">{config.description}</p>
          {actionMessage ? <p className="mt-3 text-sm font-medium text-[#181c1c]">{actionMessage}</p> : null}
        </div>
      </div>
    </Card>
  );
}
