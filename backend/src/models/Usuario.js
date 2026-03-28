import mongoose from 'mongoose';

const usuarioSchema = new mongoose.Schema({
  email: { type: String, default: '' },
  password: { type: String, default: '' },
  permiso: { type: String, default: 'user' }
});

export default usuarioSchema;
