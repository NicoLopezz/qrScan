"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Send, Star, Car, Phone, RectangleHorizontal, QrCode, ChevronRight, User, Calendar, DollarSign, Droplets, ExternalLink, ArrowLeft } from "lucide-react";
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { fetchApi } from "@/lib/api";
import type { Lavado } from "@/types";

interface LavadoDetailModalProps {
  lavado: Lavado | null;
  onClose: () => void;
}

const estadoColor: Record<string, string> = {
  Pendiente: "bg-amber-50 text-amber-700",
  "En Proceso": "bg-blue-50 text-blue-700",
  Completado: "bg-emerald-50 text-emerald-700",
  Retirado: "bg-muted text-muted-foreground",
};

export function LavadoDetailModal({ lavado, onClose }: LavadoDetailModalProps) {
  const queryClient = useQueryClient();
  const [estado, setEstado] = useState(lavado?.estado ?? "");
  const [medioPago, setMedioPago] = useState(lavado?.medioPago ?? "---");
  const [monto, setMonto] = useState(lavado?.monto ?? 0);
  const [saving, setSaving] = useState(false);
  const [showPerfil, setShowPerfil] = useState(false);

  const { data: perfil, isLoading: perfilLoading } = useQuery({
    queryKey: ["clientePerfil", lavado?.from],
    queryFn: () => fetchApi<any>(`/api/cliente/perfil?telefono=${encodeURIComponent(lavado!.from!)}`),
    enabled: showPerfil && !!lavado?.from,
    select: (res) => res.data,
  });

  if (!lavado) return null;

  const handleUpdateLavado = async () => {
    setSaving(true);
    try {
      await fetchApi("/api/lavadosModificar", {
        method: "PUT",
        body: JSON.stringify({ lavadoId: lavado._id, medioPago, estado, monto }),
      });
      toast.success("Lavado actualizado");
      queryClient.invalidateQueries({ queryKey: ["lavados"] });
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al actualizar");
    } finally {
      setSaving(false);
    }
  };

  const handleEnviarAviso = async () => {
    try {
      await fetchApi("/api/enviarAvisoRetiroLavado", { method: "POST", body: JSON.stringify({ clienteId: lavado._id }) });
      toast.success("Aviso de retiro enviado");
      queryClient.invalidateQueries({ queryKey: ["lavados"] });
    } catch (err) { toast.error(err instanceof Error ? err.message : "Error"); }
  };

  const handleEnviarEncuesta = async () => {
    try {
      await fetchApi("/api/enviarEncuesta", { method: "POST", body: JSON.stringify({ clienteId: lavado._id }) });
      toast.success("Encuesta enviada");
    } catch (err) { toast.error(err instanceof Error ? err.message : "Error"); }
  };

  return (
    <Dialog open={!!lavado} onOpenChange={(open) => { if (!open) { setShowPerfil(false); onClose(); } }}>
      <DialogContent
        className="p-0 gap-0 overflow-hidden rounded-2xl border-0 shadow-2xl sm:max-w-none"
        style={{ width: "fit-content", maxWidth: "calc(100% - 2rem)" }}
      >
        <div className="flex" style={{ minHeight: "32rem" }}>
          {/* LEFT: Lavado detail */}
          <div className="w-[28rem] flex-shrink-0 flex flex-col" style={{ borderRight: showPerfil ? "1px solid var(--border)" : "none" }}>
            {/* Info section */}
            <div className="px-5 pt-5 pb-3 space-y-3">
              <DialogHeader className="space-y-0">
                <div className="flex items-center gap-2.5 pr-8">
                  <DialogTitle className="text-lg font-semibold tracking-tight truncate">{lavado.nombre}</DialogTitle>
                  <Badge variant="secondary" className={`border-0 text-[10px] font-medium flex-shrink-0 ${estadoColor[lavado.estado] || ""}`}>{lavado.estado}</Badge>
                </div>
              </DialogHeader>

              {lavado.from && (
                <button
                  onClick={() => setShowPerfil(!showPerfil)}
                  className="flex items-center justify-between w-full rounded-xl bg-muted/50 px-3 py-2 hover:bg-brand-purple-muted transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Phone className="h-3 w-3" />
                    <span>{lavado.from}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground group-hover:text-brand-purple transition-colors">
                    <span>{showPerfil ? "Ocultar" : "Ver perfil"}</span>
                    <ChevronRight className={`h-3 w-3 transition-transform duration-200 ${showPerfil ? "rotate-180" : ""}`} />
                  </div>
                </button>
              )}

              {/* Vehicle details card */}
              <div className="rounded-xl bg-muted/40 dark:bg-white/5 px-4 py-3 space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Modelo</span>
                  <div className="flex items-center gap-1.5">
                    <Car className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>{lavado.modelo}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Patente</span>
                  <div className="flex items-center gap-1.5">
                    <RectangleHorizontal className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="font-mono text-xs tracking-wide">{lavado.patente}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Tipo</span>
                  <span>{lavado.tipoDeLavado}</span>
                </div>
                {lavado.puntuacionCalidad != null && lavado.puntuacionCalidad > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Calidad</span>
                    <div className="flex items-center gap-1">
                      <span className="text-amber-500 text-xs">{"★".repeat(lavado.puntuacionCalidad)}</span>
                      <span className="capitalize text-muted-foreground text-xs">{lavado.calidad}</span>
                    </div>
                  </div>
                )}
                {lavado.observacion && (
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Obs.</span>
                    <span className="text-xs text-muted-foreground italic">{lavado.observacion}</span>
                  </div>
                )}
              </div>

              {!lavado.textConfirmation && lavado.estado === "Pendiente" && (
                <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20 flex items-center gap-2">
                  <QrCode className="h-4 w-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                  <p className="text-[11px] text-amber-700 dark:text-amber-400">Pendiente de confirmacion QR</p>
                </div>
              )}
            </div>

            {/* Edit section - takes remaining space */}
            <div className="flex-1 flex flex-col justify-end px-5 pb-5 space-y-3">
              <div className="mx-0 h-px bg-border" />
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Estado</label>
                  <Select value={estado} onValueChange={(v) => v && setEstado(v)}>
                    <SelectTrigger className="h-9 rounded-xl text-sm w-48"><SelectValue placeholder={estado} /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pendiente">Pendiente</SelectItem>
                      <SelectItem value="En Proceso">En Proceso</SelectItem>
                      <SelectItem value="Completado">Completado</SelectItem>
                      <SelectItem value="Retirado">Retirado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Medio de Pago</label>
                  <Select value={medioPago} onValueChange={(v) => v && setMedioPago(v)}>
                    <SelectTrigger className="h-9 rounded-xl text-sm w-48"><SelectValue placeholder={medioPago} /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="---">---</SelectItem>
                      <SelectItem value="efectivo">Efectivo</SelectItem>
                      <SelectItem value="debito">Debito</SelectItem>
                      <SelectItem value="credito">Credito</SelectItem>
                      <SelectItem value="mercado-pago">Mercado Pago</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Monto</label>
                  <Input
                    type="text"
                    inputMode="decimal"
                    className="h-9 rounded-xl text-sm tabular-nums w-48 [appearance:textfield]"
                    value={monto || ""}
                    placeholder="0"
                    onChange={(e) => {
                      const v = e.target.value.replace(/[^0-9.]/g, "");
                      setMonto(v ? parseFloat(v) : 0);
                    }}
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button onClick={handleUpdateLavado} disabled={saving} size="sm" className="flex-1 h-9 rounded-xl bg-gradient-to-r from-brand-purple to-brand-fuchsia hover:from-brand-purple-dark hover:to-brand-purple text-white text-xs font-medium shadow-md shadow-brand-purple/15 cursor-pointer">
                  {saving ? "Guardando..." : "Guardar"}
                </Button>
                <Button variant="outline" size="sm" onClick={handleEnviarAviso} disabled={!lavado.from} className="h-9 w-9 rounded-xl p-0 cursor-pointer" title="Aviso de retiro">
                  <WhatsAppIcon className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={handleEnviarEncuesta} disabled={!lavado.from} className="h-9 w-9 rounded-xl p-0 cursor-pointer" title="Enviar encuesta">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* RIGHT: Client profile (only when showPerfil) */}
          {/* RIGHT: Client profile */}
          <div
            className="overflow-hidden max-h-[80vh] overflow-y-auto"
            style={{
              width: showPerfil ? "24rem" : "0",
              opacity: showPerfil ? 1 : 0,
              transition: "width 350ms cubic-bezier(0.4, 0, 0.2, 1), opacity 250ms ease 100ms",
            }}
          >
            {showPerfil && (
            <div className="w-[24rem]">
              {perfilLoading ? (
                <div className="p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <Skeleton className="h-5 w-32" />
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}
                  </div>
                </div>
              ) : perfil ? (
                <div className="divide-y divide-border/30">
                  {/* Header */}
                  <div className="px-4 pt-5 pb-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-purple-muted dark:bg-brand-purple/15 flex-shrink-0">
                        <User className="h-4 w-4 text-brand-purple" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold truncate">{perfil.nombre}</p>
                        <div className="flex items-center gap-1">
                          <Phone className="h-2.5 w-2.5 text-muted-foreground" />
                          <span className="text-[11px] text-muted-foreground">{perfil.telefono}</span>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-4 gap-1.5">
                      <div className="rounded-xl bg-brand-purple-muted dark:bg-brand-purple/10 p-2 text-center">
                        <Droplets className="h-3 w-3 mx-auto text-brand-purple mb-0.5" />
                        <p className="text-sm font-semibold tabular-nums">{perfil.totalLavados}</p>
                        <p className="text-[8px] uppercase tracking-wider text-muted-foreground">Lavados</p>
                      </div>
                      <div className="rounded-xl bg-amber-50 dark:bg-amber-500/10 p-2 text-center">
                        <Star className="h-3 w-3 mx-auto text-amber-500 mb-0.5" />
                        <p className="text-sm font-semibold tabular-nums">{perfil.promedioCalidad || "--"}</p>
                        <p className="text-[8px] uppercase tracking-wider text-muted-foreground">Calidad</p>
                      </div>
                      <div className="rounded-xl bg-emerald-50 dark:bg-emerald-500/10 p-2 text-center">
                        <DollarSign className="h-3 w-3 mx-auto text-emerald-600 dark:text-emerald-400 mb-0.5" />
                        <p className="text-[11px] font-semibold tabular-nums">{"$"}{perfil.totalGastado.toLocaleString("es-AR")}</p>
                        <p className="text-[8px] uppercase tracking-wider text-muted-foreground">Gastado</p>
                      </div>
                      <div className="rounded-xl bg-blue-50 dark:bg-blue-500/10 p-2 text-center">
                        <Calendar className="h-3 w-3 mx-auto text-blue-600 dark:text-blue-400 mb-0.5" />
                        <p className="text-sm font-semibold tabular-nums">{perfil.primerVisita ? Math.ceil((Date.now() - new Date(perfil.primerVisita).getTime()) / 86400000) : "--"}</p>
                        <p className="text-[8px] uppercase tracking-wider text-muted-foreground">Dias</p>
                      </div>
                    </div>
                    {perfil.totalCompletados >= 3 && (
                      <div className="mt-2 px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-brand-purple-muted to-purple-50 dark:from-brand-purple/10 dark:to-purple-500/10 border border-brand-purple-light dark:border-brand-purple/20">
                        <span className="text-[11px] font-medium text-brand-purple">
                          {perfil.totalCompletados >= 9 ? "Cliente VIP" : perfil.totalCompletados >= 6 ? "Frecuente" : "Recurrente"} ({perfil.totalCompletados})
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Historial */}
                  <div className="px-4 py-3">
                    <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground mb-2">Historial</p>
                    {perfil.lavados.length > 0 ? (
                      <div className="space-y-0.5">
                        {[...perfil.lavados].reverse().slice(0, 6).map((l: any) => (
                          <div key={l._id} className="flex items-center gap-2 py-1.5 border-b border-border/15 last:border-0">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-medium">{l.tipoDeLavado}</span>
                                <Badge variant="secondary" className={`border-0 text-[8px] px-1 py-0 ${estadoColor[l.estado] || ""}`}>{l.estado}</Badge>
                              </div>
                              <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                <RectangleHorizontal className="h-2.5 w-2.5" />
                                <span className="font-mono">{l.patente}</span>
                              </div>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <p className="text-xs font-medium tabular-nums">{l.monto > 0 ? `$${l.monto.toLocaleString("es-AR")}` : "--"}</p>
                              <p className="text-[9px] text-muted-foreground">{new Date(l.fecha).toLocaleDateString("es-AR", { day: "2-digit", month: "short" })}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground text-center py-3">Sin historial</p>
                    )}
                  </div>

                  {/* Mensajes */}
                  {perfil.mensajes.length > 0 && (
                    <div className="px-4 py-3">
                      <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground mb-2">Mensajes</p>
                      <div className="space-y-1 max-h-24 overflow-y-auto">
                        {perfil.mensajes.slice(-3).reverse().map((m: any, i: number) => (
                          <div key={i} className="text-[11px] rounded-lg bg-muted/30 px-2.5 py-1.5">
                            <p className="text-foreground line-clamp-1">{m.body}</p>
                            <p className="text-muted-foreground text-[9px]">{m.fecha}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Reviews */}
                  <div className="px-4 py-3">
                    <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground mb-1">Reviews</p>
                    <p className="text-[11px] text-muted-foreground">Sin reviews externas</p>
                  </div>
                </div>
              ) : null}
            </div>
          )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
