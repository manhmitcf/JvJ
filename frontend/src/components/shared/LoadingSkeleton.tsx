type SkeletonVariant = "card" | "list" | "text" | "circle";

type LoadingSkeletonProps = {
  variant?: SkeletonVariant;
  count?: number;
  className?: string;
};

const lineClass = "h-4 rounded bg-muted animate-pulse";

function CardSkeleton({ count }: { count: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="rounded-2xl border border-botanical-border bg-white p-6 shadow-stitch-soft"
        >
          <div className="mb-3 h-6 w-3/4 rounded bg-muted animate-pulse"></div>
          <div className="mb-2 h-4 w-full rounded bg-muted animate-pulse"></div>
          <div className="mb-2 h-4 w-5/6 rounded bg-muted animate-pulse"></div>
          <div className="h-4 w-2/3 rounded bg-muted animate-pulse"></div>
        </div>
      ))}
    </div>
  );
}

function ListSkeleton({ count }: { count: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-3 rounded-xl border border-botanical-border bg-white p-4"
        >
          <div className="h-12 w-12 flex-shrink-0 rounded-full bg-muted animate-pulse"></div>
          <div className="flex-1 space-y-2">
            <div className={`${lineClass} w-2/3`}></div>
            <div className={`${lineClass} w-1/2`}></div>
          </div>
        </div>
      ))}
    </div>
  );
}

function CircleSkeleton({ count }: { count: number }) {
  return (
    <div className="flex gap-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="h-16 w-16 rounded-full bg-muted animate-pulse"></div>
      ))}
    </div>
  );
}

function TextSkeleton({ count }: { count: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={`${lineClass}`}></div>
      ))}
    </div>
  );
}

export function LoadingSkeleton({
  variant = "card",
  count = 1,
  className = "",
}: LoadingSkeletonProps) {
  switch (variant) {
    case "list":
      return <ListSkeleton count={count} />;
    case "circle":
      return <CircleSkeleton count={count} />;
    case "text":
      return <TextSkeleton count={count} />;
    default:
      return (
        <div className={className}>
          <CardSkeleton count={count} />
        </div>
      );
  }
}
