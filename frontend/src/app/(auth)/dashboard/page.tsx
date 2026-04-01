"use client";

import Link from "next/link";
import { Droplets, Users, Clock, Wallet, ArrowRight, TrendingUp, Banknote, TrendingDown, ClipboardCheck } from "lucide-react";
import { useTranslations } from "next-intl";
import { useAuth } from "@/providers/AuthProvider";
import { useLavados } from "@/hooks/useLavados";
import { useResumenTurnos, useTurnos } from "@/hooks/useCaja";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardPage() {
  const { user } = useAuth();
  const { data: lavados, isLoading: lavadosLoading } = useLavados();
  const { data: resumenVentas } = useResumenTurnos();
  const { data: turnos } = useTurnos();
  const t = useTranslations("dashboard");

  const today = new Date().toDateString();
  const lavadosHoy = lavados?.filter(
    (l) => new Date(l.fechaDeAlta).toDateString() === today
  ) ?? [];
  const pendientes = lavados?.filter((l) => l.estado === "Pendiente") ?? [];
  const listos = lavados?.filter((l) => l.estado === "Completado") ?? [];
  const enProceso = lavados?.filter((l) => l.estado === "En Proceso") ?? [];
  const turnosAbiertos = turnos?.filter((t) => t.estado === "abierto") ?? [];
  const montoLavadosHoy = lavadosHoy.reduce((sum, l) => sum + (l.monto || 0), 0);

  if (lavadosLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64 rounded-lg" />
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-72 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8">
      {/* KPIs */}
      <div data-tour="kpi-cards" className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        <KpiCard
          title={t("totalWashes")}
          value={lavados?.length ?? 0}
          icon={Droplets}
        />
        <KpiCard
          title={t("today")}
          value={lavadosHoy.length}
          subtitle={lavadosHoy.length > 0 ? t("servicesCompleted") : undefined}
          icon={TrendingUp}
          accentColor="text-foreground"
          accentBg="bg-muted"
        />
        <KpiCard
          title={t("waiting")}
          value={pendientes.length}
          icon={Clock}
          accentColor="text-brand-warning"
          accentBg="bg-amber-50"
        />
        <KpiCard
          title={t("cashRegister")}
          value={turnosAbiertos.length > 0 ? `${turnosAbiertos.length} abierta${turnosAbiertos.length > 1 ? "s" : ""}` : "Cerrada"}
          icon={Wallet}
          accentColor="text-brand-success"
          accentBg="bg-emerald-50"
        />
      </div>

      {/* Mobile: status summary + CTA */}
      <div className="md:hidden space-y-3">
        {(pendientes.length > 0 || listos.length > 0 || enProceso.length > 0) ? (
          <div className="card-elevated rounded-2xl bg-white dark:bg-card p-4 space-y-3">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {t("currentStatus")}
            </p>
            <div className="space-y-2.5">
              {pendientes.length > 0 && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="h-2 w-2 rounded-full bg-amber-400" />
                    <span className="text-sm">{t("inQueue", { count: pendientes.length })}</span>
                  </div>
                  <Badge variant="secondary" className="bg-amber-50 text-amber-700 border-0 text-xs font-medium">
                    {t("pendingBadge")}
                  </Badge>
                </div>
              )}
              {enProceso.length > 0 && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="h-2 w-2 rounded-full bg-blue-400" />
                    <span className="text-sm">{t("inProcess", { count: enProceso.length })}</span>
                  </div>
                  <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-0 text-xs font-medium">
                    {t("washingBadge")}
                  </Badge>
                </div>
              )}
              {listos.length > 0 && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="h-2 w-2 rounded-full bg-emerald-400" />
                    <span className="text-sm">{t("ready", { count: listos.length })}</span>
                  </div>
                  <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border-0 text-xs font-medium">
                    {t("readyBadge")}
                  </Badge>
                </div>
              )}
            </div>
            <Link
              href="/lavados"
              className="flex items-center justify-center gap-2 w-full rounded-xl border border-border py-2.5 text-sm font-medium text-foreground hover:bg-muted transition-colors mt-1 cursor-pointer"
            >
              {t("viewWashes")} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <Link href="/lavados">
            <div className="card-elevated rounded-2xl bg-white dark:bg-card p-8 text-center cursor-pointer">
              <Droplets className="h-8 w-8 mx-auto text-muted-foreground/20 mb-3" />
              <p className="text-sm text-muted-foreground mb-4">{t("noPending")}</p>
              <span className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground">
                {t("goToWashes")} <ArrowRight className="h-4 w-4" />
              </span>
            </div>
          </Link>
        )}

        {/* Ventas / Caja summary */}
        <div className="card-elevated rounded-2xl bg-white dark:bg-card p-4 space-y-3">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Ventas
          </p>
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center gap-2.5 rounded-xl bg-muted/50 px-3 py-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 flex-shrink-0">
                <Banknote className="h-4 w-4 text-emerald-600" />
              </div>
              <div>
                <p className="text-base font-semibold tabular-nums leading-tight">
                  ${(resumenVentas?.totalIngresos ?? 0).toLocaleString("es-AR")}
                </p>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Ingresos</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5 rounded-xl bg-muted/50 px-3 py-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 flex-shrink-0">
                <TrendingDown className="h-4 w-4 text-red-500" />
              </div>
              <div>
                <p className="text-base font-semibold tabular-nums leading-tight">
                  ${(resumenVentas?.totalEgresos ?? 0).toLocaleString("es-AR")}
                </p>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Egresos</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5 rounded-xl bg-muted/50 px-3 py-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 flex-shrink-0">
                <TrendingUp className="h-4 w-4 text-amber-600" />
              </div>
              <div>
                <p className="text-base font-semibold tabular-nums leading-tight">
                  ${montoLavadosHoy.toLocaleString("es-AR")}
                </p>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Lavados hoy</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5 rounded-xl bg-muted/50 px-3 py-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted flex-shrink-0">
                <ClipboardCheck className="h-4 w-4 text-foreground" />
              </div>
              <div>
                <p className="text-base font-semibold tabular-nums leading-tight">
                  {turnosAbiertos.length}
                </p>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Cajas abiertas</p>
              </div>
            </div>
          </div>
          <Link
            href="/caja"
            className="flex items-center justify-center gap-2 w-full rounded-xl border border-border py-2.5 text-sm font-medium text-foreground hover:bg-muted transition-colors mt-1 cursor-pointer"
          >
            Ver ventas <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* Desktop: data table */}
      <div data-tour="recent-table" className="hidden md:block card-elevated rounded-2xl bg-white dark:bg-card">
        <div className="flex items-center justify-between px-6 pt-5 pb-3">
          <div>
            <h3 className="text-sm font-semibold">{t("recentWashes")}</h3>
            <p className="text-xs text-muted-foreground mt-0.5">{t("recentHistory")}</p>
          </div>
          <Link
            href="/lavados"
            className="text-xs font-medium text-foreground/70 hover:text-foreground transition-colors cursor-pointer"
          >
            {t("viewAll")}
          </Link>
        </div>
        <div className="px-6 pb-5">
          {!lavados || lavados.length === 0 ? (
            <p className="text-sm text-muted-foreground py-12 text-center">
              {t("noWashes")}
            </p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="pb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">{t("client")}</th>
                  <th className="pb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">{t("plate")}</th>
                  <th className="pb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">{t("type")}</th>
                  <th className="pb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">{t("status")}</th>
                  <th className="pb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground text-right">{t("quality")}</th>
                </tr>
              </thead>
              <tbody>
                {lavados.slice(-12).reverse().map((l) => (
                  <tr key={l._id} className="border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="py-3.5">
                      <p className="font-medium text-sm">{l.nombre}</p>
                      <p className="text-xs text-muted-foreground">{l.modelo}</p>
                    </td>
                    <td className="py-3.5 font-mono text-xs tracking-wide">{l.patente}</td>
                    <td className="py-3.5 text-sm text-muted-foreground">{l.tipoDeLavado}</td>
                    <td className="py-3.5">
                      <Badge
                        variant="secondary"
                        className={`border-0 text-xs font-medium ${
                          l.estado === "Pendiente"
                            ? "bg-amber-50 text-amber-700"
                            : l.estado === "Completado"
                            ? "bg-emerald-50 text-emerald-700"
                            : l.estado === "En Proceso"
                            ? "bg-blue-50 text-blue-700"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {l.estado}
                      </Badge>
                    </td>
                    <td className="py-3.5 text-right text-sm text-amber-500">
                      {l.puntuacionCalidad
                        ? Array.from({ length: l.puntuacionCalidad }, (_, i) => (
                            <span key={i} className="inline-block">&#9733;</span>
                          ))
                        : <span className="text-muted-foreground/30">--</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
