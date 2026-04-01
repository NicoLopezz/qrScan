"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  User,
  Phone,
  Droplets,
  Star,
  DollarSign,
  Calendar,
  Car,
  RectangleHorizontal,
  MessageCircle,
  UserPlus,
  Users,
  X,
  Send,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { useClienteDetalle } from "@/hooks/useClientes";
import { fetchApi } from "@/lib/api";

interface ClienteDetailModalProps {
  telefono: string | null;
  onClose: () => void;
}

const segmentoStyle: Record<string, string> = {
  Nuevo: "bg-muted text-muted-foreground",
  Recurrente: "bg-blue-50 text-blue-700 dark:bg-blue-950/30",
  Frecuente: "bg-purple-50 text-purple-700 dark:bg-purple-950/30",
  VIP: "bg-amber-50 text-amber-700 dark:bg-amber-950/30",
};

const estadoColor: Record<string, string> = {
  Pendiente: "bg-amber-50 text-amber-700",
  "En Proceso": "bg-blue-50 text-blue-700",
  Completado: "bg-emerald-50 text-emerald-700",
  Retirado: "bg-muted text-muted-foreground",
};

export function ClienteDetailModal({
  telefono,
  onClose,
}: ClienteDetailModalProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: perfil, isLoading } = useClienteDetalle(telefono);
  const [notas, setNotas] = useState("");

  useEffect(() => {
    if (perfil) {
      setNotas(perfil.notas ?? "");
    }
  }, [perfil]);

  const handleSaveNotas = async () => {
    if (!telefono) return;
    try {
      await fetchApi(`/api/clientes/${encodeURIComponent(telefono)}`, {
        method: "PUT",
        body: JSON.stringify({ notas }),
      });
      toast.success("Notas guardadas");
      queryClient.invalidateQueries({ queryKey: ["clienteDetalle", telefono] });
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Error al guardar notas"
      );
    }
  };

  const uniquePatentes = perfil
    ? [...new Set(perfil.vehiculos)]
    : [];

  const diasDesde =
    perfil?.primerVisita
      ? Math.ceil(
          (Date.now() - new Date(perfil.primerVisita).getTime()) / 86400000
        )
      : "--";

  return (
    <Dialog
      open={!!telefono}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="p-0 gap-0 overflow-hidden border-0 shadow-2xl rounded-2xl w-[calc(100%-1.5rem)] max-h-[85vh] sm:max-h-[90vh] sm:max-w-lg">
        <div className="overflow-y-auto max-h-[85vh] sm:max-h-[90vh]">
          {isLoading ? (
            <div className="p-5 space-y-4">
              <div className="flex flex-col items-center gap-3">
                <Skeleton className="h-16 w-16 rounded-full" />
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-4 w-28" />
              </div>
              <div className="grid grid-cols-4 gap-2">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-20 rounded-xl" />
                ))}
              </div>
              <Skeleton className="h-24 rounded-xl" />
            </div>
          ) : perfil ? (
            <div className="divide-y divide-border/30">
              {/* Header */}
              <div className="px-5 pt-5 pb-4">
                <DialogHeader className="space-y-0 sr-only">
                  <DialogTitle>{perfil.nombre}</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col items-center gap-2">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                    <User className="h-7 w-7 text-foreground" />
                  </div>
                  <p className="text-lg font-semibold uppercase">
                    {perfil.nombre}
                  </p>
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Phone className="h-3.5 w-3.5" />
                    <span>{perfil.telefono}</span>
                  </div>
                  <Badge
                    variant="secondary"
                    className={`border-0 text-xs font-medium ${segmentoStyle[perfil.segmento] || ""}`}
                  >
                    {perfil.segmento}
                  </Badge>
                  {perfil.channel && (
                    <span className="text-[11px] text-muted-foreground">
                      {perfil.channel === "telegram" ? "Telegram" : "WhatsApp"}
                    </span>
                  )}
                </div>
              </div>

              {/* KPI mini-cards */}
              <div className="px-5 py-4">
                <div className="grid grid-cols-4 gap-2">
                  {[
                    {
                      icon: Droplets,
                      color: "text-foreground",
                      bg: "bg-muted",
                      value: perfil.totalLavados,
                      label: "Lavados",
                    },
                    {
                      icon: Star,
                      color: "text-amber-500",
                      bg: "bg-amber-50 dark:bg-amber-500/10",
                      value: perfil.promedioCalidad || "--",
                      label: "Calidad",
                    },
                    {
                      icon: DollarSign,
                      color: "text-emerald-600 dark:text-emerald-400",
                      bg: "bg-emerald-50 dark:bg-emerald-500/10",
                      value: `$${perfil.totalGastado.toLocaleString("es-AR")}`,
                      label: "Gastado",
                    },
                    {
                      icon: Calendar,
                      color: "text-blue-600 dark:text-blue-400",
                      bg: "bg-blue-50 dark:bg-blue-500/10",
                      value: diasDesde,
                      label: "Dias",
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

              {/* Vehiculos */}
              <div className="px-5 py-4">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-3">
                  Vehiculos
                </p>
                {uniquePatentes.length > 0 ? (
                  <div className="space-y-1.5">
                    {uniquePatentes.map((patente) => (
                      <div
                        key={patente}
                        className="flex items-center gap-2 text-sm"
                      >
                        <Car className="h-4 w-4 text-muted-foreground" />
                        <span className="font-mono uppercase">{patente}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Sin vehiculos registrados
                  </p>
                )}
              </div>

              {/* Referidos */}
              <div className="px-5 py-4">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-3">
                  Referidos
                </p>
                {perfil.referidoPor || perfil.referidos > 0 ? (
                  <div className="space-y-1.5">
                    {perfil.referidoPor && (
                      <div className="flex items-center gap-2 text-sm">
                        <UserPlus className="h-4 w-4 text-muted-foreground" />
                        <span>
                          Referido por: {perfil.referidoPorNombre}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>Clientes referidos: {perfil.referidos}</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Sin referidos</p>
                )}
              </div>

              {/* Notas */}
              <div className="px-5 py-4">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-3">
                  Notas
                </p>
                <textarea
                  className="w-full rounded-xl border border-border bg-transparent px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-border focus:border-border placeholder:text-muted-foreground"
                  rows={3}
                  placeholder="Agregar notas sobre el cliente..."
                  value={notas}
                  onChange={(e) => setNotas(e.target.value)}
                  onBlur={handleSaveNotas}
                />
              </div>

              {/* Historial de servicios */}
              <div className="px-5 py-4">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-3">
                  Historial
                </p>
                {perfil.lavados.length > 0 ? (
                  <div className="space-y-1">
                    {[...perfil.lavados]
                      .reverse()
                      .slice(0, 8)
                      .map((l) => (
                        <div
                          key={l._id}
                          onClick={() => {
                            onClose();
                            router.push(`/lavados?lavadoId=${l._id}`);
                          }}
                          className="flex items-center gap-2 py-2 border-b border-border/15 last:border-0 cursor-pointer hover:bg-muted/30 rounded-lg px-1 -mx-1 transition-colors"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">
                                {l.tipoDeLavado}
                              </span>
                              <Badge
                                variant="secondary"
                                className={`border-0 text-[10px] px-1.5 py-0 ${estadoColor[l.estado] || ""}`}
                              >
                                {l.estado}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                              <RectangleHorizontal className="h-3 w-3" />
                              <span className="font-mono uppercase">
                                {l.patente}
                              </span>
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="text-sm font-medium tabular-nums">
                              {l.monto > 0
                                ? `$${l.monto.toLocaleString("es-AR")}`
                                : "--"}
                            </p>
                            <p className="text-[11px] text-muted-foreground">
                              {new Date(l.fecha).toLocaleDateString("es-AR", {
                                day: "2-digit",
                                month: "short",
                              })}
                            </p>
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-3">
                    Sin historial
                  </p>
                )}
              </div>

              {/* Mensajes */}
              {perfil.mensajes.length > 0 && (
                <div className="px-5 py-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Mensajes
                    </p>
                    <button
                      onClick={() => {
                        onClose();
                        router.push(`/mensajes?telefono=${encodeURIComponent(perfil.telefono)}`);
                      }}
                      className="text-[11px] text-foreground hover:underline cursor-pointer"
                    >
                      Ver todos
                    </button>
                  </div>
                  <div className="space-y-1.5 max-h-32 overflow-y-auto">
                    {perfil.mensajes
                      .slice(-3)
                      .reverse()
                      .map((m, i) => (
                        <div
                          key={i}
                          className="text-sm rounded-lg bg-muted/30 px-3 py-2"
                        >
                          <p className="text-foreground line-clamp-1">
                            {m.body}
                          </p>
                          <p className="text-muted-foreground text-[11px] mt-0.5">
                            {m.fecha}
                          </p>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
