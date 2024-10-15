import mongoose from 'mongoose';

// Esquema para los subusuarios
const usuarioSchema = new mongoose.Schema({
  name: { type: String, default: '' },  // Valor por defecto vacío
  password: { type: String, default: '' },  // Valor por defecto vacío
  permiso: { type: String, default: 'user' }  // Permiso de subusuarios
});

// Esquema para los clientes
const clienteSchema = new mongoose.Schema({
  solicitudBaja: { type: Boolean, default: false },
  from: { type: String, required: true },
  historialPedidos: [{
    tagNumber: { type: Number, default: null },
    fechaPedido: { type: Date, default: null },
    fechaRetiro: { type: Date, default: null },
    tiempoEspera: { type: Number, default: 0 },  // En segundos
    estadoPorBarra: { type: String, default: '' },
    confirmacionPorCliente: { type: Boolean, default: false },
    mensajes: [{
      body: { type: String, default: '' },
      fecha: { type: String, default: '' }
    }]
  }],
  promedioTiempo: { type: Number, default: 0 }
});

// Esquema para los pagos
const pagoSchema = new mongoose.Schema({
  fecha: { type: Date, default: null },
  monto: { type: Number, default: 0 },
  metodo: { type: String, default: '' }
});

// Esquema para el administrador del local
const adminSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  localName: { type: String, required: true },
  localNumber: { type: Number, default: null },  // Valor por defecto null si no se proporciona
  usuarios: { type: [usuarioSchema], default: [] },  // Inicializar como array vacío
  clientes: { type: [clienteSchema], default: [] },  // Inicializar como array vacío
  pagos: { type: [pagoSchema], default: [] },  // Inicializar como array vacío
  facturacion: {
    cbu: { type: String, default: '' },
    medioDePago: { type: String, default: '' },
    alias: { type: String, default: '' }
  },
  tipoDeLicencia: { type: String, default: '' },
  fechaDeAlta: { type: Date, default: Date.now },  // Fecha por defecto: ahora
  horariosDeOperacion: { type: String, default: '' },
  permiso: { type: String, default: 'Admin' }
});

// Exportar el modelo 'Admin'
export default mongoose.model('Admin', adminSchema);
