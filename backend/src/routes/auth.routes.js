import express from 'express';
import { methods as auth } from '../controllers/auth.controller.js';
import { validate, loginSchema, newLocalSchema, crearUsuarioSchema } from '../middleware/validate.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { requireRole } from '../middleware/requireRole.js';

const router = express.Router();

// Públicas
router.post('/login', validate(loginSchema), auth.login);
router.get('/logout', auth.logout);
router.post('/newLocal', validate(newLocalSchema), auth.newLocal);
router.get('/locales', auth.getLocales);
router.get('/locales/:id', auth.getLocalDetails);

// Protegidas
router.get('/admins/:adminId/usuarios', requireAuth, requireRole('Admin'), auth.listarUsuarios);
router.post('/admins/:adminId/usuarios', requireAuth, requireRole('Admin'), validate(crearUsuarioSchema), auth.crearUsuario);
router.put('/admins/:adminId/usuarios/:usuarioId', requireAuth, requireRole('Admin'), auth.editarUsuario);
router.delete('/admins/:adminId/usuarios/:usuarioId', requireAuth, requireRole('Admin'), auth.eliminarUsuario);
router.get('/me', requireAuth, auth.getMe);

export default router;
