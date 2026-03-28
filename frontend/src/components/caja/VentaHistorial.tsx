"use client";

import { toast } from "sonner";
import { Trash2, Banknote, Smartphone, CreditCard, Tag, Wrench } from "lucide-react";
import { useVentasTurno, useAnularVenta } from "@/hooks/useCaja";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { MedioPago } from "@/types";

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

interface VentaHistorialProps {
  turnoId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function VentaHistorial({ turnoId, open, onOpenChange }: VentaHistorialProps) {
  const { data: ventas, isLoading } = useVentasTurno(open ? turnoId : undefined);
  const anularVenta = useAnularVenta();

  const handleAnular = async (ventaId: string) => {
    if (!confirm("Anular esta venta?")) return;
    try {
      await anularVenta.mutateAsync(ventaId);
      toast.success("Venta anulada");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg p-5 gap-0 rounded-2xl border-0 shadow-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-lg tracking-tight">Historial de Ventas</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto -mx-5 px-5">
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 rounded-xl" />
              ))}
            </div>
          ) : ventas && ventas.length > 0 ? (
            <div className="space-y-1">
              {ventas.map((venta) => (
                <div
                  key={venta._id}
                  className="flex items-center gap-3 py-3 border-b border-border/30 last:border-0 group"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground tabular-nums">
                        {new Date(venta.fecha).toLocaleString("es-AR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      <span className="text-sm truncate">{venta.descripcion || "Sin descripcion"}</span>
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-1.5">
                      {venta.pagos?.map((pago, i) => (
                        <Badge
                          key={i}
                          variant="secondary"
                          className="border-0 text-[10px] font-medium bg-blue-50 text-blue-700 gap-1"
                        >
                          {MEDIO_ICONS[pago.medioPago]}
                          ${pago.monto.toLocaleString("es-AR")}
                        </Badge>
                      ))}
                      <Badge
                        variant="secondary"
                        className={`border-0 text-[10px] font-medium gap-1 ${
                          venta.origen === "lavado"
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {venta.origen === "lavado" ? (
                          <Wrench className="h-2.5 w-2.5" />
                        ) : (
                          <Tag className="h-2.5 w-2.5" />
                        )}
                        {venta.origen === "lavado" ? "Lavado" : "Manual"}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-sm font-semibold tabular-nums whitespace-nowrap">
                    ${venta.monto.toLocaleString("es-AR")}
                  </p>
                  <button
                    onClick={() => handleAnular(venta._id)}
                    disabled={anularVenta.isPending}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-red-50 text-muted-foreground hover:text-red-600 cursor-pointer"
                    title="Anular venta"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-12">
              Sin ventas en este turno
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
