import { CalendarDays, CheckCircle2, Star, Wallet } from "lucide-react";
import { type DashboardMetrics as DashboardMetricsData } from "../services/dashboard-service";
import { MetricCard } from "./shared";

const moneyCompact = new Intl.NumberFormat("vi-VN", {
  notation: "compact",
  maximumFractionDigits: 1,
});

export function DashboardMetrics({ metrics }: { metrics: DashboardMetricsData | null }) {
  const todayAppointments = metrics?.todayAppointmentCount ?? 0;
  const pendingCount = metrics?.pendingCount ?? 0;
  const paidRevenue = metrics?.paidRevenue ?? 0;

  return (
    <div className="grid gap-lg md:grid-cols-2 xl:grid-cols-4">
      <MetricCard icon={CheckCircle2} label="Hoàn tất" value={String(metrics?.completedBookings ?? 0)} hint="Tổng cộng liệu trình" />
      <MetricCard icon={Star} label="Đánh giá" value={String(metrics?.rating ?? 0)} hint="Điểm trung bình hiện tại" tone="green" />
      <MetricCard icon={CalendarDays} label="Lịch hôm nay" value={String(todayAppointments).padStart(2, "0")} hint={`${pendingCount} lịch đang chờ xác nhận`} tone="amber" />
      <MetricCard icon={Wallet} label="Đã thanh toán" value={paidRevenue > 0 ? `${moneyCompact.format(paidRevenue)}đ` : "0đ"} hint="Khách đã trả trong tháng" tone="blue" />
    </div>
  );
}
