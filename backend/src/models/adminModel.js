import mongoose from 'mongoose';
import usuarioSchema from './Usuario.js';
import clienteSchema from './Cliente.js';
import reservaSchema from './Reserva.js';
import pagoSchema from './Pago.js';
import facturacionSchema from './Facturacion.js';

const adminSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  localName: { type: String, required: true },
  localNumber: { type: Number, default: 5491135254661 },
  fechaDeAlta: { type: Date, default: Date.now },
  tipoDeLicencia: { type: String, default: '' },
  fechaRenovacion: { type: Date, default: null },
  mensajesRestantes: { type: String, default: '0/500' },
  horariosDeOperacion: { type: String, default: '' },
  permiso: { type: String, default: 'Admin' },
  activeChannel: { type: String, enum: ['whatsapp', 'telegram'], default: 'telegram' },
  rubro: { type: String, default: '' },
  tourCompleted: { type: Boolean, default: false },

  // Subesquemas existentes
  usuarios: { type: [usuarioSchema], default: [] },
  pagos: { type: [pagoSchema], default: [] },
  facturacion: { type: facturacionSchema, default: {} },
  clientes: { type: [clienteSchema], default: [] },
  reservas: { type: [reservaSchema], default: [] },
  // lavados: migrado a colección independiente (modelo Lavado con adminId)
}, { timestamps: true });

adminSchema.index({ 'usuarios.email': 1 });

export default mongoose.model('Admin', adminSchema);
