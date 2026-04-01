import mongoose from 'mongoose';

const automatizacionSchema = new mongoose.Schema({
  adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', required: true, index: true },
  nombre: { type: String, required: true },
  trigger: {
    type: String,
    enum: ['post_servicio', 'dias_sin_visita', 'cumpleanos', 'fidelidad', 'clima', 'pago_fallido', 'pre_renovacion'],
    required: true,
  },
  triggerValor: { type: Number, default: null }, // e.g. 30 días
  mensaje: { type: String, required: true },
  destino: { type: String, enum: ['todos', 'con_whatsapp', 'segmento'], default: 'con_whatsapp' },
  activa: { type: Boolean, default: true },
  enviados: { type: Number, default: 0 },
  conversiones: { type: Number, default: 0 },
}, { timestamps: true });

automatizacionSchema.virtual('tasaConversion').get(function () {
  return this.enviados > 0 ? Math.round((this.conversiones / this.enviados) * 100) : 0;
});

automatizacionSchema.set('toJSON', { virtuals: true });

export default mongoose.model('Automatizacion', automatizacionSchema);
