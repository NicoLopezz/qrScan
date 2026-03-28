"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchApi } from "@/lib/api";
import type { Lavado } from "@/types";

export function useLavados(adminId: string | undefined) {
  return useQuery({
    queryKey: ["lavados", adminId],
    queryFn: () => fetchApi<Lavado[]>(`/api/admins/${adminId}/lavados`),
    enabled: !!adminId,
    select: (res) => res.data,
  });
}
