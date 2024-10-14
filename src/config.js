import { config } from 'dotenv';

config(); // Cargar las variables de entorno

export default {
    mongodbURL: process.env.MONGODB_URI, // La URL de MongoDB cargada desde el archivo .env
};
