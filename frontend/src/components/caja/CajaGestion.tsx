"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Banknote, Smartphone, CreditCard } from "lucide-react";
import { useCajas, useCrearCaja, useActualizarCaja, useEliminarCaja } from "@/hooks/useCaja";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Caja, MedioPago } from "@/types";

const MEDIO_LABELS: Record<MedioPago, string> = {
  efectivo: "Efectivo",
  "mercado-pago": "Mercado Pago",
  tarjeta: "Tarjeta",
};

const MEDIO_ICONS: Record<MedioPago, React.ReactNode> = {
  efectivo: <Banknote className="h-3 w-3" />,
  "mercado-pago": <Smartphone className="h-3 w-3" />,
  tarjeta: <CreditCard className="h-3 w-3" />,
};

const ALL_MEDIOS: MedioPago[] = ["efectivo", "mercado-pago", "tarjeta"];

interface CajaGestionProps {
  onSelectCaja: (caja: Caja) => void;
}

export default function CajaGestion({ onSelectCaja }: CajaGestionProps) {
  const { data: cajas, isLoading } = useCajas();
  const crearCaja = useCrearCaja();
  const actualizarCaja = useActualizarCaja();
  const eliminarCaja = useEliminarCaja();

  const [showForm, setShowForm] = useState(false);
  const [editCaja, setEditCaja] = useState<Caja | null>(null);
  const [nombre, setNombre] = useState("");
  const [medios, setMedios] = useState<MedioPago[]>(["efectivo"]);

  const openCreate = () => {
    setEditCaja(null);
    setNombre("");
    setMedios(["efectivo"]);
    setShowForm(true);
  };

  const openEdit = (caja: Caja) => {
    setEditCaja(caja);
    setNombre(caja.nombre);
    setMedios([...caja.mediosPagoHabilitados]);
    setShowForm(true);
  };

  const toggleMedio = (m: MedioPago) => {
    setMedios((prev) =>
      prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) return;
    if (medios.length === 0) {
      toast.error("Selecciona al menos un medio de pago");
      return;
    }
    try {
      if (editCaja) {
        await actualizarCaja.mutateAsync({
          id: editCaja._id,
          nombre,
          mediosPagoHabilitados: medios,
        });
        toast.success("Caja actualizada");
      } else {
        await crearCaja.mutateAsync({
          nombre,
          mediosPagoHabilitados: medios,
        });
        toast.success("Caja creada");
      }
      setShowForm(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error");
    }
  };

  const handleDelete = async (caja: Caja) => {
    if (!confirm(`Eliminar "${caja.nombre}"?`)) return;
    try {
      await eliminarCaja.mutateAsync(caja._id);
      toast.success("Caja eliminada");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Cajas</h2>
          <p className="text-sm text-muted-foreground">Selecciona una caja para operar</p>
        </div>
        <Button
          size="sm"
          className="rounded-xl bg-gradient-to-r from-brand-purple to-brand-fuchsia text-white cursor-pointer"
          onClick={openCreate}
        >
          <Plus className="h-4 w-4 mr-1" /> Nueva Caja
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 rounded-2xl" />
          ))}
        </div>
      ) : cajas && cajas.length > 0 ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {cajas.map((caja) => (
            <div
              key={caja._id}
              onClick={() => onSelectCaja(caja)}
              className="card-elevated rounded-2xl bg-white dark:bg-card p-4 text-left transition-all hover:ring-2 hover:ring-brand-purple/30 cursor-pointer group"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-semibold">{caja.nombre}</h3>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {caja.mediosPagoHabilitados.map((m) => (
                      <Badge
                        key={m}
                        variant="secondary"
                        className="border-0 text-[10px] font-medium bg-blue-50 text-blue-700 gap-1"
                      >
                        {MEDIO_ICONS[m]}
                        {MEDIO_LABELS[m]}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openEdit(caja);
                    }}
                    className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(caja);
                    }}
                    className="p-1.5 rounded-lg hover:bg-red-50 text-muted-foreground hover:text-red-600 cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-sm text-muted-foreground mb-3">No hay cajas configuradas</p>
          <Button
            size="sm"
            variant="outline"
            className="rounded-xl cursor-pointer"
            onClick={openCreate}
          >
            <Plus className="h-4 w-4 mr-1" /> Crear primera caja
          </Button>
        </div>
      )}

      {/* Form Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="sm:max-w-sm p-5 gap-0 rounded-2xl border-0 shadow-2xl">
          <DialogHeader className="mb-4">
            <DialogTitle className="text-lg tracking-tight">
              {editCaja ? "Editar Caja" : "Nueva Caja"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <Label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                Nombre
              </Label>
              <Input
                className="h-9 rounded-xl text-sm"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej: Caja Principal"
                required
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                Medios de Pago
              </Label>
              <div className="flex flex-wrap gap-2">
                {ALL_MEDIOS.map((m) => {
                  const selected = medios.includes(m);
                  return (
                    <button
                      key={m}
                      type="button"
                      onClick={() => toggleMedio(m)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer border ${
                        selected
                          ? "bg-brand-purple/10 border-brand-purple/30 text-brand-purple"
                          : "bg-muted/50 border-transparent text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      {MEDIO_ICONS[m]}
                      {MEDIO_LABELS[m]}
                    </button>
                  );
                })}
              </div>
            </div>
            <Button
              type="submit"
              disabled={crearCaja.isPending || actualizarCaja.isPending}
              className="w-full h-10 rounded-xl bg-gradient-to-r from-brand-purple to-brand-fuchsia text-white cursor-pointer"
            >
              {editCaja ? "Guardar Cambios" : "Crear Caja"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
