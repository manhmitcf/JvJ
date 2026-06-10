import { Image, MoreHorizontal, ToggleRight, Video } from "lucide-react";

export function FormSection({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-xl font-black text-ink-primary">{title}</h2>
      <p className="mt-xs text-body-sm font-medium text-sage-secondary">{description}</p>
      <div className="mt-md space-y-md">{children}</div>
    </section>
  );
}

export function TextField({ label, value, onChange, placeholder, type = "text" }: {
  label: string;
  value: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="mb-xs block text-body-sm font-black text-ink-primary">{label}</span>
      <input
        type={type}
        className="h-12 w-full rounded-2xl border border-botanical-border bg-white px-md text-body-sm font-semibold text-ink-primary outline-none focus:border-primary focus:ring-4 focus:ring-soft-mint"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
      />
    </label>
  );
}

export function TextArea({ label, value, onChange, placeholder }: {
  label: string;
  value: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="mb-xs block text-body-sm font-black text-ink-primary">{label}</span>
      <textarea
        className="min-h-28 w-full rounded-2xl border border-botanical-border bg-white px-md py-sm text-body-sm font-semibold text-ink-primary outline-none focus:border-primary focus:ring-4 focus:ring-soft-mint"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
      />
    </label>
  );
}

export function SelectField({ label, value }: { label: string; value: string }) {
  return (
    <label className="block">
      <span className="mb-xs block text-body-sm font-black text-ink-primary">{label}</span>
      <div className="flex h-12 items-center justify-between rounded-2xl border border-botanical-border bg-white px-md text-body-sm font-semibold text-ink-primary">
        {value}
        <MoreHorizontal className="h-5 w-5 text-sage-secondary" />
      </div>
    </label>
  );
}

export function TreatmentMediaFields({ images }: { images: string[] }) {
  return (
    <FormSection title="Ảnh & video liệu trình" description="Thêm media để khách hàng hình dung rõ không gian, dụng cụ và phong cách trị liệu.">
      <div className="grid gap-md md:grid-cols-2">
        <button className="flex min-h-44 flex-col items-center justify-center rounded-[1.5rem] border-2 border-dashed border-botanical-border bg-warm-bg p-lg text-center transition hover:border-primary hover:bg-soft-mint">
          <Image className="h-8 w-8 text-primary" />
          <span className="mt-sm font-black text-ink-primary">Thêm ảnh liệu trình</span>
          <span className="mt-xs text-label-caption font-semibold text-sage-secondary">JPG, PNG, WebP · tối đa 5 ảnh</span>
        </button>
        <button className="flex min-h-44 flex-col items-center justify-center rounded-[1.5rem] border-2 border-dashed border-botanical-border bg-warm-bg p-lg text-center transition hover:border-primary hover:bg-soft-mint">
          <Video className="h-8 w-8 text-primary" />
          <span className="mt-sm font-black text-ink-primary">Thêm video giới thiệu</span>
          <span className="mt-xs text-label-caption font-semibold text-sage-secondary">MP4 hoặc link video · tối đa 60 giây</span>
        </button>
      </div>
      <div className="grid gap-sm sm:grid-cols-3">
        {images.map((image, index) => (
          <div key={image} className="relative overflow-hidden rounded-2xl border border-botanical-border bg-white">
            <img src={image} alt={`Media liệu trình ${index + 1}`} className="h-24 w-full object-cover" />
            <button className="absolute right-2 top-2 rounded-full bg-white/90 px-2 py-1 text-[10px] font-black text-primary shadow-sm">Đổi</button>
          </div>
        ))}
      </div>
    </FormSection>
  );
}

export function AvailabilityToggle() {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-botanical-border bg-warm-bg p-md">
      <div>
        <p className="font-black text-ink-primary">Cho phép khách hàng đặt lịch</p>
        <p className="text-body-sm font-medium text-sage-secondary">Liệu trình sẽ hiển thị trên marketplace JvJ.</p>
      </div>
      <ToggleRight className="h-10 w-10 text-primary" />
    </div>
  );
}
