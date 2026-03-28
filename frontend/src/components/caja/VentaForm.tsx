"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2, Banknote, Smartphone, CreditCard, Split } from "lucide-react";
import { useCrearVenta } from "@/hooks/useCaja";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { MedioPago } from "@/types";

const MEDIO_LABELS: Record<MedioPago, string> = {
  efectivo: "Efectivo",
  "mercado-pago": "Mercado Pago",
  tarjeta: "Tarjeta",
};

const MEDIO_ICONS: Record<MedioPago, React.ReactNode> = {
  efectivo: <Banknote className="h-3.5 w-3.5" />,
  "mercado-pago": <Smartphone className="h-3.5 w-3.5" />,
  tarjeta: <CreditCard className="h-3.5 w-3.5" />,
};

interface VentaFormProps {
  turnoId: string;
  mediosHabilitados: MedioPago[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface PagoRow {
  medioPago: MedioPago;
  monto: number;
}

export default function VentaForm({
  turnoId,
  mediosHabilitados,
  open,
  onOpenChange,
}: VentaFormProps) {
  const crearVenta = useCrearVenta();

  const [monto, setMonto] = useState(0);
  const [descripcion, setDescripcion] = useState("");
  const [dividir, setDividir] = useState(false);
  const [medioPago, setMedioPago] = useState<MedioPago>(mediosHabilitados[0] || "efectivo");
  const [pagos, setPagos] = useState<PagoRow[]>([
    { medioPago: mediosHabilitados[0] || "efectivo", monto: 0 },
  ]);

  const reset = () => {
    setMonto(0);
    setDescripcion("");
    setDividir(false);
    setMedioPago(mediosHabilitados[0] || "efectivo");
    setPagos([{ medioPago: mediosHabilitados[0] || "efectivo", monto: 0 }]);
  };

  const sumaPagos = pagos.reduce((s, p) => s + p.monto, 0);
  const diferencia = monto - sumaPagos;

  const addPagoRow = () => {
    const usados = new Set(pagos.map((p) => p.medioPago));
    const disponible = mediosHabilitados.find((m) => !usados.has(m));
    setPagos([...pagos, { medioPago: disponible || mediosHabilitados[0], monto: 0 }]);
  };

  const removePagoRow = (idx: number) => {
    setPagos(pagos.filter((_, i) => i !== idx));
  };

  const updatePago = (idx: number, field: keyof PagoRow, value: string | number) => {
    const updated = [...pagos];
    if (field === "medioPago") {
      updated[idx] = { ...updated[idx], medioPago: value as MedioPago };
    } else {
      updated[idx] = { ...updated[idx], monto: value as number };
    }
    setPagos(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (monto <= 0) {
      toast.error("Ingresa un monto valido");
      return;
    }

    const finalPagos = dividir
      ? pagos.filter((p) => p.monto > 0)
      : [{ medioPago, monto }];

    const sumaFinal = finalPagos.reduce((s, p) => s + p.monto, 0);
    if (Math.abs(sumaFinal - monto) > 0.01) {
      toast.error("Los pagos no suman el monto total");
      return;
    }

    try {
      await crearVenta.mutateAsync({
        turnoId,
        monto,
        descripcion,
        pagos: finalPagos,
      });
      toast.success("Venta registrada");
      reset();
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error");
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) reset();
        onOpenChange(o);
      }}
    >
      <DialogContent className="sm:max-w-md p-5 gap-0 rounded-2xl border-0 shadow-2xl">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-lg tracking-tight">Nueva Venta</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Monto */}
          <div className="space-y-1">
            <Label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Monto Total
            </Label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl text-muted-foreground">
                $
              </span>
              <Input
                type="number"
                min={0}
                step="0.01"
                className="h-14 rounded-xl text-2xl font-semibold tabular-nums pl-10 text-center"
                value={monto || ""}
                onChange={(e) => setMonto(parseFloat(e.target.value) || 0)}
                placeholder="0"
                autoFocus
              />
            </div>
          </div>

          {/* Descripcion */}
          <div className="space-y-1">
            <Label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Descripcion
            </Label>
            <Input
              className="h-10 rounded-xl text-sm"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Lavado completo, producto..."
            />
          </div>

          {/* Pago */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                Medio de Pago
              </Label>
              <button
                type="button"
                onClick={() => {
                  setDividir(!dividir);
                  if (!dividir) {
                    setPagos([{ medioPago: mediosHabilitados[0] || "efectivo", monto }]);
                  }
                }}
                className="flex items-center gap-1 text-[11px] font-medium text-brand-purple hover:text-brand-fuchsia cursor-pointer transition-colors"
              >
                <Split className="h-3 w-3" />
                {dividir ? "Pago simple" : "Dividir pago"}
              </button>
            </div>

            {!dividir ? (
              <Select
                value={medioPago}
                onValueChange={(v) => v && setMedioPago(v as MedioPago)}
              >
                <SelectTrigger className="h-10 rounded-xl text-sm w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {mediosHabilitados.map((m) => (
                    <SelectItem key={m} value={m}>
                      <span className="flex items-center gap-1.5">
                        {MEDIO_ICONS[m]}
                        {MEDIO_LABELS[m]}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <div className="space-y-2">
                {pagos.map((pago, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <Select
                      value={pago.medioPago}
                      onValueChange={(v) =>
                        v && updatePago(idx, "medioPago", v)
                      }
                    >
                      <SelectTrigger className="h-10 rounded-xl text-sm flex-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {mediosHabilitados.map((m) => (
                          <SelectItem key={m} value={m}>
                            <span className="flex items-center gap-1.5">
                              {MEDIO_ICONS[m]}
                              {MEDIO_LABELS[m]}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="relative w-28">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                        $
                      </span>
                      <Input
                        type="number"
                        min={0}
                        step="0.01"
                        className="h-10 rounded-xl text-sm tabular-nums pl-6"
                        value={pago.monto || ""}
                        onChange={(e) =>
                          updatePago(idx, "monto", parseFloat(e.target.value) || 0)
                        }
                      />
                    </div>
                    {pagos.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removePagoRow(idx)}
                        className="p-1.5 rounded-lg hover:bg-red-50 text-muted-foreground hover:text-red-600 cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                ))}

                {pagos.length < mediosHabilitados.length && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-full rounded-xl text-xs cursor-pointer"
                    onClick={addPagoRow}
                  >
                    <Plus className="h-3.5 w-3.5 mr-1" /> Agregar medio
                  </Button>
                )}

                {monto > 0 && (
                  <div
                    className={`rounded-xl px-3 py-2 text-xs font-medium tabular-nums ${
                      Math.abs(diferencia) < 0.01
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-amber-50 text-amber-700"
                    }`}
                  >
                    {Math.abs(diferencia) < 0.01
                      ? "Pagos completos"
                      : `Faltan $${diferencia.toLocaleString("es-AR")}`}
                  </div>
                )}
              </div>
            )}
          </div>

          <Button
            type="submit"
            disabled={crearVenta.isPending || monto <= 0}
            className="w-full h-10 rounded-xl bg-gradient-to-r from-brand-purple to-brand-fuchsia text-white cursor-pointer"
          >
            {crearVenta.isPending ? "Registrando..." : "Registrar Venta"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
