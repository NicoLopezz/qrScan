"use client";

import { Car, Clock, RectangleHorizontal, MessageSquare } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Lavado } from "@/types";

interface LavadoCardProps {
  lavado: Lavado;
  onClick: () => void;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
}

const estadoStyle: Record<string, string> = {
  Pendiente: "bg-amber-50 text-amber-700",
  "En Proceso": "bg-blue-50 text-blue-700",
  Completado: "bg-emerald-50 text-emerald-700",
  Retirado: "bg-muted text-muted-foreground",
};

export function LavadoCard({ lavado, onClick }: LavadoCardProps) {
  const isRetirado = lavado.estado === "Retirado";
  const sinConfirmar = !lavado.textConfirmation && lavado.estado === "Pendiente";

  return (
    <div
      className={`card-elevated rounded-2xl p-3.5 cursor-pointer group transition-all duration-150 ${
        isRetirado
          ? "bg-muted/60 opacity-60 hover:opacity-80"
          : "bg-white"
      }`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-2">
        <div>
          <p className={`font-medium text-sm group-hover:text-brand-purple transition-colors ${isRetirado ? "text-muted-foreground" : ""}`}>
            {lavado.nombre}
          </p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <Car className="h-3 w-3 text-muted-foreground/50" />
            <span className="text-xs text-muted-foreground">{lavado.modelo}</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          {sinConfirmar && (
            <Badge variant="secondary" className="text-[9px] border-0 bg-orange-50 text-orange-600 gap-0.5">
              <MessageSquare className="h-2.5 w-2.5" /> QR
            </Badge>
          )}
          {lavado.puntuacionCalidad ? (
            <span className="text-xs text-amber-500 tabular-nums">
              {"★".repeat(lavado.puntuacionCalidad)}
            </span>
          ) : null}
        </div>
      </div>
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2.5">
        <RectangleHorizontal className="h-3.5 w-3.5" />
        <span className="font-mono tracking-wide">{lavado.patente}</span>
      </div>
      {lavado.observacion && (
        <p className="text-[11px] text-muted-foreground mb-2 line-clamp-1 italic">
          {lavado.observacion}
        </p>
      )}
      <div className="flex items-center justify-between">
        <Badge variant="secondary" className={`text-xs border-0 font-medium ${estadoStyle[lavado.estado] || ""}`}>
          {lavado.tipoDeLavado}
        </Badge>
        <div className="flex items-center gap-1 text-xs text-muted-foreground tabular-nums">
          <Clock className="h-3 w-3" />
          <span>{timeAgo(lavado.fechaDeAlta)}</span>
        </div>
      </div>
      {lavado.monto != null && lavado.monto > 0 && (
        <p className="text-xs font-semibold text-brand-success mt-2 tabular-nums">
          ${lavado.monto.toLocaleString("es-AR")}
        </p>
      )}
    </div>
  );
}
