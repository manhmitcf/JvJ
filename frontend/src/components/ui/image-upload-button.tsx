import { useState, useRef } from "react";
import { Upload, Loader2 } from "lucide-react";
import { uploadFile } from "@/services/upload-service";

interface ImageUploadButtonProps {
  onUpload: (url: string) => void;
  onError?: (error: string) => void;
  multiple?: boolean;
  maxFiles?: number;
  accept?: string;
  label: string;
  hint?: string;
  disabled?: boolean;
  icon?: React.ReactNode;
}

export function ImageUploadButton({
  onUpload,
  onError,
  multiple = false,
  maxFiles = 1,
  accept = "image/jpeg,image/png,image/webp",
  label,
  hint,
  disabled = false,
  icon = <Upload className="h-6 w-6" />
}: ImageUploadButtonProps) {
  const [isUploading, setIsUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    // Validate file count
    if (files.length > maxFiles) {
      onError?.(`Tối đa ${maxFiles} ảnh`);
      return;
    }

    setIsUploading(true);
    try {
      if (multiple) {
        // Upload multiple files sequentially
        for (const file of Array.from(files)) {
          const url = await uploadFile(file);
          onUpload(url);
        }
      } else {
        // Upload single file
        const url = await uploadFile(files[0]);
        onUpload(url);
      }

      // Reset input
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Upload thất bại";
      onError?.(message);
      console.error("Upload error:", error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <label
      className={`flex min-h-32 cursor-pointer flex-col items-center justify-center rounded-[1.5rem] border-2 border-dashed border-botanical-border bg-warm-bg p-lg text-center transition ${
        isUploading || disabled
          ? "cursor-wait opacity-60"
          : "hover:border-primary hover:bg-soft-mint"
      }`}
    >
      {isUploading ? (
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      ) : (
        <div className="text-primary">{icon}</div>
      )}
      <span className="mt-sm font-black text-ink-primary">
        {isUploading ? "Đang tải lên..." : label}
      </span>
      {hint && (
        <span className="mt-xs text-label-caption font-semibold text-sage-secondary">
          {hint}
        </span>
      )}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleFileSelect}
        disabled={isUploading || disabled}
        className="hidden"
      />
    </label>
  );
}
