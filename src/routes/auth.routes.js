import express from 'express';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import { methods as autenthication } from "../controllers/auth.controller.js";

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Ruta principal
router.get("/", async (req, res) => { 
    res.sendFile(path.join(__dirname, '../../public/index.html'));
});

// Rutas relacionadas con la funcionalidad de Twilio
router.post('/webhook', autenthication.reciveMessage);

// Rutas de archivos estáticos
router.get('/qrScan', (req, res) => {
    res.sendFile(path.join(__dirname, '../../public/pages/qrScan.html'));
});
// Rutas de archivos estáticos
router.get('/qrScanReservas', (req, res) => {
    res.sendFile(path.join(__dirname, '../../public/pages/qrScanReservas.html'));
});


// Rutas de la API para los locales
router.get('/locales', autenthication.getLocales);
router.post('/newLocal', autenthication.newLocal);
router.get('/locales/:id', autenthication.getLocalDetails);

// Rutas para login y dashboard
router.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../../public/pages/login.html'));
});
router.post('/login', autenthication.login);


//Ruta para el usuario Administrador
router.get('/dashboardLocalAdmin/:user', autenthication.validateUser, (req, res) => {
    res.sendFile(path.join(__dirname, '../../public/pages/dashboardAdmin.html'));
});



// Ruta para agregar un mensaje desde el dashboard local admin
router.post('/dashboardLocalAdmin/:adminId/addMessage', autenthication.addMessage);


//Ruta para el usuario estandar.
router.get('/dashboar/:user', autenthication.validateUser, (req, res) => {
    res.sendFile(path.join(__dirname, '../../public/pages/dashboardUser.html'));
});


// Ruta para el dashboard del super administrador
router.get('/dashboardAdmin', (req, res) => {
    res.sendFile(path.join(__dirname, '../../public/pages/dashboardSuperAdmin.html'));
});

// Rutas de acciones específicas en pedidos
router.post('/updateTagSelected/:idLocal', autenthication.updateTagSelected);
router.post('/readyPickUp/:idLocal', autenthication.notifyUserForPickUp);
router.post('/confirmPickedUp/:idLocal', autenthication.notifyUserPickedUp);

// Ruta para actualización de QR
router.get('/qrScanUpdate/:localId', autenthication.qrScanUpdate, (req, res) => {
    res.send('QR Scan Update Endpoint');
});



//RUTA PARA OBTENER LA INFO DE LA RESERVA A GESTIONAR.
router.get('/qrScanUpdateReservas/:localId', autenthication.qrScanUpdateReservas);





router.patch('/reservas/:clienteId/updateSelected', autenthication.actualizarSelectedCliente);





// Endpoint para obtener reservas de un administrador
router.get('/admins/:adminId/reservas', autenthication.getReservas);
router.post('/admins/agregarCliente', autenthication.agregarCliente);






export default router;
