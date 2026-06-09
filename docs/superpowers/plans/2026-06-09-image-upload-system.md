# Image Upload System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement image upload system với Docker volume storage cho treatments, therapist profiles, và spa images

**Architecture:** Frontend upload file → Backend validate & save vào `/app/media/uploads/` (mounted từ `media-uploads/` volume) → Django serve qua `/media/*` URL → Frontend hiển thị preview

**Tech Stack:** Django REST Framework, React + TypeScript, Docker volumes, FormData API

---

## Phase 1: Backend Setup

### Task 1: Update Django Media Settings

**Files:**
- Modify: `backend/jvj_api/settings/base.py:142-144`

- [ ] **Step 1: Update MEDIA_ROOT to absolute path**

File: `backend/jvj_api/settings/base.py`

Thay đổi từ:
```python
# --- Media files (User-uploaded content) ---
MEDIA_URL = "/media/"
MEDIA_ROOT = BASE_DIR / "media"
```

Sang:
```python
# --- Media files (User-uploaded content) ---
MEDIA_URL = "/media/"
MEDIA_ROOT = Path("/app/media")  # Absolute path for Docker volume mount
```

Lý do: Docker volume mount tại `/app/media/`, cần absolute path thay vì relative

- [ ] **Step 2: Verify settings file syntax**

Run:
```powershell
cd backend
python -c "from jvj_api.settings.base import MEDIA_ROOT; print(f'MEDIA_ROOT: {MEDIA_ROOT}')"
```

Expected output: `MEDIA_ROOT: /app/media`

- [ ] **Step 3: Commit changes**

```powershell
git add backend/jvj_api/settings/base.py
git commit -m "config(backend): change MEDIA_ROOT to absolute path for Docker"
```

---

### Task 2: Update Dockerfile Permissions

**Files:**
- Modify: `backend/Dockerfile:19-21`

- [ ] **Step 1: Update mkdir command with ownership**

File: `backend/Dockerfile`

Thay đổi line 19-21 từ:
```dockerfile
# Tạo thư mục media với permissions
RUN mkdir -p /app/media/uploads && \
    chmod -R 755 /app/media
```

Sang:
```dockerfile
# Tạo thư mục media với permissions
RUN mkdir -p /app/media/uploads && \
    chown -R jvjuser:jvjuser /app/media && \
    chmod -R 755 /app/media
```

Lý do: Đảm bảo jvjuser (non-root) có quyền write vào /app/media khi volume mount

- [ ] **Step 2: Rebuild Docker image**

Run:
```powershell
cd C:\Users\manhm\Desktop\Project_JvJ
.\docker-run.ps1
```

Expected: Backend container starts successfully

- [ ] **Step 3: Verify upload endpoint**

Run:
```powershell
# Tạo test image file
$testImage = "C:\Users\manhm\Desktop\test-upload.jpg"
curl -X POST http://localhost:8000/api/v1/upload/ -F "file=@$testImage"
```

Expected response:
```json
{
  "data": {
    "url": "http://localhost:8000/media/uploads/xxx-xxx-xxx.jpg"
  }
}
```

- [ ] **Step 4: Verify file exists in volume**

Run:
```powershell
ls C:\Users\manhm\Desktop\Project_JvJ\media-uploads\uploads
```

Expected: File với UUID filename tồn tại

- [ ] **Step 5: Commit changes**

```powershell
git add backend/Dockerfile
git commit -m "fix(docker): add ownership for jvjuser to media directory"
```

---

## Phase 2: Reusable Components

### Task 3: Create ImageUploadButton Component

**Files:**
- Create: `frontend/src/components/ui/image-upload-button.tsx`

- [ ] **Step 1: Create component file with interface**

File: `frontend/src/components/ui/image-upload-button.tsx`

```typescript
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
```

- [ ] **Step 2: Verify TypeScript compilation**

Run:
```powershell
cd frontend
npm run build
```

Expected: No TypeScript errors

- [ ] **Step 3: Commit component**

```powershell
git add frontend/src/components/ui/image-upload-button.tsx
git commit -m "feat(ui): add ImageUploadButton reusable component"
```

---

### Task 4: Create ImagePreview Component

**Files:**
- Create: `frontend/src/components/ui/image-preview.tsx`

- [ ] **Step 1: Create component file**

File: `frontend/src/components/ui/image-preview.tsx`

```typescript
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
```

- [ ] **Step 2: Verify TypeScript compilation**

Run:
```powershell
cd frontend
npm run build
```

Expected: No TypeScript errors

- [ ] **Step 3: Commit component**

```powershell
git add frontend/src/components/ui/image-preview.tsx
git commit -m "feat(ui): add ImagePreview reusable component"
```

---

## Phase 3: Treatment Form Integration

### Task 5: Refactor TreatmentForm to Use New Components

**Files:**
- Modify: `frontend/src/features/therapist/components/TreatmentForm.tsx:256-303`

- [ ] **Step 1: Import new components**

File: `frontend/src/features/therapist/components/TreatmentForm.tsx`

Add imports sau line 13:
```typescript
import { ImageUploadButton } from "@/components/ui/image-upload-button";
import { ImagePreview } from "@/components/ui/image-preview";
```

- [ ] **Step 2: Replace upload UI (lines 256-303)**

Thay thế section "Ảnh liệu trình" (lines 256-303) bằng:

```typescript
<FormSection title="Ảnh liệu trình" description="Thêm tối đa 5 ảnh. Ảnh đầu tiên là ảnh chính.">
  <div className="space-y-md">
    {/* Preview existing images */}
    {form.images.length > 0 && (
      <div className="grid grid-cols-2 gap-md md:grid-cols-3">
        {form.images.map((url, index) => (
          <ImagePreview
            key={index}
            url={url}
            alt={`Ảnh ${index + 1}`}
            isPrimary={index === 0}
            onRemove={() => removeImage(index)}
          />
        ))}
      </div>
    )}

    {/* Upload button */}
    {form.images.length < 5 && (
      <ImageUploadButton
        multiple
        maxFiles={5 - form.images.length}
        label={`Thêm ảnh (${form.images.length}/5)`}
        hint="JPG, PNG, WebP · tối đa 5MB mỗi ảnh"
        disabled={uploading}
        onUpload={(url) => update("images", [...form.images, url])}
        onError={(err) => setError(err)}
      />
    )}
  </div>
</FormSection>
```

- [ ] **Step 3: Remove old handleImageUpload function (lines 73-98)**

Xóa function `handleImageUpload` vì logic đã được move vào `ImageUploadButton`

- [ ] **Step 4: Verify TypeScript compilation**

Run:
```powershell
cd frontend
npm run build
```

Expected: No TypeScript errors

- [ ] **Step 5: Test in browser**

Run:
```powershell
cd frontend
npm run dev
```

Navigate to: http://localhost:5173/therapist/treatments/new

Expected:
- Upload button hiển thị đúng
- Chọn file → upload thành công → preview hiển thị
- Xóa ảnh hoạt động
- Submit form gửi URLs

- [ ] **Step 6: Commit changes**

```powershell
git add frontend/src/features/therapist/components/TreatmentForm.tsx
git commit -m "refactor(treatment): use reusable upload components in TreatmentForm"
```

---

## Phase 4: Profile Form Integration

### Task 6: Add Portrait Upload to TherapistProfilePage

**Files:**
- Modify: `frontend/src/features/therapist/pages/TherapistPages.tsx:670-678`

- [ ] **Step 1: Import upload components**

File: `frontend/src/features/therapist/pages/TherapistPages.tsx`

Add imports sau line 50:
```typescript
import { uploadFile } from "@/services/upload-service";
```

- [ ] **Step 2: Add upload state**

Trong `TherapistProfilePage` function, sau line 602, thêm state:

```typescript
const [uploadingPortrait, setUploadingPortrait] = useState(false);
const [uploadError, setUploadError] = useState<string | null>(null);
```

- [ ] **Step 3: Add upload handler**

Sau state declarations, thêm function:

```typescript
const handlePortraitUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
  const file = event.target.files?.[0];
  if (!file) return;

  setUploadingPortrait(true);
  setUploadError(null);
  try {
    const url = await uploadFile(file);
    // Update profile với portrait URL mới
    await saveProfile({ portraitUrl: url });
    event.target.value = ""; // Reset input
  } catch (error) {
    const message = error instanceof Error ? error.message : "Upload thất bại";
    setUploadError(message);
    console.error("Portrait upload error:", error);
  } finally {
    setUploadingPortrait(false);
  }
};
```

- [ ] **Step 4: Update portrait UI (lines 670-678)**

Thay thế section avatar upload bằng:

```typescript
<div className="text-center">
  <label className={`relative mx-auto block h-32 w-32 overflow-hidden rounded-[1.5rem] border-2 border-botanical-border transition ${uploadingPortrait ? 'cursor-wait opacity-60' : 'cursor-pointer hover:border-primary'}`}>
    <img 
      src={profile?.portraitUrl || profile?.avatarUrl || "/placeholder-avatar.png"} 
      alt="Ảnh chân dung kỹ thuật viên" 
      className="h-full w-full object-cover" 
    />
    <div className="absolute inset-x-0 bottom-0 bg-black/40 py-xs text-label-caption font-black text-white">
      {uploadingPortrait ? "Đang tải..." : "Đổi ảnh"}
    </div>
    <input 
      type="file" 
      accept="image/jpeg,image/png,image/webp" 
      onChange={handlePortraitUpload}
      disabled={uploadingPortrait}
      className="sr-only" 
    />
  </label>
  <p className="mt-sm text-label-caption font-bold text-sage-secondary">
    Tải lên ảnh chân dung
  </p>
  {uploadError && (
    <p className="mt-xs text-xs font-semibold text-red-600">{uploadError}</p>
  )}
</div>
```

- [ ] **Step 5: Verify TypeScript compilation**

Run:
```powershell
cd frontend
npm run build
```

Expected: No TypeScript errors

- [ ] **Step 6: Test portrait upload**

Run frontend, navigate to: http://localhost:5173/therapist/profile

Expected:
- Click avatar → chọn file → upload → preview update
- Error handling hiển thị nếu upload fail

- [ ] **Step 7: Commit changes**

```powershell
git add frontend/src/features/therapist/pages/TherapistPages.tsx
git commit -m "feat(profile): add portrait image upload to TherapistProfilePage"
```

---

### Task 7: Add Citizen ID Uploads to TherapistProfilePage

**Files:**
- Modify: `frontend/src/features/therapist/pages/TherapistPages.tsx:710-727`

- [ ] **Step 1: Add citizen ID upload state**

Trong `TherapistProfilePage`, thêm state sau portrait state:

```typescript
const [uploadingCitizenId, setUploadingCitizenId] = useState<'front' | 'back' | null>(null);
```

- [ ] **Step 2: Add citizen ID upload handlers**

```typescript
const handleCitizenIdFrontUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
  const file = event.target.files?.[0];
  if (!file) return;

  setUploadingCitizenId('front');
  setUploadError(null);
  try {
    const url = await uploadFile(file);
    await saveProfile({ citizenIdFrontUrl: url });
    event.target.value = "";
  } catch (error) {
    const message = error instanceof Error ? error.message : "Upload thất bại";
    setUploadError(message);
  } finally {
    setUploadingCitizenId(null);
  }
};

const handleCitizenIdBackUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
  const file = event.target.files?.[0];
  if (!file) return;

  setUploadingCitizenId('back');
  setUploadError(null);
  try {
    const url = await uploadFile(file);
    await saveProfile({ citizenIdBackUrl: url });
    event.target.value = "";
  } catch (error) {
    const message = error instanceof Error ? error.message : "Upload thất bại";
    setUploadError(message);
  } finally {
    setUploadingCitizenId(null);
  }
};
```

- [ ] **Step 3: Update documents section UI (lines 710-727)**

Thay thế documents grid bằng:

```typescript
<div className="grid gap-md md:grid-cols-2">
  {/* Citizen ID Front */}
  <label className={`flex cursor-pointer items-center gap-md rounded-3xl border border-botanical-border bg-warm-bg p-md transition ${uploadingCitizenId === 'front' ? 'opacity-60' : 'hover:bg-soft-mint'}`}>
    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-soft-mint text-primary">
      <IdCard className="h-5 w-5" />
    </div>
    <div className="min-w-0 flex-1">
      <p className="font-black text-ink-primary">CCCD Mặt trước</p>
      <p className="text-label-caption font-semibold text-sage-secondary">
        {uploadingCitizenId === 'front' ? 'Đang tải...' : profile?.citizenIdFrontUrl ? 'Đã tải lên' : 'Chưa tải lên'}
      </p>
    </div>
    <StatusBadge tone={profile?.citizenIdFrontUrl ? "teal" : "slate"}>
      {profile?.citizenIdFrontUrl ? "Đã có" : "Chưa có"}
    </StatusBadge>
    <input
      type="file"
      accept="image/jpeg,image/png,image/webp"
      onChange={handleCitizenIdFrontUpload}
      disabled={uploadingCitizenId !== null}
      className="sr-only"
    />
  </label>

  {/* Citizen ID Back */}
  <label className={`flex cursor-pointer items-center gap-md rounded-3xl border border-botanical-border bg-warm-bg p-md transition ${uploadingCitizenId === 'back' ? 'opacity-60' : 'hover:bg-soft-mint'}`}>
    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-soft-mint text-primary">
      <IdCard className="h-5 w-5" />
    </div>
    <div className="min-w-0 flex-1">
      <p className="font-black text-ink-primary">CCCD Mặt sau</p>
      <p className="text-label-caption font-semibold text-sage-secondary">
        {uploadingCitizenId === 'back' ? 'Đang tải...' : profile?.citizenIdBackUrl ? 'Đã tải lên' : 'Chưa tải lên'}
      </p>
    </div>
    <StatusBadge tone={profile?.citizenIdBackUrl ? "teal" : "slate"}>
      {profile?.citizenIdBackUrl ? "Đã có" : "Chưa có"}
    </StatusBadge>
    <input
      type="file"
      accept="image/jpeg,image/png,image/webp"
      onChange={handleCitizenIdBackUpload}
      disabled={uploadingCitizenId !== null}
      className="sr-only"
    />
  </label>

  {/* Certificates - keep existing static display for now */}
  <div className="flex items-center gap-md rounded-3xl border border-botanical-border bg-warm-bg p-md">
    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-soft-mint text-primary">
      <FileText className="h-5 w-5" />
    </div>
    <div className="min-w-0 flex-1">
      <p className="font-black text-ink-primary">Chứng chỉ hành nghề</p>
      <p className="text-label-caption font-semibold text-sage-secondary">
        {certificateUrls.length > 0 ? `${certificateUrls.length} file đã tải lên` : 'Chưa tải lên'}
      </p>
    </div>
    <StatusBadge tone={certificateUrls.length > 0 ? "teal" : "slate"}>
      {certificateUrls.length > 0 ? "Đã có" : "Chưa có"}
    </StatusBadge>
  </div>
</div>
```

- [ ] **Step 4: Test citizen ID uploads**

Navigate to: http://localhost:5173/therapist/profile

Expected:
- Click CCCD cards → chọn file → upload → status update
- Loading state hiển thị
- Error handling works

- [ ] **Step 5: Commit changes**

```powershell
git add frontend/src/features/therapist/pages/TherapistPages.tsx
git commit -m "feat(profile): add citizen ID uploads to TherapistProfilePage"
```

---

### Task 8: Add Certificate Uploads to TherapistProfilePage

**Files:**
- Modify: `frontend/src/features/therapist/pages/TherapistPages.tsx` (certificates section)

- [ ] **Step 1: Add certificate upload state**

```typescript
const [uploadingCertificate, setUploadingCertificate] = useState(false);
```

- [ ] **Step 2: Add certificate upload handler**

```typescript
const handleCertificateUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
  const files = event.target.files;
  if (!files || files.length === 0) return;

  setUploadingCertificate(true);
  setUploadError(null);
  try {
    const uploadPromises = Array.from(files).map(f => uploadFile(f));
    const urls = await Promise.all(uploadPromises);
    
    // Merge with existing certificates
    const newCertificateUrls = [...certificateUrls, ...urls];
    await saveProfile({ certificateUrls: newCertificateUrls });
    
    event.target.value = "";
  } catch (error) {
    const message = error instanceof Error ? error.message : "Upload thất bại";
    setUploadError(message);
  } finally {
    setUploadingCertificate(false);
  }
};
```

- [ ] **Step 3: Update certificates UI**

Thay thế static certificates display bằng:

```typescript
<label className={`flex cursor-pointer items-center gap-md rounded-3xl border border-botanical-border bg-warm-bg p-md transition ${uploadingCertificate ? 'opacity-60' : 'hover:bg-soft-mint'}`}>
  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-soft-mint text-primary">
    <FileText className="h-5 w-5" />
  </div>
  <div className="min-w-0 flex-1">
    <p className="font-black text-ink-primary">Chứng chỉ hành nghề</p>
    <p className="text-label-caption font-semibold text-sage-secondary">
      {uploadingCertificate 
        ? 'Đang tải...' 
        : certificateUrls.length > 0 
          ? `${certificateUrls.length} file đã tải lên` 
          : 'Chưa tải lên'}
    </p>
  </div>
  <StatusBadge tone={certificateUrls.length > 0 ? "teal" : "slate"}>
    {certificateUrls.length > 0 ? "Đã có" : "Chưa có"}
  </StatusBadge>
  <input
    type="file"
    accept="image/jpeg,image/png,image/webp"
    multiple
    onChange={handleCertificateUpload}
    disabled={uploadingCertificate}
    className="sr-only"
  />
</label>
```

- [ ] **Step 4: Test certificate uploads**

Navigate to: http://localhost:5173/therapist/profile

Expected:
- Click certificate card → chọn multiple files → upload all → count update
- Loading state
- Error handling

- [ ] **Step 5: Commit changes**

```powershell
git add frontend/src/features/therapist/pages/TherapistPages.tsx
git commit -m "feat(profile): add certificate uploads to TherapistProfilePage"
```

---

## Final Verification

### Task 9: End-to-End Testing

**Files:**
- None (testing only)

- [ ] **Step 1: Test treatment image upload flow**

1. Navigate to http://localhost:5173/therapist/treatments/new
2. Fill form fields
3. Upload 3 images
4. Verify preview shows all 3
5. Remove middle image
6. Add 1 more image
7. Submit form
8. Verify treatment created with correct image URLs

- [ ] **Step 2: Test profile uploads**

1. Navigate to http://localhost:5173/therapist/profile
2. Upload portrait → verify update
3. Upload citizen ID front → verify update
4. Upload citizen ID back → verify update
5. Upload 2 certificates → verify count = 2
6. Check backend `/app/media/uploads/` có files

- [ ] **Step 3: Test Docker volume persistence**

Run:
```powershell
# Stop containers
docker stop jvj-backend jvj-frontend

# Check files still exist
ls C:\Users\manhm\Desktop\Project_JvJ\media-uploads\uploads

# Restart containers
.\docker-run.ps1

# Verify uploaded images still accessible
```

Expected: All uploaded images still work after restart

- [ ] **Step 4: Test error scenarios**

1. Upload file > 5MB → expect error "File quá lớn"
2. Upload PDF file → expect error "Chỉ chấp nhận file ảnh"
3. Upload 6 images to treatment → expect error "Tối đa 5 ảnh"

- [ ] **Step 5: Final commit**

```powershell
git add -A
git commit -m "test: verify image upload system end-to-end"
```

---

## Success Criteria Checklist

- [ ] ✅ Users có thể upload ảnh cho treatments
- [ ] ✅ Users có thể upload ảnh profile (portrait, citizen ID, certificates)
- [ ] ✅ Uploaded images được serve thành công qua `/media/*`
- [ ] ✅ Docker volume lưu trữ persistent (survive container restart)
- [ ] ✅ File validation hoạt động (size, type)
- [ ] ✅ UI hiển thị preview và loading states
- [ ] ✅ Error handling và user feedback rõ ràng
- [ ] ✅ TypeScript compilation không có errors
- [ ] ✅ Tất cả changes đã được commit

---

## Notes

**Estimated time:** ~90 phút (đã được validate từ spec)

**Backend endpoint:** `/api/v1/upload/` đã sẵn sàng, không cần thay đổi

**Volume mount:** `media-uploads:/app/media` đã được config trong docker-run.ps1

**Reusable components:** `ImageUploadButton` và `ImagePreview` có thể được dùng cho spa images sau này
