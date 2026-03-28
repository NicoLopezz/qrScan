import mongoose from 'mongoose';
import usuarioSchema from './Usuario.js';
import clienteSchema from './Cliente.js';
import reservaSchema from './Reserva.js';
import lavadoSchema from './Lavado.js';
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
  
  // Subesquemas existentes
  usuarios: { type: [usuarioSchema], default: [] },
  pagos: { type: [pagoSchema], default: [] },
  facturacion: { type: facturacionSchema, default: {} },
  clientes: { type: [clienteSchema], default: [] },
  reservas: { type: [reservaSchema], default: [] },
  lavados: { type: [lavadoSchema], default: [] },
});

// Índices para acelerar las queries más frecuentes
adminSchema.index({ 'usuarios.email': 1 });   // login de usuarios
adminSchema.index({ 'lavados.estado': 1 });    // filtros por estado en dashboard
adminSchema.index({ 'lavados.fechaDeAlta': -1 }); // listados ordenados por fecha

export default mongoose.model('Admin', adminSchema);
