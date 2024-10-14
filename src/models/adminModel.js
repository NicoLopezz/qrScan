import mongoose from 'mongoose';

const adminSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    localNumber: { type: Number, required: true },
    nameRef: { type: String, required: true },
    password: { type: String, required: true }, // Asegúrate de encriptar las contraseñas antes de guardar
});

// Exportar el modelo con el nombre pluralizado 'clientes'
export default mongoose.model('Admin', adminSchema);
