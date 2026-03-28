import mongoose from 'mongoose';

const ventaPOSSchema = new mongoose.Schema({
  turnoId:     { type: mongoose.Schema.Types.ObjectId, ref: 'Turno', required: true },
  adminId:     { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', required: true },
  monto:       { type: Number, required: true },
  descripcion: { type: String, default: '' },
  tipo:        { type: String, enum: ['ingreso', 'egreso'], default: 'ingreso' },
  nota:        { type: String, default: '' },
  origen:      { type: String, enum: ['manual', 'lavado'], default: 'manual' },
  origenRef:   { type: mongoose.Schema.Types.ObjectId, default: null },
  fecha:       { type: Date, default: Date.now },
}, { timestamps: true });

ventaPOSSchema.index({ turnoId: 1 });
ventaPOSSchema.index({ origenRef: 1 }, { sparse: true });

export default mongoose.model('VentaPOS', ventaPOSSchema);
