import { cn } from "@/utils/cn";

type SpaGalleryProps = {
  images: string[];
  spaName: string;
};

export function SpaGallery({ images, spaName }: SpaGalleryProps) {
  if (images.length === 0) {
    return null;
  }

  const [heroImage, ...secondaryImages] = images;

  return (
    <section className="grid gap-lg lg:grid-cols-[1.8fr_1fr]">
      <div className="overflow-hidden rounded-xl border border-botanical-border bg-surface-container-lowest shadow-stitch-soft">
        <img src={heroImage} alt={`${spaName} - không gian chính`} className="h-full min-h-[340px] w-full object-cover" />
      </div>
      <div className={cn("grid gap-lg", secondaryImages.length >= 2 ? "grid-rows-2" : "grid-rows-1")}>
        {secondaryImages.map((image, index) => (
          <div key={`${image}-${index}`} className="overflow-hidden rounded-xl border border-botanical-border bg-surface-container-lowest shadow-stitch-soft">
            <img src={image} alt={`${spaName} - ảnh không gian ${index + 2}`} loading="lazy" className="h-full min-h-[160px] w-full object-cover" />
          </div>
        ))}
      </div>
    </section>
  );
}
