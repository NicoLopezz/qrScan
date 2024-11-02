import mongoose from 'mongoose';

// Esquema para los subusuarios
const usuarioSchema = new mongoose.Schema({
  email: { type: String, default: '' },  // Valor por defecto vacío
  password: { type: String, default: '' },  // Valor por defecto vacío
  permiso: { type: String, default: 'user' }  // Permiso de subusuarios
});

const clienteSchema = new mongoose.Schema({
  solicitudBaja: { type: Boolean, default: false },  // Si el cliente ha solicitado la baja
  from: { type: String, required: true },  // Información del cliente (número de teléfono, etc.)
  historialPedidos: [{
    tagNumber: { type: Number, default: null },  // Número de tag asociado al pedido
    fechaPedido: { type: Date, default: null },  // Fecha en la que se realizó el pedido
    fechaRetiro: { type: Date, default: null },  // Fecha en la que se retiró el pedido
    tiempoEspera: { type: Number, default: 0 },  // Tiempo de espera en segundos
    estadoPorBarra: { type: String, default: '' },  // Estado del pedido por parte del bar
    confirmacionPorCliente: { type: Boolean, default: false },  // Confirmación del cliente
    mensajes: [{
      body: { type: String, default: '' },  // Mensaje enviado
      fecha: { type: String, default: '' }  // Fecha del mensaje
    }]
  }],
  promedioTiempo: { type: Number, default: 0 },  // Promedio del tiempo de espera en segundos
  mensajesEnviados: [{
    fecha: { type: String, required: true },  // Fecha del mensaje (e.g., "2024-10-28")
    // hora: { type: String, required: true },   // Hora del mensaje (e.g., "13:00:00")
    body: { type: String, required: true }    // Contenido del mensaje
  }]
});

// Esquema para los pagos
const pagoSchema = new mongoose.Schema({
  fecha: { type: Date, default: null },  // Fecha del pago
  monto: { type: Number, default: 0 },  // Monto del pago
  metodo: { type: String, default: '' }  // Método de pago utilizado
});

// Esquema para la facturación
const facturacionSchema = new mongoose.Schema({
  cbu: { type: String, default: '' },  // Clave Bancaria Uniforme (CBU)
  medioDePago: { type: String, default: '' },  // Medio de pago (tarjeta, etc.)
  alias: { type: String, default: '' }  // Alias de la cuenta bancaria
});

// Esquema para el administrador del local
const adminSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },  // Email del administrador (único)
  password: { type: String, required: true },  // Contraseña del administrador
  localName: { type: String, required: true },  // Nombre del local
  localNumber: { type: Number, default: 14155238886 },  // Teléfono del local (valor por defecto)
  fechaDeAlta: { type: Date, default: Date.now },  // Fecha de alta del administrador (por defecto: ahora)
  usuarios: { type: [usuarioSchema], default: [] },  // Subusuarios del administrador (array vacío por defecto)
  pagos: { type: [pagoSchema], default: [] },  // Registro de pagos (array vacío por defecto)
  facturacion: { type: facturacionSchema, default: {} },  // Información de facturación (subesquema)
  tipoDeLicencia: { type: String, default: '' },  // Tipo de licencia (básico, premium, etc.)
  fechaRenovacion: { type: Date, default: null },  // Fecha de renovación de la licencia
  mensajesRestantes: { type: String, default: '0/500' },  // Mensajes restantes (por ejemplo: "34/500")
  horariosDeOperacion: { type: String, default: '' },  // Horarios de operación del local
  permiso: { type: String, default: 'Admin' },  // Permiso del administrador (por defecto: Admin)
  passwordActual: { type: String, default: '' },  // Contraseña actual del administrador (opcional)
  tagSelected: { type: Number, default: 0 },  // Número de tag seleccionado
  clientes: { type: [clienteSchema], default: [] },  // Clientes asociados al local (array vacío por defecto)
  reservas: { type: [clienteSchema], default: [] },  // Reservas similares a los clientes (array vacío por defecto)

});

// Exportar el modelo 'Admin'
export default mongoose.model('Admin', adminSchema);
