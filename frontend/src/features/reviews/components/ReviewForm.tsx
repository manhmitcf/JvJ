import { useState } from "react";
import { Star, Send } from "lucide-react";
import { reviewService } from "@/services/review-service";

const VALID_TAGS = ["Đúng giờ", "Tận tâm", "Dễ chịu", "Sạch sẽ"];

interface ReviewFormProps {
  bookingId: string;
  treatmentId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export function ReviewForm({ bookingId, treatmentId, onSuccess, onCancel }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const toggleTag = (tag: string) => {
    setTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      setError("Vui lòng chọn số sao đánh giá");
      return;
    }
    if (!comment.trim()) {
      setError("Vui lòng nhập nhận xét");
      return;
    }

    setError("");
    setSubmitting(true);
    try {
      await reviewService.createReview({
        bookingId,
        treatmentId,
        rating: rating as 1 | 2 | 3 | 4 | 5,
        comment: comment.trim(),
        tags,
      });
      onSuccess();
    } catch (e) {
      const error = e as Error;
      setError(error.message || "Có lỗi xảy ra khi gửi đánh giá");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <h3 className="text-xl font-bold text-gray-900 mb-4">Đánh giá dịch vụ</h3>

      {/* Star Rating */}
      <div className="flex items-center gap-2 mb-4">
        {[1, 2, 3, 4, 5].map((star) => (
          <button key={star} type="button" onClick={() => setRating(star)} className="transition-transform hover:scale-110">
            <Star className={`h-8 w-8 ${star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
          </button>
        ))}
        <span className="ml-2 text-sm font-semibold text-gray-500">{rating > 0 ? `${rating}/5` : "Chưa chọn"}</span>
      </div>

      {/* Comment */}
      <textarea
        className="w-full rounded-xl border border-gray-200 p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-emerald-300"
        rows={4}
        placeholder="Chia sẻ trải nghiệm của bạn..."
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mt-4 mb-4">
        {VALID_TAGS.map((tag) => (
          <button
            key={tag}
            type="button"
            onClick={() => toggleTag(tag)}
            className={`rounded-full px-4 py-1 text-sm font-semibold border transition-colors ${
              tags.includes(tag) ? "bg-emerald-600 text-white border-emerald-600" : "bg-white text-gray-900 border-gray-200 hover:border-emerald-400"
            }`}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Error */}
      {error && <p className="text-sm font-semibold text-red-600 mb-4">{error}</p>}

      {/* Actions */}
      <div className="flex justify-end gap-2">
        <button onClick={onCancel} className="rounded-xl px-6 py-2 text-sm font-semibold text-gray-500 hover:bg-gray-50">
          Hủy
        </button>
        <button onClick={handleSubmit} disabled={submitting} className="rounded-xl px-6 py-2 text-sm font-bold bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 flex items-center gap-1">
          <Send className="h-4 w-4" /> {submitting ? "Đang gửi..." : "Gửi đánh giá"}
        </button>
      </div>
    </div>
  );
}
