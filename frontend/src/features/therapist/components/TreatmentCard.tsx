import { CheckCircle2, EyeOff, Pencil } from "lucide-react";
import { Link } from "react-router-dom";
import { type Treatment } from "@/types/treatment";
import { SecondaryButton, StatusBadge } from "./shared";

const money = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" });

export function TreatmentCard({ treatment, image, onToggleAvailability }: { treatment: Treatment; image: string; onToggleAvailability: (treatment: Treatment) => void }) {
  return (
    <article className="overflow-hidden rounded-[2rem] border border-botanical-border bg-white shadow-stitch-soft transition hover:-translate-y-1 hover:border-primary">
      <div className="grid md:grid-cols-[220px_minmax(0,1fr)]">
        <img src={image} alt={treatment.name} className="h-56 w-full object-cover md:h-full" />
        <div className="p-lg">
          <div className="mb-sm flex flex-wrap items-center gap-sm">
            <StatusBadge tone={treatment.isAvailable ? "green" : "slate"}>{treatment.isAvailable ? "Đang hoạt động" : "Tạm ẩn"}</StatusBadge>
            <span className="rounded-full bg-soft-mint px-sm py-xs text-label-caption font-black text-primary">{treatment.durationMinutes} phút</span>
          </div>
          <h2 className="text-2xl font-black text-ink-primary">{treatment.name}</h2>
          <p className="mt-sm text-body-sm font-medium text-sage-secondary">{treatment.description}</p>
          <div className="mt-md flex flex-wrap items-center justify-between gap-md">
            <div>
              <p className="text-label-caption font-black uppercase tracking-wider text-muted-text">Giá dịch vụ</p>
              <p className="text-2xl font-black text-primary">{money.format(treatment.price)}</p>
            </div>
            <div className="flex gap-sm">
              <Link to={`/therapist/treatments/${treatment.id}/edit`}><SecondaryButton><Pencil className="h-4 w-4" /> Chỉnh sửa</SecondaryButton></Link>
              <SecondaryButton onClick={() => onToggleAvailability(treatment)}>{treatment.isAvailable ? <EyeOff className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />} {treatment.isAvailable ? "Tạm ẩn" : "Bật lại"}</SecondaryButton>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
