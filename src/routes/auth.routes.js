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

// Ruta para servir el archivo index
router.get('/index', (req, res) => {
    res.sendFile(path.join(__dirname, '../../public/index.html'));
});


// //ruta para ver el tablero
// router.get('/dashboard', (req, res) => {
//     res.sendFile(path.join(__dirname, '../../public/dashboard.html'));
// });

// //ruta para ver el tablero
// router.get('/dashboardAdmin', (req, res) => {
//     res.sendFile(path.join(__dirname, '../../public/dashboardAdmin.html'));
// });






router.get("/dashboardAdmin", async (req, res) => {
    try {
        await autenthication.changeDbDashboard(req);
        res.sendFile(path.join(__dirname, '../..', '/public/dashboardAdmin.html'));  // Envía solo una respuesta
    } catch (error) {
        console.error("Error al actualizar los movimientos:", error);
        res.status(500).send("Error al actualizar los movimientos");
    }
});














// Ruta para servir el formulario de nuevo local
router.get('/newLocal', (req, res) => {
    res.sendFile(path.join(__dirname, '../../public/register.html'));
});
// Ruta para notificar al usuario cuando su pedido esté listo
router.post('/newLocal', autenthication.newLocal);

// Ruta para servir el formulario de nuevo local
router.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../../public/login.html'));
});
// Ruta para notificar al usuario cuando su pedido esté listo
router.post('/login', autenthication.login);



// Ruta para notificar al usuario cuando su pedido esté listo
router.post('/readyPickUp', autenthication.notifyUserForPickUp);

// Ruta para notificar al usuario que su pedido fue retirado
router.post('/confirmPickedUp', autenthication.notifyUserPickedUp);

// // Ruta para notificar al usuario cuando su pedido esté listo
// router.post('/', autenthication.notifyUserForPickUp);

export default router;
