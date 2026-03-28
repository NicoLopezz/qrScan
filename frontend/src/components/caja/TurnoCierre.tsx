"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Lock, Banknote, Smartphone, CreditCard } from "lucide-react";
import { useCerrarTurno } from "@/hooks/useCaja";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { MedioPago, TurnoActivo } from "@/types";

const MEDIO_LABELS: Record<MedioPago, string> = {
  efectivo: "Efectivo",
  "mercado-pago": "Mercado Pago",
  tarjeta: "Tarjeta",
};

const MEDIO_ICONS: Record<MedioPago, React.ReactNode> = {
  efectivo: <Banknote className="h-4 w-4 text-emerald-600" />,
  "mercado-pago": <Smartphone className="h-4 w-4 text-blue-600" />,
  tarjeta: <CreditCard className="h-4 w-4 text-violet-600" />,
};

interface TurnoCierreProps {
  turnoId: string;
  turnoActivo: TurnoActivo;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCerrado: () => void;
}

export default function TurnoCierre({
  turnoId,
  turnoActivo,
  open,
  onOpenChange,
  onCerrado,
}: TurnoCierreProps) {
  const cerrarTurno = useCerrarTurno();

  const [montos, setMontos] = useState<Record<string, number>>(() => {
    const init: Record<string, number> = {};
    turnoActivo.bolsillos.forEach((b) => {
      init[b.medioPago] = b.total;
    });
    return init;
  });
  const [observacion, setObservacion] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await cerrarTurno.mutateAsync({
        turnoId,
        arqueo: {
          real: montos,
          observacion,
        },
      });
      toast.success("Turno cerrado");
      onCerrado();
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al cerrar turno");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-5 gap-0 rounded-2xl border-0 shadow-2xl">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-lg tracking-tight">Cerrar Turno</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Header row */}
          <div className="grid grid-cols-[1fr_80px_80px_80px] gap-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground px-1">
            <span>Medio</span>
            <span className="text-right">Sistema</span>
            <span className="text-right">Real</span>
            <span className="text-right">Diferencia</span>
          </div>

          {/* Bolsillo rows */}
          <div className="space-y-2">
            {turnoActivo.bolsillos.map((bolsillo) => {
              const real = montos[bolsillo.medioPago] ?? 0;
              const diff = real - bolsillo.total;
              return (
                <div
                  key={bolsillo.medioPago}
                  className="grid grid-cols-[1fr_80px_80px_80px] gap-2 items-center"
                >
                  <div className="flex items-center gap-2">
                    {MEDIO_ICONS[bolsillo.medioPago]}
                    <span className="text-sm font-medium">
                      {MEDIO_LABELS[bolsillo.medioPago]}
                    </span>
                  </div>
                  <p className="text-sm font-semibold tabular-nums text-right">
                    ${bolsillo.total.toLocaleString("es-AR")}
                  </p>
                  <div className="relative">
                    <Input
                      type="number"
                      step="0.01"
                      className="h-10 rounded-xl text-sm tabular-nums text-right pr-2 pl-1"
                      value={montos[bolsillo.medioPago] ?? ""}
                      onChange={(e) =>
                        setMontos({
                          ...montos,
                          [bolsillo.medioPago]: parseFloat(e.target.value) || 0,
                        })
                      }
                    />
                  </div>
                  <p
                    className={`text-sm font-semibold tabular-nums text-right ${
                      diff > 0
                        ? "text-emerald-600"
                        : diff < 0
                        ? "text-red-500"
                        : "text-muted-foreground"
                    }`}
                  >
                    {diff >= 0 ? "+" : ""}${diff.toLocaleString("es-AR")}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Observacion */}
          <div className="space-y-1">
            <Label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Observacion
            </Label>
            <Textarea
              className="rounded-xl text-sm min-h-[60px]"
              value={observacion}
              onChange={(e) => setObservacion(e.target.value)}
              placeholder="Notas sobre el cierre..."
            />
          </div>

          <Button
            type="submit"
            disabled={cerrarTurno.isPending}
            className="w-full h-10 rounded-xl bg-amber-500 hover:bg-amber-600 text-white cursor-pointer"
          >
            <Lock className="h-4 w-4 mr-1" />
            {cerrarTurno.isPending ? "Cerrando..." : "Confirmar Cierre"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
