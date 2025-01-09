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


router.post('/enviarMensajesTemplates', autenthication.enviarMensajesTemplates);


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
router.get('/qrScanUpdateLavados/:localId', autenthication.qrScanUpdateLavados);
router.post('/enviarMensajeCuentaRegresiva', autenthication.enviarMensajeCuentaRegresiva);
router.post('/enviarAvisoRetiroLavado', autenthication.enviarAvisoRetiroLavado);
router.patch('/reservas/:clienteId/updateSelected', autenthication.actualizarSelectedCliente);
router.patch('/lavados/:lavadoId/actualizarSelectedLavado', autenthication.actualizarSelectedLavado);

// En auth.routes.js o en el archivo de rutas correspondiente
router.delete('/reservas/:clienteId/eliminar', autenthication.eliminarCliente);
router.post('/enviarEncuesta', autenthication.enviarEncuesta)





// Endpoint para obtener reservas de un administrador
router.get('/admins/:adminId/reservas', autenthication.getReservas);
router.get('/admins/:adminId/lavados', autenthication.getLavados);
router.post('/admins/agregarCliente', autenthication.agregarCliente);
router.post('/admins/agregarLavado', autenthication.agregarLavado);
router.post('/admins/agregarLavado', autenthication.agregarLavado);
router.put("/lavadosModificar", autenthication.modificarLavado);




// Endpoint para Ventas
//-> CREAR Y OBTENER ARQUEOS
router.post('/arqueos', autenthication.crearArqueo);
router.get('/arqueos', autenthication.getArqueos);
// router.get('/tiposArqueosAbiertos', autenthication.getTiposArqueosAbiertos);
router.post('/cerrarArqueo/:arqueoId', autenthication.cerrarArqueo);





//->CREAR Y OBTENER MOVS.
router.post("/movimientos", autenthication.crearMovimiento);
router.get("/movimientos", autenthication.getMovimientos);
router.get("/movimientosAbiertos", autenthication.getMovimientosAbiertos);
router.delete("/movimientosEliminar", autenthication.eliminarMovimiento);
router.put("/movimientosModificar", autenthication.modificarMovimiento);





export default router;
