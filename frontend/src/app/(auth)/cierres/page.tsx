"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
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
  Search,
  X,
  Car,
  CalendarDays,
} from "lucide-react";
import {
  useTurnos,
  useTurnoDetalle,
  useResumenTurnos,
  useCajas,
} from "@/hooks/useCaja";
import { fetchApi } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { Turno, VentaPOS, Lavado, MedioPago } from "@/types";

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

type DatePreset = "all" | "today" | "week" | "month";

const DATE_PRESETS: { key: DatePreset; label: string }[] = [
  { key: "all", label: "Todo" },
  { key: "today", label: "Hoy" },
  { key: "week", label: "Última semana" },
  { key: "month", label: "Último mes" },
];

function getDateFrom(preset: DatePreset): Date | null {
  if (preset === "all") return null;
  const now = new Date();
  if (preset === "today") return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (preset === "week") { const d = new Date(now); d.setDate(d.getDate() - 7); return d; }
  const d = new Date(now); d.setMonth(d.getMonth() - 1); return d;
}

export default function ArqueosPage() {
  const { data: cajas } = useCajas();
  const [filtroCaja, setFiltroCaja] = useState<string | null>(null);
  const { data: resumen, isLoading: resumenLoading } = useResumenTurnos();
  const { data: turnos, isLoading: turnosLoading } = useTurnos(
    filtroCaja ?? undefined
  );
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [datePreset, setDatePreset] = useState<DatePreset>("all");
  const [showDateFilter, setShowDateFilter] = useState(false);

  const filteredTurnos = useMemo(() => {
    if (!turnos) return [];
    const from = getDateFrom(datePreset);
    if (!from) return turnos;
    return turnos.filter((t) => new Date(t.apertura) >= from);
  }, [turnos, datePreset]);

  const { data: searchResults, isLoading: searchLoading } = useQuery({
    queryKey: ["buscarLavados", searchQuery],
    queryFn: () => fetchApi<Lavado[]>(`/api/lavados/buscar?q=${encodeURIComponent(searchQuery)}`),
    select: (res) => res.data,
    enabled: searchQuery.length >= 2,
  });

  const cajaNombres: Record<string, string> = {};
  cajas?.forEach((c) => {
    cajaNombres[c._id] = c.nombre;
  });

  const isSearching = searchQuery.length >= 2;

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
          <div className="flex items-center gap-3 card-elevated rounded-2xl bg-white dark:bg-card px-4 py-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl flex-shrink-0 bg-muted">
              <ClipboardCheck className="h-4 w-4 text-foreground" />
            </div>
            <div className="min-w-0">
              <p className="text-lg font-semibold tabular-nums leading-tight">{resumen.totalTurnos}</p>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Turnos</p>
            </div>
          </div>
          <div className="flex items-center gap-3 card-elevated rounded-2xl bg-white dark:bg-card px-4 py-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl flex-shrink-0 bg-emerald-50">
              <TrendingUp className="h-4 w-4 text-emerald-600" />
            </div>
            <div className="min-w-0">
              <p className="text-lg font-semibold tabular-nums leading-tight">${resumen.totalIngresos.toLocaleString("es-AR")}</p>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Ingresos</p>
            </div>
          </div>
          <div className="flex items-center gap-3 card-elevated rounded-2xl bg-white dark:bg-card px-4 py-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl flex-shrink-0 bg-red-50">
              <TrendingDown className="h-4 w-4 text-red-500" />
            </div>
            <div className="min-w-0">
              <p className="text-lg font-semibold tabular-nums leading-tight">${resumen.totalEgresos.toLocaleString("es-AR")}</p>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Egresos</p>
            </div>
          </div>
          <div className="flex items-center gap-3 card-elevated rounded-2xl bg-white dark:bg-card px-4 py-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl flex-shrink-0 bg-amber-50">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
            </div>
            <div className="min-w-0">
              <p className={`text-lg font-semibold tabular-nums leading-tight ${resumen.totalDiferencia === 0 ? "text-muted-foreground" : resumen.totalDiferencia > 0 ? "text-emerald-600" : "text-red-500"}`}>
                {resumen.totalDiferencia >= 0 ? "+" : ""}${resumen.totalDiferencia.toLocaleString("es-AR")}
              </p>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Diferencias</p>
            </div>
          </div>
        </div>
      ) : null}

      {/* Search results */}
      {isSearching ? (
        <div className="card-static rounded-2xl bg-white dark:bg-card overflow-hidden animate-fade-in">
          <div className="px-4 pt-4 pb-2 flex items-center justify-between">
            <h3 className="text-sm font-semibold">Historial de lavados</h3>
            <span className="text-xs text-muted-foreground tabular-nums">{searchResults?.length ?? 0} registros</span>
          </div>
          {searchLoading ? (
            <div className="p-4 space-y-2">
              {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-10 rounded-lg" />)}
            </div>
          ) : searchResults && searchResults.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="px-4 py-3 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Fecha</th>
                    <th className="px-4 py-3 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Cliente</th>
                    <th className="px-4 py-3 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Vehiculo</th>
                    <th className="px-4 py-3 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Patente</th>
                    <th className="px-4 py-3 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Tipo</th>
                    <th className="px-4 py-3 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Estado</th>
                    <th className="px-4 py-3 text-[10px] font-medium uppercase tracking-wider text-muted-foreground text-right">Monto</th>
                    <th className="px-4 py-3 text-[10px] font-medium uppercase tracking-wider text-muted-foreground text-right">Calidad</th>
                  </tr>
                </thead>
                <tbody>
                  {searchResults.map((l) => {
                    const estadoStyle: Record<string, string> = {
                      Pendiente: "bg-amber-50 text-amber-700",
                      "En Proceso": "bg-blue-50 text-blue-700",
                      Completado: "bg-emerald-50 text-emerald-700",
                      Retirado: "bg-muted text-muted-foreground",
                    };
                    return (
                      <tr key={l._id} className="border-b border-border/30 last:border-0 hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-2.5 text-xs text-muted-foreground tabular-nums whitespace-nowrap">
                          {new Date(l.fechaDeAlta).toLocaleDateString("es-AR", { day: "2-digit", month: "short", year: "numeric" })}
                        </td>
                        <td className="px-4 py-2.5 font-medium text-sm">{l.nombre}</td>
                        <td className="px-4 py-2.5 text-muted-foreground flex items-center gap-1.5">
                          <Car className="h-3 w-3" /> {l.modelo}
                        </td>
                        <td className="px-4 py-2.5 font-mono text-xs tracking-wide">{l.patente}</td>
                        <td className="px-4 py-2.5">
                          <Badge variant="secondary" className="border-0 text-xs font-medium">{l.tipoDeLavado}</Badge>
                        </td>
                        <td className="px-4 py-2.5">
                          <Badge variant="secondary" className={`border-0 text-xs font-medium ${estadoStyle[l.estado] || ""}`}>{l.estado}</Badge>
                        </td>
                        <td className="px-4 py-2.5 text-right font-medium tabular-nums text-brand-success">
                          {l.monto ? `$${l.monto.toLocaleString("es-AR")}` : <span className="text-muted-foreground/30">--</span>}
                        </td>
                        <td className="px-4 py-2.5 text-right text-amber-500">
                          {l.puntuacionCalidad ? "★".repeat(l.puntuacionCalidad) : <span className="text-muted-foreground/30">--</span>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="px-4 py-12 text-center">
              <Car className="h-8 w-8 mx-auto text-muted-foreground/20 mb-3" />
              <p className="text-sm text-muted-foreground">Sin resultados para "{searchQuery}"</p>
            </div>
          )}
        </div>
      ) : (<>

      {/* Filter bar + search */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 overflow-x-auto">
            <button
              onClick={() => setFiltroCaja(null)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${
                filtroCaja === null
                  ? "bg-muted text-foreground"
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
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${
                  filtroCaja === c._id
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:bg-muted"
                }`}
              >
                {c.nombre}
              </button>
            ))}
          </div>

          {/* Date filter */}
          <div className="relative flex-shrink-0">
            <button
              onClick={() => setShowDateFilter(!showDateFilter)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${
                datePreset !== "all"
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:bg-muted"
              }`}
            >
              <CalendarDays className="h-3.5 w-3.5" />
              {datePreset !== "all" && (
                <span>{DATE_PRESETS.find((p) => p.key === datePreset)?.label}</span>
              )}
            </button>
            {showDateFilter && (<>
              <div className="fixed inset-0 z-10" onClick={() => setShowDateFilter(false)} />
              <div className="absolute top-full right-0 md:left-0 mt-1 z-20 bg-white dark:bg-card border border-border rounded-xl shadow-lg py-1 min-w-[160px] animate-fade-in">
                {DATE_PRESETS.map((p) => (
                  <button
                    key={p.key}
                    onClick={() => { setDatePreset(p.key); setShowDateFilter(false); }}
                    className={`w-full text-left px-3 py-2 text-sm transition-colors cursor-pointer ${
                      datePreset === p.key
                        ? "bg-muted text-foreground font-medium"
                        : "text-muted-foreground hover:bg-muted/50"
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </>)}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isSearching && (
            <span className="text-xs text-muted-foreground tabular-nums">
              {searchLoading ? "Buscando..." : `${searchResults?.length ?? 0} resultados`}
            </span>
          )}
          <div className="relative flex-1 md:flex-none">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar patente..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-8 w-full md:w-48 rounded-lg border border-border bg-transparent pl-8 pr-8 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/50 md:focus:w-64 transition-all placeholder:text-muted-foreground"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 cursor-pointer">
                <X className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Turnos table */}
      <div className="card-static rounded-2xl bg-white dark:bg-card overflow-hidden">
        <div className="px-4 pt-4 pb-2 flex items-center justify-between">
          <h3 className="text-sm font-semibold">Historial de arqueos</h3>
          <span className="text-xs text-muted-foreground tabular-nums">
            {filteredTurnos.length} turnos
          </span>
        </div>

        {turnosLoading ? (
          <div className="p-4 space-y-2">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-12 rounded-xl" />
            ))}
          </div>
        ) : filteredTurnos.length > 0 ? (
          <div>
            {/* Desktop header */}
            <div className="hidden md:grid grid-cols-[24px_1fr_1fr_1fr_1fr_1fr_1fr] gap-2 px-4 pb-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              <span />
              <span>Fecha</span>
              <span>Caja</span>
              <span>Cerrado por</span>
              <span className="text-right">Duracion</span>
              <span className="text-right">Total</span>
              <span className="text-right">Diferencia</span>
            </div>

            {filteredTurnos.map((t) => {
              const dif = sumArqueo(t.arqueo?.diferencia);
              const total = sumArqueo(t.arqueo?.esperado);
              const isExpanded = expandedId === t._id;
              const isOpen = t.estado === "abierto";
              return (
                <div key={t._id}>
                  {/* Mobile row */}
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : t._id)}
                    className={`md:hidden w-full flex items-center gap-3 px-4 py-3 border-t border-border/30 transition-all duration-200 cursor-pointer ${
                      isExpanded ? "bg-muted" : "hover:bg-muted/30"
                    }`}
                  >
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4 text-foreground flex-shrink-0" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0 text-left">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium tabular-nums">{formatDate(t.apertura)}</span>
                        <span className="text-xs text-muted-foreground">{cajaNombres[t.cajaId] || "—"}</span>
                        <span className={`text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded ${
                          isOpen ? "bg-emerald-50 text-emerald-600" : "bg-muted text-muted-foreground"
                        }`}>
                          {isOpen ? "Abierto" : "Cerrado"}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5 text-xs text-muted-foreground tabular-nums">
                        <span>{formatTime(t.apertura)}</span>
                        <span>→</span>
                        <span>{isOpen ? "ahora" : formatTime(t.cierre!)}</span>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-semibold tabular-nums">${total.toLocaleString("es-AR")}</p>
                      {dif !== 0 && (
                        <p className={`text-xs tabular-nums font-medium ${dif > 0 ? "text-emerald-600" : "text-red-500"}`}>
                          {dif >= 0 ? "+" : ""}${dif.toLocaleString("es-AR")}
                        </p>
                      )}
                    </div>
                  </button>

                  {/* Desktop row */}
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : t._id)}
                    className={`hidden md:grid w-full grid-cols-[24px_1fr_1fr_1fr_1fr_1fr_1fr] gap-2 items-center px-4 py-3 text-sm border-t border-border/30 transition-all duration-200 cursor-pointer ${
                      isExpanded ? "bg-muted" : "hover:bg-muted/30"
                    }`}
                  >
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4 text-foreground" />
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
                      ${total.toLocaleString("es-AR")}
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
      </>)}
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
      <div className="px-4 md:px-6 pt-4 pb-3">
        <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground mb-2">
          Balance por medio de pago
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {bolsillos.map((b) => (
            <div key={b.medioPago} className="flex items-center gap-2 md:gap-3 rounded-xl bg-white dark:bg-card px-2.5 md:px-3 py-2 md:py-2.5 border border-border/30">
              <div className={`flex h-7 w-7 md:h-8 md:w-8 items-center justify-center rounded-lg md:rounded-xl flex-shrink-0 ${MEDIO_COLORS[b.medioPago]}`}>
                {MEDIO_ICONS[b.medioPago]}
              </div>
              <div className="min-w-0">
                <p className="text-sm md:text-base font-semibold tabular-nums leading-tight">${b.total.toLocaleString("es-AR")}</p>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{MEDIO_LABELS[b.medioPago]}</p>
              </div>
            </div>
          ))}
          <div className="flex items-center gap-2 md:gap-3 rounded-xl bg-white dark:bg-card px-2.5 md:px-3 py-2 md:py-2.5 border border-border/30">
            <div className="flex h-7 w-7 md:h-8 md:w-8 items-center justify-center rounded-lg md:rounded-xl flex-shrink-0 bg-muted">
              <DollarSign className="h-3.5 w-3.5 text-foreground" />
            </div>
            <div className="min-w-0">
              <p className="text-sm md:text-base font-semibold tabular-nums leading-tight">${totalGeneral.toLocaleString("es-AR")}</p>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Total</p>
            </div>
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
            <div className="rounded-xl bg-white dark:bg-card border border-border/30 overflow-hidden">
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
          <div className="rounded-xl bg-white dark:bg-card border border-border/30 overflow-hidden">
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
