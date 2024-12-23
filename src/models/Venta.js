import mongoose from 'mongoose';

const ventaSchema = new mongoose.Schema({
  cajaId: { type: mongoose.Schema.Types.ObjectId, ref: 'CajaChica', required: true },
  usuarioId: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
  monto: { type: Number, required: true },
  medioPago: { type: String, enum: ['efectivo', 'tarjeta', 'transferencia'], required: true },
  descripcion: { type: String, default: '' },
  fecha: { type: Date, default: Date.now },
  estado: { type: String, enum: ['pagado', 'pendiente'], default: 'pagado' }
});

export default mongoose.model('Venta', ventaSchema);
