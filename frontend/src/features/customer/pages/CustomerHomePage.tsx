import { useQuery } from "@tanstack/react-query";
import { CalendarDays, ClipboardList, Star, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { treatmentService } from "@/services/treatment-service";

export function CustomerHomePage() {
  const treatmentsQuery = useQuery({
    queryKey: ["customer", "featured-treatments"],
    queryFn: () => treatmentService.listTreatments(),
  });

  return (
    <div className="space-y-lg">
      <section className="rounded-3xl border border-botanical-border bg-white/80 p-lg shadow-stitch-soft">
        <div className="flex flex-col gap-2">
          <span className="text-label-caption font-semibold text-sage-secondary">Xin chào</span>
          <h1 className="text-3xl font-black text-ink-primary">Trang tổng quan</h1>
          <p className="text-sage-secondary">
            Chào mừng bạn quay lại. Bạn có thể xem lại lịch hẹn sắp tới và tìm liệu trình phù hợp.
          </p>
        </div>
      </section>

      <section className="grid gap-md md:grid-cols-3">
        <Link
          to="/app/bookings/new"
          className="flex items-center gap-md rounded-2xl border border-botanical-border bg-white/80 p-lg shadow-stitch-soft transition-colors hover:border-primary/40"
        >
          <ClipboardList className="h-8 w-8 text-primary" />
          <div>
            <p className="text-body-sm font-black text-ink-primary">Đặt lịch mới</p>
            <p className="text-label-caption text-sage-secondary">Đặt lịch với KTV phù hợp</p>
          </div>
        </Link>
        <Link
          to="/app/appointments"
          className="flex items-center gap-md rounded-2xl border border-botanical-border bg-white/80 p-lg shadow-stitch-soft transition-colors hover:border-primary/40"
        >
          <CalendarDays className="h-8 w-8 text-primary" />
          <div>
            <p className="text-body-sm font-black text-ink-primary">Lịch hẹn</p>
            <p className="text-label-caption text-sage-secondary">Xem và theo dõi lịch</p>
          </div>
        </Link>
        <Link
          to="/app/calendar"
          className="flex items-center gap-md rounded-2xl border border-botanical-border bg-white/80 p-lg shadow-stitch-soft transition-colors hover:border-primary/40"
        >
          <CalendarDays className="h-8 w-8 text-primary" />
          <div>
            <p className="text-body-sm font-black text-ink-primary">Lịch</p>
            <p className="text-label-caption text-sage-secondary">Xem lịch theo tháng</p>
          </div>
        </Link>
      </section>

      <section className="space-y-md">
        <div className="flex items-center justify-between gap-md">
          <div>
            <h2 className="text-2xl font-black text-ink-primary">Liệu trình nổi bật</h2>
            <p className="text-sage-secondary">Gợi ý phù hợp với tình trạng của bạn</p>
          </div>
          <Link to="/treatments" className="text-body-sm font-bold text-primary hover:underline">
            Xem tất cả
          </Link>
        </div>

        {treatmentsQuery.isLoading ? (
          <div className="grid gap-md md:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="h-48 animate-pulse rounded-2xl bg-white/70" />
            ))}
          </div>
        ) : treatmentsQuery.isError ? (
          <p className="text-sage-secondary">Không tải được liệu trình nổi bật.</p>
        ) : (
          <div className="grid gap-md md:grid-cols-3">
            {treatmentsQuery.data?.slice(0, 3).map((treatment) => (
              <Link
                key={treatment.id}
                to={`/treatments/${treatment.id}`}
                className="rounded-2xl border border-botanical-border bg-white/80 p-md shadow-stitch-soft transition-colors hover:border-primary/40"
              >
                <div className="flex items-center gap-xs text-sage-secondary">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span className="text-body-sm font-bold">4.8</span>
                </div>
                <p className="mt-sm text-body-sm font-black text-ink-primary">{treatment.name}</p>
                <p className="text-label-caption text-sage-secondary">{treatment.category}</p>
                <p className="mt-sm text-body-sm font-bold text-primary">
                  {treatment.price ? `${treatment.price.toLocaleString("vi-VN")}đ` : "Liên hệ"}
                </p>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
