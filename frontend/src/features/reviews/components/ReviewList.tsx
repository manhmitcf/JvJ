import { useMemo } from "react";
import { Star, User } from "lucide-react";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { reviewService } from "@/services/review-service";
import { useQuery } from "@tanstack/react-query";

type ReviewListProps = {
  treatmentId?: string;
  therapistId?: string;
};

export function ReviewList({ treatmentId, therapistId }: ReviewListProps) {
  const reviewsQuery = useQuery({
    queryKey: ["public", "reviews", treatmentId ?? therapistId],
    queryFn: () => {
      if (treatmentId) return reviewService.listReviewsByTreatment(treatmentId);
      if (therapistId) return reviewService.listReviewsByTherapist(therapistId);
      return Promise.resolve([]);
    },
    enabled: Boolean(treatmentId ?? therapistId),
  });

  const averageRating = useMemo(() => {
    const reviews = reviewsQuery.data ?? [];
    if (reviews.length === 0) return 0;
    return reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
  }, [reviewsQuery.data]);

  if (reviewsQuery.isLoading) {
    return <LoadingSkeleton variant="card" count={2} />;
  }

  if (reviewsQuery.isError) {
    return <p className="text-sm text-red-600">Không thể tải đánh giá lúc này.</p>;
  }

  const reviews = reviewsQuery.data ?? [];
  if (reviews.length === 0) {
    return (
      <p className="text-center text-sm text-sage-secondary py-6">
        Chưa có đánh giá nào.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-lg font-bold text-ink-primary">{averageRating.toFixed(1)}</span>
        <div className="flex">
          {([1, 2, 3, 4, 5] as const).map((s) => (
            <Star
              key={s}
              className={`h-4 w-4 ${s <= Math.round(averageRating) ? "fill-warning-clay text-warning-clay" : "text-botanical-border"}`}
            />
          ))}
        </div>
        <span className="text-sm text-sage-secondary">({reviews.length} đánh giá)</span>
      </div>
      {reviews.map((review, index) => (
        <div
          key={review.id}
          className={index < reviews.length - 1 ? "border-b border-botanical-border pb-4" : ""}
        >
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gentle-wash text-sm font-bold text-primary">
              {review.customerAvatar ? (
                <img src={review.customerAvatar} alt={review.customerName} className="h-full w-full rounded-full object-cover" />
              ) : (
                <User className="h-4 w-4" />
              )}
            </div>
            <div className="flex-1">
              <div className="mb-1 flex items-center justify-between gap-2">
                <span className="text-sm font-bold text-ink-primary">{review.customerName}</span>
                <div className="flex items-center gap-0.5">
                  {([1, 2, 3, 4, 5] as const).map((s) => (
                    <Star
                      key={s}
                      className={`h-3.5 w-3.5 ${s <= review.rating ? "fill-warning-clay text-warning-clay" : "text-botanical-border"}`}
                    />
                  ))}
                </div>
              </div>
              <p className="text-sm leading-6 text-sage-secondary">{review.comment}</p>
              {review.tags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {review.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-soft-mint px-2.5 py-0.5 text-xs font-semibold text-primary"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
