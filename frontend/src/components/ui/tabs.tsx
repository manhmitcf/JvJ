import { type HTMLAttributes } from "react";
import { cn } from "@/utils/cn";

export function TabsList({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("inline-flex rounded-lg bg-muted p-1", className)} {...props} />;
}

type TabsTriggerProps = HTMLAttributes<HTMLButtonElement> & {
  active?: boolean;
};

export function TabsTrigger({ className, active, ...props }: TabsTriggerProps) {
  return (
    <button
      className={cn(
        "rounded-md px-3 py-1.5 text-sm font-medium transition-colors hover:bg-card",
        active && "bg-card shadow-sm",
        className,
      )}
      {...props}
    />
  );
}
