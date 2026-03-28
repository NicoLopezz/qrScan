"use client";

import { useState } from "react";
import { Plus, Droplets, Clock, CheckCircle, LayoutGrid, List, Search, X } from "lucide-react";
import { DragDropContext, Droppable, Draggable, type DropResult } from "@hello-pangea/dnd";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuth } from "@/providers/AuthProvider";
import { useLavados } from "@/hooks/useLavados";
import { fetchApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { LavadoCard } from "@/components/lavados/LavadoCard";
import { LavadoForm } from "@/components/lavados/LavadoForm";
import { LavadoDetailModal } from "@/components/lavados/LavadoDetailModal";
import type { Lavado } from "@/types";

const COLUMNS = [
  { key: "Pendiente", label: "En Cola", color: "bg-amber-500" },
  { key: "En Proceso", label: "En Proceso", color: "bg-blue-500" },
  { key: "Completado", label: "Listo", color: "bg-green-500" },
  { key: "Retirado", label: "Retirado", color: "bg-gray-400" },
];

export default function LavadosPage() {
  const { user } = useAuth();
  const { data: lavados, isLoading } = useLavados();
  const [showForm, setShowForm] = useState(false);
  const [selectedLavado, setSelectedLavado] = useState<Lavado | null>(null);
  const [mobileFilter, setMobileFilter] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"kanban" | "table">("kanban");
  const [searchQuery, setSearchQuery] = useState("");

  const normalize = (s: string) => s.toLowerCase().replace(/\s+/g, "");

  const filteredLavados = searchQuery
    ? lavados?.filter((l) => {
        const q = normalize(searchQuery);
        return (
          normalize(l.patente).includes(q) ||
          normalize(l.nombre).includes(q) ||
          normalize(l.modelo).includes(q)
        );
      })
    : lavados;

  const getByEstado = (estado: string) =>
    filteredLavados?.filter((l) => l.estado === estado) ?? [];

  const pendientes = getByEstado("Pendiente");
  const enProceso = getByEstado("En Proceso");
  const listos = getByEstado("Completado");

  // Mobile: show filtered list or all active (non-retirado)
  const mobileList = mobileFilter
    ? getByEstado(mobileFilter)
    : filteredLavados?.filter((l) => l.estado !== "Retirado") ?? [];

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-2 md:hidden">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-10 w-48 hidden md:block" />
        <div className="space-y-2 md:hidden">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
        <div className="hidden md:grid md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-96 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* ===== MOBILE ===== */}
      <div className="md:hidden space-y-3">
        {/* Mini metrics */}
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => setMobileFilter(mobileFilter === "Pendiente" ? null : "Pendiente")}
            className={`card-elevated rounded-2xl p-3 text-center transition-all duration-200 cursor-pointer ${
              mobileFilter === "Pendiente"
                ? "bg-amber-50 ring-2 ring-amber-300"
                : "bg-white dark:bg-card"
            }`}
          >
            <Clock className="h-4 w-4 mx-auto text-amber-500 mb-1" />
            <p className="text-xl font-semibold tabular-nums">{pendientes.length}</p>
            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">En Cola</p>
          </button>
          <button
            onClick={() => setMobileFilter(mobileFilter === "En Proceso" ? null : "En Proceso")}
            className={`card-elevated rounded-2xl p-3 text-center transition-all duration-200 cursor-pointer ${
              mobileFilter === "En Proceso"
                ? "bg-blue-50 ring-2 ring-blue-300"
                : "bg-white dark:bg-card"
            }`}
          >
            <Droplets className="h-4 w-4 mx-auto text-blue-500 mb-1" />
            <p className="text-xl font-semibold tabular-nums">{enProceso.length}</p>
            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Lavando</p>
          </button>
          <button
            onClick={() => setMobileFilter(mobileFilter === "Completado" ? null : "Completado")}
            className={`card-elevated rounded-2xl p-3 text-center transition-all duration-200 cursor-pointer ${
              mobileFilter === "Completado"
                ? "bg-emerald-50 ring-2 ring-emerald-300"
                : "bg-white dark:bg-card"
            }`}
          >
            <CheckCircle className="h-4 w-4 mx-auto text-emerald-500 mb-1" />
            <p className="text-xl font-semibold tabular-nums">{listos.length}</p>
            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Listos</p>
          </button>
        </div>

        {/* Filter label */}
        {mobileFilter && (
          <div className="flex items-center justify-between animate-fade-in">
            <p className="text-sm font-medium text-muted-foreground">
              Mostrando: {mobileFilter}
            </p>
            <button
              onClick={() => setMobileFilter(null)}
              className="text-xs text-brand-purple font-medium"
            >
              Ver todos
            </button>
          </div>
        )}

        {/* Lavado list */}
        <div className="space-y-2">
          {mobileList.length > 0 ? (
            mobileList.map((lavado) => (
              <LavadoCard
                key={lavado._id}
                lavado={lavado}
                onClick={() => setSelectedLavado(lavado)}
              />
            ))
          ) : (
            <div className="text-center py-16">
              <Droplets className="h-10 w-10 mx-auto text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground">
                {mobileFilter ? "Sin lavados en esta categoria" : "No hay lavados activos"}
              </p>
              <Button
                onClick={() => setShowForm(true)}
                variant="outline"
                className="mt-4"
                size="sm"
              >
                <Plus className="h-4 w-4 mr-1" /> Agregar Lavado
              </Button>
            </div>
          )}
        </div>

        {/* FAB - Floating Action Button */}
        <button
          onClick={() => setShowForm(true)}
          className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-purple to-brand-fuchsia text-white shadow-xl shadow-brand-purple/25 active:scale-95 transition-all duration-200 cursor-pointer"
        >
          <Plus className="h-6 w-6" />
        </button>
      </div>

      {/* ===== DESKTOP ===== */}
      <div className="hidden md:block space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar patente, cliente..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-8 w-56 rounded-lg border border-border bg-transparent pl-8 pr-8 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/50 transition-all placeholder:text-muted-foreground"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer">
                  <X className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
                </button>
              )}
            </div>
            {searchQuery && (
              <span className="text-xs text-muted-foreground">
                {filteredLavados?.length ?? 0} resultados
              </span>
            )}
            {!searchQuery && (
              <span className="text-xs text-muted-foreground tabular-nums">
                {new Date().toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long" })}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <div className="flex rounded-lg border border-border p-0.5">
              <button
                onClick={() => setViewMode("kanban")}
                className={`p-1.5 rounded-md transition-colors cursor-pointer ${viewMode === "kanban" ? "bg-brand-purple-muted text-brand-purple" : "text-muted-foreground hover:text-foreground"}`}
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode("table")}
                className={`p-1.5 rounded-md transition-colors cursor-pointer ${viewMode === "table" ? "bg-brand-purple-muted text-brand-purple" : "text-muted-foreground hover:text-foreground"}`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
            <Button
              onClick={() => setShowForm(true)}
              className="rounded-xl bg-gradient-to-r from-brand-purple to-brand-fuchsia hover:from-brand-purple-dark hover:to-brand-purple text-white shadow-md shadow-brand-purple/15 transition-all duration-200 cursor-pointer"
            >
              <Plus className="h-4 w-4 mr-1" />
              Nuevo Lavado
            </Button>
          </div>
        </div>

        <div key={searchQuery ? "search" : viewMode} className="animate-fade-in">
        {viewMode === "kanban" && !searchQuery ? (
        <KanbanBoard
          lavados={filteredLavados ?? []}
          onSelectLavado={setSelectedLavado}
        />
        ) : (
        <div className="card-static rounded-2xl bg-white dark:bg-card overflow-hidden">
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
                {(searchQuery ? filteredLavados : filteredLavados?.filter((l) => l.estado !== "Retirado"))?.map((l) => {
                  const estadoStyle: Record<string, string> = {
                    Pendiente: "bg-amber-50 text-amber-700",
                    "En Proceso": "bg-blue-50 text-blue-700",
                    Completado: "bg-emerald-50 text-emerald-700",
                    Retirado: "bg-muted text-muted-foreground",
                  };
                  return (
                    <tr
                      key={l._id}
                      onClick={() => setSelectedLavado(l)}
                      className="border-b border-border/30 last:border-0 cursor-pointer hover:bg-muted/30 transition-colors"
                    >
                      <td className="px-4 py-2.5 text-xs text-muted-foreground tabular-nums whitespace-nowrap">
                        {new Date(l.fechaDeAlta).toLocaleDateString("es-AR", { day: "2-digit", month: "short" })}
                      </td>
                      <td className="px-4 py-2.5">
                        <p className="font-medium text-sm">{l.nombre}</p>
                      </td>
                      <td className="px-4 py-2.5 text-muted-foreground">{l.modelo}</td>
                      <td className="px-4 py-2.5 font-mono text-xs tracking-wide">{l.patente}</td>
                      <td className="px-4 py-2.5">
                        <Badge variant="secondary" className="border-0 text-xs font-medium">
                          {l.tipoDeLavado}
                        </Badge>
                      </td>
                      <td className="px-4 py-2.5">
                        <Badge variant="secondary" className={`border-0 text-xs font-medium ${estadoStyle[l.estado] || ""}`}>
                          {l.estado}
                        </Badge>
                      </td>
                      <td className="px-4 py-2.5 text-right font-medium tabular-nums text-brand-success">
                        {l.monto ? `$${l.monto.toLocaleString("es-AR")}` : <span className="text-muted-foreground/30">--</span>}
                      </td>
                      <td className="px-4 py-2.5 text-right text-amber-500">
                        {l.puntuacionCalidad
                          ? "★".repeat(l.puntuacionCalidad)
                          : <span className="text-muted-foreground/30">--</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
        )}
        </div>
      </div>

      {/* Modals */}
      <LavadoForm open={showForm} onOpenChange={setShowForm} />
      <LavadoDetailModal
        lavado={selectedLavado}
        onClose={() => setSelectedLavado(null)}
      />
    </div>
  );
}

// --- Kanban Board with Drag & Drop (hello-pangea/dnd) ---
function KanbanBoard({ lavados, onSelectLavado }: { lavados: Lavado[]; onSelectLavado: (l: Lavado) => void }) {
  const queryClient = useQueryClient();

  const getByEstado = (estado: string) => lavados.filter((l) => l.estado === estado);

  const handleDragEnd = async (result: DropResult) => {
    const { draggableId, destination } = result;
    if (!destination) return;

    const newEstado = destination.droppableId;
    const lavado = lavados.find((l) => l._id === draggableId);
    if (!lavado || lavado.estado === newEstado) return;

    try {
      await fetchApi("/api/lavadosModificar", {
        method: "PUT",
        body: JSON.stringify({
          lavadoId: draggableId,
          medioPago: lavado.medioPago || "---",
          estado: newEstado,
          monto: lavado.monto || 0,
        }),
      });
      queryClient.invalidateQueries({ queryKey: ["lavados"] });
      toast.success(`${lavado.nombre} movido a ${newEstado}`);
    } catch (err) {
      toast.error("Error al mover lavado");
    }
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-4 gap-4">
        {COLUMNS.map((col) => {
          const items = getByEstado(col.key);
          return (
            <Droppable key={col.key} droppableId={col.key}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`glass-card rounded-2xl p-3 min-h-[200px] transition-colors duration-200 ${
                    snapshot.isDraggingOver ? "ring-2 ring-brand-purple/40 bg-brand-purple-muted/20" : ""
                  }`}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <div className={`h-2 w-2 rounded-full ${col.color}`} />
                    <span className="text-xs font-semibold uppercase tracking-wider">{col.label}</span>
                    <Badge variant="secondary" className="ml-auto text-xs border-0 tabular-nums">
                      {items.length}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    {items.map((lavado, index) => (
                      <Draggable key={lavado._id} draggableId={lavado._id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            style={provided.draggableProps.style}
                            className={snapshot.isDragging ? "rotate-[2deg] scale-[1.03] z-50 shadow-xl shadow-brand-purple/15 ring-2 ring-brand-purple/20 rounded-2xl" : ""}
                          >
                            <LavadoCard lavado={lavado} onClick={() => onSelectLavado(lavado)} />
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                    {items.length === 0 && !snapshot.isDraggingOver && (
                      <p className="text-xs text-muted-foreground text-center py-8">Sin lavados</p>
                    )}
                  </div>
                </div>
              )}
            </Droppable>
          );
        })}
      </div>
    </DragDropContext>
  );
}
