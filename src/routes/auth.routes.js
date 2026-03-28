import express from 'express';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import { methods as autenthication } from "../controllers/auth.controller.js";
import { methods as lavados } from "../controllers/lavados.controller.js";
import { methods as reservas } from "../controllers/reservas.controller.js";
import { methods as caja } from "../controllers/caja.controller.js";
import { methods as mensajes } from "../controllers/mensajes.controller.js";
import { validate, loginSchema, newLocalSchema, crearUsuarioSchema, agregarLavadoSchema, crearMovimientoSchema } from "../middleware/validate.js";

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Logout — limpia el JWT
router.get('/logout', (req, res) => {
  res.clearCookie('token');
  res.redirect('/api/login');
});

// Ruta principal
router.get("/", async (req, res) => {
    res.sendFile(path.join(__dirname, '../../public/index.html'));
});

// Rutas relacionadas con la funcionalidad de Twilio
router.post('/webhook', mensajes.reciveMessage);

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
router.post('/newLocal', validate(newLocalSchema), autenthication.newLocal);
router.get('/locales/:id', autenthication.getLocalDetails);

// Rutas para login y dashboard
router.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../../public/pages/login.html'));
});
router.post('/login', validate(loginSchema), autenthication.login);

//Ruta para el usuario Administrador
router.get('/dashboardLocalAdmin/:user', autenthication.validateUser, (req, res) => {
    res.sendFile(path.join(__dirname, '../../public/pages/dashboardAdmin.html'));
});


router.post('/enviarMensajesTemplates', mensajes.enviarMensajesTemplates);


// Ruta para agregar un mensaje desde el dashboard local admin
router.post('/dashboardLocalAdmin/:adminId/addMessage', mensajes.addMessage);


//Ruta para el usuario estandar.
router.get('/dashboar/:user', autenthication.validateUser, (req, res) => {
    res.sendFile(path.join(__dirname, '../../public/pages/dashboardUser.html'));
});


// Ruta para el dashboard del super administrador
router.get('/dashboardAdmin', (req, res) => {
    res.sendFile(path.join(__dirname, '../../public/pages/dashboardSuperAdmin.html'));
});

// Rutas de acciones específicas en pedidos
router.post('/updateTagSelected/:idLocal', mensajes.updateTagSelected);
router.post('/readyPickUp/:idLocal', mensajes.notifyUserForPickUp);
router.post('/confirmPickedUp/:idLocal', mensajes.notifyUserPickedUp);

// Ruta para actualización de QR
router.get('/qrScanUpdate/:localId', mensajes.qrScanUpdate, (req, res) => {
    res.send('QR Scan Update Endpoint');
});



//RUTA PARA OBTENER LA INFO DE LA RESERVA A GESTIONAR.
router.get('/qrScanUpdateReservas/:localId', reservas.qrScanUpdateReservas);
router.get('/qrScanUpdateLavados/:localId', lavados.qrScanUpdateLavados);
router.post('/enviarMensajeCuentaRegresiva', reservas.enviarMensajeCuentaRegresiva);
router.post('/enviarAvisoRetiroLavado', lavados.enviarAvisoRetiroLavado);
router.patch('/reservas/:clienteId/updateSelected', reservas.actualizarSelectedCliente);
router.patch('/lavados/:lavadoId/actualizarSelectedLavado', lavados.actualizarSelectedLavado);

// En auth.routes.js o en el archivo de rutas correspondiente
router.delete('/reservas/:clienteId/eliminar', reservas.eliminarCliente);
router.post('/enviarEncuesta', lavados.enviarEncuesta)




// Endpoint para obtener reservas de un administrador
router.get('/admins/:adminId/reservas', reservas.getReservas);
router.get('/admins/:adminId/lavados', lavados.getLavados);
router.post('/admins/agregarCliente', reservas.agregarCliente);
router.post('/admins/agregarLavado', validate(agregarLavadoSchema), lavados.agregarLavado);
router.post('/admins/:adminId/usuarios', validate(crearUsuarioSchema), autenthication.crearUsuario);
router.put("/lavadosModificar", lavados.modificarLavado);




// Endpoint para Ventas
//-> CREAR Y OBTENER ARQUEOS
router.post('/arqueos', caja.crearArqueo);
router.get('/arqueos', caja.getArqueos);
router.get('/arqueosBalances', caja.getArqueosBalances);
// router.get('/tiposArqueosAbiertos', caja.getTiposArqueosAbiertos);
router.post('/cerrarArqueo/:arqueoId', caja.cerrarArqueo);




//->CREAR Y OBTENER MOVS.
router.post("/movimientos", validate(crearMovimientoSchema), caja.crearMovimiento);
router.get("/movimientos", caja.getMovimientos);
router.get("/movimientosAbiertos", caja.getMovimientosAbiertos);
router.delete("/movimientosEliminar", caja.eliminarMovimiento);
router.put("/movimientosModificar", caja.modificarMovimiento);




export default router;
