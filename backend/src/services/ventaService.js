import Turno from '../models/Turno.js';
import Caja from '../models/Caja.js';
import VentaPOS from '../models/VentaPOS.js';
import PagoPOS from '../models/PagoPOS.js';

/**
 * Creates a VentaPOS automatically from a completed lavado.
 * Maps debito/credito -> tarjeta.
 * Returns the venta or null if no open turno exists.
 */
export async function crearVentaDesdeLavado({ adminId, lavadoId, monto, medioPago, descripcion }) {
  // Map legacy payment methods to new POS medios
  const mapMedio = {
    efectivo: 'efectivo',
    debito: 'tarjeta',
    credito: 'tarjeta',
    'mercado-pago': 'mercado-pago',
    tarjeta: 'tarjeta',
  };

  const medioPagoMapped = mapMedio[medioPago] || 'efectivo';

  // Find any open turno for this admin
  const turno = await Turno.findOne({ adminId, estado: 'abierto' });
  if (!turno) return null;

  // Check caja has this medio de pago enabled
  const caja = await Caja.findById(turno.cajaId);
  if (caja && !caja.mediosPagoHabilitados.includes(medioPagoMapped)) {
    return null;
  }

  // Idempotency: check if a venta with this origenRef already exists
  const existe = await VentaPOS.findOne({ origenRef: lavadoId });
  if (existe) return existe;

  const venta = await VentaPOS.create({
    turnoId: turno._id,
    adminId,
    monto,
    descripcion: descripcion || '',
    origen: 'lavado',
    origenRef: lavadoId,
  });

  await PagoPOS.create({
    ventaId: venta._id,
    medioPago: medioPagoMapped,
    monto,
  });

  return venta;
}
