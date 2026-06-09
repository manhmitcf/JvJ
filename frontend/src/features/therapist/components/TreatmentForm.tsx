import { useState, useEffect } from "react";
import { Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { PrimaryButton, SecondaryButton, StatusBadge } from "./shared";
import { FormSection } from "./TreatmentFormFields";
import {
  createTreatment,
  TREATMENT_CATEGORIES,
  DURATION_OPTIONS,
  type TreatmentFormInput
} from "../services/therapist-treatment-service";
import { uploadFile } from "@/services/upload-service";
import { useTreatmentStore } from "../stores/treatment-store";
import { ImageUploadButton } from "@/components/ui/image-upload-button";
import { ImagePreview } from "@/components/ui/image-preview";

const initialForm: TreatmentFormInput = {
  name: "",
  category: "neck_shoulder",
  description: "",
  price: 0,
  duration_minutes: 60,
  images: [],
  is_available: true,
};

export function TreatmentForm({ treatmentId }: { treatmentId?: string }) {
  const navigate = useNavigate();
  const isEditMode = !!treatmentId;
  const { treatments, updateTreatment, deleteTreatment: deleteTreatmentFromStore, fetchTreatments } = useTreatmentStore();

  const [form, setForm] = useState<TreatmentFormInput>(initialForm);
  const [uploading, setUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Load treatment data khi ở edit mode
  useEffect(() => {
    if (isEditMode && treatmentId) {
      const loadTreatment = async () => {
        // Fetch treatments nếu chưa có
        if (treatments.length === 0) {
          await fetchTreatments(true);
        }

        // Tìm treatment theo ID
        const treatment = treatments.find(t => t.id === treatmentId);

        if (treatment) {
          setForm({
            name: treatment.name,
            category: treatment.category as any,
            description: treatment.description,
            price: treatment.price,
            duration_minutes: treatment.durationMinutes,
            images: treatment.images || [],
            is_available: treatment.isAvailable,
          });
        } else {
          setError("Không tìm thấy liệu trình");
        }
      };

      void loadTreatment();
    }
  }, [isEditMode, treatmentId, treatments, fetchTreatments]);

  const update = (field: keyof TreatmentFormInput, value: string | number | boolean | string[]) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const removeImage = (index: number) => {
    update("images", form.images.filter((_, i) => i !== index));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    // Validation
    if (!form.name.trim()) {
      setError("Tên liệu trình là bắt buộc");
      return;
    }
    if (!form.description.trim()) {
      setError("Mô tả là bắt buộc");
      return;
    }
    if (form.price < 0) {
      setError("Giá không hợp lệ");
      return;
    }
    if (form.images.length === 0) {
      setError("Vui lòng tải ít nhất 1 ảnh");
      return;
    }

    setIsSubmitting(true);
    try {
      if (isEditMode && treatmentId) {
        // Update existing treatment
        await updateTreatment(treatmentId, {
          name: form.name,
          category: form.category as any,
          description: form.description,
          price: form.price,
          durationMinutes: form.duration_minutes,
          imageUrl: form.images[0],
          images: form.images,
          isAvailable: form.is_available,
        });
      } else {
        // Create new treatment
        await createTreatment(form);
      }
      navigate("/therapist/treatments");
    } catch (err) {
      const error = err as { response?: { data?: { error?: { message?: string } } }; message?: string };
      setError(error.response?.data?.error?.message || "Có lỗi xảy ra. Vui lòng thử lại.");
      console.error(isEditMode ? "Update treatment error:" : "Create treatment error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!treatmentId) return;

    setIsDeleting(true);
    setDeleteError(null);
    try {
      await deleteTreatmentFromStore(treatmentId);
      navigate("/therapist/treatments");
    } catch (err) {
      const error = err as { response?: { data?: { error?: { message?: string } } }; message?: string };
      const errorMsg = error.response?.data?.error?.message
        || error.message
        || "Không thể xóa liệu trình. Vui lòng thử lại.";
      setDeleteError(errorMsg);
      console.error("Delete treatment error:", err);
      console.error("Error response:", error.response?.data);
    } finally {
      setIsDeleting(false);
    }
  };

  const money = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" });

  return (
    <div className="grid gap-lg xl:grid-cols-[minmax(0,1.25fr)_minmax(340px,0.75fr)]">
      <section className="rounded-[2rem] border border-botanical-border bg-white p-xl shadow-stitch-soft">
        <form onSubmit={handleSubmit} className="space-y-xl">
          <FormSection title="Thông tin cơ bản" description="Tên và mô tả ngắn sẽ xuất hiện trong danh sách liệu trình.">
            <label className="block">
              <span className="mb-xs block text-body-sm font-black text-ink-primary">Tên liệu trình *</span>
              <input
                required
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                placeholder="VD: Massage cổ vai gáy tại nhà"
                className="h-12 w-full rounded-2xl border border-botanical-border bg-white px-md text-body-sm font-semibold text-ink-primary outline-none focus:border-primary focus:ring-4 focus:ring-soft-mint"
              />
            </label>

            <label className="block">
              <span className="mb-xs block text-body-sm font-black text-ink-primary">Mô tả ngắn *</span>
              <textarea
                required
                value={form.description}
                onChange={(e) => update("description", e.target.value)}
                placeholder="Mô tả chi tiết dịch vụ, đối tượng phù hợp..."
                rows={4}
                className="w-full rounded-2xl border border-botanical-border bg-white px-md py-sm text-body-sm font-semibold text-ink-primary outline-none focus:border-primary focus:ring-4 focus:ring-soft-mint"
              />
            </label>

            <label className="block">
              <span className="mb-xs block text-body-sm font-black text-ink-primary">Danh mục chuyên môn *</span>
              <select
                required
                value={form.category}
                onChange={(e) => update("category", e.target.value)}
                className="h-12 w-full rounded-2xl border border-botanical-border bg-white px-md text-body-sm font-semibold text-ink-primary outline-none focus:border-primary focus:ring-4 focus:ring-soft-mint"
              >
                {TREATMENT_CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </label>
          </FormSection>

          <FormSection title="Thời lượng và giá" description="Giá nên rõ ràng và phù hợp phạm vi phục vụ nội thành Đà Nẵng.">
            <div className="grid gap-md md:grid-cols-2">
              <label className="block">
                <span className="mb-xs block text-body-sm font-black text-ink-primary">Thời lượng *</span>
                <select
                  required
                  value={form.duration_minutes}
                  onChange={(e) => update("duration_minutes", Number.parseInt(e.target.value))}
                  className="h-12 w-full rounded-2xl border border-botanical-border bg-white px-md text-body-sm font-semibold text-ink-primary outline-none focus:border-primary focus:ring-4 focus:ring-soft-mint"
                >
                  {DURATION_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="mb-xs block text-body-sm font-black text-ink-primary">Giá dịch vụ (₫) *</span>
                <input
                  required
                  type="number"
                  min="0"
                  step="1"
                  value={form.price}
                  onChange={(e) => update("price", Number.parseInt(e.target.value) || 0)}
                  placeholder="350000"
                  className="h-12 w-full rounded-2xl border border-botanical-border bg-white px-md text-body-sm font-semibold text-ink-primary outline-none focus:border-primary focus:ring-4 focus:ring-soft-mint"
                />
              </label>
            </div>
          </FormSection>

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

          <FormSection title="Trạng thái" description="Bạn có thể tạm ẩn liệu trình khi chưa sẵn sàng nhận lịch.">
            <label className="flex cursor-pointer items-center justify-between rounded-2xl border border-botanical-border bg-warm-bg p-md">
              <div>
                <p className="font-black text-ink-primary">Cho phép khách hàng đặt lịch</p>
                <p className="text-body-sm font-medium text-sage-secondary">
                  Liệu trình sẽ hiển thị trên marketplace JvJ.
                </p>
              </div>
              <input
                type="checkbox"
                checked={form.is_available}
                onChange={(e) => update("is_available", e.target.checked)}
                className="h-6 w-6 rounded accent-primary"
              />
            </label>
          </FormSection>

          {error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-md text-body-sm font-semibold text-red-600">
              {error}
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-sm border-t border-botanical-border pt-lg">
            <div className="flex flex-wrap gap-sm">
              <PrimaryButton type="submit" disabled={isSubmitting || uploading}>
                {isSubmitting ? "Đang lưu..." : isEditMode ? "Cập nhật liệu trình" : "Lưu liệu trình"}
              </PrimaryButton>
              <SecondaryButton type="button" onClick={() => navigate("/therapist/treatments")}>
                Hủy
              </SecondaryButton>
            </div>

            {isEditMode && (
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                disabled={isDeleting}
                className="inline-flex items-center gap-xs rounded-2xl border-2 border-red-200 bg-red-50 px-md py-sm text-body-sm font-black text-red-600 transition hover:border-red-300 hover:bg-red-100 disabled:opacity-50"
              >
                <Trash2 className="h-4 w-4" />
                {isDeleting ? "Đang xóa..." : "Xóa liệu trình"}
              </button>
            )}
          </div>

          {/* Delete confirmation dialog */}
          {showDeleteConfirm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-md">
              <div className="w-full max-w-md rounded-[2rem] border border-botanical-border bg-white p-xl shadow-2xl">
                <h3 className="text-2xl font-black text-ink-primary">Xác nhận xóa</h3>
                <p className="mt-md text-body font-medium text-sage-secondary">
                  Bạn có chắc chắn muốn xóa liệu trình "<span className="font-black">{form.name}</span>"?
                  Hành động này không thể hoàn tác.
                </p>
                {deleteError && (
                  <div className="mt-md rounded-2xl border border-red-200 bg-red-50 p-md text-body-sm font-semibold text-red-600">
                    {deleteError}
                  </div>
                )}
                <div className="mt-lg flex gap-sm">
                  <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="flex-1 rounded-2xl bg-red-600 px-md py-sm text-body-sm font-black text-white transition hover:bg-red-700 disabled:opacity-50"
                  >
                    {isDeleting ? "Đang xóa..." : "Xóa"}
                  </button>
                  <button
                    onClick={() => {
                      setShowDeleteConfirm(false);
                      setDeleteError(null);
                    }}
                    disabled={isDeleting}
                    className="flex-1 rounded-2xl border-2 border-botanical-border bg-white px-md py-sm text-body-sm font-black text-ink-primary transition hover:bg-warm-bg disabled:opacity-50"
                  >
                    Hủy
                  </button>
                </div>
              </div>
            </div>
          )}
        </form>
      </section>

      <aside className="space-y-lg">
        <div className="overflow-hidden rounded-[2rem] border border-botanical-border bg-white shadow-stitch-soft">
          {form.images.length > 0 ? (
            <img src={form.images[0]} alt="Xem trước" className="h-56 w-full object-cover" />
          ) : (
            <div className="flex h-56 items-center justify-center bg-warm-bg text-sage-secondary">
              Chưa có ảnh
            </div>
          )}
          <div className="p-lg">
            <div className="mb-sm flex flex-wrap gap-sm">
              <StatusBadge tone={form.is_available ? "green" : "gray"}>
                {form.is_available ? "Đang hoạt động" : "Tạm ẩn"}
              </StatusBadge>
            </div>
            <h2 className="mt-sm text-2xl font-black text-ink-primary">
              {form.name || "Tên liệu trình"}
            </h2>
            <p className="mt-sm line-clamp-2 text-body-sm font-medium text-sage-secondary">
              {form.description || "Mô tả ngắn..."}
            </p>
            <div className="mt-md flex items-end justify-between">
              <p className="text-2xl font-black text-primary">
                {form.price > 0 ? money.format(form.price) : "0 ₫"}
              </p>
              <span className="font-bold text-sage-secondary">{form.duration_minutes} phút</span>
            </div>
          </div>
        </div>

        <div className="rounded-[2rem] border border-botanical-border bg-soft-mint p-lg shadow-stitch-soft">
          <div>
            <h3 className="font-black text-ink-primary">Gợi ý mô tả tốt</h3>
            <p className="text-label-caption font-bold text-sage-secondary">Dùng ngôn ngữ rõ, thân thiện.</p>
          </div>
          <ul className="mt-md space-y-sm text-body-sm font-semibold text-sage-secondary">
            <li>• Nêu rõ đối tượng phù hợp.</li>
            <li>• Ghi thời lượng chính xác.</li>
            <li>• Tránh cam kết y khoa quá mức.</li>
            <li>• Giá nên rõ ràng, không phí ẩn.</li>
          </ul>
        </div>
      </aside>
    </div>
  );
}
