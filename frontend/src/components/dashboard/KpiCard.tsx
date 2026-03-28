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
  accentColor = "text-brand-purple",
  accentBg = "bg-brand-purple-muted",
}: KpiCardProps) {
  return (
    <div className="card-elevated rounded-2xl bg-white p-4 md:p-5">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {title}
          </p>
          <p className="text-2xl md:text-3xl font-semibold tabular-nums tracking-tight">
            {value}
          </p>
          {subtitle && (
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          )}
        </div>
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${accentBg}`}>
          <Icon className={`h-5 w-5 ${accentColor}`} />
        </div>
      </div>
    </div>
  );
}
