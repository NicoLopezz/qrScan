"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Bell, CheckCircle, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fetchApi } from "@/lib/api";
import type { Lavado } from "@/types";
import { cn } from "@/lib/utils";

interface MobileListosViewProps {
  lavados: Lavado[];
  onSelect: (lavado: Lavado) => void;
}

export function MobileListosView({ lavados, onSelect }: MobileListosViewProps) {
  const listos = lavados.filter((l) => l.estado === "Completado");

  if (listos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 px-6">
        <CheckCircle className="h-12 w-12 text-muted-foreground/20 mb-3" />
        <p className="text-sm font-medium text-muted-foreground">Sin lavados listos</p>
        <p className="text-xs text-muted-foreground mt-1 text-center">
          Cuando un lavado se complete, aparecera aca para que notifiques al cliente
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 pt-2 space-y-2">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
        {listos.length} listos para retirar
      </p>
      {listos.map((l) => (
        <ListoCard key={l._id} lavado={l} onSelect={onSelect} />
      ))}
    </div>
  );
}

function ListoCard({ lavado, onSelect }: { lavado: Lavado; onSelect: (l: Lavado) => void }) {
  const [sending, setSending] = useState(false);

  const handleNotify = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!lavado.from) {
      toast.error("Este cliente no tiene numero de WhatsApp");
      return;
    }
    setSending(true);
    try {
      await fetchApi("/api/enviarAvisoRetiroLavado", {
        method: "POST",
        body: JSON.stringify({ clienteId: lavado._id }),
      });
      toast.success(`Notificacion enviada a ${lavado.nombre}`);
    } catch (err) {
      toast.error("Error al enviar notificacion");
    } finally {
      setSending(false);
    }
  };

  return (
    <div
      onClick={() => onSelect(lavado)}
      className="card-elevated rounded-2xl bg-white dark:bg-card p-4 cursor-pointer active:scale-[0.98] transition-transform"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold truncate">{lavado.nombre}</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {lavado.modelo} — {lavado.patente}
          </p>
          <div className="flex items-center gap-2 mt-2">
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded-full">
              <CheckCircle className="h-3 w-3" /> Listo
            </span>
            {lavado.tipoDeLavado && (
              <span className="text-[11px] text-muted-foreground">{lavado.tipoDeLavado}</span>
            )}
            {lavado.monto ? (
              <span className="text-[11px] font-medium text-emerald-600 tabular-nums">
                ${lavado.monto.toLocaleString("es-AR")}
              </span>
            ) : null}
          </div>
        </div>
        <Button
          size="sm"
          onClick={handleNotify}
          disabled={sending || !lavado.from}
          className={cn(
            "rounded-xl text-xs h-9 px-3 cursor-pointer flex-shrink-0 ml-3",
            lavado.from
              ? "bg-emerald-500 hover:bg-emerald-600 text-white"
              : "bg-muted text-muted-foreground"
          )}
        >
          {sending ? (
            "..."
          ) : (
            <>
              <MessageCircle className="h-3.5 w-3.5 mr-1" />
              Notificar
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
