import express from 'express';
import { methods as mensajes } from '../controllers/mensajes.controller.js';
import { telegramWebhook } from '../controllers/telegram.controller.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { validateTwilioRequest } from '../middleware/validateTwilio.js';

const router = express.Router();

// Públicas (webhooks, QR scan)
router.post('/webhook', validateTwilioRequest, mensajes.reciveMessage);
router.post('/telegram/webhook', telegramWebhook);
router.get('/qrScanUpdate/:localId', mensajes.qrScanUpdate);

// Protegidas
router.post('/enviarMensajesTemplates', requireAuth, mensajes.enviarMensajesTemplates);
router.post('/addMessage', requireAuth, mensajes.addMessage);
router.post('/updateTagSelected', requireAuth, mensajes.updateTagSelected);
router.post('/readyPickUp', requireAuth, mensajes.notifyUserForPickUp);
router.post('/confirmPickedUp', requireAuth, mensajes.notifyUserPickedUp);

export default router;
