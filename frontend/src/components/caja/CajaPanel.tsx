"use client";

import { useState } from "react";
import {
  Banknote,
  Smartphone,
  CreditCard,
  DollarSign,
  Plus,
  Clock,
  Lock,
} from "lucide-react";
import { useTurnoActivo } from "@/hooks/useCaja";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import VentaForm from "./VentaForm";
import VentaHistorial from "./VentaHistorial";
import TurnoCierre from "./TurnoCierre";
import type { Caja, MedioPago } from "@/types";

const MEDIO_LABELS: Record<MedioPago, string> = {
  efectivo: "Efectivo",
  "mercado-pago": "Mercado Pago",
  tarjeta: "Tarjeta",
};

const MEDIO_ICONS: Record<MedioPago, React.ReactNode> = {
  efectivo: <Banknote className="h-5 w-5 text-emerald-600" />,
  "mercado-pago": <Smartphone className="h-5 w-5 text-blue-600" />,
  tarjeta: <CreditCard className="h-5 w-5 text-violet-600" />,
};

const MEDIO_BG: Record<MedioPago, string> = {
  efectivo: "bg-emerald-50",
  "mercado-pago": "bg-blue-50",
  tarjeta: "bg-violet-50",
};

interface CajaPanelProps {
  caja: Caja;
  turnoId: string;
  onTurnoCerrado: () => void;
}

export default function CajaPanel({ caja, turnoId, onTurnoCerrado }: CajaPanelProps) {
  const { data: turnoActivo, isLoading } = useTurnoActivo(caja._id);

  const [showVenta, setShowVenta] = useState(false);
  const [showHistorial, setShowHistorial] = useState(false);
  const [showCierre, setShowCierre] = useState(false);

  if (isLoading || !turnoActivo) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-12 rounded-2xl" />
        <Skeleton className="h-10 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Bolsillo cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {turnoActivo.bolsillos.map((bolsillo) => (
          <div
            key={bolsillo.medioPago}
            className="card-elevated rounded-2xl bg-white p-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <div
                className={`h-8 w-8 rounded-lg flex items-center justify-center ${MEDIO_BG[bolsillo.medioPago]}`}
              >
                {MEDIO_ICONS[bolsillo.medioPago]}
              </div>
              <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                {MEDIO_LABELS[bolsillo.medioPago]}
              </p>
            </div>
            <p className="text-2xl font-semibold tabular-nums">
              ${bolsillo.total.toLocaleString("es-AR")}
            </p>
            <div className="mt-1 flex gap-3 text-[10px] text-muted-foreground tabular-nums">
              <span>Fondo: ${bolsillo.fondo.toLocaleString("es-AR")}</span>
              <span className="text-emerald-600">
                +${bolsillo.ingresos.toLocaleString("es-AR")}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Total general */}
      <div className="card-elevated rounded-2xl bg-white p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg flex items-center justify-center bg-brand-purple/10">
            <DollarSign className="h-5 w-5 text-brand-purple" />
          </div>
          <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Total General
          </p>
        </div>
        <p className="text-2xl font-bold tabular-nums">
          ${turnoActivo.totalGeneral.toLocaleString("es-AR")}
        </p>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2">
        <Button
          className="flex-1 h-10 rounded-xl bg-gradient-to-r from-brand-purple to-brand-fuchsia text-white cursor-pointer"
          onClick={() => setShowVenta(true)}
        >
          <Plus className="h-4 w-4 mr-1.5" /> Nueva Venta
        </Button>
        <Button
          variant="outline"
          className="h-10 rounded-xl cursor-pointer"
          onClick={() => setShowHistorial(true)}
        >
          <Clock className="h-4 w-4 mr-1.5" /> Historial
        </Button>
        <Button
          variant="outline"
          className="h-10 rounded-xl text-amber-600 border-amber-200 hover:bg-amber-50 cursor-pointer"
          onClick={() => setShowCierre(true)}
        >
          <Lock className="h-4 w-4 mr-1.5" /> Cerrar Turno
        </Button>
      </div>

      {/* Dialogs */}
      <VentaForm
        turnoId={turnoId}
        mediosHabilitados={caja.mediosPagoHabilitados}
        open={showVenta}
        onOpenChange={setShowVenta}
      />

      <VentaHistorial
        turnoId={turnoId}
        open={showHistorial}
        onOpenChange={setShowHistorial}
      />

      {showCierre && (
        <TurnoCierre
          turnoId={turnoId}
          turnoActivo={turnoActivo}
          open={showCierre}
          onOpenChange={setShowCierre}
          onCerrado={onTurnoCerrado}
        />
      )}
    </div>
  );
}
