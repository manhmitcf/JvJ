import { useEffect, useState, useRef } from "react";
import { Upload, Loader2, X } from "lucide-react";
import { type Spa, type SpaFormInput } from "@/types/spa";
import { AdminPrimaryButton, AdminSecondaryButton } from "./shared";
import { uploadFile } from "@/services/upload-service";

const emptyForm: SpaFormInput = {
  name: "",
  address: "",
  district: "Hải Châu",
  phone: "",
  email: "",
  openTime: "08:00",
  closeTime: "20:00",
  description: "",
  status: "active",
  imageUrls: [],
};

export function SpaFormDialog({ open, onClose, onSubmit, spa }: { open: boolean; onClose: () => void; onSubmit: (data: SpaFormInput) => void; spa?: Spa | null }) {
  const isEditing = Boolean(spa);
  const [form, setForm] = useState<SpaFormInput>(emptyForm);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) {
      setForm(emptyForm);
      return;
    }

    if (spa) {
      setForm({
        name: spa.name,
        address: spa.address,
        district: spa.district,
        phone: spa.phone,
        email: spa.email,
        openTime: spa.openTime,
        closeTime: spa.closeTime,
        description: spa.description ?? "",
        status: spa.status,
        imageUrls: spa.imageUrls,
      });
    } else {
      setForm(emptyForm);
    }
  }, [open, spa]);

  if (!open) return null;

  const update = (field: keyof SpaFormInput, value: string | number) => setForm((current) => ({ ...current, [field]: value }));

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setUploadError(null);
    try {
      for (const file of Array.from(files)) {
        const url = await uploadFile(file);
        setForm((current) => ({
          ...current,
          imageUrls: [...current.imageUrls, url],
        }));
      }
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload thất bại");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removeImage = (index: number) => {
    setForm((current) => ({
      ...current,
      imageUrls: current.imageUrls.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit(form);
    setForm(emptyForm);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-primary/35 px-md backdrop-blur-sm">
      <form
        className="w-full max-w-2xl rounded-[2rem] border border-botanical-border bg-white p-lg shadow-stitch-soft"
        onSubmit={handleSubmit}
      >
        <p className="text-label-caption font-black uppercase tracking-[0.2em] text-primary">Spa đối tác</p>
        <h2 className="mt-xs text-2xl font-black text-ink-primary">{isEditing ? "Cập nhật Spa" : "Thêm Spa mới"}</h2>
        <div className="mt-lg grid gap-sm md:grid-cols-2">
          <label className="flex flex-col gap-xs">
            <span className="text-label-caption font-black uppercase tracking-[0.14em] text-sage-secondary">Tên Spa</span>
            <input required value={form.name} onChange={(event) => update("name", event.target.value)} placeholder="Nhập tên Spa" className="rounded-2xl border border-botanical-border bg-warm-bg px-md py-sm text-body-sm font-semibold outline-none focus:border-primary" />
          </label>
          <label className="flex flex-col gap-xs">
            <span className="text-label-caption font-black uppercase tracking-[0.14em] text-sage-secondary">Quận/Huyện</span>
            <input required value={form.district} onChange={(event) => update("district", event.target.value)} placeholder="Nhập quận/huyện" className="rounded-2xl border border-botanical-border bg-warm-bg px-md py-sm text-body-sm font-semibold outline-none focus:border-primary" />
          </label>
          <label className="flex flex-col gap-xs">
            <span className="text-label-caption font-black uppercase tracking-[0.14em] text-sage-secondary">Số điện thoại</span>
            <input required value={form.phone} onChange={(event) => update("phone", event.target.value)} placeholder="Nhập số điện thoại" className="rounded-2xl border border-botanical-border bg-warm-bg px-md py-sm text-body-sm font-semibold outline-none focus:border-primary" />
          </label>
          <label className="flex flex-col gap-xs">
            <span className="text-label-caption font-black uppercase tracking-[0.14em] text-sage-secondary">Email</span>
            <input required type="email" value={form.email} onChange={(event) => update("email", event.target.value)} placeholder="Nhập email" className="rounded-2xl border border-botanical-border bg-warm-bg px-md py-sm text-body-sm font-semibold outline-none focus:border-primary" />
          </label>
          <label className="flex flex-col gap-xs">
            <span className="text-label-caption font-black uppercase tracking-[0.14em] text-sage-secondary">Giờ mở</span>
            <input required value={form.openTime} onChange={(event) => update("openTime", event.target.value)} placeholder="Nhập giờ mở" className="rounded-2xl border border-botanical-border bg-warm-bg px-md py-sm text-body-sm font-semibold outline-none focus:border-primary" />
          </label>
          <label className="flex flex-col gap-xs">
            <span className="text-label-caption font-black uppercase tracking-[0.14em] text-sage-secondary">Giờ đóng</span>
            <input required value={form.closeTime} onChange={(event) => update("closeTime", event.target.value)} placeholder="Nhập giờ đóng" className="rounded-2xl border border-botanical-border bg-warm-bg px-md py-sm text-body-sm font-semibold outline-none focus:border-primary" />
          </label>
        </div>
        <label className="mt-sm flex flex-col gap-xs">
          <span className="text-label-caption font-black uppercase tracking-[0.14em] text-sage-secondary">Địa chỉ</span>
          <input required value={form.address} onChange={(event) => update("address", event.target.value)} placeholder="Nhập địa chỉ đầy đủ" className="rounded-2xl border border-botanical-border bg-warm-bg px-md py-sm text-body-sm font-semibold outline-none focus:border-primary" />
        </label>
        <label className="mt-sm flex flex-col gap-xs">
          <span className="text-label-caption font-black uppercase tracking-[0.14em] text-sage-secondary">Mô tả ngắn</span>
          <textarea required value={form.description} onChange={(event) => update("description", event.target.value)} placeholder="Nhập mô tả ngắn" rows={3} className="rounded-2xl border border-botanical-border bg-warm-bg px-md py-sm text-body-sm font-semibold outline-none focus:border-primary" />
        </label>
        <label className="mt-sm flex flex-col gap-xs">
          <span className="text-label-caption font-black uppercase tracking-[0.14em] text-sage-secondary">Hình ảnh Spa</span>
          <div className="flex flex-wrap gap-sm">
            {form.imageUrls.map((url, i) => (
              <div key={i} className="relative h-24 w-24 overflow-hidden rounded-2xl border border-botanical-border">
                <img src={url} alt="" className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-ink-primary/70 text-white hover:bg-red-500"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
            <label className={`relative flex h-24 w-24 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-botanical-border bg-warm-bg transition ${uploading ? "cursor-wait opacity-60" : "hover:border-primary hover:bg-soft-mint"}`}>
              {uploading ? (
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              ) : (
                <Upload className="h-6 w-6 text-primary" />
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                onChange={handleFileSelect}
                disabled={uploading}
                className="hidden"
              />
            </label>
          </div>
          {uploadError && <p className="mt-xs text-xs font-semibold text-red-600">{uploadError}</p>}
        </label>
        <div className="mt-lg flex justify-end gap-sm">
          <AdminSecondaryButton onClick={onClose}>Hủy</AdminSecondaryButton>
          <AdminPrimaryButton type="submit">{isEditing ? "Cập nhật" : "Lưu Spa"}</AdminPrimaryButton>
        </div>
      </form>
    </div>
  );
}
