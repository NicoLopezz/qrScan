import mongoose from 'mongoose';

// Esquema para los mensajes asociados a un pedido
const mensajeSchema = new mongoose.Schema({
  body: { type: String, required: true },
  fecha: { type: String, required: true }
});

// Esquema para los pedidos
const pedidoSchema = new mongoose.Schema({
  tagNumber: { type: Number, required: true },
  fechaPedido: { type: Date, required: true },         
  fechaRetiro: { type: Date },                         
  tiempoEspera: { type: Number },   // En segundos
  estadoPorBarra: { type: String, default: 'en espera' }, 
  confirmacionPorCliente: { type: Boolean, default: false },
  mensajes: [mensajeSchema]
});

// Esquema para los clientes
const clienteSchema = new mongoose.Schema({
  solicitudBaja: { type: Boolean, default: false },
  from: { type: String, required: true },
  historialPedidos: [pedidoSchema],
  promedioTiempo: { type: Number }  // En segundos
});

export default mongoose.model('Cliente', clienteSchema, 'clientes');
