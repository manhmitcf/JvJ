import { type ReactNode } from "react";
import { Link, type LinkProps } from "react-router-dom";

interface StitchContainerProps {
  readonly children: ReactNode;
  readonly className?: string;
}

export function StitchContainer({ children, className = "" }: StitchContainerProps) {
  return <div className={`mx-auto max-w-max-width px-lg md:px-xl ${className}`}>{children}</div>;
}

interface StitchCardProps {
  readonly children: ReactNode;
  readonly className?: string;
}

export function StitchCard({ children, className = "" }: StitchCardProps) {
  return <div className={`rounded-xl border border-botanical-border bg-surface-container-lowest shadow-stitch-soft ${className}`}>{children}</div>;
}

interface StitchEyebrowProps {
  readonly children: ReactNode;
  readonly className?: string;
}

export function StitchEyebrow({ children, className = "" }: StitchEyebrowProps) {
  return <div className={`text-sm font-bold uppercase tracking-[0.18em] text-primary ${className}`}>{children}</div>;
}

interface StitchButtonLinkProps extends LinkProps {
  readonly variant?: "primary" | "secondary";
}

export function StitchButtonLink({ variant = "primary", className = "", children, ...props }: StitchButtonLinkProps) {
  const classes = variant === "primary"
    ? "bg-primary text-primary-foreground hover:bg-primary-hover"
    : "border border-botanical-border bg-surface text-ink-primary hover:border-primary hover:text-primary";

  return (
    <Link {...props} className={`inline-flex h-12 items-center justify-center rounded-full px-6 text-sm font-black transition-colors ${classes} ${className}`}>
      {children}
    </Link>
  );
}
