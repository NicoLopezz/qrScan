import mongoose from 'mongoose';

export const MEDIOS_PAGO = ['efectivo', 'mercado-pago', 'tarjeta'];

const cajaSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', required: true },
  mediosPagoHabilitados: {
    type: [String],
    enum: MEDIOS_PAGO,
    default: MEDIOS_PAGO,
  },
  activa: { type: Boolean, default: true },
}, { timestamps: true });

cajaSchema.index({ adminId: 1, nombre: 1 }, { unique: true });

export default mongoose.model('Caja', cajaSchema);
