import express from 'express';
import { methods as ctrl } from '../controllers/automatizaciones.controller.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { validate, crearAutomatizacionSchema, actualizarAutomatizacionSchema, broadcastSchema } from '../middleware/validate.js';

const router = express.Router();

// Automatizaciones CRUD
router.get('/automatizaciones', requireAuth, ctrl.listar);
router.post('/automatizaciones', requireAuth, validate(crearAutomatizacionSchema), ctrl.crear);
router.put('/automatizaciones/:id', requireAuth, validate(actualizarAutomatizacionSchema), ctrl.actualizar);
router.delete('/automatizaciones/:id', requireAuth, ctrl.eliminar);
router.patch('/automatizaciones/:id/toggle', requireAuth, ctrl.toggle);

// Broadcast
router.post('/mensajes/broadcast', requireAuth, validate(broadcastSchema), ctrl.broadcast);

// Historial
router.get('/mensajes/historial', requireAuth, ctrl.historial);

// Stats
router.get('/mensajes/stats', requireAuth, ctrl.stats);

// Conversacion de un cliente
router.get('/mensajes/conversacion', requireAuth, ctrl.conversacion);

// Segmentos (conteos para envío rápido)
router.get('/mensajes/segmentos', requireAuth, ctrl.segmentos);

export default router;
