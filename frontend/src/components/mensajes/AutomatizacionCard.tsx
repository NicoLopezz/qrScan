"use client";

import { useState } from "react";
import {
  Star,
  Clock,
  Cake,
  Trophy,
  CloudRain,
  CreditCard,
  Bell,
  BarChart3,
  Send,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Automatizacion, TriggerType, } from "@/types/mensajes";
import { TRIGGER_LABELS } from "@/types/mensajes";

const TRIGGER_ICON_MAP: Record<TriggerType, React.ReactNode> = {
  post_servicio: <Star className="h-4 w-4" />,
  dias_sin_visita: <Clock className="h-4 w-4" />,
  cumpleanos: <Cake className="h-4 w-4" />,
  fidelidad: <Trophy className="h-4 w-4" />,
  clima: <CloudRain className="h-4 w-4" />,
  pago_fallido: <CreditCard className="h-4 w-4" />,
  pre_renovacion: <Bell className="h-4 w-4" />,
};

interface AutomatizacionCardProps {
  auto: Automatizacion;
  onToggle: (id: string) => void;
  onClick: (auto: Automatizacion) => void;
}

export function AutomatizacionCard({ auto, onToggle, onClick }: AutomatizacionCardProps) {
  const [toggling, setToggling] = useState(false);

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setToggling(true);
    onToggle(auto._id);
    setTimeout(() => setToggling(false), 300);
  };

  return (
    <button
      onClick={() => onClick(auto)}
      className="w-full text-left rounded-2xl border border-border/40 bg-white dark:bg-card/80 p-4 hover:border-border hover:shadow-sm transition-all cursor-pointer group"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0 flex-1">
          <div className={`flex h-9 w-9 items-center justify-center rounded-xl flex-shrink-0 ${auto.activa ? "bg-muted text-foreground" : "bg-muted text-muted-foreground"}`}>
            {TRIGGER_ICON_MAP[auto.trigger]}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold truncate">{auto.nombre}</p>
              <Badge
                variant="secondary"
                className={`border-0 text-[10px] font-medium ${auto.activa ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400" : "bg-muted text-muted-foreground"}`}
              >
                {auto.activa ? "Activa" : "Inactiva"}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Trigger: {TRIGGER_LABELS[auto.trigger]}
              {auto.triggerValor ? ` (${auto.triggerValor} dias)` : ""}
            </p>
            <p className="text-xs text-muted-foreground/70 mt-1 line-clamp-1 italic">
              &ldquo;{auto.mensaje}&rdquo;
            </p>
          </div>
        </div>

        {/* Toggle */}
        <div
          onClick={handleToggle}
          className={`relative flex-shrink-0 w-10 h-5 rounded-full transition-colors cursor-pointer ${toggling ? "opacity-50" : ""} ${auto.activa ? "bg-foreground" : "bg-muted-foreground/20"}`}
        >
          <div className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${auto.activa ? "translate-x-5" : "translate-x-0.5"}`} />
        </div>
      </div>

      {/* Metrics */}
      {auto.enviados > 0 && (
        <div className="flex items-center gap-4 mt-3 pt-3 border-t border-border/20">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Send className="h-3 w-3" />
            <span className="tabular-nums">{auto.enviados}</span>
            <span>enviados</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Users className="h-3 w-3" />
            <span className="tabular-nums">{auto.conversiones}</span>
            <span>conversiones</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <BarChart3 className="h-3 w-3 text-foreground" />
            <span className="tabular-nums font-medium text-foreground">{auto.tasaConversion}%</span>
          </div>
        </div>
      )}
    </button>
  );
}
