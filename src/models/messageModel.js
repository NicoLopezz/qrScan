import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  from: { type: String, required: true },
  status: { type: String, default: 'en espera' },  // Campo de estado con valor por defecto 'en espera'
  mensajes: [
    {
      body: { type: String, required: true },
      fecha: { type: String, required: true },    // Almacena la fecha y hora en formato personalizado
      _id: false
    }
  ]
});

export default mongoose.model('Message', messageSchema);
