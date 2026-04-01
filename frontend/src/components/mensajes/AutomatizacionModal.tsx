"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import type { Automatizacion, TriggerType } from "@/types/mensajes";
import { TRIGGER_LABELS } from "@/types/mensajes";

interface AutomatizacionModalProps {
  auto: Automatizacion | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: Partial<Automatizacion>) => void;
}

const TRIGGERS: TriggerType[] = [
  "post_servicio",
  "dias_sin_visita",
  "cumpleanos",
  "fidelidad",
  "clima",
  "pago_fallido",
  "pre_renovacion",
];

const VARIABLES = [
  { key: "{nombre}", desc: "Nombre del cliente" },
  { key: "{patente}", desc: "Patente del vehículo" },
  { key: "{dias}", desc: "Días sin visita" },
  { key: "{estrellas}", desc: "Progreso fidelidad" },
];

const DEFAULT_MESSAGES: Partial<Record<TriggerType, string>> = {
  post_servicio:
    "Hola {nombre}! Como estuvo tu experiencia en el lavado? Respondé: Excelente, Bueno o Regular.",
  dias_sin_visita:
    "Hola {nombre}! Hace {dias} dias que no pasas por aca. Te esperamos con un 20% OFF en tu proximo lavado!",
  cumpleanos:
    "Feliz cumple {nombre}! Te regalamos un lavado gratis este mes. Mostra este mensaje al llegar.",
  fidelidad:
    "Hola {nombre}! Ya llevas {estrellas} de 5 estrellas. Un lavado mas y el proximo es GRATIS!",
  clima:
    "Hola {nombre}! Despues de la lluvia tu auto necesita un lavado. Hoy con 15% OFF!",
  pago_fallido:
    "Hola {nombre}, no pudimos procesar tu pago. Actualiza tu medio de pago para no perder tu plan.",
  pre_renovacion:
    "Hola {nombre}! Tu plan se renueva en 3 dias. Todo listo para seguir disfrutando el servicio!",
};

export function AutomatizacionModal({
  auto,
  open,
  onOpenChange,
  onSave,
}: AutomatizacionModalProps) {
  const [nombre, setNombre] = useState("");
  const [trigger, setTrigger] = useState<TriggerType>("post_servicio");
  const [triggerValor, setTriggerValor] = useState(30);
  const [mensaje, setMensaje] = useState("");
  const [destino, setDestino] = useState<"todos" | "con_whatsapp" | "segmento">("con_whatsapp");

  const isEditing = !!auto;

  useEffect(() => {
    if (auto) {
      setNombre(auto.nombre);
      setTrigger(auto.trigger);
      setTriggerValor(auto.triggerValor ?? 30);
      setMensaje(auto.mensaje);
      setDestino(auto.destino);
    } else {
      setNombre("");
      setTrigger("post_servicio");
      setTriggerValor(30);
      setMensaje(DEFAULT_MESSAGES.post_servicio ?? "");
      setDestino("con_whatsapp");
    }
  }, [auto, open]);

  const handleTriggerChange = (t: TriggerType) => {
    setTrigger(t);
    if (!isEditing && DEFAULT_MESSAGES[t]) {
      setMensaje(DEFAULT_MESSAGES[t]!);
    }
  };

  const handleSave = () => {
    onSave({
      _id: auto?._id,
      nombre,
      trigger,
      triggerValor: trigger === "dias_sin_visita" ? triggerValor : undefined,
      mensaje,
      destino,
      activa: auto?.activa ?? true,
    });
    onOpenChange(false);
  };

  const needsValor = trigger === "dias_sin_visita";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg p-5 gap-0 rounded-2xl border-0 shadow-2xl">
        <DialogHeader className="mb-5">
          <DialogTitle className="text-lg tracking-tight">
            {isEditing ? "Editar Automatizacion" : "Nueva Automatizacion"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Nombre */}
          <div className="space-y-1.5">
            <Label className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              Nombre
            </Label>
            <Input
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej: Review post-servicio"
              className="h-10 rounded-xl"
            />
          </div>

          {/* Trigger */}
          <div className="space-y-1.5">
            <Label className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              Trigger
            </Label>
            <Select value={trigger} onValueChange={(v) => v && handleTriggerChange(v as TriggerType)}>
              <SelectTrigger className="h-10 rounded-xl w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TRIGGERS.map((t) => (
                  <SelectItem key={t} value={t}>
                    {TRIGGER_LABELS[t]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Trigger valor (condicional) */}
          {needsValor && (
            <div className="space-y-1.5">
              <Label className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                Despues de (dias)
              </Label>
              <Input
                type="number"
                value={triggerValor}
                onChange={(e) => setTriggerValor(Number(e.target.value))}
                className="h-10 rounded-xl w-28"
                min={1}
                max={365}
              />
            </div>
          )}

          {/* Mensaje */}
          <div className="space-y-1.5">
            <Label className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              Mensaje
            </Label>
            <Textarea
              value={mensaje}
              onChange={(e) => setMensaje(e.target.value)}
              rows={4}
              className="rounded-xl resize-none text-sm"
              placeholder="Escribe tu mensaje..."
            />
            <div className="flex flex-wrap gap-1.5 mt-1">
              {VARIABLES.map((v) => (
                <button
                  key={v.key}
                  type="button"
                  onClick={() => setMensaje((prev) => prev + " " + v.key)}
                  className="cursor-pointer"
                >
                  <Badge
                    variant="secondary"
                    className="text-[10px] border-0 bg-muted text-foreground hover:bg-muted/80 cursor-pointer"
                  >
                    {v.key}
                  </Badge>
                </button>
              ))}
            </div>
          </div>

          {/* Destino */}
          <div className="space-y-1.5">
            <Label className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              Destino
            </Label>
            <div className="space-y-2">
              {([
                { value: "todos" as const, label: "Todos los clientes" },
                { value: "con_whatsapp" as const, label: "Clientes con WhatsApp" },
                { value: "segmento" as const, label: "Segmento personalizado" },
              ]).map((opt) => (
                <label
                  key={opt.value}
                  className="flex items-center gap-2.5 cursor-pointer text-sm"
                >
                  <div
                    className={`h-4 w-4 rounded-full border-2 flex items-center justify-center transition-colors ${destino === opt.value ? "border-foreground" : "border-muted-foreground/30"}`}
                    onClick={() => setDestino(opt.value)}
                  >
                    {destino === opt.value && (
                      <div className="h-2 w-2 rounded-full bg-foreground" />
                    )}
                  </div>
                  <span>{opt.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter className="mt-5">
          <Button
            variant="outline"
            size="sm"
            className="rounded-xl cursor-pointer"
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button
            size="sm"
            className="rounded-xl bg-foreground text-background hover:bg-foreground/90 cursor-pointer"
            onClick={handleSave}
            disabled={!nombre.trim() || !mensaje.trim()}
          >
            {isEditing ? "Guardar Cambios" : "Crear y Activar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
