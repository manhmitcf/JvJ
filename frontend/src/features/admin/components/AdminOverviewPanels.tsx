import { CalendarCheck, CheckCircle2, CircleDollarSign, UserCheck, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { type AdminAlert, type AdminChartPoint, type AdminOverviewMetrics } from "@/types/admin";
import { AdminMetricCard, AdminStatusBadge } from "./shared";

const formatter = new Intl.NumberFormat("vi-VN");
const currencyFormatter = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" });

export function AdminOverviewPanels({ metrics, chart, alerts }: { metrics: AdminOverviewMetrics; chart: AdminChartPoint[]; alerts: AdminAlert[] }) {
  const maxRevenue = Math.max(...chart.map((point) => point.revenue), 1);

  return (
    <div className="space-y-lg">
      <div className="grid gap-md md:grid-cols-2 xl:grid-cols-5">
        <AdminMetricCard label="Khách hàng" value={formatter.format(metrics.totalCustomers)} helper="Tài khoản customer đang hoạt động" icon={<Users className="h-5 w-5" />} />
        <AdminMetricCard label="KTV hoạt động" value={formatter.format(metrics.activeTherapists)} helper="Therapist đã được duyệt" icon={<UserCheck className="h-5 w-5" />} />
        <AdminMetricCard label="Booking hôm nay" value={formatter.format(metrics.newBookingsToday)} helper="Lịch mới cần theo dõi" icon={<CalendarCheck className="h-5 w-5" />} />
        <AdminMetricCard label="Hồ sơ chờ duyệt" value={formatter.format(metrics.pendingTherapistApprovals)} helper="Cần phản hồi trong ngày" icon={<CheckCircle2 className="h-5 w-5" />} />
        <AdminMetricCard label="Doanh thu tháng" value={currencyFormatter.format(metrics.totalRevenueMonth)} helper="Tổng booking đã thanh toán" icon={<CircleDollarSign className="h-5 w-5" />} />
      </div>

      <div className="grid gap-lg xl:grid-cols-[1.4fr_0.8fr]">
        <section className="rounded-[2rem] border border-botanical-border bg-white p-lg shadow-stitch-soft">
          <div className="flex flex-wrap items-start justify-between gap-md">
            <div>
              <p className="text-label-caption font-black uppercase tracking-[0.22em] text-primary">Hiệu suất tuần</p>
              <h2 className="mt-xs text-2xl font-black text-ink-primary">Doanh thu & booking</h2>
            </div>
            <AdminStatusBadge tone="teal">Đà Nẵng · 7 ngày</AdminStatusBadge>
          </div>
          <div className="mt-lg flex h-72 items-end gap-sm rounded-[1.5rem] bg-warm-bg p-md">
            {chart.map((point) => (
              <div key={point.date} className="flex h-full flex-1 flex-col justify-end gap-xs">
                <div className="flex flex-1 items-end rounded-full bg-white px-1 py-1 shadow-sm">
                  <div className="w-full rounded-full bg-gradient-to-t from-primary to-[#5EEAD4]" style={{ height: `${Math.max((point.revenue / maxRevenue) * 100, 10)}%` }} />
                </div>
                <div className="text-center">
                  <p className="text-label-caption font-black text-ink-primary">{point.label}</p>
                  <p className="text-[11px] font-semibold text-sage-secondary">{point.bookings} lịch</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[2rem] border border-botanical-border bg-white p-lg shadow-stitch-soft">
          <div className="flex items-start justify-between gap-md">
            <div>
              <p className="text-label-caption font-black uppercase tracking-[0.22em] text-primary">Cảnh báo</p>
              <h2 className="mt-xs text-2xl font-black text-ink-primary">Việc cần Admin xử lý</h2>
            </div>
            <CircleDollarSign className="h-6 w-6 text-primary" />
          </div>
          <div className="mt-lg space-y-sm">
            {alerts.length > 0 ? (
              alerts.map((alert) => (
                <Link key={alert.id} to={alert.href} className="block rounded-[1.5rem] border border-botanical-border bg-warm-bg p-md transition-colors hover:border-primary hover:bg-soft-mint/60">
                  <div className="flex items-start justify-between gap-sm">
                    <div>
                      <p className="text-body-sm font-black text-ink-primary">{alert.title}</p>
                      <p className="mt-1 text-body-sm font-semibold text-sage-secondary">{alert.description}</p>
                    </div>
                    <AdminStatusBadge tone={alert.tone}>{alert.tone === "red" ? "Gấp" : alert.tone === "amber" ? "Cần xem" : "Mới"}</AdminStatusBadge>
                  </div>
                </Link>
              ))
            ) : (
              <div className="rounded-[1.5rem] border border-botanical-border bg-warm-bg p-md text-center">
                <p className="text-body-sm font-semibold text-sage-secondary">Không có cảnh báo nào</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
