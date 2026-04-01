import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

interface KpiCardProps {
  title: ReactNode;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  accentColor?: string;
  accentBg?: string;
}

export function KpiCard({
  title,
  value,
  subtitle,
  icon: Icon,
  accentColor = "text-foreground",
  accentBg = "bg-muted",
}: KpiCardProps) {
  return (
    <div className="flex items-center gap-3 card-elevated rounded-2xl bg-white dark:bg-card px-4 py-3">
      <div className={`flex h-9 w-9 items-center justify-center rounded-xl flex-shrink-0 ${accentBg}`}>
        <Icon className={`h-4 w-4 ${accentColor}`} />
      </div>
      <div className="min-w-0">
        <p className="text-lg font-semibold tabular-nums leading-tight">{value}</p>
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground truncate">{title}</p>
        {subtitle && <p className="text-[10px] text-muted-foreground truncate">{subtitle}</p>}
      </div>
    </div>
  );
}
