// models/arqueoChicaSchema.js
import mongoose from 'mongoose';

const arqueoChicaSchema = new mongoose.Schema({
  cajaId: { type: mongoose.Schema.Types.ObjectId, ref: 'CajaChica', required: true },
  fechaApertura: { type: Date, default: Date.now }, // Agregado: Fecha y hora de apertura
  saldoInicial: { type: Number, required: true },
  saldoFinalSistema: { type: Number, default: 0 },
  saldoFinalReal: { type: Number, default: 0 },
  diferencia: { type: Number, default: 0 },
  fechaCierre: { type: Date, default: null },
  estado: { type: String, enum: ['abierto', 'cerrado'], default: 'abierto' },
  movimientos: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Movimiento' }], // Referencia a movimientos
  ventas: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Venta' }], // Referencia a ventas
  observacion: { type: String, default: '' }, // Nueva observación
});

export default mongoose.model('ArqueoChica', arqueoChicaSchema, 'ArqueosChica');
