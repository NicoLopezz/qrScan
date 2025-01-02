// models/Movimiento.js
import mongoose from 'mongoose';

const movimientoSchema = new mongoose.Schema({
  cajaId: { type: mongoose.Schema.Types.ObjectId, refPath: 'cajaTipo', required: true },
  cajaTipo: { type: String, enum: ['CajaMayor', 'CajaChica'], required: true },
  tipo: { type: String, enum: ['ingreso', 'egreso'], required: true },
  monto: { type: Number, required: true },
  descripcion: { type: String, default: '' },
  medioPago: { type: String, enum: ['efectivo', 'debito', 'credito', 'mercado-pago', 'otro'], default: 'efectivo' },
  estadoPago: { type: String, enum: ['abonado', 'no-abonado','pendiente']},
  fecha: { type: Date, default: Date.now },
});

export default mongoose.model('Movimiento', movimientoSchema);
