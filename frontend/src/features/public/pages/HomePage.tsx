import { useQuery } from "@tanstack/react-query";
import { CalendarClock, HeartPulse, MapPin, ShieldCheck, Sparkles, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { ErrorState } from "@/components/shared/ErrorState";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { Badge } from "@/components/ui/badge";
import { SectionHeading } from "@/features/public/components/SectionHeading";
import { formatDuration, formatPrice, formatRating, formatTreatmentCategory } from "@/features/public/lib/formatters";
import { getTreatmentStitchImage, publicStitchAssets } from "@/features/public/lib/stitch-assets";
import { treatmentService } from "@/services/treatment-service";

const trustSignals = [
  { title: "Kỹ thuật viên được duyệt hồ sơ", icon: ShieldCheck },
  { title: "Giá và thời lượng rõ ràng", icon: CalendarClock },
  { title: "Đánh giá minh bạch sau liệu trình", icon: Star },
  { title: "Chỉ phục vụ trong phạm vi Đà Nẵng", icon: MapPin },
];

const categories = [
  "Giảm đau cổ vai gáy",
  "Massage trị liệu",
  "Vật lý trị liệu",
  "Phục hồi sau vận động",
  "Giảm căng cơ và stress",
];

const steps = [
  {
    title: "Chọn liệu trình",
    description: "Tìm kiếm liệu trình phù hợp với tình trạng đau mỏi, căng cơ hoặc nhu cầu phục hồi của anh/chị.",
  },
  {
    title: "Chọn kỹ thuật viên và khung giờ",
    description: "Xem hồ sơ đã duyệt, đánh giá và chọn thời gian thuận tiện ngay tại nhà ở Đà Nẵng.",
  },
  {
    title: "Xác nhận đặt lịch",
    description: "Hoàn tất thông tin đặt lịch để kỹ thuật viên chuẩn bị phục vụ đúng nhu cầu đã chọn.",
  },
];

function getTreatmentRating(index: number) {
  return formatRating(4.8 + (index % 2) * 0.1);
}

function getCategoryIcon(index: number) {
  const icons = [HeartPulse, Sparkles, ShieldCheck, CalendarClock, MapPin];
  return icons[index] ?? HeartPulse;
}

function getTherapistDescription(specialties: string[]) {
  return specialties.length > 0 ? specialties.join(" · ") : "Massage trị liệu và hỗ trợ phục hồi tại nhà";
}

export function HomePage() {
  const treatmentsQuery = useQuery({ queryKey: ["public", "featured-treatments"], queryFn: () => treatmentService.listTreatments() });

  if (treatmentsQuery.isLoading) {
    return <LoadingSkeleton variant="card" count={3} />;
  }

  if (treatmentsQuery.isError) {
    return <ErrorState message="Không thể tải dữ liệu trang chủ lúc này. Anh Mạnh thử lại giúp em nhé." />;
  }

  const featuredTreatments = (treatmentsQuery.data ?? []).slice(0, 3);

  return (
    <div className="pb-20">
      <section className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-16 lg:grid-cols-[1fr_1fr] lg:py-20">
        <div className="space-y-6">
          <div className="inline-flex w-max items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-primary">
            <Sparkles className="h-4 w-4" />
            Dịch vụ trị liệu tại nhà ở Đà Nẵng
          </div>
          <div className="space-y-5">
            <h1 className="max-w-[720px] text-[40px] font-bold leading-[1.14] tracking-[-0.025em] text-foreground md:text-[52px] md:leading-[1.12] lg:max-w-[640px] lg:text-[56px]">
              <span className="block">Massage trị liệu </span>
              <span className="block">tại nhà ở Đà Nẵng</span>
            </h1>
            <p className="max-w-[620px] text-lg leading-8 text-muted-foreground">
              JvJ giúp bạn tìm liệu trình massage trị liệu và vật lý trị liệu tại nhà với kỹ thuật viên được thẩm định, giá rõ ràng, đánh giá minh bạch và khung giờ đặt lịch thuận tiện.
            </p>
          </div>
          <div className="pt-2">
            <Link
              to="/treatments"
              className="inline-flex h-12 items-center justify-center rounded-xl bg-primary px-6 text-sm font-bold text-primary-foreground transition hover:bg-primary/90"
            >
              Xem liệu trình
            </Link>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-[28px] border border-border/80 bg-card shadow-sm">
          <img src={publicStitchAssets.homeHero} alt="Không gian trị liệu tại nhà" className="h-[400px] w-full object-cover md:h-[500px]" />
        </div>
      </section>

      <section className="border-y border-border/70 bg-primary/5 py-10">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-6 text-center md:grid-cols-4">
          {trustSignals.map(({ title, icon: Icon }) => (
            <div key={title} className="flex flex-col items-center gap-3">
              <Icon className="h-8 w-8 text-primary" />
              <p className="text-sm font-medium leading-6 text-foreground">{title}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto mt-16 max-w-7xl px-6">
        <SectionHeading eyebrow="Danh mục phổ biến" title="Bạn cần hỗ trợ vấn đề gì?" description="Chọn nhanh nhóm nhu cầu để đi tới danh sách liệu trình phù hợp." />
        <div className="mt-8 grid gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
          {categories.map((category, index) => {
            const Icon = getCategoryIcon(index);

            return (
              <Link
                key={category}
                to="/treatments"
                className="group flex flex-col items-center gap-4 rounded-2xl border border-border/80 bg-card p-6 text-center transition hover:-translate-y-1 hover:shadow-sm"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-base font-extrabold leading-6 text-foreground">{category}</h3>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="mx-auto mt-16 max-w-7xl px-6">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeading eyebrow="Liệu trình nổi bật" title="Liệu trình phổ biến" description="Các liệu trình được khách hàng quan tâm nhiều trên JvJ hiện nay." />
          <Link to="/treatments" className="text-sm font-bold text-primary hover:underline">
            Xem tất cả
          </Link>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {featuredTreatments.map((treatment, index) => (
              <Link
                key={treatment.id}
                to={`/treatments/${treatment.id}`}
                className="group overflow-hidden rounded-2xl border border-border/80 bg-card transition hover:-translate-y-1 hover:shadow-sm"
              >
                <div className="relative h-48 overflow-hidden bg-muted">
                  <img
                    src={getTreatmentStitchImage(treatment.id, treatment.imageUrl)}
                    alt={treatment.name}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute left-4 top-4">
                    <Badge className="border-primary/10 bg-white/90 text-primary shadow-sm backdrop-blur-sm">{formatTreatmentCategory(treatment.category)}</Badge>
                  </div>
                  <div className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-full bg-white/90 px-3 py-1 text-primary shadow-sm backdrop-blur-sm">
                    <Star className="h-4 w-4 fill-current" />
                    <span className="text-xs font-bold">{getTreatmentRating(index)}</span>
                  </div>
                </div>

                <div className="flex min-h-[250px] flex-col gap-4 p-6">
                  <h3 className="text-xl font-bold leading-8 text-foreground">{treatment.name}</h3>
                  <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                    <CalendarClock className="h-4 w-4" />
                    {formatDuration(treatment.durationMinutes)}
                  </div>
                  <p className="line-clamp-2 text-sm leading-6 text-muted-foreground">{treatment.description}</p>
                  <div className="mt-auto text-2xl font-bold text-primary">{formatPrice(treatment.price)}</div>
                  <div className="inline-flex h-11 items-center justify-center rounded-xl border border-border bg-card text-sm font-bold text-primary transition-colors group-hover:border-primary/50 group-hover:bg-primary/5">
                    Xem chi tiết
                  </div>
                </div>
              </Link>
            ))}
        </div>
      </section>

      <section className="mx-auto mt-16 max-w-7xl px-6 text-center">
        <SectionHeading align="center" eyebrow="Cách hoạt động" title="Đặt lịch chỉ trong 3 bước" description="Quy trình rõ ràng để khách hàng chọn đúng dịch vụ và tiếp tục đặt lịch thuận tiện." />
        <div className="mt-8 flex flex-col items-center justify-center gap-8 md:flex-row md:gap-10">
          {steps.map((step, index) => (
            <div key={step.title} className="flex max-w-xs flex-col items-center gap-4 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-2xl font-black text-primary">{index + 1}</div>
              <h3 className="text-xl font-black text-foreground">{step.title}</h3>
              <p className="text-sm leading-6 text-muted-foreground">{step.description}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
