import mongoose from 'mongoose';

const cajaMayorSchema = new mongoose.Schema({
  adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', required: true },
  fechaApertura: { type: Date, default: Date.now },
  saldoInicial: { type: Number, required: true },
  saldoActual: { type: Number, default: 0 },
  estado: { type: String, enum: ['abierta', 'cerrada'], default: 'abierta' },
  arqueos: [{ type: mongoose.Schema.Types.ObjectId, ref: 'ArqueoMayor' }], // Arqueos específicos de Caja Mayor
});

export default mongoose.model('CajaMayor', cajaMayorSchema, 'CajasMayores');
