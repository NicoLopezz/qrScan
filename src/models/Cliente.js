import mongoose from 'mongoose';

const clienteSchema = new mongoose.Schema({
  nombre: { type: String, required: false },
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

export default clienteSchema;
