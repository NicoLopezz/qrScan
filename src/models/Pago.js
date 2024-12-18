import mongoose from 'mongoose';

const pagoSchema = new mongoose.Schema({
  fecha: { type: Date, default: null },
  monto: { type: Number, default: 0 },
  metodo: { type: String, default: '' }
});

export default pagoSchema;
