import mongoose from 'mongoose';

// Esquema para los mensajes asociados a un pedido
const mensajeSchema = new mongoose.Schema({
  body: { type: String, required: true },
  fecha: { type: String, required: true }
});

// Esquema para cada pedido dentro del historial de pedidos del cliente
const pedidoSchema = new mongoose.Schema({
  tagNumber: { type: Number, required: true },           
  fechaPedido: { type: String, required: true },         
  fechaRetiro: { type: String },                         
  tiempoTotal: { type: String },                         
  estadoPorBarra: { type: String, default: 'en espera' }, 
  confirmacionPorCliente: { type: Boolean, default: false }, // <--- Cambiado aquí
  mensajes: [mensajeSchema]                              
});

// Esquema principal del cliente
const clienteSchema = new mongoose.Schema({
  from: { type: String, required: true },                // Número de teléfono del cliente
  historialPedidos: [pedidoSchema],                      // Historial de pedidos realizados por el cliente
  promedioTiempo: { type: String },                      // Promedio de tiempo entre pedido y retiro
});

// Exportar el modelo con el nombre pluralizado 'clientes'
export default mongoose.model('Clientes', clienteSchema, 'clientes');
