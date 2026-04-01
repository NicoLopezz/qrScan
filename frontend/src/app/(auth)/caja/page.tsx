"use client";

import { useState } from "react";
import {
  Plus,
  Banknote,
  Smartphone,
  CreditCard,
  DollarSign,
  Settings,
  ArrowDownCircle,
  ArrowUpCircle,
  Minus,
  Trash2,
  X,
  Lock,
  Pencil,
} from "lucide-react";
import {
  useCajas,
  useTurnoActivo,
  useVentasTurno,
  useCrearVenta,
  useEditarVenta,
  useAnularVenta,
  useAbrirTurno,
  useCerrarTurno,
} from "@/hooks/useCaja";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { FloatingButton } from "@/components/common/FloatingButton";
import type { Caja, VentaPOS, MedioPago } from "@/types";

const MEDIO_ICONS: Record<string, React.ReactNode> = {
  efectivo: <Banknote className="h-4 w-4" />,
  "mercado-pago": <Smartphone className="h-4 w-4" />,
  tarjeta: <CreditCard className="h-4 w-4" />,
};
const MEDIO_LABELS: Record<string, string> = {
  efectivo: "Efectivo",
  "mercado-pago": "Mercado Pago",
  tarjeta: "Tarjeta",
};
const MEDIO_COLORS: Record<string, string> = {
  efectivo: "text-emerald-600 bg-emerald-50",
  "mercado-pago": "text-blue-600 bg-blue-50",
  tarjeta: "text-foreground bg-muted",
};

export default function VentasPage() {
  const { data: cajas, isLoading: cajasLoading } = useCajas();
  const [selectedCajaId, setSelectedCajaId] = useState<string | null>(null);
  const selectedCaja = cajas?.find((c) => c._id === selectedCajaId) ?? cajas?.[0] ?? null;
  const effectiveCajaId = selectedCajaId ?? cajas?.[0]?._id;

  const { data: turnoActivo, isLoading: turnoLoading } = useTurnoActivo(effectiveCajaId);
  const { data: ventas } = useVentasTurno(turnoActivo?.turno?._id);

  const [selectedVenta, setSelectedVenta] = useState<VentaPOS | null>(null);
  const [filtroMedio, setFiltroMedio] = useState<string | null>(null);
  const [showNuevaVenta, setShowNuevaVenta] = useState(false);
  const [showNuevoEgreso, setShowNuevoEgreso] = useState(false);
  const [showApertura, setShowApertura] = useState(false);
  const [showCierre, setShowCierre] = useState(false);
  const [showConfig, setShowConfig] = useState(false);

  // Auto-select first caja
  if (!selectedCajaId && cajas && cajas.length > 0 && !cajasLoading) {
    setSelectedCajaId(cajas[0]._id);
  }

  const hasTurno = !!turnoActivo?.turno;

  const ventasFiltradas = filtroMedio
    ? ventas?.filter((v) => v.pagos?.some((p) => p.medioPago === filtroMedio)) ?? []
    : ventas ?? [];

  return (
    <div className="space-y-4">
      {/* ===== MOBILE ===== */}
      <div className="md:hidden space-y-3">
        {/* Caja selector pills */}
        {cajasLoading ? (
          <Skeleton className="h-9 w-40 rounded-xl" />
        ) : (
          <div className="flex gap-1">
            {cajas?.map((c) => (
              <button
                key={c._id}
                onClick={() => setSelectedCajaId(c._id)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors duration-200 cursor-pointer ${
                  effectiveCajaId === c._id
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:bg-muted"
                }`}
              >
                {c.nombre}
              </button>
            ))}
          </div>
        )}

        {/* Turno badge */}
        {hasTurno && turnoActivo && (
          <div className="flex items-center justify-between">
            <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border-0 text-xs">
              Turno abierto — {new Date(turnoActivo.turno.apertura).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })}hs
            </Badge>
            <button
              onClick={() => setShowCierre(true)}
              className="text-xs font-medium text-amber-600 cursor-pointer"
            >
              Cerrar
            </button>
          </div>
        )}

        {/* Bolsillos 2x2 grid */}
        {turnoLoading ? (
          <div className="grid grid-cols-2 gap-2">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-20 rounded-2xl" />)}
          </div>
        ) : hasTurno && turnoActivo ? (
          <div className="grid grid-cols-2 gap-2">
            {turnoActivo.bolsillos.map((b) => (
              <button
                key={b.medioPago}
                onClick={() => setFiltroMedio(filtroMedio === b.medioPago ? null : b.medioPago)}
                className={`flex items-center gap-3 card-elevated rounded-2xl bg-white dark:bg-card px-3 py-2.5 text-left cursor-pointer transition-all duration-200 ${
                  filtroMedio === b.medioPago ? "ring-2 ring-ring" : ""
                }`}
              >
                <div className={`flex h-8 w-8 items-center justify-center rounded-xl flex-shrink-0 ${MEDIO_COLORS[b.medioPago]}`}>
                  {MEDIO_ICONS[b.medioPago]}
                </div>
                <div className="min-w-0">
                  <p className="text-lg font-semibold tabular-nums leading-tight">${b.total.toLocaleString("es-AR")}</p>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{MEDIO_LABELS[b.medioPago]}</p>
                </div>
              </button>
            ))}
            <button
              onClick={() => setFiltroMedio(null)}
              className={`flex items-center gap-3 card-elevated rounded-2xl bg-white dark:bg-card px-3 py-2.5 text-left cursor-pointer transition-all duration-200 ${
                filtroMedio === null ? "ring-2 ring-ring" : ""
              }`}
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-xl flex-shrink-0 bg-muted">
                <DollarSign className="h-4 w-4 text-foreground" />
              </div>
              <div className="min-w-0">
                <p className="text-lg font-semibold tabular-nums leading-tight">${turnoActivo.totalGeneral.toLocaleString("es-AR")}</p>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Todo</p>
              </div>
            </button>
          </div>
        ) : !turnoLoading && !hasTurno ? (
          <div className="card-elevated rounded-2xl bg-white dark:bg-card p-8 text-center">
            <Lock className="h-8 w-8 mx-auto text-muted-foreground/20 mb-3" />
            <p className="text-sm text-muted-foreground mb-1">No hay turno abierto</p>
            <p className="text-xs text-muted-foreground mb-4">Abri un turno para registrar ventas</p>
            <Button size="sm" className="rounded-xl bg-foreground text-background hover:bg-foreground/90 cursor-pointer" onClick={() => setShowApertura(true)}>
              Abrir Turno
            </Button>
          </div>
        ) : null}

        {/* Mobile transaction list */}
        {hasTurno && (
          <div className="space-y-2">
            {/* Filter label */}
            {filtroMedio && (
              <div className="flex items-center justify-between animate-fade-in">
                <p className="text-sm font-medium text-muted-foreground">
                  {MEDIO_LABELS[filtroMedio]}
                </p>
                <button
                  onClick={() => setFiltroMedio(null)}
                  className="text-xs text-foreground font-medium cursor-pointer"
                >
                  Ver todos
                </button>
              </div>
            )}

            {/* Transaction cards */}
            {ventasFiltradas.length > 0 ? (
              <div className="space-y-2">
                {[...ventasFiltradas].reverse().map((v) => (
                  <div
                    key={v._id}
                    onClick={() => setSelectedVenta(v)}
                    className="card-elevated rounded-2xl bg-white dark:bg-card p-3.5 cursor-pointer transition-all duration-200 active:scale-[0.98]"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg ${
                          v.tipo === "egreso" ? "bg-red-50 text-red-500" : "bg-emerald-50 text-emerald-600"
                        }`}>
                          {v.tipo === "egreso"
                            ? <ArrowUpCircle className="h-4 w-4" />
                            : <ArrowDownCircle className="h-4 w-4" />
                          }
                        </div>
                        <div className="min-w-0">
                          <p className={`text-sm font-medium truncate ${v.tipo === "egreso" ? "text-red-500" : ""}`}>
                            {v.descripcion || "Sin descripcion"}
                          </p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[10px] text-muted-foreground tabular-nums">
                              {new Date(v.fecha).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })}
                            </span>
                            {v.pagos?.map((p, i) => (
                              <Badge key={i} variant="secondary" className={`border-0 text-[9px] px-1 py-0 ${MEDIO_COLORS[p.medioPago]}`}>
                                {MEDIO_LABELS[p.medioPago]?.charAt(0)}
                              </Badge>
                            ))}
                            {v.origen === "lavado" && (
                              <Badge variant="secondary" className="border-0 text-[9px] px-1 py-0 bg-blue-50 text-blue-600">auto</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <p className={`text-sm font-semibold tabular-nums flex-shrink-0 ml-2 ${v.tipo === "egreso" ? "text-red-500" : ""}`}>
                        {v.tipo === "egreso" ? "-" : ""}{"$"}{v.monto.toLocaleString("es-AR")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <DollarSign className="h-10 w-10 mx-auto text-muted-foreground/20 mb-3" />
                <p className="text-sm text-muted-foreground">
                  {filtroMedio ? `Sin movimientos en ${MEDIO_LABELS[filtroMedio]}` : "Sin movimientos en este turno"}
                </p>
              </div>
            )}
          </div>
        )}

      </div>

      {/* Mobile FAB — portal to body so fixed works regardless of parent transforms */}
      {hasTurno && (
        <FloatingButton
          onClick={() => setShowNuevaVenta(true)}
          hidden={showNuevaVenta || showApertura || showCierre || showConfig}
          className="bg-foreground text-background shadow-black/10"
        >
          <Plus className="h-6 w-6" />
        </FloatingButton>
      )}
      {!hasTurno && !turnoLoading && (
        <FloatingButton
          onClick={() => setShowApertura(true)}
          hidden={showApertura}
          className="bg-foreground text-background shadow-black/10"
        >
          <Lock className="h-6 w-6" />
        </FloatingButton>
      )}

      {/* ===== DESKTOP ===== */}
      <div className="hidden md:block space-y-4">
        {/* Top bar: caja selector + actions */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            {cajasLoading ? (
              <Skeleton className="h-9 w-40 rounded-xl" />
            ) : (
              <div className="flex gap-1">
                {cajas?.map((c) => (
                  <button
                    key={c._id}
                    onClick={() => setSelectedCajaId(c._id)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                      effectiveCajaId === c._id
                        ? "bg-muted text-foreground"
                        : "text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    {c.nombre}
                  </button>
                ))}
              </div>
            )}
            {hasTurno && turnoActivo && (
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border-0 text-xs">
                  Turno abierto — {new Date(turnoActivo.turno.apertura).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })}hs
                </Badge>
                <Button size="sm" variant="outline" className="rounded-xl text-xs text-amber-600 border-amber-200 hover:bg-amber-50 cursor-pointer" onClick={() => setShowCierre(true)}>
                  <Lock className="h-3.5 w-3.5 mr-1" /> Cerrar Turno
                </Button>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            {!hasTurno ? (
              <Button size="sm" className="rounded-xl bg-foreground text-background hover:bg-foreground/90 text-xs cursor-pointer" onClick={() => setShowApertura(true)}>
                <Lock className="h-3.5 w-3.5 mr-1" /> Abrir Turno
              </Button>
            ) : (
              <Button size="sm" className="rounded-xl bg-foreground text-background hover:bg-foreground/90 text-xs cursor-pointer" onClick={() => setShowNuevaVenta(true)}>
                <Plus className="h-3.5 w-3.5 mr-1" /> Nuevo Movimiento
              </Button>
            )}
          </div>
        </div>

        {/* Bolsillos summary */}
        {turnoLoading ? (
          <div className="grid grid-cols-4 gap-3">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-20 rounded-2xl" />)}
          </div>
        ) : hasTurno && turnoActivo ? (
          <div className="grid grid-cols-4 gap-2">
            {turnoActivo.bolsillos.map((b) => (
              <button
                key={b.medioPago}
                onClick={() => setFiltroMedio(filtroMedio === b.medioPago ? null : b.medioPago)}
                className={`card-elevated rounded-2xl bg-white dark:bg-card p-3.5 text-left cursor-pointer transition-all duration-200 ${
                  filtroMedio === b.medioPago ? "ring-2 ring-ring" : ""
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${MEDIO_COLORS[b.medioPago]}`}>
                    {MEDIO_ICONS[b.medioPago]}
                  </div>
                  <span className="text-xs font-medium text-muted-foreground">{MEDIO_LABELS[b.medioPago]}</span>
                </div>
                <p className="text-lg font-semibold tabular-nums">${b.total.toLocaleString("es-AR")}</p>
                <p className="text-[10px] text-muted-foreground tabular-nums">
                  Fondo: ${b.fondo.toLocaleString("es-AR")} + Ventas: ${b.ingresos.toLocaleString("es-AR")}
                </p>
              </button>
            ))}
            <button
              onClick={() => setFiltroMedio(null)}
              className={`card-elevated rounded-2xl bg-white dark:bg-card p-3.5 text-left cursor-pointer transition-all duration-200 ${
                filtroMedio === null ? "ring-2 ring-ring" : ""
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-muted text-foreground">
                  <DollarSign className="h-4 w-4" />
                </div>
                <span className="text-xs font-medium text-muted-foreground">Todo</span>
              </div>
              <p className="text-lg font-semibold tabular-nums">${turnoActivo.totalGeneral.toLocaleString("es-AR")}</p>
              <p className="text-[10px] text-muted-foreground">{ventas?.length ?? 0} movimientos</p>
            </button>
          </div>
        ) : !turnoLoading && !hasTurno ? (
          <div className="card-elevated rounded-2xl bg-white dark:bg-card p-8 text-center">
            <Lock className="h-8 w-8 mx-auto text-muted-foreground/20 mb-3" />
            <p className="text-sm text-muted-foreground mb-1">No hay turno abierto en esta caja</p>
            <p className="text-xs text-muted-foreground mb-4">Abri un turno para empezar a registrar ventas</p>
            <Button size="sm" className="rounded-xl bg-foreground text-background hover:bg-foreground/90 cursor-pointer" onClick={() => setShowApertura(true)}>
              Abrir Turno
            </Button>
          </div>
        ) : null}

        {/* Main content: table + detail panel */}
        {hasTurno && (
          <div className="flex gap-4">
            {/* Tabla de ventas */}
            <div className={`card-static rounded-2xl bg-white dark:bg-card overflow-hidden flex-1 ${selectedVenta ? "hidden md:block" : ""}`}>
              {(() => {
                return (<div key={filtroMedio ?? "all"} className="animate-fade-in">
              <div className="px-4 pt-4 pb-2 flex items-center justify-between">
                <h3 className="text-sm font-semibold">
                  {filtroMedio ? `Movimientos — ${MEDIO_LABELS[filtroMedio]}` : "Movimientos del turno"}
                </h3>
                <span className="text-xs text-muted-foreground tabular-nums">{ventasFiltradas.length} registros</span>
              </div>
              {ventasFiltradas.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-left">
                        <th className="px-4 pb-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Hora</th>
                        <th className="px-4 pb-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Descripcion</th>
                        <th className="px-4 pb-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Pagos</th>
                        <th className="px-4 pb-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground text-right">Monto</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[...ventasFiltradas].reverse().map((v) => (
                        <tr
                          key={v._id}
                          onClick={() => setSelectedVenta(v)}
                          className={`border-b border-border/30 last:border-0 cursor-pointer transition-all duration-200 ${
                            selectedVenta?._id === v._id
                              ? "bg-muted"
                              : "hover:bg-muted/30"
                          }`}
                        >
                          <td className="px-4 py-2.5 text-xs text-muted-foreground tabular-nums whitespace-nowrap">
                            {new Date(v.fecha).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })}
                          </td>
                          <td className="px-4 py-2.5">
                            <div className="flex items-center gap-1.5">
                              <span className={`text-sm truncate max-w-[200px] ${v.tipo === "egreso" ? "text-red-500" : ""}`}>{v.descripcion || "Sin descripcion"}</span>
                              {v.origen === "lavado" && (
                                <Badge variant="secondary" className="border-0 text-[9px] bg-blue-50 text-blue-600">auto</Badge>
                              )}
                              {v.tipo === "egreso" && (
                                <Badge variant="secondary" className="border-0 text-[9px] bg-red-50 text-red-500">egreso</Badge>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-2.5">
                            <div className="flex gap-1">
                              {v.pagos?.map((p, i) => (
                                <Badge key={i} variant="secondary" className={`border-0 text-[10px] gap-0.5 ${MEDIO_COLORS[p.medioPago]}`}>
                                  {MEDIO_LABELS[p.medioPago]?.charAt(0)}{"$"}{p.monto.toLocaleString("es-AR")}
                                </Badge>
                              ))}
                            </div>
                          </td>
                          <td className={`px-4 py-2.5 text-right font-medium tabular-nums ${v.tipo === "egreso" ? "text-red-500" : ""}`}>
                            {v.tipo === "egreso" ? "-" : ""}{"$"}{v.monto.toLocaleString("es-AR")}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="px-4 py-12 text-center">
                  <p className="text-sm text-muted-foreground">
                    {filtroMedio ? `Sin movimientos en ${MEDIO_LABELS[filtroMedio]}` : "Sin movimientos en este turno"}
                  </p>
                </div>
              )}
                </div>);
              })()}
            </div>

            {/* Panel de detalle */}
            {selectedVenta && (
              <VentaDetailPanel
                key={selectedVenta._id}
                venta={selectedVenta}
                onClose={() => setSelectedVenta(null)}
              />
            )}
          </div>
        )}
      </div>

      {/* Modal: Nuevo Movimiento */}
      <NuevaVentaDialog
        open={showNuevaVenta}
        onOpenChange={setShowNuevaVenta}
        turnoId={turnoActivo?.turno?._id ?? ""}
        medios={selectedCaja?.mediosPagoHabilitados ?? []}
      />

      {/* Modal: Nuevo Egreso */}
      {/* Modal: Apertura de Turno */}
      <AperturaTurnoDialog
        open={showApertura}
        onOpenChange={setShowApertura}
        cajaId={effectiveCajaId ?? ""}
        medios={selectedCaja?.mediosPagoHabilitados ?? []}
      />

      {/* Modal: Cierre de Turno */}
      {turnoActivo && (
        <CierreTurnoDialog
          open={showCierre}
          onOpenChange={setShowCierre}
          turnoActivo={turnoActivo}
        />
      )}

      {/* Modal: Config Cajas - simple for now */}
      <Dialog open={showConfig} onOpenChange={setShowConfig}>
        <DialogContent className="sm:max-w-sm p-5 gap-0 rounded-2xl border-0 shadow-2xl">
          <DialogHeader className="mb-3">
            <DialogTitle className="text-lg tracking-tight">Gestion de Cajas</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            {cajas?.map((c) => (
              <div key={c._id} className="flex items-center justify-between rounded-xl border p-3">
                <div>
                  <p className="text-sm font-medium">{c.nombre}</p>
                  <div className="flex gap-1 mt-1">
                    {c.mediosPagoHabilitados.map((m) => (
                      <Badge key={m} variant="secondary" className={`border-0 text-[9px] ${MEDIO_COLORS[m]}`}>
                        {MEDIO_LABELS[m]}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// --- Detail Panel ---
function VentaDetailPanel({ venta, onClose }: { venta: VentaPOS; onClose: () => void }) {
  const anular = useAnularVenta();
  const editar = useEditarVenta();
  const [editing, setEditing] = useState(false);
  const [editDesc, setEditDesc] = useState(venta.descripcion);
  const [editMonto, setEditMonto] = useState(venta.monto);
  const [editTipo, setEditTipo] = useState(venta.tipo || "ingreso");
  const [editNota, setEditNota] = useState(venta.nota || "");

  const handleAnular = () => {
    anular.mutate(venta._id, {
      onSuccess: () => { toast.success("Venta anulada"); onClose(); },
      onError: (e) => toast.error(e.message),
    });
  };

  const handleGuardar = () => {
    editar.mutate(
      { id: venta._id, descripcion: editDesc, monto: editMonto, tipo: editTipo, nota: editNota },
      {
        onSuccess: () => { toast.success("Venta actualizada"); setEditing(false); },
        onError: (e) => toast.error(e.message),
      }
    );
  };

  return (
    <div className="card-static rounded-2xl bg-white dark:bg-card w-80 flex-shrink-0 hidden md:block animate-slide-in-right">
      <div className="flex items-center justify-between p-4 border-b border-border/30">
        <h3 className="text-sm font-semibold">Detalle</h3>
        <button onClick={onClose} className="p-1 rounded-lg hover:bg-muted cursor-pointer">
          <X className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>
      <div className="p-4 space-y-4">
        {/* Info */}
        <div className="space-y-2.5 text-sm">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Hora</span>
            <span className="tabular-nums">{new Date(venta.fecha).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })}</span>
          </div>
          <div>
            <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Descripcion</span>
            <div className="relative mt-0.5">
              <div className={`transition-all duration-200 ${editing ? "opacity-0 h-0 overflow-hidden" : "opacity-100"}`}>
                <p className="text-sm">{venta.descripcion || "--"}</p>
              </div>
              <div className={`transition-all duration-200 ${editing ? "opacity-100" : "opacity-0 h-0 overflow-hidden"}`}>
                <Input className="h-10 rounded-xl text-sm" value={editDesc} onChange={(e) => setEditDesc(e.target.value)} />
              </div>
            </div>
          </div>
          <div>
            <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Monto</span>
            <div className="relative mt-0.5">
              <div className={`transition-all duration-200 ${editing ? "opacity-0 h-0 overflow-hidden" : "opacity-100"}`}>
                <p className="text-lg font-semibold tabular-nums">${venta.monto.toLocaleString("es-AR")}</p>
              </div>
              <div className={`transition-all duration-200 ${editing ? "opacity-100" : "opacity-0 h-0 overflow-hidden"}`}>
                <Input type="number" className="h-10 rounded-xl text-sm tabular-nums" value={editMonto} onChange={(e) => setEditMonto(parseFloat(e.target.value) || 0)} />
              </div>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Tipo</span>
            {editing ? (
              <Select value={editTipo} onValueChange={(v) => v && setEditTipo(v as "ingreso" | "egreso")}>
                <SelectTrigger className="h-7 rounded-lg text-xs w-28"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ingreso">Ingreso</SelectItem>
                  <SelectItem value="egreso">Egreso</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <Badge variant="secondary" className={`border-0 text-[10px] ${venta.tipo === "egreso" ? "bg-red-50 text-red-500" : "bg-emerald-50 text-emerald-600"}`}>
                {venta.tipo === "egreso" ? "Egreso" : "Ingreso"}
              </Badge>
            )}
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Origen</span>
            <Badge variant="secondary" className={`border-0 text-[10px] ${venta.origen === "lavado" ? "bg-blue-50 text-blue-600" : ""}`}>
              {venta.origen}
            </Badge>
          </div>
          <div>
            <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Nota</span>
            <div className="relative mt-0.5">
              <div className={`transition-all duration-200 ${editing ? "opacity-0 h-0 overflow-hidden" : "opacity-100"}`}>
                <p className="text-xs text-muted-foreground italic">{venta.nota || "Sin nota"}</p>
              </div>
              <div className={`transition-all duration-200 ${editing ? "opacity-100" : "opacity-0 h-0 overflow-hidden"}`}>
                <textarea
                  className="w-full h-16 rounded-lg border border-input bg-transparent px-2.5 py-1.5 text-xs outline-none focus:border-ring focus:ring-2 focus:ring-ring/50 resize-none placeholder:text-muted-foreground"
                  value={editNota}
                  onChange={(e) => setEditNota(e.target.value)}
                  placeholder="Agregar una nota..."
                />
              </div>
            </div>
          </div>
        </div>

        <div className="h-px bg-border/50" />

        {/* Pagos */}
        <div className="space-y-1.5">
          <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Pagos</p>
          {venta.pagos?.map((p, i) => (
            <div key={i} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div className={`flex h-6 w-6 items-center justify-center rounded-md ${MEDIO_COLORS[p.medioPago]}`}>
                  {MEDIO_ICONS[p.medioPago]}
                </div>
                <span>{MEDIO_LABELS[p.medioPago]}</span>
              </div>
              <span className="font-medium tabular-nums">${p.monto.toLocaleString("es-AR")}</span>
            </div>
          ))}
        </div>

        <div className="h-px bg-border/50" />

        {/* Actions */}
        <div className="space-y-2">
          {editing ? (
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="flex-1 rounded-xl text-xs cursor-pointer" onClick={() => setEditing(false)}>
                Cancelar
              </Button>
              <Button size="sm" className="flex-1 rounded-xl text-xs bg-foreground text-background hover:bg-foreground/90 cursor-pointer" onClick={handleGuardar} disabled={editar.isPending}>
                {editar.isPending ? "Guardando..." : "Guardar"}
              </Button>
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              className="w-full rounded-xl text-xs cursor-pointer"
              onClick={() => setEditing(true)}
            >
              <Pencil className="h-3.5 w-3.5 mr-1" /> Editar Venta
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            className="w-full rounded-xl text-xs text-red-500 border-red-200 hover:bg-red-50 cursor-pointer"
            onClick={handleAnular}
            disabled={anular.isPending}
          >
            <Trash2 className="h-3.5 w-3.5 mr-1" />
            {anular.isPending ? "Anulando..." : "Anular Venta"}
          </Button>
        </div>
      </div>
    </div>
  );
}

// --- Nueva Venta Dialog ---
function NuevaVentaDialog({ open, onOpenChange, turnoId, medios, tipo: tipoProp }: { open: boolean; onOpenChange: (o: boolean) => void; turnoId: string; medios: MedioPago[]; tipo?: "ingreso" | "egreso" }) {
  const crear = useCrearVenta();
  const [monto, setMonto] = useState<number | string>("");
  const [desc, setDesc] = useState("");
  const [medioPago, setMedioPago] = useState<string>(medios[0] ?? "efectivo");

  const [tipoManual, setTipoManual] = useState<"ingreso" | "egreso">(tipoProp ?? "ingreso");
  const montoStr = String(monto);
  const montoNum = parseFloat(montoStr);
  const autoTipo = tipoProp ?? tipoManual;
  const isEgreso = autoTipo === "egreso";

  const [nota, setNota] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!montoNum || montoNum === 0) return;
    const absM = Math.abs(montoNum);
    crear.mutate(
      { turnoId, monto: absM, tipo: autoTipo, descripcion: desc, nota: nota || undefined, pagos: [{ medioPago, monto: absM }] },
      {
        onSuccess: () => {
          toast.success(isEgreso ? "Egreso registrado" : "Ingreso registrado");
          onOpenChange(false);
          setMonto(""); setDesc(""); setNota("");
        },
        onError: (e) => toast.error(e.message),
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm p-5 gap-0 rounded-2xl border-0 shadow-2xl">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-sm font-semibold tracking-tight">
            Nuevo Movimiento
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          {!tipoProp && (
            <div className="flex rounded-xl bg-muted p-0.5">
              <button
                type="button"
                className={`flex-1 rounded-[10px] py-1.5 text-xs font-semibold transition-all ${!isEgreso ? "bg-white dark:bg-card text-emerald-600 shadow-sm" : "text-muted-foreground"}`}
                onClick={() => setTipoManual("ingreso")}
              >
                Ingreso
              </button>
              <button
                type="button"
                className={`flex-1 rounded-[10px] py-1.5 text-xs font-semibold transition-all ${isEgreso ? "bg-white dark:bg-card text-red-500 shadow-sm" : "text-muted-foreground"}`}
                onClick={() => setTipoManual("egreso")}
              >
                Egreso
              </button>
            </div>
          )}
          <div className="space-y-1.5">
            <Label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Monto</Label>
            <input
              type="text"
              inputMode="decimal"
              className="h-10 w-full rounded-xl border border-input bg-transparent px-2.5 text-sm tabular-nums font-medium outline-none focus:border-ring focus:ring-2 focus:ring-ring/50 placeholder:text-muted-foreground"
              value={monto}
              onChange={(e) => {
                const v = e.target.value.replace(/[^0-9.]/g, "");
                setMonto(v);
              }}
              required
              autoFocus
              placeholder="1500"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Descripcion</Label>
            <Input className="h-10 rounded-xl text-sm" value={desc} onChange={(e) => setDesc(e.target.value)} placeholder={isEgreso ? "Sueldo, insumos, compra..." : "Lavado, venta, producto..."} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Nota</Label>
            <textarea
              className="w-full h-14 rounded-xl border border-input bg-transparent px-2.5 py-2 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/50 resize-none placeholder:text-muted-foreground"
              value={nota}
              onChange={(e) => setNota(e.target.value)}
              placeholder="Observacion opcional..."
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Medio de Pago</Label>
            <Select value={medioPago} onValueChange={(v) => v && setMedioPago(v)}>
              <SelectTrigger className="h-10 rounded-xl text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                {medios.map((m) => (
                  <SelectItem key={m} value={m}>{MEDIO_LABELS[m]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" className={`w-full h-10 rounded-xl text-white cursor-pointer ${isEgreso ? "bg-red-500 hover:bg-red-600" : "bg-foreground text-background hover:bg-foreground/90"}`} disabled={crear.isPending}>
            {crear.isPending ? "Registrando..." : isEgreso ? "Registrar Egreso" : "Registrar Ingreso"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// --- Apertura de Turno Dialog ---
function AperturaTurnoDialog({ open, onOpenChange, cajaId, medios }: { open: boolean; onOpenChange: (o: boolean) => void; cajaId: string; medios: MedioPago[] }) {
  const abrir = useAbrirTurno();
  const [fondos, setFondos] = useState<Record<string, number>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fondosArr = medios.map((m) => ({ medioPago: m, monto: fondos[m] || 0 }));
    abrir.mutate(
      { cajaId, fondos: fondosArr },
      {
        onSuccess: () => { toast.success("Turno abierto"); onOpenChange(false); },
        onError: (e) => toast.error(e.message),
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm p-5 gap-0 rounded-2xl border-0 shadow-2xl">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-lg tracking-tight">Abrir Turno</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          <p className="text-xs text-muted-foreground">Ingresa el fondo inicial por medio de pago</p>
          {medios.map((m) => (
            <div key={m} className="flex items-center gap-3">
              <div className={`flex h-8 w-8 items-center justify-center rounded-lg flex-shrink-0 ${MEDIO_COLORS[m]}`}>
                {MEDIO_ICONS[m]}
              </div>
              <Label className="text-sm flex-1">{MEDIO_LABELS[m]}</Label>
              <Input
                type="number"
                className="h-10 rounded-xl text-sm tabular-nums w-28"
                value={fondos[m] ?? ""}
                onChange={(e) => setFondos({ ...fondos, [m]: parseFloat(e.target.value) || 0 })}
              />
            </div>
          ))}
          <Button type="submit" className="w-full h-10 rounded-xl bg-foreground text-background hover:bg-foreground/90 cursor-pointer" disabled={abrir.isPending}>
            {abrir.isPending ? "Abriendo..." : "Abrir Turno"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// --- Cierre de Turno Dialog ---
function CierreTurnoDialog({ open, onOpenChange, turnoActivo }: { open: boolean; onOpenChange: (o: boolean) => void; turnoActivo: NonNullable<ReturnType<typeof useTurnoActivo>["data"]> }) {
  const cerrar = useCerrarTurno();
  const [conteo, setConteo] = useState<Record<string, number>>({});
  const [obs, setObs] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    cerrar.mutate(
      { turnoId: turnoActivo.turno._id, arqueo: { real: conteo, observacion: obs } },
      {
        onSuccess: () => { toast.success("Turno cerrado"); onOpenChange(false); },
        onError: (e) => toast.error(e.message),
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-5 gap-0 rounded-2xl border-0 shadow-2xl">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-lg tracking-tight">Cerrar Turno</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-[1fr_auto_auto_auto] gap-x-3 gap-y-2 items-center text-sm">
            <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Medio</span>
            <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground text-right">Sistema</span>
            <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground text-right">Real</span>
            <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground text-right">Dif.</span>
            {turnoActivo.bolsillos.map((b) => {
              const real = conteo[b.medioPago] ?? b.total;
              const dif = real - b.total;
              return (
                <div key={b.medioPago} className="contents">
                  <div className="flex items-center gap-2">
                    <div className={`flex h-6 w-6 items-center justify-center rounded-md ${MEDIO_COLORS[b.medioPago]}`}>
                      {MEDIO_ICONS[b.medioPago]}
                    </div>
                    <span>{MEDIO_LABELS[b.medioPago]}</span>
                  </div>
                  <span className="text-right tabular-nums font-medium">${b.total.toLocaleString("es-AR")}</span>
                  <Input
                    type="number"
                    className="h-8 rounded-lg text-xs tabular-nums w-24"
                    value={conteo[b.medioPago] ?? ""}
                    placeholder={b.total.toString()}
                    onChange={(e) => setConteo({ ...conteo, [b.medioPago]: parseFloat(e.target.value) || 0 })}
                  />
                  <span className={`text-right tabular-nums text-xs font-medium ${dif === 0 ? "text-muted-foreground" : dif > 0 ? "text-emerald-600" : "text-red-500"}`}>
                    {dif >= 0 ? "+" : ""}{"$"}{dif.toLocaleString("es-AR")}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="space-y-1">
            <Label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Observacion</Label>
            <Input className="h-10 rounded-xl text-sm" value={obs} onChange={(e) => setObs(e.target.value)} placeholder="Opcional..." />
          </div>
          <Button type="submit" className="w-full h-10 rounded-xl bg-amber-500 hover:bg-amber-600 text-white cursor-pointer" disabled={cerrar.isPending}>
            <Lock className="h-4 w-4 mr-1" /> {cerrar.isPending ? "Cerrando..." : "Confirmar Cierre"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
