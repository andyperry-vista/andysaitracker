import { cn } from "@/lib/utils";

interface HealthBadgeProps {
  score: number;
  size?: "sm" | "md";
}

export function HealthBadge({ score, size = "md" }: HealthBadgeProps) {
  const colorClass =
    score >= 70 ? "bg-status-healthy/15 text-status-healthy border-status-healthy/30" :
    score >= 40 ? "bg-status-warning/15 text-status-warning border-status-warning/30" :
    "bg-status-danger/15 text-status-danger border-status-danger/30";

  return (
    <span className={cn(
      "inline-flex items-center justify-center rounded-full border font-semibold font-display",
      colorClass,
      size === "sm" ? "h-6 w-6 text-[10px]" : "h-8 w-8 text-xs"
    )}>
      {score}
    </span>
  );
}
