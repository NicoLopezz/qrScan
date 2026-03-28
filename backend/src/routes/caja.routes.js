import express from 'express';
import { methods as caja } from '../controllers/caja.controller.js';
import { requireAuth } from '../middleware/requireAuth.js';

const router = express.Router();

// Cajas
router.post('/cajas', requireAuth, caja.crearCaja);
router.get('/cajas', requireAuth, caja.getCajas);
router.put('/cajas/:cajaId', requireAuth, caja.actualizarCaja);
router.delete('/cajas/:cajaId', requireAuth, caja.eliminarCaja);

// Turnos
router.post('/turnos', requireAuth, caja.abrirTurno);
router.get('/turnos/activo', requireAuth, caja.getTurnoActivo);
router.get('/turnos/resumen', requireAuth, caja.getResumenTurnos);
router.get('/turnos', requireAuth, caja.getTurnos);
router.post('/turnos/:turnoId/cerrar', requireAuth, caja.cerrarTurno);
router.get('/turnos/:turnoId/detalle', requireAuth, caja.getTurnoDetalle);

// Ventas
router.post('/ventas', requireAuth, caja.crearVenta);
router.get('/ventas', requireAuth, caja.getVentas);
router.put('/ventas/:ventaId', requireAuth, caja.editarVenta);
router.delete('/ventas/:ventaId', requireAuth, caja.anularVenta);

export default router;
