import { type ReactNode } from "react";
import { Search } from "lucide-react";

export function AdminStatusBadge({ children, tone = "slate", className = "" }: { children: ReactNode; tone?: "teal" | "amber" | "red" | "slate" | "green" | "blue"; className?: string }) {
  const tones = {
    teal: "bg-primary/10 text-primary",
    amber: "bg-[#FEF3C7] text-[#A16207]",
    red: "bg-[#FEE2E2] text-[#B91C1C]",
    slate: "bg-[#EEF2F0] text-sage-secondary",
    green: "bg-[#DCFCE7] text-[#15803D]",
    blue: "bg-[#DBEAFE] text-[#2563EB]",
  };

  return <span className={`inline-flex rounded-full px-sm py-1 text-xs font-black ${tones[tone]} ${className}`}>{children}</span>;
}

export function AdminPrimaryButton({ children, onClick, type = "button", className = "" }: { children: ReactNode; onClick?: () => void; type?: "button" | "submit"; className?: string }) {
  return (
    <button type={type} onClick={onClick} className={`inline-flex items-center justify-center gap-xs rounded-2xl bg-primary px-md py-sm text-body-sm font-black text-white shadow-stitch-soft transition-colors hover:bg-[#115E59] ${className}`}>
      {children}
    </button>
  );
}

export function AdminSecondaryButton({ children, onClick, type = "button", tone = "default" }: { children: ReactNode; onClick?: () => void; type?: "button" | "submit"; tone?: "default" | "danger" }) {
  return (
    <button type={type} onClick={onClick} className={`inline-flex items-center justify-center gap-xs rounded-2xl border px-md py-sm text-body-sm font-black transition-colors ${tone === "danger" ? "border-red-200 bg-red-50 text-[#B91C1C] hover:bg-red-100" : "border-botanical-border bg-white text-ink-primary hover:bg-soft-mint"}`}>
      {children}
    </button>
  );
}

export function AdminMetricCard({ label, value, helper, icon }: { label: string; value: string; helper: string; icon?: ReactNode }) {
  return (
    <div className="rounded-[2rem] border border-botanical-border bg-white p-lg shadow-stitch-soft">
      <div className="flex items-start justify-between gap-md">
        <div>
          <p className="text-body-sm font-bold text-sage-secondary">{label}</p>
          <p className="mt-xs text-3xl font-black text-ink-primary">{value}</p>
        </div>
        {icon && <div className="rounded-2xl bg-soft-mint p-sm text-primary">{icon}</div>}
      </div>
      <p className="mt-xs text-body-sm font-semibold text-sage-secondary">{helper}</p>
    </div>
  );
}

export function AdminSearchBar({ value, onChange, placeholder }: { value: string; onChange: (value: string) => void; placeholder: string }) {
  return (
    <label className="flex h-12 items-center gap-sm rounded-2xl border border-botanical-border bg-white px-md text-sage-secondary shadow-sm focus-within:border-primary">
      <Search className="h-5 w-5" />
      <input value={value} onChange={(event) => onChange(event.target.value)} className="w-full bg-transparent text-body-sm font-semibold outline-none placeholder:text-sage-secondary/70" placeholder={placeholder} />
    </label>
  );
}

export function AdminTableShell({ children }: { children: ReactNode }) {
  return <div className="overflow-hidden rounded-[2rem] border border-botanical-border bg-white shadow-stitch-soft">{children}</div>;
}

export function AdminEmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-[2rem] border border-dashed border-botanical-border bg-white p-xl text-center">
      <p className="text-body-md font-black text-ink-primary">{title}</p>
      <p className="mt-xs text-body-sm font-semibold text-sage-secondary">{description}</p>
    </div>
  );
}
