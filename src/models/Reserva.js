import mongoose from 'mongoose';

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

export default reservaSchema;
