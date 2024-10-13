import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  from: { type: String, 
    required: true },

  estadoPorBarra: { 
    type: String, 
    default: 'en espera' },

  confirmacionPorCliente: {
    type: Boolean,
    default: false
  },

  tagNumber: { type: Number },  // Asegúrate de que este campo esté definido
  mensajes: [
    {
      body: { type: String, required: true },
      fecha: { type: String, required: true }
    }
  ]
});

export default mongoose.model('Message', messageSchema);


