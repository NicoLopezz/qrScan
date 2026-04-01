"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { QRCodeSVG } from "qrcode.react";
import { Check, QrCode } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PatenteInput } from "@/components/lavados/PatenteInput";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { fetchApi } from "@/lib/api";
import { useAuth } from "@/providers/AuthProvider";

interface LavadoFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LavadoForm({ open, onOpenChange }: LavadoFormProps) {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"form" | "qr">("form");
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

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || `http://${window.location.hostname}:4000`;
  const qrUrl = createdLavadoId && user
    ? `${backendUrl}/api/qrScanUpdateLavados/${user.adminId}`
    : "";

  const resetForm = () => {
    setForm({ nombre: "", patente: "", modelo: "", tipoDeLavado: "", medioPago: "---", monto: 0, observacion: "" });
    setStep("form");
    setCreatedLavadoId(null);
  };

  const handleClose = (open: boolean) => {
    if (!open) resetForm();
    onOpenChange(open);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetchApi<{ _id?: string }>("/api/admins/agregarLavado", {
        method: "POST",
        body: JSON.stringify(form),
      });
      queryClient.invalidateQueries({ queryKey: ["lavados"] });

      // Get the last lavado to select it for QR
      const lavadosRes = await fetchApi<Array<{ _id: string }>>(`/api/lavados`);
      const lastLavado = lavadosRes.data?.[lavadosRes.data.length - 1];

      if (lastLavado) {
        // Mark it as selected for QR scan
        await fetchApi(`/api/lavados/${lastLavado._id}/actualizarSelectedLavado`, { method: "PATCH" });
        setCreatedLavadoId(lastLavado._id);
        setStep("qr");
        toast.success("Lavado creado - Mostra el QR al cliente");
      } else {
        toast.success("Lavado agregado");
        handleClose(false);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al agregar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md p-5 gap-0 rounded-2xl border-0 shadow-2xl">
        {step === "form" ? (
          <>
            <DialogHeader className="mb-4">
              <DialogTitle className="text-lg tracking-tight">Nuevo Lavado</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-3">
              {/* Patente — visual plate */}
              <div className="space-y-1">
                <Label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Patente</Label>
                <PatenteInput value={form.patente} onChange={(v) => setForm({ ...form, patente: v })} required />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Nombre</Label>
                  <Input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} className="h-10 rounded-xl text-sm" required />
                </div>
                <div className="space-y-1">
                  <Label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Modelo</Label>
                  <Input value={form.modelo} onChange={(e) => setForm({ ...form, modelo: e.target.value })} className="h-10 rounded-xl text-sm" required />
                </div>
                <div className="space-y-1">
                  <Label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Tipo de Lavado</Label>
                  <Input value={form.tipoDeLavado} onChange={(e) => setForm({ ...form, tipoDeLavado: e.target.value })} placeholder="Completo, Simple..." className="h-10 rounded-xl text-sm" required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Medio de Pago</Label>
                  <Select value={form.medioPago} onValueChange={(v) => v && setForm({ ...form, medioPago: v })}>
                    <SelectTrigger className="h-10 rounded-xl text-sm"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="---">Sin definir</SelectItem>
                      <SelectItem value="efectivo">Efectivo</SelectItem>
                      <SelectItem value="debito">Debito</SelectItem>
                      <SelectItem value="credito">Credito</SelectItem>
                      <SelectItem value="mercado-pago">Mercado Pago</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Monto</Label>
                  <Input type="number" value={form.monto} onChange={(e) => setForm({ ...form, monto: parseFloat(e.target.value) || 0 })} className="h-10 rounded-xl text-sm tabular-nums" />
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Observacion</Label>
                <Textarea value={form.observacion} onChange={(e) => setForm({ ...form, observacion: e.target.value })} rows={2} className="rounded-xl text-sm" />
              </div>
              <div className="flex gap-2 pt-1">
                <Button type="button" variant="outline" onClick={() => handleClose(false)} className="flex-1 h-10 rounded-xl cursor-pointer">
                  Cancelar
                </Button>
                <Button type="submit" className="flex-1 h-10 rounded-xl bg-foreground text-background hover:bg-foreground/90 font-medium cursor-pointer" disabled={loading}>
                  {loading ? "Creando..." : "Crear y Generar QR"}
                </Button>
              </div>
            </form>
          </>
        ) : (
          <>
            <DialogHeader className="mb-2">
              <DialogTitle className="text-lg tracking-tight">Escanear QR</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col items-center py-4 space-y-4">
              <p className="text-sm text-muted-foreground text-center">
                Pedi al cliente que escanee este codigo para confirmar el servicio via WhatsApp
              </p>
              <div className="p-4 bg-white dark:bg-card rounded-2xl border border-border/50 shadow-sm">
                {qrUrl && (
                  <QRCodeSVG
                    value={qrUrl}
                    size={200}
                    level="M"
                    fgColor="#1E1B4B"
                    style={{ borderRadius: 8 }}
                  />
                )}
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground">
                  {form.nombre} - {form.patente}
                </p>
                <p className="text-xs text-muted-foreground">
                  {form.tipoDeLavado}
                </p>
              </div>
              {qrUrl && window.location.hostname === "localhost" && (
                <a
                  href={qrUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] text-foreground underline break-all text-center max-w-[280px]"
                >
                  {qrUrl}
                </a>
              )}
              <Button
                onClick={() => handleClose(false)}
                className="w-full h-10 rounded-xl bg-foreground text-background hover:bg-foreground/90 cursor-pointer"
              >
                <Check className="h-4 w-4 mr-1" /> Listo
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
