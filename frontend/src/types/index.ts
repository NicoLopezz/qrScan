export interface User {
  adminId: string;
  email: string;
  localNumber: number;
  permiso: string;
  localName?: string;
}

export interface Lavado {
  _id: string;
  nombre: string;
  modelo: string;
  patente: string;
  empresa?: string;
  tipoDeLavado: string;
  observacion?: string;
  estado: string;
  monto?: number;
  medioPago?: string;
  from?: string;
  selected?: boolean;
  textConfirmation?: boolean;
  calidad?: string;
  puntuacionCalidad?: number;
  fechaDeAlta: string;
  historialLavados: HistorialLavado[];
}

export interface HistorialLavado {
  confirmacionPorCliente: boolean;
  tipoDeLavado: string;
  fechaIngreso: string;
  fechaEgreso: string | null;
  tiempoEspera: number;
  observacion: string;
  calidad?: string;
  puntuacionCalidad?: number;
}

export interface Reserva {
  _id: string;
  nombre: string;
  comensales: number;
  observacion: string;
  selected?: boolean;
  from?: string;
  textConfirmation?: boolean;
}

export type MedioPago = "efectivo" | "mercado-pago" | "tarjeta";

export interface Caja {
  _id: string;
  nombre: string;
  adminId: string;
  mediosPagoHabilitados: MedioPago[];
  activa: boolean;
}

export interface Turno {
  _id: string;
  cajaId: string;
  adminId: string;
  usuarioId: string;
  abiertoPor: string;
  cerradoPor: string;
  estado: "abierto" | "cerrado";
  apertura: string;
  cierre: string | null;
  arqueo?: {
    esperado: Record<string, number>;
    real: Record<string, number>;
    diferencia: Record<string, number>;
    observacion: string;
  };
}

export interface Fondo {
  _id: string;
  turnoId: string;
  medioPago: MedioPago;
  monto: number;
}

export interface VentaPOS {
  _id: string;
  turnoId: string;
  monto: number;
  descripcion: string;
  tipo: "ingreso" | "egreso";
  origen: "manual" | "lavado";
  origenRef?: string;
  fecha: string;
  pagos?: PagoVenta[];
}

export interface PagoVenta {
  _id: string;
  ventaId: string;
  medioPago: MedioPago;
  monto: number;
}

export interface BolsilloBalance {
  medioPago: MedioPago;
  fondo: number;
  ingresos: number;
  total: number;
}

export interface TurnoActivo {
  turno: Turno;
  fondos: Fondo[];
  bolsillos: BolsilloBalance[];
  totalGeneral: number;
}

export interface TurnoDetalle {
  turno: Turno;
  caja: { _id: string; nombre: string } | null;
  fondos: Fondo[];
  ventas: VentaPOS[];
  bolsillos: BolsilloBalance[];
  totalGeneral: number;
}

export interface ResumenTurnos {
  totalTurnos: number;
  totalIngresos: number;
  totalEgresos: number;
  totalDiferencia: number;
  peorDiferencia: number;
  desde: string;
  hasta: string;
}

export interface Cliente {
  from: string;
  solicitudBaja: boolean;
  historialPedidos: Pedido[];
  promedioTiempo: number;
  mensajesEnviados: Mensaje[];
}

export interface Pedido {
  tagNumber: number;
  fechaPedido: string;
  fechaRetiro?: string;
  tiempoEspera: number;
  estadoPorBarra: string;
  confirmacionPorCliente: boolean;
}

export interface Mensaje {
  body: string;
  fecha: string;
  hora?: string;
}
