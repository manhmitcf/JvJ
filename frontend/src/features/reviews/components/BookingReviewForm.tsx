import { useState } from "react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { type ReviewTag } from "@/types/review";
import { cn } from "@/utils/cn";

const quickTags: ReviewTag[] = ["Đúng giờ", "Tận tâm", "Dễ chịu", "Sạch sẽ"];

type BookingReviewFormProps = {
  submitting: boolean;
  error: string | null;
  onSubmit: (payload: { rating: 1 | 2 | 3 | 4 | 5; comment: string; tags: ReviewTag[] }) => Promise<void>;
};

export function BookingReviewForm({ submitting, error, onSubmit }: BookingReviewFormProps) {
  const [rating, setRating] = useState<1 | 2 | 3 | 4 | 5>(5);
  const [comment, setComment] = useState("");
  const [tags, setTags] = useState<ReviewTag[]>([]);

  function toggleTag(tag: ReviewTag) {
    setTags((currentTags) => (currentTags.includes(tag) ? currentTags.filter((item) => item !== tag) : [...currentTags, tag]));
  }

  return (
    <div className="space-y-5">
      <div className="flex justify-center gap-2">
        {([1, 2, 3, 4, 5] as const).map((value) => (
          <button key={value} type="button" onClick={() => setRating(value)} className="rounded-full p-1 transition-transform hover:scale-110">
            <Star className={cn("h-8 w-8", value <= rating ? "fill-[#A16207] text-[#A16207]" : "text-[#bdc9c6]")} />
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {quickTags.map((tag) => (
          <button
            key={tag}
            type="button"
            onClick={() => toggleTag(tag)}
            className={cn(
              "rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
              tags.includes(tag) ? "border-[#005c55] bg-[#E6F4F1] text-[#005c55]" : "border-[#bdc9c6] bg-white text-[#3e4947] hover:bg-[#f1f4f3]",
            )}
          >
            {tag}
          </button>
        ))}
      </div>

      <textarea
        value={comment}
        onChange={(event) => setComment(event.target.value)}
        className="h-28 w-full resize-none rounded-xl border border-[#bdc9c6] bg-white p-3 text-sm outline-none transition-colors focus:border-[#005c55]"
        placeholder="Chia sẻ cảm nhận của bạn sau buổi trị liệu..."
      />

      {error ? <p className="rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">{error}</p> : null}

      <Button disabled={submitting} onClick={() => void onSubmit({ rating, comment, tags })} className="w-full">
        {submitting ? "Đang gửi đánh giá..." : "Gửi đánh giá"}
      </Button>
    </div>
  );
}
