import mongoose from 'mongoose';

const arqueoSchema = new mongoose.Schema({
  esperado:   { type: Map, of: Number, default: {} },
  real:       { type: Map, of: Number, default: {} },
  diferencia: { type: Map, of: Number, default: {} },
  observacion: { type: String, default: '' },
}, { _id: false });

const turnoSchema = new mongoose.Schema({
  cajaId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Caja', required: true },
  adminId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', required: true },
  usuarioId:    { type: String, default: '' },
  abiertoPor:   { type: String, default: '' },
  cerradoPor:   { type: String, default: '' },
  estado:       { type: String, enum: ['abierto', 'cerrado'], default: 'abierto' },
  apertura:     { type: Date, default: Date.now },
  cierre:       { type: Date, default: null },
  arqueo:       { type: arqueoSchema, default: () => ({}) },
});

turnoSchema.index({ cajaId: 1, estado: 1 });
turnoSchema.index({ adminId: 1, estado: 1 });

export default mongoose.model('Turno', turnoSchema);
