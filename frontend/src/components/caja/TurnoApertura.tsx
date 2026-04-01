"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Banknote, Smartphone, CreditCard, Play } from "lucide-react";
import { useAbrirTurno } from "@/hooks/useCaja";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Caja, MedioPago } from "@/types";

const MEDIO_LABELS: Record<MedioPago, string> = {
  efectivo: "Efectivo",
  "mercado-pago": "Mercado Pago",
  tarjeta: "Tarjeta",
};

const MEDIO_ICONS: Record<MedioPago, React.ReactNode> = {
  efectivo: <Banknote className="h-5 w-5 text-emerald-600" />,
  "mercado-pago": <Smartphone className="h-5 w-5 text-blue-600" />,
  tarjeta: <CreditCard className="h-5 w-5 text-foreground" />,
};

interface TurnoAperturaProps {
  caja: Caja;
  onTurnoAbierto: () => void;
}

export default function TurnoApertura({ caja, onTurnoAbierto }: TurnoAperturaProps) {
  const abrirTurno = useAbrirTurno();
  const [fondos, setFondos] = useState<Record<MedioPago, number>>(
    () => {
      const initial: Record<string, number> = {};
      caja.mediosPagoHabilitados.forEach((m) => {
        initial[m] = 0;
      });
      return initial as Record<MedioPago, number>;
    }
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await abrirTurno.mutateAsync({
        cajaId: caja._id,
        fondos: caja.mediosPagoHabilitados.map((m) => ({
          medioPago: m,
          monto: fondos[m] || 0,
        })),
      });
      toast.success("Turno abierto");
      onTurnoAbierto();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al abrir turno");
    }
  };

  return (
    <div className="mx-auto max-w-md space-y-6">
      <div className="text-center">
        <h2 className="text-lg font-semibold tracking-tight">{caja.nombre}</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Configura los fondos iniciales para abrir el turno
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-3">
          {caja.mediosPagoHabilitados.map((m) => (
            <div
              key={m}
              className="card-elevated rounded-2xl bg-white dark:bg-card p-4 flex items-center gap-4"
            >
              <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-muted/50">
                {MEDIO_ICONS[m]}
              </div>
              <div className="flex-1 space-y-1">
                <Label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  {MEDIO_LABELS[m]}
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                    $
                  </span>
                  <Input
                    type="number"
                    min={0}
                    step="0.01"
                    className="h-10 rounded-xl text-sm tabular-nums pl-7"
                    value={fondos[m] || ""}
                    onChange={(e) =>
                      setFondos({ ...fondos, [m]: parseFloat(e.target.value) || 0 })
                    }
                    placeholder="0"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <Button
          type="submit"
          disabled={abrirTurno.isPending}
          className="w-full h-11 rounded-xl bg-foreground text-background hover:bg-foreground/90 cursor-pointer text-sm font-medium"
        >
          <Play className="h-4 w-4 mr-1.5" />
          {abrirTurno.isPending ? "Abriendo..." : "Abrir Turno"}
        </Button>
      </form>
    </div>
  );
}
