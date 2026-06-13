import { Building2, Clock, Pencil } from "lucide-react";
import { type Spa } from "@/types/spa";
import { AdminSecondaryButton, AdminStatusBadge, AdminTableShell } from "./shared";

export function SpaManagementTable({ spas, selectedSpaId, onSelect, onHide, onDelete, onEdit }: { spas: Spa[]; selectedSpaId?: string; onSelect: (spaId: string) => void; onHide: (spaId: string, status: Spa["status"]) => void; onDelete: (spaId: string) => void; onEdit?: (spa: Spa) => void }) {
  return (
    <AdminTableShell>
      <div className="grid min-w-[860px] grid-cols-[1.4fr_1fr_0.8fr_0.8fr_1.2fr] gap-md border-b border-botanical-border bg-soft-mint/60 px-lg py-md text-label-caption font-black uppercase tracking-[0.16em] text-sage-secondary">
        <span>Spa đối tác</span>
        <span>Khu vực</span>
        <span>Giờ mở</span>
        <span>Trạng thái</span>
        <span className="text-right">Thao tác</span>
      </div>
      <div className="divide-y divide-botanical-border overflow-x-auto">
        {spas.map((spa) => (
          <div key={spa.id} className={`grid min-w-[860px] grid-cols-[1.4fr_1fr_0.8fr_0.8fr_1.2fr] items-center gap-md px-lg py-md ${selectedSpaId === spa.id ? "bg-soft-mint/50" : "bg-white"}`}>
            <button type="button" onClick={() => onSelect(spa.id)} className="flex items-center gap-sm text-left">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-soft-mint text-primary"><Building2 className="h-5 w-5" /></div>
              <div>
                <p className="text-body-sm font-black text-ink-primary">{spa.name}</p>
                <p className="text-label-caption font-semibold text-sage-secondary">{spa.address}</p>
              </div>
            </button>
            <span className="text-body-sm font-bold text-ink-primary">{spa.district}</span>
            <span className="flex items-center gap-xs text-body-sm font-bold text-ink-primary"><Clock className="h-4 w-4 text-primary" />{spa.openTime}-{spa.closeTime}</span>
            <AdminStatusBadge tone={spa.status === "active" ? "green" : "slate"}>{spa.status === "active" ? "Đang hiển thị" : "Đã ẩn"}</AdminStatusBadge>
            <div className="flex justify-end gap-xs">
              {onEdit && (
                <AdminSecondaryButton onClick={() => onEdit(spa)}><Pencil className="h-4 w-4" /></AdminSecondaryButton>
              )}
              <AdminSecondaryButton onClick={() => onHide(spa.id, spa.status)}>{spa.status === "active" ? "Ẩn" : "Hiện"}</AdminSecondaryButton>
              <AdminSecondaryButton tone="danger" onClick={() => onDelete(spa.id)}>Xóa</AdminSecondaryButton>
            </div>
          </div>
        ))}
      </div>
    </AdminTableShell>
  );
}
