"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchApi } from "@/lib/api";
import type { ClienteResumen, ClienteDetalle } from "@/types";

export function useClientes(searchQuery?: string) {
  const params = searchQuery ? `?q=${encodeURIComponent(searchQuery)}` : "";
  return useQuery({
    queryKey: ["clientes", searchQuery],
    queryFn: () => fetchApi<ClienteResumen[]>(`/api/clientes${params}`),
    select: (res) => res.data,
  });
}

export function useClienteDetalle(telefono: string | null) {
  return useQuery({
    queryKey: ["clienteDetalle", telefono],
    queryFn: () =>
      fetchApi<ClienteDetalle>(
        `/api/clientes/${encodeURIComponent(telefono!)}`
      ),
    enabled: !!telefono,
    select: (res) => res.data,
  });
}
