import { z } from 'zod';

// Middleware factory: recibe un schema zod, valida req.body
export function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const errors = result.error.errors.map(e => `${e.path.join('.')}: ${e.message}`);
      return res.status(400).json({ error: 'Datos inválidos', details: errors });
    }
    req.body = result.data;
    next();
  };
}

// ========================== SCHEMAS ==========================

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
  cumpleaños:   z.string().optional(),
});

export const crearMovimientoSchema = z.object({
  cajaTipo:    z.enum(['CajaMayor', 'CajaChica']),
  tipo:        z.enum(['ingreso', 'egreso']),
  monto:       z.number().positive('El monto debe ser mayor a 0'),
  medioPago:   z.enum(['efectivo', 'debito', 'credito', 'mercado-pago', 'otro']),
  descripcion: z.string().optional(),
  estadoPago:  z.enum(['abonado', 'no-abonado', 'pendiente']).optional(),
});
