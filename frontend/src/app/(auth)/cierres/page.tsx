"use client";

import { useState } from "react";
import {
  Banknote,
  Smartphone,
  CreditCard,
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  ClipboardCheck,
  ChevronDown,
  ChevronRight,
  Clock,
  User,
} from "lucide-react";
import {
  useTurnos,
  useTurnoDetalle,
  useResumenTurnos,
  useCajas,
} from "@/hooks/useCaja";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { Turno, VentaPOS, MedioPago } from "@/types";

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
  tarjeta: "text-purple-600 bg-purple-50",
};

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
  });
}

function formatTime(d: string) {
  return new Date(d).toLocaleTimeString("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDuration(apertura: string, cierre: string | null) {
  if (!cierre) return "--";
  const ms = new Date(cierre).getTime() - new Date(apertura).getTime();
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

function sumArqueo(map: Record<string, number> | undefined): number {
  if (!map) return 0;
  return Object.values(map).reduce((a, v) => a + v, 0);
}

export default function CierresPage() {
  const { data: cajas } = useCajas();
  const [filtroCaja, setFiltroCaja] = useState<string | null>(null);
  const { data: resumen, isLoading: resumenLoading } = useResumenTurnos();
  const { data: turnos, isLoading: turnosLoading } = useTurnos(
    filtroCaja ?? undefined,
    "cerrado"
  );
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const cajaNombres: Record<string, string> = {};
  cajas?.forEach((c) => {
    cajaNombres[c._id] = c.nombre;
  });

  return (
    <div className="space-y-4">
      {/* Stats cards */}
      {resumenLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-2xl" />
          ))}
        </div>
      ) : resumen ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="card-elevated rounded-2xl bg-white p-3.5">
            <div className="flex items-center gap-2 mb-1">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-purple-muted text-brand-purple">
                <ClipboardCheck className="h-4 w-4" />
              </div>
              <span className="text-xs font-medium text-muted-foreground">
                Turnos
              </span>
            </div>
            <p className="text-lg font-semibold tabular-nums">
              {resumen.totalTurnos}
            </p>
            <p className="text-[10px] text-muted-foreground">esta semana</p>
          </div>
          <div className="card-elevated rounded-2xl bg-white p-3.5">
            <div className="flex items-center gap-2 mb-1">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                <TrendingUp className="h-4 w-4" />
              </div>
              <span className="text-xs font-medium text-muted-foreground">
                Ingresos
              </span>
            </div>
            <p className="text-lg font-semibold tabular-nums">
              ${resumen.totalIngresos.toLocaleString("es-AR")}
            </p>
            <p className="text-[10px] text-muted-foreground">esta semana</p>
          </div>
          <div className="card-elevated rounded-2xl bg-white p-3.5">
            <div className="flex items-center gap-2 mb-1">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-50 text-red-500">
                <TrendingDown className="h-4 w-4" />
              </div>
              <span className="text-xs font-medium text-muted-foreground">
                Egresos
              </span>
            </div>
            <p className="text-lg font-semibold tabular-nums">
              ${resumen.totalEgresos.toLocaleString("es-AR")}
            </p>
            <p className="text-[10px] text-muted-foreground">esta semana</p>
          </div>
          <div className="card-elevated rounded-2xl bg-white p-3.5">
            <div className="flex items-center gap-2 mb-1">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                <AlertTriangle className="h-4 w-4" />
              </div>
              <span className="text-xs font-medium text-muted-foreground">
                Diferencias
              </span>
            </div>
            <p
              className={`text-lg font-semibold tabular-nums ${
                resumen.totalDiferencia === 0
                  ? "text-muted-foreground"
                  : resumen.totalDiferencia > 0
                    ? "text-emerald-600"
                    : "text-red-500"
              }`}
            >
              {resumen.totalDiferencia >= 0 ? "+" : ""}$
              {resumen.totalDiferencia.toLocaleString("es-AR")}
            </p>
            <p className="text-[10px] text-muted-foreground">
              arqueo acumulado
            </p>
          </div>
        </div>
      ) : null}

      {/* Filter bar */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setFiltroCaja(null)}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
            filtroCaja === null
              ? "bg-brand-purple-muted text-brand-purple"
              : "text-muted-foreground hover:bg-muted"
          }`}
        >
          Todas
        </button>
        {cajas?.map((c) => (
          <button
            key={c._id}
            onClick={() =>
              setFiltroCaja(filtroCaja === c._id ? null : c._id)
            }
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
              filtroCaja === c._id
                ? "bg-brand-purple-muted text-brand-purple"
                : "text-muted-foreground hover:bg-muted"
            }`}
          >
            {c.nombre}
          </button>
        ))}
      </div>

      {/* Turnos table */}
      <div className="card-static rounded-2xl bg-white overflow-hidden">
        <div className="px-4 pt-4 pb-2 flex items-center justify-between">
          <h3 className="text-sm font-semibold">Historial de cierres</h3>
          <span className="text-xs text-muted-foreground tabular-nums">
            {turnos?.length ?? 0} turnos
          </span>
        </div>

        {turnosLoading ? (
          <div className="p-4 space-y-2">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-12 rounded-xl" />
            ))}
          </div>
        ) : turnos && turnos.length > 0 ? (
          <div>
            {/* Header */}
            <div className="grid grid-cols-[24px_1fr_1fr_1fr_1fr_1fr_1fr] gap-2 px-4 pb-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              <span />
              <span>Fecha</span>
              <span>Caja</span>
              <span>Cerrado por</span>
              <span className="text-right">Duracion</span>
              <span className="text-right">Total</span>
              <span className="text-right">Diferencia</span>
            </div>

            {turnos.map((t) => {
              const dif = sumArqueo(t.arqueo?.diferencia);
              const isExpanded = expandedId === t._id;
              return (
                <div key={t._id}>
                  <button
                    onClick={() =>
                      setExpandedId(isExpanded ? null : t._id)
                    }
                    className={`w-full grid grid-cols-[24px_1fr_1fr_1fr_1fr_1fr_1fr] gap-2 items-center px-4 py-3 text-sm border-t border-border/30 transition-all duration-200 cursor-pointer ${
                      isExpanded
                        ? "bg-brand-purple-muted"
                        : "hover:bg-muted/30"
                    }`}
                  >
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4 text-brand-purple" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span className="text-left tabular-nums">
                      {formatDate(t.apertura)}{" "}
                      <span className="text-muted-foreground text-xs">
                        {formatTime(t.apertura)}
                      </span>
                    </span>
                    <span className="text-left">
                      {cajaNombres[t.cajaId] || "—"}
                    </span>
                    <span className="text-left text-xs text-muted-foreground flex items-center gap-1.5 truncate">
                      <User className="h-3 w-3 flex-shrink-0" />
                      {t.cerradoPor || "—"}
                    </span>
                    <span className="text-right tabular-nums text-muted-foreground flex items-center justify-end gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDuration(t.apertura, t.cierre)}
                    </span>
                    <span className="text-right tabular-nums font-medium">
                      ${sumArqueo(t.arqueo?.esperado).toLocaleString("es-AR")}
                    </span>
                    <span
                      className={`text-right tabular-nums font-medium ${
                        dif === 0
                          ? "text-muted-foreground"
                          : dif > 0
                            ? "text-emerald-600"
                            : "text-red-500"
                      }`}
                    >
                      {dif >= 0 ? "+" : ""}${dif.toLocaleString("es-AR")}
                    </span>
                  </button>

                  {isExpanded && <TurnoExpandido turnoId={t._id} />}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="px-4 py-12 text-center">
            <ClipboardCheck className="h-8 w-8 mx-auto text-muted-foreground/20 mb-3" />
            <p className="text-sm text-muted-foreground">
              No hay turnos cerrados
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Turno expandido (detalle inline) ─────────────────────────

function TurnoExpandido({ turnoId }: { turnoId: string }) {
  const { data, isLoading } = useTurnoDetalle(turnoId);

  if (isLoading) {
    return (
      <div className="px-6 py-4 border-t border-border/30 bg-muted/20">
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-8 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { turno, fondos, ventas, bolsillos, totalGeneral } = data;

  return (
    <div className="border-t border-border/30 bg-muted/20">
      {/* Bolsillos summary */}
      <div className="px-6 pt-4 pb-3">
        <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground mb-2">
          Balance por medio de pago
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {bolsillos.map((b) => (
            <div
              key={b.medioPago}
              className="rounded-xl bg-white p-3 border border-border/30"
            >
              <div className="flex items-center gap-2 mb-1">
                <div
                  className={`flex h-6 w-6 items-center justify-center rounded-md ${MEDIO_COLORS[b.medioPago]}`}
                >
                  {MEDIO_ICONS[b.medioPago]}
                </div>
                <span className="text-xs font-medium text-muted-foreground">
                  {MEDIO_LABELS[b.medioPago]}
                </span>
              </div>
              <p className="text-base font-semibold tabular-nums">
                ${b.total.toLocaleString("es-AR")}
              </p>
              <p className="text-[10px] text-muted-foreground tabular-nums">
                Fondo: ${b.fondo.toLocaleString("es-AR")} + Ventas: $
                {b.ingresos.toLocaleString("es-AR")}
              </p>
            </div>
          ))}
          <div className="rounded-xl bg-white p-3 border border-border/30">
            <div className="flex items-center gap-2 mb-1">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-brand-purple-muted text-brand-purple">
                <DollarSign className="h-3.5 w-3.5" />
              </div>
              <span className="text-xs font-medium text-muted-foreground">
                Total
              </span>
            </div>
            <p className="text-base font-semibold tabular-nums">
              ${totalGeneral.toLocaleString("es-AR")}
            </p>
            <p className="text-[10px] text-muted-foreground">
              {ventas.length} movimientos
            </p>
          </div>
        </div>
      </div>

      {/* Arqueo */}
      {turno.arqueo &&
        turno.arqueo.esperado &&
        Object.keys(turno.arqueo.esperado).length > 0 && (
          <div className="px-6 pb-3">
            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground mb-2">
              Arqueo
            </p>
            <div className="rounded-xl bg-white border border-border/30 overflow-hidden">
              <div className="grid grid-cols-4 gap-2 px-3 py-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground border-b border-border/30">
                <span>Medio</span>
                <span className="text-right">Sistema</span>
                <span className="text-right">Real</span>
                <span className="text-right">Diferencia</span>
              </div>
              {Object.keys(turno.arqueo.esperado).map((medio) => {
                const esp = turno.arqueo!.esperado[medio] ?? 0;
                const real = turno.arqueo!.real[medio] ?? 0;
                const dif = turno.arqueo!.diferencia[medio] ?? 0;
                return (
                  <div
                    key={medio}
                    className="grid grid-cols-4 gap-2 items-center px-3 py-2 text-sm border-b border-border/30 last:border-0"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={`flex h-6 w-6 items-center justify-center rounded-md ${MEDIO_COLORS[medio] || ""}`}
                      >
                        {MEDIO_ICONS[medio]}
                      </div>
                      <span className="text-xs">
                        {MEDIO_LABELS[medio] || medio}
                      </span>
                    </div>
                    <span className="text-right tabular-nums">
                      ${esp.toLocaleString("es-AR")}
                    </span>
                    <span className="text-right tabular-nums font-medium">
                      ${real.toLocaleString("es-AR")}
                    </span>
                    <span
                      className={`text-right tabular-nums font-medium ${
                        dif === 0
                          ? "text-muted-foreground"
                          : dif > 0
                            ? "text-emerald-600"
                            : "text-red-500"
                      }`}
                    >
                      {dif >= 0 ? "+" : ""}${dif.toLocaleString("es-AR")}
                    </span>
                  </div>
                );
              })}
            </div>
            {turno.arqueo.observacion && (
              <p className="text-xs text-muted-foreground mt-2 italic">
                "{turno.arqueo.observacion}"
              </p>
            )}
          </div>
        )}

      {/* Ventas list */}
      {ventas.length > 0 && (
        <div className="px-6 pb-4">
          <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground mb-2">
            Movimientos ({ventas.length})
          </p>
          <div className="rounded-xl bg-white border border-border/30 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/30">
                  <th className="px-3 py-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground text-left">
                    Hora
                  </th>
                  <th className="px-3 py-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground text-left">
                    Descripcion
                  </th>
                  <th className="px-3 py-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground text-left">
                    Pagos
                  </th>
                  <th className="px-3 py-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground text-right">
                    Monto
                  </th>
                </tr>
              </thead>
              <tbody>
                {ventas.map((v) => (
                  <tr
                    key={v._id}
                    className="border-b border-border/30 last:border-0"
                  >
                    <td className="px-3 py-2 text-xs text-muted-foreground tabular-nums whitespace-nowrap">
                      {formatTime(v.fecha)}
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`text-sm truncate max-w-[200px] ${v.tipo === "egreso" ? "text-red-500" : ""}`}
                        >
                          {v.descripcion || "Sin descripcion"}
                        </span>
                        {v.origen === "lavado" && (
                          <Badge
                            variant="secondary"
                            className="border-0 text-[9px] bg-blue-50 text-blue-600"
                          >
                            auto
                          </Badge>
                        )}
                        {v.tipo === "egreso" && (
                          <Badge
                            variant="secondary"
                            className="border-0 text-[9px] bg-red-50 text-red-500"
                          >
                            egreso
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex gap-1">
                        {v.pagos?.map((p, i) => (
                          <Badge
                            key={i}
                            variant="secondary"
                            className={`border-0 text-[10px] gap-0.5 ${MEDIO_COLORS[p.medioPago]}`}
                          >
                            {MEDIO_LABELS[p.medioPago]?.charAt(0)}$
                            {p.monto.toLocaleString("es-AR")}
                          </Badge>
                        ))}
                      </div>
                    </td>
                    <td
                      className={`px-3 py-2 text-right font-medium tabular-nums ${v.tipo === "egreso" ? "text-red-500" : ""}`}
                    >
                      {v.tipo === "egreso" ? "-" : ""}$
                      {v.monto.toLocaleString("es-AR")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
