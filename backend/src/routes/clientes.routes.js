import express from 'express';
import { methods as clientes } from '../controllers/clientes.controller.js';
import { requireAuth } from '../middleware/requireAuth.js';

const router = express.Router();

router.get('/clientes', requireAuth, clientes.getClientes);
router.get('/clientes/:telefono', requireAuth, clientes.getClienteDetalle);
router.put('/clientes/:telefono', requireAuth, clientes.updateCliente);

export default router;
