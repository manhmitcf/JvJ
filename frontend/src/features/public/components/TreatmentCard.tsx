import { Clock3, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { type Treatment } from "@/types/treatment";
import { formatDuration, formatPrice, formatRating, formatTreatmentCategory } from "@/features/public/lib/formatters";
import { getTreatmentStitchImage } from "@/features/public/lib/stitch-assets";

interface TreatmentCardProps {
  readonly treatment: Treatment;
  readonly variant?: "grid" | "horizontal";
}

export function TreatmentCard({ treatment, variant = "grid" }: TreatmentCardProps) {
  const imageSrc = getTreatmentStitchImage(treatment.id, treatment.imageUrl);
  const isHorizontal = variant === "horizontal";

  return (
    <Card className={isHorizontal ? "h-full overflow-hidden border-border/80 bg-card shadow-[0_4px_20px_rgba(15,118,110,0.04)] lg:grid lg:grid-cols-[260px_1fr]" : "h-full overflow-hidden border-border/80 bg-card shadow-[0_4px_20px_rgba(15,118,110,0.04)]"}>
      <div className={isHorizontal ? "min-h-64 overflow-hidden border-b border-border/60 bg-muted/40 lg:border-b-0 lg:border-r" : "aspect-[16/10] overflow-hidden border-b border-border/60 bg-muted/40"}>
        <img src={imageSrc} alt={treatment.name} loading="lazy" className="h-full w-full object-cover object-center" />
      </div>
      <div>
      <CardHeader className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <Badge className="border-primary/10 bg-primary/10 text-primary">{formatTreatmentCategory(treatment.category)}</Badge>
          <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
            {formatRating(treatment.rating)}
          </span>
        </div>
        <div className="space-y-2">
          <CardTitle className="text-xl leading-7">{treatment.name}</CardTitle>
          <p className="text-sm leading-6 text-muted-foreground">{treatment.description}</p>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">{formatPrice(treatment.price)}</span>
          <span className="inline-flex items-center gap-1">
            <Clock3 className="h-4 w-4" />
            {formatDuration(treatment.durationMinutes)}
          </span>
          <Badge className={treatment.isAvailable ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-slate-200 bg-slate-50 text-slate-600"}>
            {treatment.isAvailable ? "Có lịch" : "Tạm kín lịch"}
          </Badge>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            to={`/treatments/${treatment.id}`}
            className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Xem chi tiết
          </Link>
          <Link
            to={`/therapists/${treatment.therapistId}`}
            className="inline-flex h-10 items-center justify-center rounded-md bg-muted px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted/80"
          >
            Xem kỹ thuật viên
          </Link>
        </div>
      </CardContent>
      </div>
    </Card>
  );
}
