import express from 'express';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import { methods as autenthication } from "../controllers/auth.controller.js";


// Obtener __dirname en contexto de módulos ES
const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);




router.get("/", async (req, res) => { 
    res.sendFile(path.join(__dirname, '../../public/index.html'));
});
// Ruta para recibir mensajes de Twilio
router.post('/webhook', autenthication.reciveMessage);

// Ruta para servir el archivo index
router.get('/qrScan', (req, res) => {
    res.sendFile(path.join(__dirname, '../../public/qrScan.html'));
});

// Nueva ruta para obtener los locales (API)
router.get('/locales', autenthication.getLocales);

// Ruta para servir el formulario de nuevo local
router.get('/newLocal', (req, res) => {
    res.sendFile(path.join(__dirname, '../../public/register.html'));
});
router.post('/newLocal', autenthication.newLocal);

// Ruta para obtener los detalles de un local específico
router.get('/locales/:id', autenthication.getLocalDetails);

// Ruta para servir el formulario de nuevo local
router.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../../public/login.html'));
});
// Ruta para notificar al usuario cuando su pedido esté listo
router.post('/login', autenthication.login);

// Ruta para servir el formulario de nuevo local
router.get('/dashboardLocalAdmin/:user', autenthication.validateUser, (req, res) => {
    res.sendFile(path.join(__dirname, '../../public/dashboardLocalAdmin.html'));
});
//ruta para ver el tablero
router.get('/dashboar/:user',autenthication.validateUser, (req, res) => {
    res.sendFile(path.join(__dirname, '../../public/dashboard.html'));
});

// Ruta para servir el archivo HTML del dashboard admin
router.get('/dashboardAdmin', (req, res) => {
    res.sendFile(path.join(__dirname, '../../public/dashboardAdmin.html'));
});



router.post('/updateTagSelected/:idLocal', autenthication.updateTagSelected);

// Ruta para notificar al usuario cuando su pedido esté listo
router.post('/readyPickUp/:idLocal', autenthication.notifyUserForPickUp);

// Ruta para notificar al usuario que su pedido fue retirado
router.post('/confirmPickedUp/:idLocal', autenthication.notifyUserPickedUp);

// // Ruta para notificar al usuario cuando su pedido esté listo
// router.post('/', autenthication.notifyUserForPickUp);

  
router.get('/qrScanUpdate/:localId',autenthication.qrScanUpdate, (req, res) => {
    res.send('QR Scan Update Endpoint');
});

export default router;
