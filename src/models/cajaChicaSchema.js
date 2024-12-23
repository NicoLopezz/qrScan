import mongoose from 'mongoose';

const cajaChicaSchema = new mongoose.Schema({
  adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', required: true },
  saldoInicial: { type: Number, required: true },
  saldoActual: { type: Number, default: 0 },
  estado: { type: String, enum: ['abierta', 'cerrada'], default: 'abierta' },
  fechaApertura: { type: Date, default: Date.now },
  arqueos: [{ type: mongoose.Schema.Types.ObjectId, ref: 'ArqueoChica' }],
});

export default mongoose.model('CajaChica', cajaChicaSchema, 'CajasChicas');
