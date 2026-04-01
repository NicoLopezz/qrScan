import { z } from 'zod';

export function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const errors = result.error.errors.map(e => `${e.path.join('.')}: ${e.message}`);
      return res.status(400).json({ success: false, message: 'Datos inválidos', details: errors });
    }
    req.body = result.data;
    next();
  };
}

export const loginSchema = z.object({
  email:    z.string().email('Email inválido'),
  password: z.string().min(1, 'Password requerida'),
});

const passwordSchema = z.string()
  .min(8, 'Mínimo 8 caracteres')
  .regex(/[A-Z]/, 'Debe contener al menos una mayúscula')
  .regex(/[0-9]/, 'Debe contener al menos un número');

export const newLocalSchema = z.object({
  email:     z.string().email('Email inválido'),
  password:  passwordSchema,
  localName: z.string().min(1, 'Nombre del local requerido'),
});

export const crearUsuarioSchema = z.object({
  email:    z.string().email('Email inválido'),
  password: passwordSchema,
  role:     z.enum(['Admin', 'editor', 'viewer', 'user'], { message: 'Rol inválido' }),
});

export const agregarLavadoSchema = z.object({
  nombre:       z.string().min(1),
  patente:      z.string().min(1),
  modelo:       z.string().min(1),
  tipoDeLavado: z.string().min(1),
  medioPago:    z.enum(['efectivo', 'debito', 'credito', 'mercado-pago', '---']).optional(),
  monto:        z.number().nonnegative().optional(),
  observacion:  z.string().optional(),
});

const mediosPagoEnum = z.enum(['efectivo', 'mercado-pago', 'tarjeta']);

export const crearCajaSchema = z.object({
  nombre: z.string().min(1, 'Nombre requerido'),
  mediosPagoHabilitados: z.array(mediosPagoEnum).optional(),
});

export const abrirTurnoSchema = z.object({
  cajaId: z.string().min(1, 'cajaId requerido'),
  fondos: z.array(z.object({
    medioPago: mediosPagoEnum,
    monto: z.number().nonnegative('El monto no puede ser negativo'),
  })),
});

export const crearVentaSchema = z.object({
  turnoId: z.string().min(1, 'turnoId requerido'),
  monto: z.number().positive('El monto debe ser mayor a 0'),
  descripcion: z.string().optional(),
  pagos: z.array(z.object({
    medioPago: mediosPagoEnum,
    monto: z.number().positive('El monto del pago debe ser mayor a 0'),
  })).min(1, 'Se requiere al menos un pago'),
});

export const cerrarTurnoSchema = z.object({
  conteoReal: z.record(z.string(), z.number()),
  observacion: z.string().optional(),
});

// ── Automatizaciones ──────────────────────────────────────────

export const crearAutomatizacionSchema = z.object({
  nombre:       z.string().min(1, 'Nombre requerido'),
  trigger:      z.string().min(1, 'Trigger requerido'),
  triggerValor: z.union([z.string(), z.number()]).optional(),
  mensaje:      z.string().min(1, 'Mensaje requerido'),
  destino:      z.string().optional(),
});

export const actualizarAutomatizacionSchema = z.object({
  nombre:       z.string().min(1).optional(),
  trigger:      z.string().min(1).optional(),
  triggerValor: z.union([z.string(), z.number()]).optional(),
  mensaje:      z.string().min(1).optional(),
  destino:      z.string().optional(),
  activa:       z.boolean().optional(),
}).strict();

// ── Lavados (modificar) ───────────────────────────────────────

export const modificarLavadoSchema = z.object({
  lavadoId:  z.string().min(1, 'lavadoId requerido'),
  medioPago: z.string().min(1, 'medioPago requerido'),
  estado:    z.string().min(1, 'estado requerido'),
  monto:     z.union([z.number(), z.string()]).refine(v => !isNaN(parseFloat(String(v))), 'monto inválido'),
  patente:   z.string().optional(),
});

// ── Broadcast ─────────────────────────────────────────────────

export const broadcastSchema = z.object({
  mensaje:   z.string().min(1, 'Mensaje requerido'),
  segmento:  z.enum(['todos', 'activos', 'inactivos', 'vip']).optional(),
});

// ── Reservas ──────────────────────────────────────────────────

export const agregarClienteSchema = z.object({
  nombre:      z.string().min(1, 'Nombre requerido'),
  comensales:  z.number().int().positive().optional(),
  observacion: z.string().optional(),
});
