import { BriefcaseBusiness, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { type Therapist } from "@/types/therapist";
import { formatRating } from "@/features/public/lib/formatters";

interface TherapistCardProps {
  readonly therapist: Therapist;
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((part) => (part[0] ?? "").toUpperCase()).join("") || "?";
}

export function TherapistCard({ therapist }: TherapistCardProps) {
  const imageSrc = therapist.avatarUrl?.trim();

  return (
    <Card className="h-full overflow-hidden border-border/80 bg-card shadow-[0_4px_20px_rgba(15,118,110,0.04)]">
      <div className="aspect-[16/10] overflow-hidden border-b border-border/60 bg-muted/40">
        {imageSrc ? (
          <img src={imageSrc} alt={therapist.fullName} loading="lazy" className="h-full w-full object-cover object-top" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-soft-mint text-primary">
            <span className="text-2xl font-black">{getInitials(therapist.fullName)}</span>
          </div>
        )}
      </div>
      <CardHeader className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="text-xl">{therapist.fullName}</CardTitle>
            <p className="mt-2 text-sm text-muted-foreground">{therapist.specialties.join(" · ")}</p>
          </div>
          <Badge className="border-primary/10 bg-primary/10 text-primary">Đã duyệt hồ sơ</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid gap-3 text-sm text-muted-foreground sm:grid-cols-2">
          <div className="rounded-xl bg-muted/60 p-3">
            <div className="text-xs uppercase tracking-wide">Đánh giá</div>
            <div className="mt-2 inline-flex items-center gap-1 font-semibold text-foreground">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              {formatRating(therapist.rating)}
            </div>
          </div>
          <div className="rounded-xl bg-muted/60 p-3">
            <div className="text-xs uppercase tracking-wide">Kinh nghiệm</div>
            <div className="mt-2 inline-flex items-center gap-1 font-semibold text-foreground">
              <BriefcaseBusiness className="h-4 w-4" />
              {therapist.yearsOfExperience} năm
            </div>
          </div>
        </div>
        <p className="text-sm leading-6 text-muted-foreground">{therapist.completedBookings} lượt đặt hoàn tất. Phù hợp cho khách hàng cần trị liệu tại nhà rõ ràng, đúng giờ và nhẹ nhàng.</p>
        <div className="flex gap-3">
          <Link
            to={`/therapists/${therapist.id}`}
            className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Xem hồ sơ
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
