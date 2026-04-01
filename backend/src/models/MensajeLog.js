import mongoose from 'mongoose';

const mensajeLogSchema = new mongoose.Schema({
  adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', required: true, index: true },
  clienteNombre: { type: String, default: 'Broadcast' },
  clienteTelefono: { type: String, default: null },
  tipo: { type: String, enum: ['automatico', 'broadcast', 'encuesta', 'manual'], required: true },
  etiqueta: { type: String, default: '' }, // "Review", "Win-back", "Promo 2x1", etc.
  estado: { type: String, enum: ['enviado', 'respondio', 'volvio', 'uso_cupon', 'error'], default: 'enviado' },
  mensaje: { type: String, required: true },
  respuesta: { type: String, default: null },
  automatizacionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Automatizacion', default: null },
  cantidadDestinatarios: { type: Number, default: 1 }, // for broadcasts
}, { timestamps: true });

mensajeLogSchema.index({ adminId: 1, createdAt: -1 });

export default mongoose.model('MensajeLog', mensajeLogSchema);
