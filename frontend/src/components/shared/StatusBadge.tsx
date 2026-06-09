import { Badge } from "@/components/ui/badge";
import { type BookingStatus } from "@/types/booking";
import { cn } from "@/utils/cn";

const labels: Record<BookingStatus, string> = {
  pending: "Chờ xác nhận",
  confirmed: "Đã xác nhận",
  in_progress: "Đang thực hiện",
  completed: "Đã hoàn thành",
  cancelled: "Đã hủy",
  rejected: "Đã từ chối",
};

const classes: Record<BookingStatus, string> = {
  pending: "border-amber-200 bg-amber-50 text-amber-700",
  confirmed: "border-blue-200 bg-blue-50 text-blue-700",
  in_progress: "border-teal-200 bg-teal-50 text-teal-700",
  completed: "border-emerald-200 bg-emerald-50 text-emerald-700",
  cancelled: "border-slate-200 bg-slate-50 text-slate-600",
  rejected: "border-red-200 bg-red-50 text-red-700",
};

export function StatusBadge({ status }: { status: BookingStatus }) {
  return <Badge className={cn(classes[status])}>{labels[status]}</Badge>;
}
