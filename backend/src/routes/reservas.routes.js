import express from 'express';
import { methods as reservas } from '../controllers/reservas.controller.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { validate, agregarClienteSchema } from '../middleware/validate.js';

const router = express.Router();

// Públicas (QR scan redirect)
router.get('/qrScanUpdateReservas/:localId', reservas.qrScanUpdateReservas);

// Protegidas
router.get('/reservas', requireAuth, reservas.getReservas);
router.post('/admins/agregarCliente', requireAuth, validate(agregarClienteSchema), reservas.agregarCliente);
router.patch('/reservas/:clienteId/updateSelected', requireAuth, reservas.actualizarSelectedCliente);
router.delete('/reservas/:clienteId/eliminar', requireAuth, reservas.eliminarCliente);
router.post('/enviarMensajeCuentaRegresiva', requireAuth, reservas.enviarMensajeCuentaRegresiva);

export default router;
