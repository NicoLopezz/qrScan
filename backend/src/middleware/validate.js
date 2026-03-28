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

export const newLocalSchema = z.object({
  email:     z.string().email('Email inválido'),
  password:  z.string().min(6, 'Mínimo 6 caracteres'),
  localName: z.string().min(1, 'Nombre del local requerido'),
});

export const crearUsuarioSchema = z.object({
  email:    z.string().email('Email inválido'),
  password: z.string().min(4, 'Mínimo 4 caracteres'),
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
