import express from 'express';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import { methods as autenthication } from "../controllers/auth.controller.js";


// Obtener __dirname en contexto de módulos ES
const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


// Ruta para recibir mensajes de Twilio
router.post('/webhook', autenthication.reciveMessage);

// Ruta para servir el archivo index.html
router.get('/index', (req, res) => {
    res.sendFile(path.join(__dirname, '../../public/index.html'));
});

// Ruta para servir el archivo index.html
router.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, '../../public/dashboard.html'));
});

// Ruta para notificar al usuario cuando su pedido esté listo
router.post('/notify', autenthication.notifyUser);

export default router;
