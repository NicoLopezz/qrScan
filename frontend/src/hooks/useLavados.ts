"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchApi } from "@/lib/api";
import type { Lavado } from "@/types";

export function useLavados() {
  return useQuery({
    queryKey: ["lavados"],
    queryFn: () => fetchApi<Lavado[]>("/api/lavados"),
    select: (res) => res.data,
    refetchInterval: 15000,
  });
}
