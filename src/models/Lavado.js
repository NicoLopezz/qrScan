import mongoose from 'mongoose';

const lavadoSchema = new mongoose.Schema({
  fechaDeAlta: { type: Date, default: Date.now },
  nombre: { type: String, required: true },
  patente: { type: String, required: true },
  empresa: { type: String, required: false },
  solicitudBaja: { type: Boolean, default: false },
  from: { type: String, default: '' },
  calidad: { type: String, default: '' },
  puntuacionCalidad: { type: Number, default: 0 },
  historialLavados: [{
    confirmacionPorCliente: { type: Boolean, default: false },
    tipoDeLavado: { type: String, required: null },
    fechaIngreso: { type: Date, default: null },
    fechaEgreso: { type: Date, default: null },
    tiempoEspera: { type: Number, default: 0 },
    observacion: { type: String, default: '' },
    calidad: { type: String, default: '' },
    puntuacionCalidad: { type: Number, default: 0 },
    mensajes: [{
      body: { type: String, default: '' },
      fecha: { type: String, default: '' }
    }]
  }],
  lavadosAcumulados: { type: Number, default: 0 },
  promedioTiempo: { type: Number, default: 0 },
  mensajesEnviados: [{
    fecha: { type: String, required: true },
    body: { type: String, required: true }
  }],
  tipoDeLavado: { type: String, required: true },
  observacion: { type: String, default: '' },
  estado: { type: String, default: 'Pendiente' },
  modelo: { type: String, required: true },
  selected: { type: Boolean, default: false },
  textConfirmation: { type: Boolean, default: false },
  numeroDeFila: { type: Number, default: 0 },
  puntuacionPromedio: { type: Number, default: 0 }
});

export default lavadoSchema;
