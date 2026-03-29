"use client";

import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { QRCodeSVG } from "qrcode.react";
import { ArrowLeft, ArrowRight, Check, Car, QrCode } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { fetchApi } from "@/lib/api";
import { useAuth } from "@/providers/AuthProvider";
import { cn } from "@/lib/utils";

interface MobileWizardProps {
  onComplete: () => void;
  onNextRef?: (fn: (() => void) | null) => void;
}

const STEPS = [
  { label: "Datos", icon: Car },
  { label: "QR", icon: QrCode },
];

export function MobileWizard({ onComplete, onNextRef }: MobileWizardProps) {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1); // 1=forward, -1=back
  const [loading, setLoading] = useState(false);
  const [createdLavadoId, setCreatedLavadoId] = useState<string | null>(null);
  const [form, setForm] = useState({
    nombre: "",
    patente: "",
    modelo: "",
    tipoDeLavado: "",
    medioPago: "---",
    monto: 0,
    observacion: "",
  });

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || `http://${typeof window !== "undefined" ? window.location.hostname : "localhost"}:4000`;
  const qrUrl = createdLavadoId && user
    ? `${backendUrl}/api/qrScanUpdateLavados/${user.adminId}`
    : "";

  const canNext = step === 0
    ? form.nombre && form.patente && form.modelo && form.tipoDeLavado
    : true;

  const handleCreate = async () => {
    setLoading(true);
    try {
      await fetchApi("/api/admins/agregarLavado", {
        method: "POST",
        body: JSON.stringify(form),
      });
      queryClient.invalidateQueries({ queryKey: ["lavados"] });

      const lavadosRes = await fetchApi<Array<{ _id: string }>>("/api/lavados");
      const lastLavado = lavadosRes.data?.[0];

      if (lastLavado) {
        await fetchApi(`/api/lavados/${lastLavado._id}/actualizarSelectedLavado`, { method: "PATCH" });
        setCreatedLavadoId(lastLavado._id);
        goTo(1);
        toast.success("Lavado creado");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al crear");
    } finally {
      setLoading(false);
    }
  };

  const goTo = (next: number) => {
    setDirection(next > step ? 1 : -1);
    setStep(next);
  };

  const handleNext = () => {
    if (step === 0) handleCreate();
  };

  const handleBack = () => {
    if (step === 0) onComplete();
    else goTo(step - 1);
  };

  useEffect(() => {
    onNextRef?.(() => handleNext());
    return () => onNextRef?.(null);
  });

  // Available height: 100dvh - topbar(56px) - layout padding(24px) - tabbar(80px)
  return (
    <div className="flex flex-col px-2" style={{ height: "calc(100dvh - 56px - 24px - 80px)" }}>
      {/* Stepper */}
      <div className="flex items-center justify-center px-4 py-3">
        {STEPS.map((s, i) => {
          const Icon = s.icon;
          const isActive = i === step;
          const isDone = i < step;
          return (
            <div key={i} className="flex items-center">
              <div className="flex flex-col items-center gap-0.5">
                <div className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full transition-all duration-300",
                  isActive ? "bg-brand-purple text-white scale-110"
                    : isDone ? "bg-brand-purple/20 text-brand-purple"
                    : "bg-muted text-muted-foreground"
                )}>
                  {isDone ? <Check className="h-3.5 w-3.5" /> : <Icon className="h-3.5 w-3.5" />}
                </div>
                <span className={cn("text-[9px] font-medium", isActive ? "text-brand-purple" : isDone ? "text-brand-purple" : "text-muted-foreground")}>{s.label}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={cn("w-10 h-0.5 mx-1 mb-3 rounded-full transition-colors duration-500", i < step ? "bg-brand-purple" : "bg-muted")} />
              )}
            </div>
          );
        })}
      </div>

      {/* Content */}
      <div className="flex-1 relative overflow-y-auto overflow-x-hidden">
        <div key={step} className={cn("py-1", direction > 0 ? "animate-[slideInRight_200ms_ease-out_both]" : "animate-[slideInLeft_200ms_ease-out_both]")}>
          {step === 0 && (
            <div className="flex flex-col gap-3 pt-2 px-2">
              <div>
                <Label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Nombre del cliente</Label>
                <Input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} className="h-10 rounded-xl mt-1" placeholder="Martin Gonzalez" autoFocus />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Patente</Label>
                  <Input value={form.patente} onChange={(e) => setForm({ ...form, patente: e.target.value.toUpperCase() })} className="h-10 rounded-xl mt-1 uppercase tracking-wider" placeholder="AB 123 CD" />
                </div>
                <div>
                  <Label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Modelo</Label>
                  <Input value={form.modelo} onChange={(e) => setForm({ ...form, modelo: e.target.value })} className="h-10 rounded-xl mt-1" placeholder="Toyota Corolla" />
                </div>
              </div>
              <div>
                <Label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Tipo de lavado</Label>
                <Input value={form.tipoDeLavado} onChange={(e) => setForm({ ...form, tipoDeLavado: e.target.value })} className="h-10 rounded-xl mt-1" placeholder="Simple, Completo, Premium..." />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Medio de pago</Label>
                  <Select value={form.medioPago} onValueChange={(v) => v && setForm({ ...form, medioPago: v })}>
                    <SelectTrigger className="h-10 rounded-xl mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="---">Sin definir</SelectItem>
                      <SelectItem value="efectivo">Efectivo</SelectItem>
                      <SelectItem value="debito">Debito</SelectItem>
                      <SelectItem value="credito">Credito</SelectItem>
                      <SelectItem value="mercado-pago">Mercado Pago</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Monto</Label>
                  <Input type="number" value={form.monto || ""} onChange={(e) => setForm({ ...form, monto: parseFloat(e.target.value) || 0 })} className="h-10 rounded-xl mt-1 tabular-nums" placeholder="$0" />
                </div>
              </div>
              <div>
                <Label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Observacion</Label>
                <Input value={form.observacion} onChange={(e) => setForm({ ...form, observacion: e.target.value })} className="h-10 rounded-xl mt-1" placeholder="Notas adicionales..." />
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="flex flex-col items-center justify-center h-full gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40">
                <Check className="h-4 w-4" />
              </div>
              <p className="text-[11px] text-muted-foreground">Pedi al cliente que escanee este codigo</p>
              <div className="p-2 bg-white dark:bg-card rounded-xl border border-border/50">
                {qrUrl && <QRCodeSVG value={qrUrl} size={140} level="M" fgColor="#1E1B4B" />}
              </div>
              <p className="text-sm font-semibold">{form.nombre}</p>
              <p className="text-[11px] text-muted-foreground">{form.patente} — {form.tipoDeLavado}</p>
            </div>
          )}
        </div>
      </div>

      {/* Bottom action — only on QR step */}
      {step === 1 && (
        <div className="pt-1 flex justify-center">
          <Button onClick={onComplete} className="h-10 px-8 rounded-xl bg-gradient-to-r from-brand-purple to-brand-fuchsia text-white font-medium cursor-pointer text-sm">
            Volver a Lista
          </Button>
        </div>
      )}
    </div>
  );
}
