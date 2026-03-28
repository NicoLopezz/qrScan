"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchApi } from "@/lib/api";
import type { Caja, TurnoActivo, Turno, TurnoDetalle, ResumenTurnos, VentaPOS } from "@/types";

// ── Queries ──────────────────────────────────────────────────────────

export function useCajas() {
  return useQuery({
    queryKey: ["cajas"],
    queryFn: () => fetchApi<Caja[]>("/api/cajas"),
    select: (res) => res.data,
  });
}

export function useTurnoActivo(cajaId: string | undefined) {
  return useQuery({
    queryKey: ["turnoActivo", cajaId],
    queryFn: () => fetchApi<TurnoActivo>(`/api/turnos/activo?cajaId=${cajaId}`),
    select: (res) => res.data,
    enabled: !!cajaId,
    refetchInterval: 30_000,
  });
}

export function useTurnos(cajaId?: string, estado?: string) {
  const params = new URLSearchParams();
  if (cajaId) params.set("cajaId", cajaId);
  if (estado) params.set("estado", estado);
  return useQuery({
    queryKey: ["turnos", cajaId, estado],
    queryFn: () => fetchApi<{ data: Turno[]; total: number; page: number; limit: number }>(`/api/turnos?${params.toString()}`),
    select: (res) => res.data?.data,
  });
}

export function useVentasTurno(turnoId: string | undefined) {
  return useQuery({
    queryKey: ["ventas", turnoId],
    queryFn: () => fetchApi<VentaPOS[]>(`/api/ventas?turnoId=${turnoId}`),
    select: (res) => res.data,
    enabled: !!turnoId,
  });
}

export function useTurnoDetalle(turnoId: string | undefined) {
  return useQuery({
    queryKey: ["turnoDetalle", turnoId],
    queryFn: () => fetchApi<TurnoDetalle>(`/api/turnos/${turnoId}/detalle`),
    select: (res) => res.data,
    enabled: !!turnoId,
  });
}

export function useResumenTurnos(desde?: string, hasta?: string) {
  const params = new URLSearchParams();
  if (desde) params.set("desde", desde);
  if (hasta) params.set("hasta", hasta);
  return useQuery({
    queryKey: ["resumenTurnos", desde, hasta],
    queryFn: () => fetchApi<ResumenTurnos>(`/api/turnos/resumen?${params.toString()}`),
    select: (res) => res.data,
  });
}

// ── Mutations ────────────────────────────────────────────────────────

export function useCrearCaja() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Partial<Caja>) =>
      fetchApi<Caja>("/api/cajas", {
        method: "POST",
        body: JSON.stringify(body),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cajas"] }),
  });
}

export function useActualizarCaja() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: Partial<Caja> & { id: string }) =>
      fetchApi<Caja>(`/api/cajas/${id}`, {
        method: "PUT",
        body: JSON.stringify(body),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cajas"] }),
  });
}

export function useEliminarCaja() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      fetchApi(`/api/cajas/${id}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cajas"] }),
  });
}

export function useAbrirTurno() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { cajaId: string; fondos: { medioPago: string; monto: number }[] }) =>
      fetchApi("/api/turnos", {
        method: "POST",
        body: JSON.stringify(body),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["turnos"] });
      qc.invalidateQueries({ queryKey: ["turnoActivo"] });
    },
  });
}

export function useCerrarTurno() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      turnoId,
      ...body
    }: {
      turnoId: string;
      arqueo: {
        real: Record<string, number>;
        observacion: string;
      };
    }) =>
      fetchApi(`/api/turnos/${turnoId}/cerrar`, {
        method: "POST",
        body: JSON.stringify(body),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["turnos"] });
      qc.invalidateQueries({ queryKey: ["turnoActivo"] });
    },
  });
}

export function useCrearVenta() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: {
      turnoId: string;
      monto: number;
      descripcion: string;
      tipo?: "ingreso" | "egreso";
      nota?: string;
      pagos: { medioPago: string; monto: number }[];
    }) =>
      fetchApi("/api/ventas", {
        method: "POST",
        body: JSON.stringify(body),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ventas"] });
      qc.invalidateQueries({ queryKey: ["turnoActivo"] });
    },
  });
}

export function useEditarVenta() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: { id: string; descripcion?: string; monto?: number; tipo?: string; nota?: string }) =>
      fetchApi(`/api/ventas/${id}`, {
        method: "PUT",
        body: JSON.stringify(body),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ventas"] });
      qc.invalidateQueries({ queryKey: ["turnoActivo"] });
    },
  });
}

export function useAnularVenta() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      fetchApi(`/api/ventas/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ventas"] });
      qc.invalidateQueries({ queryKey: ["turnoActivo"] });
    },
  });
}
