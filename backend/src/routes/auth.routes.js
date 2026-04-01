import express from 'express';
import { methods as auth } from '../controllers/auth.controller.js';
import { validate, loginSchema, newLocalSchema, crearUsuarioSchema } from '../middleware/validate.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { requireRole } from '../middleware/requireRole.js';

const router = express.Router();

// Públicas
router.post('/login', validate(loginSchema), auth.login);
router.post('/logout', auth.logout);
router.post('/newLocal', validate(newLocalSchema), auth.newLocal);
router.post('/send-code', auth.sendCode);
router.post('/verify-code', auth.verifyCode);
// /locales y /locales/:id eliminados — exponían datos sensibles sin auth

// Protegidas
router.get('/usuarios', requireAuth, requireRole('Admin'), auth.listarUsuarios);
router.post('/usuarios', requireAuth, requireRole('Admin'), validate(crearUsuarioSchema), auth.crearUsuario);
router.put('/usuarios/:usuarioId', requireAuth, requireRole('Admin'), auth.editarUsuario);
router.delete('/usuarios/:usuarioId', requireAuth, requireRole('Admin'), auth.eliminarUsuario);
router.get('/me', requireAuth, auth.getMe);
router.patch('/tour-status', requireAuth, auth.updateTourStatus);

export default router;
