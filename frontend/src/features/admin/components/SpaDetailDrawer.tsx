import { Building2, Mail, MapPin, Phone, Sparkles } from "lucide-react";
import { type Spa } from "@/types/spa";
import { AdminEmptyState, AdminStatusBadge } from "./shared";

export function SpaDetailDrawer({ spa }: { spa: Spa | null }) {
  if (!spa) {
    return <AdminEmptyState title="Chọn Spa đối tác" description="Thông tin liên hệ, khu vực và liệu trình liên kết sẽ hiện tại đây." />;
  }

  return (
    <aside className="rounded-[2rem] border border-botanical-border bg-white p-lg shadow-stitch-soft">
      <div className="flex items-start gap-md">
        <div className="flex h-16 w-16 items-center justify-center rounded-[1.5rem] bg-soft-mint text-primary"><Building2 className="h-7 w-7" /></div>
        <div>
          <h2 className="text-2xl font-black text-ink-primary">{spa.name}</h2>
          <p className="mt-xs text-body-sm font-semibold text-sage-secondary">{spa.description}</p>
          <div className="mt-sm"><AdminStatusBadge tone={spa.status === "active" ? "green" : "slate"}>{spa.status}</AdminStatusBadge></div>
        </div>
      </div>

      <div className="mt-lg space-y-sm">
        <div className="rounded-[1.5rem] bg-warm-bg p-md">
          <p className="flex items-center gap-xs text-body-sm font-black text-ink-primary"><MapPin className="h-4 w-4 text-primary" />{spa.address}</p>
          <p className="mt-xs text-body-sm font-semibold text-sage-secondary">Khu vực {spa.district}</p>
        </div>
        <div className="rounded-[1.5rem] bg-warm-bg p-md">
          <p className="flex items-center gap-xs text-body-sm font-black text-ink-primary"><Phone className="h-4 w-4 text-primary" />{spa.phone}</p>
          <p className="mt-xs flex items-center gap-xs text-body-sm font-black text-ink-primary"><Mail className="h-4 w-4 text-primary" />{spa.email}</p>
        </div>
        <div className="rounded-[1.5rem] bg-soft-mint p-md">
          <p className="flex items-center gap-xs text-body-sm font-black text-primary"><Sparkles className="h-4 w-4" />{spa.linkedTreatmentCount} liệu trình liên kết</p>
          <p className="mt-xs text-body-sm font-semibold text-sage-secondary">Giờ hoạt động {spa.openTime} - {spa.closeTime}</p>
        </div>
      </div>
    </aside>
  );
}
