import { useEffect, useState } from "react";
import { formatRating } from "@/features/public/lib/formatters";
import { Link2, Loader2, Search, Sparkles, Star } from "lucide-react";
import { type Treatment } from "@/types/treatment";
import { AdminPrimaryButton, AdminSecondaryButton } from "./shared";
import { getAvailableTreatments } from "../services/admin-spa-service";

interface LinkTreatmentsDialogProps {
  open: boolean;
  spaId: string;
  currentLinkedIds: string[];
  onClose: () => void;
  onLink: (treatmentIds: string[]) => void;
}

export function LinkTreatmentsDialog({ open, spaId, currentLinkedIds, onClose, onLink }: LinkTreatmentsDialogProps) {
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set(currentLinkedIds));
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    getAvailableTreatments()
      .then(setTreatments)
      .finally(() => setLoading(false));
  }, [open]);

  useEffect(() => {
    if (!open) {
      setSearch("");
      setSelected(new Set(currentLinkedIds));
    }
  }, [open, currentLinkedIds]);

  if (!open) return null;

  const filtered = treatments.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.therapistName?.toLowerCase().includes(search.toLowerCase())
  );

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await onLink(Array.from(selected));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-primary/35 px-md backdrop-blur-sm">
      <div className="flex h-[85vh] max-h-[85vh] w-full max-w-2xl flex-col rounded-[2rem] border border-botanical-border bg-white p-lg shadow-stitch-soft overflow-hidden">
        <div className="mb-md">
          <p className="text-label-caption font-black uppercase tracking-[0.2em] text-primary">Liên kết liệu trình</p>
          <h2 className="mt-xs text-2xl font-black text-ink-primary">Liên kết liệu trình với Spa</h2>
        </div>

        <div className="relative mb-md">
          <Search className="absolute left-md top-1/2 h-4 w-4 -translate-y-1/2 text-sage-secondary" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo tên liệu trình hoặc KTV..."
            className="h-12 w-full rounded-2xl border border-botanical-border bg-warm-bg pl-xl pr-md text-body-sm font-semibold text-ink-primary outline-none focus:border-primary"
          />
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto space-y-sm">
          {loading ? (
            <div className="flex items-center justify-center py-xl">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center gap-sm py-xl text-center">
              <Sparkles className="h-8 w-8 text-sage-secondary" />
              <p className="text-body-sm font-bold text-sage-secondary">Không có liệu trình phù hợp</p>
            </div>
          ) : (
            filtered.map((treatment) => {
              const isLinked = selected.has(treatment.id);
              return (
                <div
                  key={treatment.id}
                  onClick={() => toggle(treatment.id)}
                  className={`flex cursor-pointer items-center gap-sm rounded-2xl border p-sm transition-colors ${isLinked ? "border-primary bg-soft-mint" : "border-botanical-border bg-warm-bg hover:border-primary/50"}`}
                >
                  <div className="h-[160px] w-[240px] shrink-0 overflow-hidden rounded-xl border border-botanical-border bg-surface-container-lowest">
                    {treatment.imageUrl ? (
                      <img src={treatment.imageUrl} alt={treatment.name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-sage-secondary"><Sparkles className="h-6 w-6" /></div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-body-sm font-black text-ink-primary">{treatment.name}</p>
                    <p className="truncate text-label-caption font-semibold text-sage-secondary">{treatment.therapistName ?? "Kỹ thuật viên"}</p>
                    <div className="mt-xs flex items-center gap-sm text-label-caption font-bold text-sage-secondary">
                      <span>{treatment.durationMinutes} phút</span>
                      <span>·</span>
                      <span>{treatment.price.toLocaleString()}đ</span>
                      <span>·</span>
                      <span className="flex items-center gap-1"><Star className="h-3 w-3 text-amber-400 fill-amber-400" />{formatRating(Number(treatment.rating))}</span>
                    </div>
                  </div>
                  <div className={`shrink-0 h-5 w-5 rounded-full border-2 flex items-center justify-center transition-colors ${isLinked ? "border-primary bg-primary" : "border-botanical-border"}`}>
                    {isLinked && <span className="h-2 w-2 rounded-full bg-white" />}
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="mt-md flex items-center justify-between border-t border-botanical-border pt-md">
          <p className="text-body-sm font-semibold text-sage-secondary">
            <span className="font-black text-ink-primary">{selected.size}</span> liệu trình được chọn
          </p>
          <div className="flex gap-sm">
            <AdminSecondaryButton onClick={onClose}>Hủy</AdminSecondaryButton>
            <AdminPrimaryButton onClick={() => void handleSubmit()} disabled={submitting}>
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Link2 className="h-4 w-4" />}
              Xác nhận liên kết
            </AdminPrimaryButton>
          </div>
        </div>
      </div>
    </div>
  );
}
