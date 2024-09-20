import express from 'express';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import { receiveMessage, notifyUser } from '../controllers/messageControler.js';

// Obtener __dirname en contexto de módulos ES
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = express.Router();

// Ruta para recibir mensajes de Twilio
router.post('/webhook', receiveMessage);

// Ruta para servir el archivo index.html
router.get('/index', (req, res) => {
    res.sendFile(path.join(__dirname, '../../public/index.html'));
});

// Ruta para notificar al usuario cuando su pedido esté listo
router.post('/notify', notifyUser);

export default router;
