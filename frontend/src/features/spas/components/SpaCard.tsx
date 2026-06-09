import { CalendarDays, CheckCircle2, Clock3, MapPin, ShieldCheck, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { type Spa, type SpaStatus } from "@/types/spa";

const statusLabels: Record<SpaStatus, string> = {
  active: "Đang hoạt động",
  hidden: "Tạm ẩn",
};

const statusClassNames: Record<SpaStatus, string> = {
  active: "bg-soft-mint text-primary",
  hidden: "bg-surface-container-high text-sage-secondary",
};

type SpaCardProps = {
  spa: Spa;
  imageSrc: string;
};

export function SpaCard({ spa, imageSrc }: SpaCardProps) {
  return (
    <article className="group overflow-hidden rounded-xl border border-botanical-border bg-surface-container-lowest shadow-stitch-soft transition-all hover:-translate-y-1 hover:border-primary hover:shadow-[0_10px_30px_rgba(15,118,110,0.08)]">
      <div className="relative h-64 overflow-hidden">
        <img src={imageSrc} alt={spa.name} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
        <div className="absolute inset-x-0 top-0 flex items-center justify-between gap-md p-lg">
          <Badge className={`rounded-full px-md py-xs text-label-caption font-bold ${statusClassNames[spa.status]}`}>
            {statusLabels[spa.status]}
          </Badge>
          <div className="inline-flex items-center gap-xs rounded-full bg-white/90 px-md py-xs text-label-caption font-semibold text-primary shadow-sm">
            <ShieldCheck className="h-4 w-4" />
            Đã xác minh thông tin đối tác
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-lg p-xl">
        <div className="space-y-sm">
          <div className="flex items-center gap-sm text-label-caption font-bold uppercase tracking-[0.18em] text-primary">
            <Sparkles className="h-4 w-4" />
            Không gian wellness tại Đà Nẵng
          </div>
          <h2 className="text-h2 font-h2 text-ink-primary">{spa.name}</h2>
          <p className="text-body text-sage-secondary">{spa.description}</p>
        </div>

        <div className="grid gap-md text-body-sm text-sage-secondary sm:grid-cols-2">
          <div className="flex items-start gap-sm">
            <MapPin className="mt-0.5 h-4 w-4 text-primary" />
            <span>{spa.address}</span>
          </div>
          <div className="flex items-center gap-sm">
            <Clock3 className="h-4 w-4 text-primary" />
            <span>{spa.openTime} - {spa.closeTime}</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-sm">
          <Badge className="rounded-full border border-secondary-container bg-gentle-wash px-md py-xs text-label-caption font-semibold text-on-secondary-container">
            {spa.linkedTreatmentCount} liệu trình liên kết
          </Badge>
          <Badge className="rounded-full border border-botanical-border bg-surface px-md py-xs text-label-caption font-semibold text-sage-secondary">
            {spa.district}
          </Badge>
          <Badge className="rounded-full border border-botanical-border bg-surface px-md py-xs text-label-caption font-semibold text-sage-secondary">
            <CheckCircle2 className="mr-xs h-3.5 w-3.5" />
            Thông tin đối tác đã kiểm duyệt
          </Badge>
        </div>

        <div className="mt-auto flex flex-col gap-md sm:flex-row">
          <Link
            to={`/spas/${spa.id}`}
            className="inline-flex h-12 flex-1 items-center justify-center rounded-full bg-primary px-6 text-sm font-black text-on-primary transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            Xem chi tiết
          </Link>
          <Link
            to={`/app/bookings/new?spaId=${spa.id}`}
            className="inline-flex h-12 flex-1 items-center justify-center gap-sm rounded-full border border-botanical-border bg-surface px-6 text-sm font-black text-ink-primary transition-colors hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            <CalendarDays className="h-4 w-4" />
            Đặt lịch ngay
          </Link>
        </div>
      </div>
    </article>
  );
}
