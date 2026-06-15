import { Building2, Clock, Eye, Pencil, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { type Spa } from "@/types/spa";
import { AdminPrimaryButton, AdminSecondaryButton, AdminStatusBadge } from "./shared";

export function SpaManagementCard({ spa, isSelected, onSelect, onHide, onDelete, onEdit }: { spa: Spa; isSelected: boolean; onSelect: () => void; onHide: () => void; onDelete: () => void; onEdit?: (spa: Spa) => void }) {
  const tone = spa.status === "active" ? "green" : "slate";

  return (
    <article className={`rounded-[2rem] border bg-white p-lg shadow-stitch-soft transition-colors ${isSelected ? "border-primary" : "border-botanical-border"}`}>
      <button type="button" onClick={onSelect} className="w-full text-left">
        <div className="flex items-start gap-md">
          <div className="flex h-14 w-14 items-center justify-center rounded-[1.5rem] bg-soft-mint text-xl font-black text-primary"><Building2 className="h-6 w-6" /></div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-start justify-between gap-sm">
              <div>
                <h3 className="text-xl font-black text-ink-primary">{spa.name}</h3>
                <p className="text-body-sm font-semibold text-sage-secondary">{spa.address}</p>
              </div>
              <AdminStatusBadge tone={tone}>{spa.status === "active" ? "Đang hiển thị" : "Đã ẩn"}</AdminStatusBadge>
            </div>
          </div>
        </div>
      </button>

      <div className="mt-md grid gap-sm rounded-[1.5rem] bg-warm-bg p-md text-body-sm font-semibold text-sage-secondary sm:grid-cols-2">
        <span className="flex items-center gap-xs"><Building2 className="h-4 w-4 text-primary" />Khu vực: {spa.district}</span>
        <span className="flex items-center gap-xs"><Clock className="h-4 w-4 text-primary" />{spa.openTime} – {spa.closeTime}</span>
      </div>

      <div className="mt-md flex flex-wrap gap-sm">
        <Link to={`/admin/spas/${spa.id}`} className="inline-flex items-center gap-1 rounded-full border border-botanical-border bg-white px-md py-sm text-label-caption font-black uppercase tracking-[0.1em] text-sage-secondary transition-colors hover:border-primary hover:bg-soft-mint">
          <Eye className="h-4 w-4" />Xem chi tiết
        </Link>
        {onEdit && (
          <AdminSecondaryButton onClick={() => onEdit(spa)}><Pencil className="h-4 w-4" />Chỉnh sửa</AdminSecondaryButton>
        )}
        <AdminSecondaryButton onClick={onHide}>{spa.status === "active" ? "Ẩn Spa" : "Hiện Spa"}</AdminSecondaryButton>
        <AdminSecondaryButton tone="danger" onClick={onDelete}><Trash2 className="h-4 w-4" />Xóa</AdminSecondaryButton>
      </div>
    </article>
  );
}
