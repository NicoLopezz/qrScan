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
  nombre: { type: String, required: true },
  comensales: { type: Number, required: true },
  observacion: { type: String, required: true },
  mesaId: { type: Number },
  selected: { type: Boolean, default: false },
  textConfirmation: { type: Boolean, default: false },
  numeroDeFila: { type: Number, default: 0 }
});

// Esquema para los lavados
const lavadoSchema = new mongoose.Schema({
  fechaDeAlta: { type: Date, default: Date.now }, //  Fecha de alta del cliente = lavado
  nombre: { type: String, required: true },         // Nombre del cliente
  patente: { type: String, required: true },        // Patente del vehículo
  solicitudBaja: { type: Boolean, default: false },
  from: { type: String, default: '' },              // telefono
  historialLavados: [{
    confirmacionPorCliente: { type: Boolean, default: false },
    tipoDeLavado: { type: String, required: null },
    fechaIngreso: { type: Date, default: null },
    fechaEgreso: { type: Date, default: null },
    tiempoEspera: { type: Number, default: 0 },
    observacion: { type: String, default: '' },       // Observaciones adicionales
    mensajes: [{
      body: { type: String, default: '' },
      fecha: { type: String, default: '' }
    }],
    puntuacion: { type: Number, default: 0 }
  }],
  lavadosAcumulados: { type: Number, default: 0 },
  promedioTiempo: { type: Number, default: 0 },
  mensajesEnviados: [{
    fecha: { type: String, required: true },
    body: { type: String, required: true }
  }],
  tipoDeLavado: { type: String, required: true },   // Tipo de lavado (Básico, Completo, etc.)
  observacion: { type: String, default: '' },       // Observaciones adicionales
  estado: { type: String, default: 'Pendiente' },    // Estado del lavado (Pendiente, Completado, etc.)
  modelo: { type: String, required: true },         // modelo de vehiculo FORD 208, 
  selected: { type: Boolean, default: false },
  textConfirmation: { type: Boolean, default: false },
  numeroDeFila: { type: Number, default: 0 },
  puntuacionPromedio: { type: Number, default: 0 }
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
  reservas: { type: [reservaSchema], default: [] }, // Lista de reservas
  lavados: { type: [lavadoSchema], default: [] }   // Lista de lavados
});

export default mongoose.model('Admin', adminSchema);
