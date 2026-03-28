import mongoose from 'mongoose';
import { MEDIOS_PAGO } from './Caja.js';

const pagoPOSSchema = new mongoose.Schema({
  ventaId:    { type: mongoose.Schema.Types.ObjectId, ref: 'VentaPOS', required: true },
  medioPago:  { type: String, enum: MEDIOS_PAGO, required: true },
  monto:      { type: Number, required: true },
}, { timestamps: true });

pagoPOSSchema.index({ ventaId: 1 });

export default mongoose.model('PagoPOS', pagoPOSSchema);
