import mongoose from 'mongoose';
import VentaPOS from '../models/VentaPOS.js';

/**
 * Fetches ventas with pagos joined via $lookup (avoids N+1).
 */
export async function getVentasConPagos(turnoId) {
  return VentaPOS.aggregate([
    { $match: { turnoId: new mongoose.Types.ObjectId(turnoId) } },
    {
      $lookup: {
        from: 'pagopos',
        localField: '_id',
        foreignField: 'ventaId',
        as: 'pagos',
      },
    },
    { $sort: { fecha: -1 } },
  ]);
}
