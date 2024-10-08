import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  from: { type: String, required: true },
  status: { type: String, default: 'en espera' },
  tagNumber: { type: Number },  // Asegúrate de que este campo esté definido
  mensajes: [
    {
      body: { type: String, required: true },
      fecha: { type: String, required: true }
    }
  ]
});

export default mongoose.model('Message', messageSchema);


