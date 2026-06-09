# Image Upload System Design

**Date:** 2026-06-09  
**Project:** JvJ - Wellness Therapy Platform  
**Status:** Approved

## Overview

Thiết kế hệ thống upload ảnh cho JvJ sử dụng Docker volume để lưu trữ file uploads, phục vụ cho treatments, therapist profiles, và spa images.

## Goals

1. Cho phép users upload ảnh từ frontend
2. Lưu trữ files trong Docker volume tách biệt khỏi application code
3. Serve images thông qua Django backend
4. Đơn giản, dễ maintain và phù hợp với infrastructure hiện tại

## Non-Goals

- Object storage (S3/R2) - không cần ở giai đoạn này
- Image processing/resizing - giữ nguyên file gốc
- CDN integration - chưa cần thiết
- Cleanup job cho orphaned files - có thể thêm sau

## Architecture

### Storage Layer

```
Host Machine:
  Project_JvJ/
    └── media-uploads/           # Docker volume (persistent)
        └── uploads/
            ├── {uuid1}.jpg
            ├── {uuid2}.png
            └── {uuid3}.webp

Docker Container (backend):
  /app/
    ├── media/                   # Mount point
    │   └── uploads/             # Uploaded files
    └── jvj_api/
        └── settings/
```

**Volume mount:** `media-uploads:/app/media`

### Upload Flow

```
1. User chọn file trong UI
   ↓
2. Frontend gọi uploadFile(file)
   ↓
3. POST /api/v1/upload/ với FormData
   ↓
4. Backend validate & save → /app/media/uploads/{uuid}.ext
   ↓
5. Backend return URL: http://localhost:8000/media/uploads/{uuid}.ext
   ↓
6. Frontend lưu URL vào state, hiển thị preview
   ↓
7. User submit form → gửi URL (không phải file)
```

## Components

### Backend Changes

**File:** `backend/jvj_api/settings/base.py`

```python
# Thay đổi từ relative path sang absolute path
MEDIA_URL = "/media/"
MEDIA_ROOT = Path("/app/media")  # Absolute path cho Docker
```

**File:** `backend/apps/common/views.py` - **KHÔNG THAY ĐỔI**

Endpoint hiện tại đã đủ:
- Validate file size (max 5MB)
- Validate file type (JPG, PNG, WebP)
- Generate unique filename với UUID
- Return absolute URL

### Frontend Changes

**File:** `frontend/src/services/upload-service.ts` - **KHÔNG THAY ĐỔI**

Service `uploadFile()` đã sẵn sàng sử dụng.

**File:** `frontend/src/features/therapist/components/TreatmentFormFields.tsx`

Thay đổi `TreatmentMediaFields`:
- Thêm `<input type="file">` ẩn, trigger bằng button click
- Thêm `onChange` handler gọi `uploadFile()`
- Hiển thị loading state khi đang upload
- Hiển thị preview sau khi upload thành công
- Emit URL lên parent component

**File:** `frontend/src/features/therapist/components/TreatmentForm.tsx`

Thêm state management:
- `imageUrls: string[]` - lưu URLs của images đã upload
- `isUploading: boolean` - loading state
- Truyền callbacks xuống `TreatmentMediaFields`
- Submit form gửi imageUrls vào API

**File:** `frontend/src/features/therapist/pages/TherapistPages.tsx` (TherapistProfilePage)

Tương tự cho profile avatar upload:
- Thêm upload handler cho portrait image
- Thêm upload handlers cho citizen ID front/back
- Thêm upload handlers cho certificates
- Update UI để hiển thị preview

### Docker Configuration

**File:** `docker-run.ps1` - **KHÔNG THAY ĐỔI**

Volume mount đã đúng (line 35):
```powershell
-v "${PSScriptRoot}\media-uploads:/app/media"
```

**File:** `backend/Dockerfile`

Cập nhật mkdir command:
```dockerfile
# Thay đổi từ:
RUN mkdir -p /app/media/uploads && chmod -R 755 /app/media

# Sang:
RUN mkdir -p /app/media/uploads && \
    chown -R jvjuser:jvjuser /app/media && \
    chmod -R 755 /app/media
```

Lý do: Đảm bảo jvjuser có quyền write vào /app/media khi volume được mount.

## Data Flow

### Treatment Images Upload

```typescript
// User clicks "Thêm ảnh liệu trình"
// → <input type="file" multiple accept="image/*" />

const handleImageSelect = async (files: FileList) => {
  for (const file of files) {
    const url = await uploadFile(file);
    setImageUrls(prev => [...prev, url]);
  }
};

// User submits form
const handleSubmit = async () => {
  await updateTreatment(treatmentId, {
    images: imageUrls,  // Array of URLs
    // ... other fields
  });
};
```

### Therapist Profile Upload

```typescript
// Portrait
const handlePortraitUpload = async (file: File) => {
  const url = await uploadFile(file);
  setPortraitUrl(url);
};

// Certificates (multiple)
const handleCertificatesUpload = async (files: FileList) => {
  const urls = await Promise.all(
    Array.from(files).map(f => uploadFile(f))
  );
  setCertificateUrls(prev => [...prev, ...urls]);
};
```

## UI Components

### Image Upload Button Component

Tạo reusable component:

**File:** `frontend/src/components/ui/image-upload-button.tsx`

```typescript
interface ImageUploadButtonProps {
  onUpload: (url: string) => void;
  multiple?: boolean;
  maxFiles?: number;
  accept?: string;
  label: string;
  hint?: string;
  icon?: React.ReactNode;
}

export function ImageUploadButton({
  onUpload,
  multiple = false,
  maxFiles = 1,
  accept = "image/jpeg,image/png,image/webp",
  label,
  hint,
  icon
}: ImageUploadButtonProps) {
  // Implementation với:
  // - Hidden <input type="file">
  // - Loading state
  // - Error handling
  // - File validation
}
```

### Image Preview Component

**File:** `frontend/src/components/ui/image-preview.tsx`

```typescript
interface ImagePreviewProps {
  url: string;
  onRemove?: () => void;
  alt?: string;
}

export function ImagePreview({ url, onRemove, alt }: ImagePreviewProps) {
  // Preview với:
  // - Thumbnail display
  // - Remove button (optional)
  // - Loading placeholder
}
```

## Error Handling

### Backend

Đã có validation trong `FileUploadView`:
- File size > 5MB → HTTP 400 "File quá lớn"
- Wrong content type → HTTP 400 "Chỉ chấp nhận file ảnh"
- Missing file → HTTP 400 "Không tìm thấy file"

### Frontend

```typescript
try {
  const url = await uploadFile(file);
  // Success handling
} catch (error) {
  // Show error toast/message
  console.error('Upload failed:', error);
  alert(error.message);
}
```

## Security Considerations

1. **File Type Validation:** Backend chỉ chấp nhận image/jpeg, image/png, image/webp
2. **File Size Limit:** Max 5MB per file
3. **Filename Security:** UUID-based filenames ngăn path traversal
4. **Authentication:** Endpoint hiện tại dùng `AllowAny` - có thể thắt chặt sau
5. **Volume Permissions:** jvjuser (non-root) có quyền write vào /app/media

## Testing Strategy

### Manual Testing

1. **Upload single image:**
   - Chọn JPG file < 5MB → should succeed
   - Chọn PDF file → should fail with error
   - Chọn file > 5MB → should fail with error

2. **Upload multiple images:**
   - Chọn 3 images trong Treatment form → should upload all
   - Verify preview hiển thị đúng
   - Submit form → verify URLs được gửi đúng

3. **Docker volume persistence:**
   - Upload image
   - Stop container
   - Start container
   - Verify image URL vẫn accessible

### API Testing

```bash
# Test upload endpoint
curl -X POST http://localhost:8000/api/v1/upload/ \
  -F "file=@test-image.jpg"

# Expected response:
{
  "data": {
    "url": "http://localhost:8000/media/uploads/xxx-xxx-xxx.jpg"
  }
}

# Test serving uploaded file
curl -I http://localhost:8000/media/uploads/xxx-xxx-xxx.jpg
# Expected: HTTP 200
```

## Migration Path

### Phase 1: Backend Setup (10 phút)
1. Sửa MEDIA_ROOT trong settings/base.py
2. Cập nhật Dockerfile permissions
3. Rebuild Docker image
4. Test upload endpoint

### Phase 2: Reusable Components (20 phút)
1. Tạo ImageUploadButton component
2. Tạo ImagePreview component
3. Test components standalone

### Phase 3: Treatment Form Integration (30 phút)
1. Update TreatmentFormFields với upload UI
2. Update TreatmentForm state management
3. Update TreatmentForm submit logic
4. Test end-to-end flow

### Phase 4: Profile Form Integration (30 phút)
1. Add portrait upload to TherapistProfilePage
2. Add citizen ID uploads
3. Add certificate uploads
4. Test all upload scenarios

**Total estimated time:** ~90 phút

## Open Questions & Future Improvements

### Potential Improvements (không implement ngay)

1. **Image optimization:**
   - Resize/compress images server-side
   - Generate thumbnails
   - Library: Pillow hoặc django-imagekit

2. **Orphaned file cleanup:**
   - Cronjob xóa files không được reference sau 24h
   - Celery task chạy daily

3. **Progress indicator:**
   - Upload progress bar cho files lớn
   - Sử dụng XMLHttpRequest.upload.onprogress

4. **Multiple file selection UX:**
   - Drag & drop zone
   - Image reordering
   - Library: react-dropzone

5. **Storage migration:**
   - Move to object storage (S3/R2) khi scale
   - Django-storages với boto3

## Success Criteria

✅ Users có thể upload ảnh cho treatments  
✅ Users có thể upload ảnh profile/documents  
✅ Uploaded images được serve thành công  
✅ Docker volume lưu trữ persistent  
✅ File validation hoạt động đúng  
✅ UI hiển thị preview và loading states  

## References

- Django media files: https://docs.djangoproject.com/en/5.1/topics/files/
- Docker volumes: https://docs.docker.com/storage/volumes/
- FormData API: https://developer.mozilla.org/en-US/docs/Web/API/FormData
