import mongoose from 'mongoose';
import { MEDIOS_PAGO } from './Caja.js';

const fondoSchema = new mongoose.Schema({
  turnoId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Turno', required: true },
  medioPago:  { type: String, enum: MEDIOS_PAGO, required: true },
  monto:      { type: Number, default: 0 },
});

fondoSchema.index({ turnoId: 1, medioPago: 1 }, { unique: true });

export default mongoose.model('Fondo', fondoSchema);
