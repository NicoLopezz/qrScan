"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchApi } from "@/lib/api";
import type { Automatizacion, MensajeHistorial, ConversacionCliente } from "@/types/mensajes";

// ── Stats ──────────────────────────────────────────────────────

interface MensajesStats {
  totalEnviados: number;
  reviews: number;
  tasaRespuesta: number;
  recuperados: number;
}

export function useMensajesStats() {
  return useQuery({
    queryKey: ["mensajesStats"],
    queryFn: () => fetchApi<MensajesStats>("/api/mensajes/stats"),
    select: (res) => res.data,
  });
}

// ── Segmentos ──────────────────────────────────────────────────

interface Segmentos {
  todos: number;
  activos: number;
  inactivos: number;
  vip: number;
}

export function useSegmentos() {
  return useQuery({
    queryKey: ["mensajesSegmentos"],
    queryFn: () => fetchApi<Segmentos>("/api/mensajes/segmentos"),
    select: (res) => res.data,
  });
}

// ── Automatizaciones ───────────────────────────────────────────

export function useAutomatizaciones() {
  return useQuery({
    queryKey: ["automatizaciones"],
    queryFn: () => fetchApi<Automatizacion[]>("/api/automatizaciones"),
    select: (res) => res.data,
  });
}

export function useCrearAutomatizacion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Partial<Automatizacion>) =>
      fetchApi<Automatizacion>("/api/automatizaciones", {
        method: "POST",
        body: JSON.stringify(body),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["automatizaciones"] }),
  });
}

export function useActualizarAutomatizacion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ _id, ...body }: Partial<Automatizacion> & { _id: string }) =>
      fetchApi<Automatizacion>(`/api/automatizaciones/${_id}`, {
        method: "PUT",
        body: JSON.stringify(body),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["automatizaciones"] }),
  });
}

export function useEliminarAutomatizacion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      fetchApi(`/api/automatizaciones/${id}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["automatizaciones"] }),
  });
}

export function useToggleAutomatizacion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      fetchApi<Automatizacion>(`/api/automatizaciones/${id}/toggle`, { method: "PATCH" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["automatizaciones"] }),
  });
}

// ── Broadcast ──────────────────────────────────────────────────

export function useBroadcast() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { mensaje: string; segmento: string }) =>
      fetchApi<{ enviados: number; errores: number; total: number }>("/api/mensajes/broadcast", {
        method: "POST",
        body: JSON.stringify(body),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["mensajesStats"] });
      qc.invalidateQueries({ queryKey: ["mensajesHistorial"] });
    },
  });
}

// ── Historial ──────────────────────────────────────────────────

export function useHistorial(tipo?: string, busqueda?: string) {
  const params = new URLSearchParams();
  if (tipo && tipo !== "todos") params.set("tipo", tipo);
  if (busqueda) params.set("busqueda", busqueda);

  return useQuery({
    queryKey: ["mensajesHistorial", tipo, busqueda],
    queryFn: () =>
      fetchApi<MensajeHistorial[]>(`/api/mensajes/historial?${params.toString()}`),
    select: (res) => res.data,
  });
}

// ── Conversacion ───────────────────────────────────────────────

export function useConversacion(telefono: string | null) {
  return useQuery({
    queryKey: ["mensajesConversacion", telefono],
    queryFn: () =>
      fetchApi<ConversacionCliente>(`/api/mensajes/conversacion?telefono=${encodeURIComponent(telefono!)}`),
    select: (res) => res.data,
    enabled: !!telefono,
  });
}
