import { Search } from "lucide-react";
import { cn } from "@/utils/cn";

export function StatusBadge({ children, tone = "teal" }: { children: React.ReactNode; tone?: "teal" | "green" | "amber" | "blue" | "red" | "slate" }) {
  const toneClass = {
    teal: "bg-[#CCFBF1] text-primary",
    green: "bg-[#DCFCE7] text-success-leaf",
    amber: "bg-[#FEF3C7] text-pending-amber",
    blue: "bg-[#DBEAFE] text-[#2563EB]",
    red: "bg-[#FEE2E2] text-[#B91C1C]",
    slate: "bg-[#F1F5F9] text-[#64748B]",
  }[tone];

  return <span className={cn("inline-flex rounded-full px-sm py-xs text-label-caption font-black", toneClass)}>{children}</span>;
}

export function SearchBar({ placeholder, value, onChange }: { placeholder: string; value?: string; onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void }) {
  return (
    <label className="flex h-12 flex-1 items-center gap-sm rounded-full border border-botanical-border bg-white px-md text-sage-secondary focus-within:border-primary focus-within:ring-4 focus-within:ring-soft-mint">
      <Search className="h-5 w-5" />
      <input
        className="w-full border-none bg-transparent text-body-sm font-semibold outline-none placeholder:text-muted-text"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
      />
    </label>
  );
}

export function PrimaryButton({ children, className, onClick, disabled }: { children: React.ReactNode; className?: string; onClick?: () => void; disabled?: boolean }) {
  return <button onClick={onClick} disabled={disabled} className={cn("inline-flex items-center justify-center gap-xs rounded-2xl bg-primary px-lg py-sm text-body-sm font-black text-on-primary shadow-lg shadow-primary/10 transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60", className)}>{children}</button>;
}

export function SecondaryButton({ children, className, onClick, disabled }: { children: React.ReactNode; className?: string; onClick?: () => void; disabled?: boolean }) {
  return <button onClick={onClick} disabled={disabled} className={cn("inline-flex items-center justify-center gap-xs rounded-2xl border border-botanical-border bg-white px-md py-sm text-body-sm font-black text-ink-primary transition hover:border-primary hover:bg-soft-mint disabled:cursor-not-allowed disabled:opacity-60", className)}>{children}</button>;
}

export function MetricCard({ icon: Icon, label, value, hint, tone = "teal" }: { icon: React.ElementType; label: string; value: string; hint: string; tone?: "teal" | "green" | "amber" | "blue" }) {
  const toneClass = {
    teal: "bg-soft-mint text-primary",
    green: "bg-gentle-wash text-success-leaf",
    amber: "bg-[#FEF3C7] text-pending-amber",
    blue: "bg-[#DBEAFE] text-[#2563EB]",
  }[tone];

  return (
    <div className="rounded-[1.5rem] border border-botanical-border bg-white p-lg shadow-stitch-soft transition hover:-translate-y-0.5 hover:border-primary">
      <div className="mb-md flex items-center gap-sm">
        <div className={cn("flex h-11 w-11 items-center justify-center rounded-2xl", toneClass)}>
          <Icon className="h-5 w-5" />
        </div>
        <p className="text-body-sm font-bold text-sage-secondary">{label}</p>
      </div>
      <div className="text-3xl font-black text-ink-primary">{value}</div>
      <p className="mt-xs text-label-caption font-semibold text-muted-text">{hint}</p>
    </div>
  );
}
