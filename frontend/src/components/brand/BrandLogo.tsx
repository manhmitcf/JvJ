import jvjLogo from "@/assets/brand/jvj-logo.png";
import { cn } from "@/utils/cn";

type BrandLogoProps = {
  className?: string;
  imageClassName?: string;
  showText?: boolean;
  subtitle?: string;
  textClassName?: string;
  subtitleClassName?: string;
};

export function BrandLogo({ className, imageClassName, showText = true, subtitle, textClassName, subtitleClassName }: BrandLogoProps) {
  return (
    <span className={cn("inline-flex items-center gap-3", className)}>
      <img src={jvjLogo} alt="JvJ" className={cn("h-11 w-11 rounded-2xl object-contain", imageClassName)} />
      {showText ? (
        <span>
          <span className={cn("block text-xl font-black tracking-tight text-ink-primary", textClassName)}>JvJ</span>
          {subtitle ? <span className={cn("block text-xs font-medium text-sage-secondary", subtitleClassName)}>{subtitle}</span> : null}
        </span>
      ) : null}
    </span>
  );
}
