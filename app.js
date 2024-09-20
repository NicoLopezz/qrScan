import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import messageRoutes from './src/routes/messageRoutes.js';
import connectDB from './db.js'; // Asegúrate de que esta ruta sea correcta


dotenv.config();
const app = express();


connectDB(); // Esto ejecutará el código de conexión

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors());
app.use(express.json());
app.use(express.text());

// Rutas
app.use('/api/messages', messageRoutes);

// Iniciar el servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});
