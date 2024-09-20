import express from 'express';
import { receiveMessage, notifyUser } from '../controllers/messageControler.js';

const router = express.Router();

// Ruta para recibir mensajes de Twilio
router.post('/webhook', receiveMessage);

// Ruta para notificar al usuario cuando su pedido esté listo
router.post('/notify', notifyUser);

export default router;
