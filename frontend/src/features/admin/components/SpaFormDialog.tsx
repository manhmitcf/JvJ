import { useState } from "react";
import { type SpaFormInput } from "@/types/spa";
import { AdminPrimaryButton, AdminSecondaryButton } from "./shared";

const initialForm: SpaFormInput = {
  name: "",
  address: "",
  district: "Hải Châu",
  latitude: 16.047079,
  longitude: 108.206230,
  phone: "",
  email: "",
  openTime: "08:00",
  closeTime: "20:00",
  description: "",
  status: "active",
  imageUrls: [],
};

export function SpaFormDialog({ open, onClose, onSubmit }: { open: boolean; onClose: () => void; onSubmit: (data: SpaFormInput) => void }) {
  const [form, setForm] = useState<SpaFormInput>(initialForm);

  if (!open) return null;

  const update = (field: keyof SpaFormInput, value: string | number) => setForm((current) => ({ ...current, [field]: value }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-primary/35 px-md backdrop-blur-sm">
      <form
        className="w-full max-w-2xl rounded-[2rem] border border-botanical-border bg-white p-lg shadow-stitch-soft"
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit(form);
          setForm(initialForm);
        }}
      >
        <p className="text-label-caption font-black uppercase tracking-[0.2em] text-primary">Spa đối tác</p>
        <h2 className="mt-xs text-2xl font-black text-ink-primary">Thêm Spa mới</h2>
        <div className="mt-lg grid gap-sm md:grid-cols-2">
          <input required value={form.name} onChange={(event) => update("name", event.target.value)} placeholder="Tên Spa" className="rounded-2xl border border-botanical-border bg-warm-bg px-md py-sm text-body-sm font-semibold outline-none focus:border-primary" />
          <input required value={form.district} onChange={(event) => update("district", event.target.value)} placeholder="Quận/Huyện" className="rounded-2xl border border-botanical-border bg-warm-bg px-md py-sm text-body-sm font-semibold outline-none focus:border-primary" />
          <input required value={form.phone} onChange={(event) => update("phone", event.target.value)} placeholder="Số điện thoại" className="rounded-2xl border border-botanical-border bg-warm-bg px-md py-sm text-body-sm font-semibold outline-none focus:border-primary" />
          <input required type="email" value={form.email} onChange={(event) => update("email", event.target.value)} placeholder="Email" className="rounded-2xl border border-botanical-border bg-warm-bg px-md py-sm text-body-sm font-semibold outline-none focus:border-primary" />
          <input required type="number" step="any" value={form.latitude} onChange={(event) => update("latitude", Number.parseFloat(event.target.value))} placeholder="Latitude (VD: 16.047079)" className="rounded-2xl border border-botanical-border bg-warm-bg px-md py-sm text-body-sm font-semibold outline-none focus:border-primary" />
          <input required type="number" step="any" value={form.longitude} onChange={(event) => update("longitude", Number.parseFloat(event.target.value))} placeholder="Longitude (VD: 108.206230)" className="rounded-2xl border border-botanical-border bg-warm-bg px-md py-sm text-body-sm font-semibold outline-none focus:border-primary" />
          <input required value={form.openTime} onChange={(event) => update("openTime", event.target.value)} placeholder="Giờ mở" className="rounded-2xl border border-botanical-border bg-warm-bg px-md py-sm text-body-sm font-semibold outline-none focus:border-primary" />
          <input required value={form.closeTime} onChange={(event) => update("closeTime", event.target.value)} placeholder="Giờ đóng" className="rounded-2xl border border-botanical-border bg-warm-bg px-md py-sm text-body-sm font-semibold outline-none focus:border-primary" />
        </div>
        <input required value={form.address} onChange={(event) => update("address", event.target.value)} placeholder="Địa chỉ" className="mt-sm w-full rounded-2xl border border-botanical-border bg-warm-bg px-md py-sm text-body-sm font-semibold outline-none focus:border-primary" />
        <textarea required value={form.description} onChange={(event) => update("description", event.target.value)} placeholder="Mô tả ngắn" rows={3} className="mt-sm w-full rounded-2xl border border-botanical-border bg-warm-bg px-md py-sm text-body-sm font-semibold outline-none focus:border-primary" />
        <div className="mt-lg flex justify-end gap-sm">
          <AdminSecondaryButton onClick={onClose}>Hủy</AdminSecondaryButton>
          <AdminPrimaryButton type="submit">Lưu Spa</AdminPrimaryButton>
        </div>
      </form>
    </div>
  );
}
