import express from 'express';
import { methods as lavados } from '../controllers/lavados.controller.js';
import { validate, agregarLavadoSchema } from '../middleware/validate.js';
import { requireAuth } from '../middleware/requireAuth.js';

const router = express.Router();

// Públicas (QR scan redirect)
router.get('/qrScanUpdateLavados/:localId', lavados.qrScanUpdateLavados);

// Protegidas
router.get('/lavados', requireAuth, lavados.getLavados);
router.get('/admins/:adminId/lavados', requireAuth, lavados.getLavados); // legacy alias
router.post('/admins/agregarLavado', requireAuth, validate(agregarLavadoSchema), lavados.agregarLavado);
router.put('/lavadosModificar', requireAuth, lavados.modificarLavado);
router.patch('/lavados/:lavadoId/actualizarSelectedLavado', requireAuth, lavados.actualizarSelectedLavado);
router.post('/enviarAvisoRetiroLavado', requireAuth, lavados.enviarAvisoRetiroLavado);
router.post('/enviarEncuesta', requireAuth, lavados.enviarEncuesta);
router.get('/cliente/perfil', requireAuth, lavados.getClientePerfil);
router.get('/lavados/buscar', requireAuth, lavados.buscarLavados);

export default router;
