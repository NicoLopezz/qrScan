import mongoose from 'mongoose';

// Esquema para los subusuarios
const usuarioSchema = new mongoose.Schema({
  email: { type: String, default: '' },
  password: { type: String, default: '' },
  permiso: { type: String, default: 'user' }
});

// Esquema para los clientes
const clienteSchema = new mongoose.Schema({
  solicitudBaja: { type: Boolean, default: false },
  from: { type: String, required: true },
  historialPedidos: [{
    tagNumber: { type: Number, default: null },
    fechaPedido: { type: Date, default: null },
    fechaRetiro: { type: Date, default: null },
    tiempoEspera: { type: Number, default: 0 },
    estadoPorBarra: { type: String, default: '' },
    confirmacionPorCliente: { type: Boolean, default: false },
    mensajes: [{
      body: { type: String, default: '' },
      fecha: { type: String, default: '' }
    }]
  }],
  promedioTiempo: { type: Number, default: 0 },
  mensajesEnviados: [{
    fecha: { type: String, required: true },
    body: { type: String, required: true }
  }]
});

// Esquema para las reservas
const reservaSchema = new mongoose.Schema({
  solicitudBaja: { type: Boolean, default: false },
  from: { type: String, default: '' },
  historialPedidos: [{
    tagNumber: { type: Number, default: null },
    fechaPedido: { type: Date, default: null },
    fechaRetiro: { type: Date, default: null },
    tiempoEspera: { type: Number, default: 0 },
    estadoPorBarra: { type: String, default: '' },
    confirmacionPorCliente: { type: Boolean, default: false },
    mensajes: [{
      body: { type: String, default: '' },
      fecha: { type: String, default: '' }
    }]
  }],
  promedioTiempo: { type: Number, default: 0 },
  mensajesEnviados: [{
    fecha: { type: String, required: true },
    body: { type: String, required: true }
  }],
  nombre: { type: String, required: true },         // Nuevo campo
  comensales: { type: Number, required: true },     // Nuevo campo
  observacion: { type: String, required: true },    // Nuevo campo
  mesaId: { type: Number },          // Nuevo campo
  selected: { type: Boolean, default: false },         // Nuevo campo
  textConfirmation: { type: Boolean, default: false },        // Nuevo campo
  numeroDeFila: { type: Number, default: 0 }          // Nuevo campo
});

// Esquema para los pagos
const pagoSchema = new mongoose.Schema({
  fecha: { type: Date, default: null },
  monto: { type: Number, default: 0 },
  metodo: { type: String, default: '' }
});

// Esquema para la facturación
const facturacionSchema = new mongoose.Schema({
  cbu: { type: String, default: '' },
  medioDePago: { type: String, default: '' },
  alias: { type: String, default: '' }
});

// Esquema para el administrador del local
const adminSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  localName: { type: String, required: true },
  localNumber: { type: Number, default: 14155238886 },
  fechaDeAlta: { type: Date, default: Date.now },
  usuarios: { type: [usuarioSchema], default: [] },
  pagos: { type: [pagoSchema], default: [] },
  facturacion: { type: facturacionSchema, default: {} },
  tipoDeLicencia: { type: String, default: '' },
  fechaRenovacion: { type: Date, default: null },
  mensajesRestantes: { type: String, default: '0/500' },
  horariosDeOperacion: { type: String, default: '' },
  permiso: { type: String, default: 'Admin' },
  passwordActual: { type: String, default: '' },
  tagSelected: { type: Number, default: 0 },
  clientes: { type: [clienteSchema], default: [] },
  reservas: { type: [reservaSchema], default: [] } // Modificación: esquema de reservas actualizado
});

export default mongoose.model('Admin', adminSchema);
