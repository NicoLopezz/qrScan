"use client";

import { useState } from "react";
import {
  User,
  Phone,
  Droplets,
  Star,
  ChevronRight,
  ArrowLeft,
  Check,
  CheckCheck,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { ConversacionCliente } from "@/types/mensajes";

interface ChatModalProps {
  conversacion: ConversacionCliente | null;
  onClose: () => void;
}

function formatFecha(fecha: string) {
  const d = new Date(fecha);
  const hoy = new Date();
  const ayer = new Date();
  ayer.setDate(ayer.getDate() - 1);

  if (d.toDateString() === hoy.toDateString()) return "Hoy";
  if (d.toDateString() === ayer.toDateString()) return "Ayer";
  return d.toLocaleDateString("es-AR", { day: "2-digit", month: "short" });
}

function formatHora(fecha: string) {
  return new Date(fecha).toLocaleTimeString("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function ChatModal({ conversacion, onClose }: ChatModalProps) {
  const [showPerfil, setShowPerfil] = useState(false);

  if (!conversacion) return null;

  // Group messages by date
  const grouped = conversacion.mensajes.reduce<Record<string, typeof conversacion.mensajes>>((acc, m) => {
    const key = formatFecha(m.fecha);
    if (!acc[key]) acc[key] = [];
    acc[key].push(m);
    return acc;
  }, {});

  return (
    <Dialog
      open={!!conversacion}
      onOpenChange={(open) => {
        if (!open) {
          setShowPerfil(false);
          onClose();
        }
      }}
    >
      <DialogContent
        className={`p-0 gap-0 overflow-hidden border-0 shadow-2xl rounded-2xl w-[calc(100%-1.5rem)] max-h-[85vh] sm:max-h-[85vh] sm:h-[75vh] ${showPerfil ? "sm:max-w-[52rem]" : "sm:max-w-[26rem]"} transition-[max-width] duration-300 ease-out`}
      >
        <div className="flex h-full sm:max-h-[90vh]">
          {/* LEFT: Chat */}
          <div
            className="w-full sm:w-[26rem] flex-shrink-0 flex flex-col min-h-0"
            style={{
              borderRight: showPerfil ? "1px solid var(--border)" : "none",
            }}
          >
            {/* Chat header */}
            <div className="px-4 pt-4 pb-3 border-b border-border/30">
              <DialogHeader className="space-y-0">
                <div className="flex items-center gap-3 pr-8">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted flex-shrink-0">
                    <User className="h-4 w-4 text-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <DialogTitle className="text-sm font-semibold truncate">
                      {conversacion.nombre}
                    </DialogTitle>
                    {conversacion.telefono && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {conversacion.telefono}
                      </p>
                    )}
                  </div>
                  {conversacion.telefono && (
                    <button
                      onClick={() => setShowPerfil(!showPerfil)}
                      className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer rounded-lg px-2 py-1 hover:bg-muted"
                    >
                      <span className="hidden sm:inline">
                        {showPerfil ? "Ocultar" : "Perfil"}
                      </span>
                      <ChevronRight
                        className={`h-3 w-3 transition-transform duration-200 ${showPerfil ? "rotate-180" : ""}`}
                      />
                    </button>
                  )}
                </div>
              </DialogHeader>
            </div>

            {/* Chat messages */}
            <div className="flex-1 overflow-y-auto px-4 py-3 pb-5 space-y-4 bg-muted/20 dark:bg-black/10">
              {conversacion.mensajes.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-sm text-muted-foreground">
                    Sin mensajes registrados
                  </p>
                </div>
              ) : (
                Object.entries(grouped).map(([fecha, msgs]) => (
                  <div key={fecha}>
                    {/* Date separator */}
                    <div className="flex items-center justify-center mb-3">
                      <span className="text-[10px] text-muted-foreground bg-white dark:bg-card px-2.5 py-0.5 rounded-full shadow-sm border border-border/20">
                        {fecha}
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      {msgs.map((m) => (
                        <div
                          key={m._id}
                          className={`flex ${m.direccion === "enviado" ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[75%] rounded-2xl px-3 py-2 text-[13px] ${
                              m.direccion === "enviado"
                                ? "bg-foreground text-background rounded-br-md"
                                : "bg-white dark:bg-card border border-border/30 rounded-bl-md"
                            }`}
                          >
                            <p className="whitespace-pre-wrap break-words leading-snug">
                              {m.body}
                            </p>
                            <div
                              className={`flex items-center justify-end gap-1 mt-1 ${
                                m.direccion === "enviado"
                                  ? "text-white/60"
                                  : "text-muted-foreground"
                              }`}
                            >
                              <span className="text-[10px]">
                                {formatHora(m.fecha)}
                              </span>
                              {m.direccion === "enviado" && (
                                <CheckCheck className="h-3 w-3" />
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* RIGHT: Client profile */}
          <div
            className={`overflow-hidden max-h-[90vh] overflow-y-auto ${showPerfil ? "sm:block" : ""} ${showPerfil ? "absolute inset-0 z-10 bg-popover sm:relative sm:inset-auto sm:z-auto sm:bg-transparent" : ""}`}
            style={{
              width: showPerfil ? undefined : "0",
              opacity: showPerfil ? 1 : 0,
              transition:
                "width 300ms ease-out, opacity 200ms ease-out 80ms",
            }}
          >
            {showPerfil && (
              <div className="w-full sm:w-[24rem]">
                <div className="divide-y divide-border/30">
                  {/* Back on mobile */}
                  <button
                    onClick={() => setShowPerfil(false)}
                    className="sm:hidden flex items-center gap-1.5 px-4 pt-4 pb-2 text-xs text-foreground font-medium cursor-pointer"
                  >
                    <ArrowLeft className="h-3 w-3" /> Volver al chat
                  </button>

                  {/* Profile header */}
                  <div className="px-4 pt-3 sm:pt-5 pb-4">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-muted flex-shrink-0">
                        <User className="h-5 w-5 text-foreground" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-base font-semibold truncate">
                          {conversacion.nombre}
                        </p>
                        <div className="flex items-center gap-1.5">
                          <Phone className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            {conversacion.telefono}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      {[
                        {
                          icon: Droplets,
                          color: "text-foreground",
                          bg: "bg-muted",
                          value: conversacion.totalLavados ?? 0,
                          label: "Lavados",
                        },
                        {
                          icon: Star,
                          color: "text-amber-500",
                          bg: "bg-amber-50 dark:bg-amber-500/10",
                          value: conversacion.calidad
                            ? `${conversacion.calidad}`
                            : "--",
                          label: "Calidad",
                        },
                        {
                          icon: CheckCheck,
                          color: "text-emerald-600 dark:text-emerald-400",
                          bg: "bg-emerald-50 dark:bg-emerald-500/10",
                          value: conversacion.mensajes.length,
                          label: "Mensajes",
                        },
                      ].map((kpi) => (
                        <div
                          key={kpi.label}
                          className={`rounded-xl ${kpi.bg} p-2.5 text-center flex flex-col items-center`}
                        >
                          <kpi.icon className={`h-4 w-4 ${kpi.color} mb-1`} />
                          <p className="text-base font-semibold tabular-nums leading-tight">
                            {kpi.value}
                          </p>
                          <p className="text-[10px] uppercase tracking-wider text-muted-foreground mt-0.5">
                            {kpi.label}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recent messages summary */}
                  <div className="px-4 py-4">
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-3">
                      Ultimos mensajes enviados
                    </p>
                    <div className="space-y-1.5 max-h-48 overflow-y-auto">
                      {conversacion.mensajes
                        .filter((m) => m.direccion === "enviado")
                        .slice(-5)
                        .reverse()
                        .map((m) => (
                          <div
                            key={m._id}
                            className="text-sm rounded-lg bg-muted/30 px-3 py-2"
                          >
                            <p className="text-foreground line-clamp-1">
                              {m.body}
                            </p>
                            <p className="text-muted-foreground text-[11px] mt-0.5">
                              {formatFecha(m.fecha)} {formatHora(m.fecha)}
                            </p>
                          </div>
                        ))}
                      {conversacion.mensajes.filter(
                        (m) => m.direccion === "enviado"
                      ).length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-3">
                          Sin mensajes enviados
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
