interface SectionHeadingProps {
  readonly eyebrow?: string;
  readonly title: string;
  readonly description?: string;
  readonly align?: "left" | "center";
}

export function SectionHeading({ eyebrow, title, description, align = "left" }: SectionHeadingProps) {
  const centered = align === "center";

  return (
    <div className={`space-y-3 ${centered ? "text-center" : ""}`}>
      {eyebrow ? <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary/80">{eyebrow}</p> : null}
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold text-foreground sm:text-3xl">{title}</h2>
        {description ? <p className={`max-w-3xl text-sm leading-6 text-muted-foreground sm:text-base ${centered ? "mx-auto" : ""}`}>{description}</p> : null}
      </div>
    </div>
  );
}
