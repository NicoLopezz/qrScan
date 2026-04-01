"use client";

import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { Users, UserPlus, TrendingUp, DollarSign, Search, X, Phone, Car, Star } from "lucide-react";
import { useClientes } from "@/hooks/useClientes";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { ClienteDetailModal } from "@/components/clientes/ClienteDetailModal";

const segmentoStyle: Record<string, string> = {
  Nuevo: "bg-muted text-muted-foreground",
  Recurrente: "bg-blue-50 text-blue-700 dark:bg-blue-950/30",
  Frecuente: "bg-purple-50 text-purple-700 dark:bg-purple-950/30",
  VIP: "bg-amber-50 text-amber-700 dark:bg-amber-950/30",
};

export default function ClientesPage() {
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [selectedCliente, setSelectedCliente] = useState<string | null>(null);

  // Deep link: /clientes?telefono=xxx
  useEffect(() => {
    const tel = searchParams.get("telefono");
    if (tel) setSelectedCliente(tel);
  }, [searchParams]);

  // Debounce search with 300ms delay
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { data: clientes, isLoading } = useClientes(debouncedQuery || undefined);

  // KPI calculations
  const kpis = useMemo(() => {
    if (!clientes) return { total: 0, nuevos: 0, recurrentes: 0, ticketPromedio: 0 };

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const nuevos = clientes.filter((c) => {
      if (!c.primerVisita) return false;
      const d = new Date(c.primerVisita);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    }).length;

    const recurrentes = clientes.filter((c) => c.segmento !== "Nuevo").length;

    let ticketPromedio = 0;
    const conLavados = clientes.filter((c) => c.totalLavados > 0);
    if (conLavados.length > 0) {
      const sum = conLavados.reduce((acc, c) => acc + c.totalGastado / c.totalLavados, 0);
      ticketPromedio = Math.round(sum / conLavados.length);
    }

    return {
      total: clientes.length,
      nuevos,
      recurrentes,
      ticketPromedio,
    };
  }, [clientes]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-[72px] rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-10 w-full rounded-xl md:w-64" />
        <div className="space-y-2 md:hidden">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-xl" />
          ))}
        </div>
        <div className="hidden md:block">
          <Skeleton className="h-96 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <>
      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <KpiCard
          title="Total Clientes"
          value={kpis.total}
          icon={Users}
          accentColor="text-foreground"
          accentBg="bg-muted"
        />
        <KpiCard
          title="Nuevos este mes"
          value={kpis.nuevos}
          icon={UserPlus}
          accentColor="text-emerald-600"
          accentBg="bg-emerald-50 dark:bg-emerald-950/30"
        />
        <KpiCard
          title="Recurrentes+"
          value={kpis.recurrentes}
          icon={TrendingUp}
          accentColor="text-blue-600"
          accentBg="bg-blue-50 dark:bg-blue-950/30"
        />
        <KpiCard
          title="Ticket Promedio"
          value={kpis.ticketPromedio ? `$${kpis.ticketPromedio.toLocaleString("es-AR")}` : "--"}
          icon={DollarSign}
          accentColor="text-amber-600"
          accentBg="bg-amber-50 dark:bg-amber-950/30"
        />
      </div>

      {/* Search bar */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Buscar por nombre, telefono..."
          className="pl-9 pr-8 h-9 rounded-xl"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 cursor-pointer"
          >
            <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
          </button>
        )}
      </div>

      {/* ===== MOBILE LIST ===== */}
      <div className="md:hidden space-y-1.5">
        {clientes && clientes.length > 0 ? (
          clientes.map((c) => (
            <button
              key={c._id}
              onClick={() => setSelectedCliente(c._id)}
              className="w-full flex items-center gap-3 rounded-xl bg-white dark:bg-card p-3 text-left cursor-pointer active:scale-[0.98] transition-transform shadow-sm"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate uppercase">{c.nombre}</p>
                <p className="text-[11px] text-muted-foreground truncate">{c._id}</p>
              </div>
              <Badge
                variant="secondary"
                className={`text-[10px] border-0 font-medium flex-shrink-0 ${segmentoStyle[c.segmento] || ""}`}
              >
                {c.segmento}
              </Badge>
            </button>
          ))
        ) : (
          <div className="text-center py-16">
            <Users className="h-10 w-10 mx-auto text-muted-foreground/30 mb-3" />
            <p className="text-sm text-muted-foreground">
              {searchQuery ? "Sin resultados para esta busqueda" : "No hay clientes registrados"}
            </p>
          </div>
        )}
      </div>

      {/* ===== DESKTOP TABLE ===== */}
      <div className="hidden md:block">
        {clientes && clientes.length > 0 ? (
          <div className="card-static rounded-2xl bg-white dark:bg-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="px-4 py-3 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Nombre</th>
                    <th className="px-4 py-3 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Telefono</th>
                    <th className="px-4 py-3 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Vehiculos</th>
                    <th className="px-4 py-3 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Visitas</th>
                    <th className="px-4 py-3 text-[10px] font-medium uppercase tracking-wider text-muted-foreground text-right">Gasto Total</th>
                    <th className="px-4 py-3 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Ultima Visita</th>
                    <th className="px-4 py-3 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Segmento</th>
                  </tr>
                </thead>
                <tbody>
                  {clientes.map((c) => {
                    const patentesDisplay =
                      c.vehiculos.length <= 2
                        ? c.vehiculos.join(", ")
                        : `${c.vehiculos.slice(0, 2).join(", ")} +${c.vehiculos.length - 2}`;

                    return (
                      <tr
                        key={c._id}
                        onClick={() => setSelectedCliente(c._id)}
                        className="border-b border-border/30 last:border-0 hover:bg-muted/30 transition-colors cursor-pointer"
                      >
                        <td className="px-4 py-2.5">
                          <p className="font-medium text-sm uppercase">{c.nombre}</p>
                        </td>
                        <td className="px-4 py-2.5 text-xs text-muted-foreground">{c._id}</td>
                        <td className="px-4 py-2.5 font-mono text-xs uppercase">{patentesDisplay}</td>
                        <td className="px-4 py-2.5 tabular-nums">{c.totalLavados}</td>
                        <td className="px-4 py-2.5 text-right font-medium tabular-nums text-brand-success">
                          ${c.totalGastado.toLocaleString("es-AR")}
                        </td>
                        <td className="px-4 py-2.5 text-xs text-muted-foreground whitespace-nowrap">
                          {c.ultimaVisita
                            ? new Date(c.ultimaVisita).toLocaleDateString("es-AR", { day: "numeric", month: "short" })
                            : "--"}
                        </td>
                        <td className="px-4 py-2.5">
                          <Badge
                            variant="secondary"
                            className={`border-0 text-xs font-medium ${segmentoStyle[c.segmento] || ""}`}
                          >
                            {c.segmento}
                          </Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="text-center py-20">
            <Users className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
            <p className="text-sm text-muted-foreground">
              {searchQuery ? "Sin resultados para esta busqueda" : "No hay clientes registrados"}
            </p>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedCliente && (
        <ClienteDetailModal
          telefono={selectedCliente}
          onClose={() => setSelectedCliente(null)}
        />
      )}
    </>
  );
}
