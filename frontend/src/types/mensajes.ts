export type TriggerType =
  | "post_servicio"
  | "dias_sin_visita"
  | "cumpleanos"
  | "fidelidad"
  | "clima"
  | "pago_fallido"
  | "pre_renovacion";

export interface Automatizacion {
  _id: string;
  nombre: string;
  trigger: TriggerType;
  triggerValor?: number; // e.g. 30 días
  mensaje: string;
  destino: "todos" | "con_whatsapp" | "segmento";
  activa: boolean;
  enviados: number;
  conversiones: number;
  tasaConversion: number;
}

export interface MensajeHistorial {
  _id: string;
  fecha: string;
  clienteNombre: string;
  clienteTelefono?: string;
  tipo: "automatico" | "broadcast" | "encuesta" | "manual";
  etiqueta: string; // "Review", "Win-back", "Promo 2x1", etc.
  estado: "enviado" | "respondio" | "volvio" | "uso_cupon" | "error";
  mensaje: string;
  respuesta?: string;
}

export interface ConversacionCliente {
  _id: string;
  nombre: string;
  telefono: string;
  mensajes: {
    _id: string;
    body: string;
    fecha: string;
    direccion: "enviado" | "recibido";
  }[];
  ultimoMensaje?: string;
  totalLavados?: number;
  calidad?: number;
}

export const TRIGGER_LABELS: Record<TriggerType, string> = {
  post_servicio: "Post-servicio",
  dias_sin_visita: "Días sin visita",
  cumpleanos: "Cumpleaños",
  fidelidad: "Progreso fidelidad",
  clima: "Clima (post-lluvia)",
  pago_fallido: "Pago fallido",
  pre_renovacion: "Pre-renovación plan",
};

export const TRIGGER_ICONS: Record<TriggerType, string> = {
  post_servicio: "star",
  dias_sin_visita: "clock",
  cumpleanos: "cake",
  fidelidad: "trophy",
  clima: "cloud-rain",
  pago_fallido: "credit-card",
  pre_renovacion: "bell",
};
