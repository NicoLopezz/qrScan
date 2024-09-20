import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import messageRoutes from './src/routes/messageRoutes.js';
import connectDB from './db.js'; // Asegúrate de que esta ruta sea correcta
import path from 'path';

dotenv.config();
const app = express();

// Conectar a la base de datos
connectDB();

// Middleware para analizar el cuerpo de las solicitudes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Middleware para servir archivos estáticos desde la carpeta "public"
app.use(express.static(path.join(process.cwd(), 'public')));

// Rutas
app.use('/api/messages', messageRoutes);

// Iniciar el servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});
