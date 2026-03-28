import express from 'express';
import { methods as mensajes } from '../controllers/mensajes.controller.js';
import { requireAuth } from '../middleware/requireAuth.js';

const router = express.Router();

// Públicas (Twilio webhook, QR scan)
router.post('/webhook', mensajes.reciveMessage);
router.get('/qrScanUpdate/:localId', mensajes.qrScanUpdate);

// Protegidas
router.post('/enviarMensajesTemplates', requireAuth, mensajes.enviarMensajesTemplates);
router.post('/dashboardLocalAdmin/:adminId/addMessage', requireAuth, mensajes.addMessage);
router.post('/updateTagSelected/:idLocal', requireAuth, mensajes.updateTagSelected);
router.post('/readyPickUp/:idLocal', requireAuth, mensajes.notifyUserForPickUp);
router.post('/confirmPickedUp/:idLocal', requireAuth, mensajes.notifyUserPickedUp);

export default router;
