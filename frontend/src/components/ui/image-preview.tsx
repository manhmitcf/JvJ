import { X } from "lucide-react";

interface ImagePreviewProps {
  url: string;
  onRemove?: () => void;
  alt?: string;
  isPrimary?: boolean;
  className?: string;
}

export function ImagePreview({
  url,
  onRemove,
  alt = "Ảnh preview",
  isPrimary = false,
  className = ""
}: ImagePreviewProps) {
  return (
    <div className={`relative overflow-hidden rounded-2xl border border-botanical-border bg-white ${className}`}>
      <img src={url} alt={alt} className="aspect-video w-full object-cover" />

      {isPrimary && (
        <div className="absolute left-2 top-2 rounded-full bg-primary px-2 py-0.5 text-xs font-black text-white">
          Ảnh chính
        </div>
      )}

      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-red-600 shadow-sm transition hover:bg-white"
          aria-label="Xóa ảnh"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
