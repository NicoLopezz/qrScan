"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Send, Star, Car, Phone, RectangleHorizontal, QrCode, ChevronRight, User, Calendar, DollarSign, Droplets, ExternalLink, ArrowLeft, X } from "lucide-react";
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
import { QRCodeSVG } from "qrcode.react";
import { useAuth } from "@/providers/AuthProvider";
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
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [estado, setEstado] = useState("");
  const [medioPago, setMedioPago] = useState("---");
  const [monto, setMonto] = useState(0);
  const [saving, setSaving] = useState(false);
  const [showPerfil, setShowPerfil] = useState(false);
  const [showQr, setShowQr] = useState(false);

  useEffect(() => {
    if (lavado) {
      setEstado(lavado.estado ?? "");
      setMedioPago(lavado.medioPago ?? "---");
      setMonto(lavado.monto ?? 0);
      setShowPerfil(false);
      setShowQr(false);
    }
  }, [lavado]);

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
        className={`p-0 gap-0 overflow-hidden border-0 shadow-2xl rounded-2xl w-[calc(100%-1.5rem)] max-h-[85vh] sm:max-h-[90vh] sm:h-auto ${showPerfil ? "sm:max-w-[56rem]" : "sm:max-w-[30rem]"} transition-[max-width] duration-300`}
      >
        <div className="flex h-full sm:max-h-[90vh]">
          {/* LEFT: Lavado detail */}
          <div className="w-full sm:w-[30rem] flex-shrink-0 flex flex-col overflow-y-auto" style={{ borderRight: showPerfil ? "1px solid var(--border)" : "none" }}>
            {/* Info section */}
            <div className="px-5 pt-5 pb-3 space-y-3">
              <DialogHeader className="space-y-0">
                <div className="flex items-center gap-2.5 pr-8">
                  <DialogTitle className="text-lg font-semibold tracking-tight truncate uppercase">{lavado.nombre}</DialogTitle>
                  <Badge variant="secondary" className={`border-0 text-[10px] font-medium flex-shrink-0 ${estadoColor[lavado.estado] || ""}`}>{lavado.estado}</Badge>
                </div>
              </DialogHeader>

              {lavado.from && (
                <button
                  onClick={() => setShowPerfil(!showPerfil)}
                  className="flex items-center justify-between w-full rounded-xl bg-muted/50 px-3 py-2 hover:bg-muted transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Phone className="h-3 w-3" />
                    <span>{lavado.from}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground group-hover:text-foreground transition-colors">
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
                    <span className="uppercase">{lavado.modelo}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Patente</span>
                  <div className="flex items-center gap-1.5">
                    <RectangleHorizontal className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="font-mono text-xs tracking-wide uppercase">{lavado.patente}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Tipo</span>
                  <span className="uppercase">{lavado.tipoDeLavado}</span>
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
                <>
                  <button
                    onClick={() => setShowQr(!showQr)}
                    className="w-full p-2.5 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20 flex items-center justify-between cursor-pointer hover:bg-amber-100/50 dark:hover:bg-amber-500/15 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <QrCode className="h-4 w-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                      <p className="text-[11px] text-amber-700 dark:text-amber-400">Pendiente de confirmacion QR</p>
                    </div>
                    <span className="text-[11px] font-medium text-amber-600 dark:text-amber-400">
                      Ver QR
                    </span>
                  </button>
                  {user && (
                    <div
                      className={`fixed inset-0 z-[100] flex items-center justify-center transition-all duration-300 ${showQr ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
                    >
                      <div className={`absolute inset-0 bg-black/30 transition-[backdrop-filter] duration-300 ${showQr ? "backdrop-blur-sm" : "backdrop-blur-0"}`} onClick={() => setShowQr(false)} />
                      <div className={`relative bg-white dark:bg-card rounded-2xl shadow-2xl p-8 flex flex-col items-center gap-4 transition-all duration-300 ${showQr ? "scale-100 opacity-100" : "scale-90 opacity-0"}`}>
                        <button onClick={() => setShowQr(false)} className="absolute top-3 right-3 text-muted-foreground hover:text-foreground cursor-pointer">
                          <X className="h-4 w-4" />
                        </button>
                        <QRCodeSVG
                          value={`${process.env.NEXT_PUBLIC_BACKEND_URL || `http://${window.location.hostname}:4000`}/api/qrScanUpdateLavados/${user.adminId}`}
                          size={200}
                        />
                        <p className="text-sm text-muted-foreground text-center">
                          Pedi al cliente que escanee este codigo
                        </p>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Edit section or finalized view */}
            <div className="flex-1 flex flex-col justify-end px-5 pb-5 space-y-3">
              <div className="mx-0 h-px bg-border" />
              {lavado.estado === "Completado" || lavado.estado === "Retirado" ? (
                <div className="rounded-xl bg-muted/50 px-4 py-5 text-center space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    {lavado.estado === "Retirado" ? "Lavado finalizado" : "Lavado completado"}
                  </p>
                  <div className="flex items-center justify-center gap-3 text-xs text-muted-foreground">
                    {lavado.medioPago && lavado.medioPago !== "---" && <span className="capitalize">{lavado.medioPago}</span>}
                    {lavado.monto ? <span className="font-medium text-foreground">${lavado.monto.toLocaleString("es-AR")}</span> : null}
                  </div>
                </div>
              ) : (
              <>
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Estado</label>
                  <Select value={estado} onValueChange={(v) => v && setEstado(v)}>
                    <SelectTrigger className="h-10 rounded-xl text-sm w-48"><SelectValue placeholder={estado} /></SelectTrigger>
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
                    <SelectTrigger className="h-10 rounded-xl text-sm w-48"><SelectValue placeholder={medioPago} /></SelectTrigger>
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
                    className="h-10 rounded-xl text-sm tabular-nums w-48 [appearance:textfield]"
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
                <Button onClick={handleUpdateLavado} disabled={saving} size="sm" className="flex-1 h-9 rounded-xl bg-foreground text-background hover:bg-foreground/90 text-xs font-medium cursor-pointer">
                  {saving ? "Guardando..." : "Guardar"}
                </Button>
                <Button variant="outline" size="sm" onClick={handleEnviarAviso} disabled={!lavado.from || lavado.estado === "Retirado"} className="h-9 w-9 rounded-xl p-0 cursor-pointer" title="Aviso de retiro">
                  <WhatsAppIcon className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={handleEnviarEncuesta} disabled={!lavado.from} className="h-9 w-9 rounded-xl p-0 cursor-pointer" title="Enviar encuesta">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              </>
              )}
            </div>
          </div>

          {/* RIGHT: Client profile — overlay on mobile, side panel on desktop */}
          <div
            className={`overflow-hidden max-h-[90vh] overflow-y-auto ${showPerfil ? "sm:block" : ""} ${showPerfil ? "absolute inset-0 z-10 bg-popover sm:relative sm:inset-auto sm:z-auto sm:bg-transparent" : ""}`}
            style={{
              width: showPerfil ? undefined : "0",
              opacity: showPerfil ? 1 : 0,
              transition: "width 350ms cubic-bezier(0.4, 0, 0.2, 1), opacity 250ms ease 100ms",
            }}
          >
            {showPerfil && (
            <div className="w-full sm:w-[26rem]">
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
                  {/* Back button on mobile */}
                  <button
                    onClick={() => setShowPerfil(false)}
                    className="sm:hidden flex items-center gap-1.5 px-4 pt-4 pb-2 text-xs text-foreground font-medium cursor-pointer"
                  >
                    <ChevronRight className="h-3 w-3 rotate-180" /> Volver al detalle
                  </button>
                  {/* Header */}
                  <div className="px-4 pt-3 sm:pt-5 pb-4">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-muted flex-shrink-0">
                        <User className="h-5 w-5 text-foreground" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-base font-semibold truncate">{perfil.nombre}</p>
                        <div className="flex items-center gap-1.5">
                          <Phone className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">{perfil.telefono}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          onClose();
                          router.push(`/clientes?telefono=${encodeURIComponent(perfil.telefono)}`);
                        }}
                        className="text-[11px] text-foreground hover:underline cursor-pointer flex-shrink-0"
                      >
                        Ver perfil
                      </button>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        { icon: Droplets, color: "text-foreground", bg: "bg-muted", value: perfil.totalLavados, label: "Lavados" },
                        { icon: Star, color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-500/10", value: perfil.promedioCalidad || "--", label: "Calidad" },
                        { icon: DollarSign, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-500/10", value: `$${perfil.totalGastado.toLocaleString("es-AR")}`, label: "Gastado" },
                        { icon: Calendar, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-500/10", value: perfil.primerVisita ? Math.ceil((Date.now() - new Date(perfil.primerVisita).getTime()) / 86400000) : "--", label: "Dias" },
                      ].map((kpi) => (
                        <div key={kpi.label} className={`rounded-xl ${kpi.bg} p-2.5 text-center flex flex-col items-center`}>
                          <kpi.icon className={`h-4 w-4 ${kpi.color} mb-1`} />
                          <p className="text-base font-semibold tabular-nums leading-tight">{kpi.value}</p>
                          <p className="text-[10px] uppercase tracking-wider text-muted-foreground mt-0.5">{kpi.label}</p>
                        </div>
                      ))}
                    </div>
                    {perfil.totalCompletados >= 3 && (
                      <div className="mt-2 px-2.5 py-1.5 rounded-lg bg-muted border border-border">
                        <span className="text-[11px] font-medium text-foreground">
                          {perfil.totalCompletados >= 9 ? "Cliente VIP" : perfil.totalCompletados >= 6 ? "Frecuente" : "Recurrente"} ({perfil.totalCompletados})
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Historial */}
                  <div className="px-4 py-4">
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-3">Historial</p>
                    {perfil.lavados.length > 0 ? (
                      <div className="space-y-1">
                        {[...perfil.lavados].reverse().slice(0, 6).map((l: any) => (
                          <div key={l._id} className="flex items-center gap-2 py-2 border-b border-border/15 last:border-0">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium">{l.tipoDeLavado}</span>
                                <Badge variant="secondary" className={`border-0 text-[10px] px-1.5 py-0 ${estadoColor[l.estado] || ""}`}>{l.estado}</Badge>
                              </div>
                              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                                <RectangleHorizontal className="h-3 w-3" />
                                <span className="font-mono">{l.patente}</span>
                              </div>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <p className="text-sm font-medium tabular-nums">{l.monto > 0 ? `$${l.monto.toLocaleString("es-AR")}` : "--"}</p>
                              <p className="text-[11px] text-muted-foreground">{new Date(l.fecha).toLocaleDateString("es-AR", { day: "2-digit", month: "short" })}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-3">Sin historial</p>
                    )}
                  </div>

                  {/* Mensajes */}
                  {perfil.mensajes.length > 0 && (
                    <div className="px-4 py-4">
                      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-3">Mensajes</p>
                      <div className="space-y-1.5 max-h-32 overflow-y-auto">
                        {perfil.mensajes.slice(-3).reverse().map((m: any, i: number) => (
                          <div key={i} className="text-sm rounded-lg bg-muted/30 px-3 py-2">
                            <p className="text-foreground line-clamp-1">{m.body}</p>
                            <p className="text-muted-foreground text-[11px] mt-0.5">{m.fecha}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Reviews */}
                  <div className="px-4 py-4">
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">Reviews</p>
                    <p className="text-sm text-muted-foreground">Sin reviews externas</p>
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
