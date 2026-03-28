import mongoose from 'mongoose';
import Caja, { MEDIOS_PAGO } from '../models/Caja.js';
import Turno from '../models/Turno.js';
import Fondo from '../models/Fondo.js';
import VentaPOS from '../models/VentaPOS.js';
import PagoPOS from '../models/PagoPOS.js';
import { ok, created, fail } from '../utils/apiResponse.js';

// ─── Helpers ───────────────────────────────────────────────

async function calcularBalances(turnoId) {
  const fondos = await Fondo.find({ turnoId });

  const pipeline = [
    { $match: { turnoId: new mongoose.Types.ObjectId(turnoId) } },
    {
      $lookup: {
        from: 'pagopos',
        localField: '_id',
        foreignField: 'ventaId',
        as: 'pagos',
      },
    },
    { $unwind: '$pagos' },
    {
      $group: {
        _id: '$pagos.medioPago',
        total: {
          $sum: {
            $cond: [{ $eq: ['$tipo', 'egreso'] }, { $multiply: ['$pagos.monto', -1] }, '$pagos.monto'],
          },
        },
      },
    },
  ];

  const agg = await VentaPOS.aggregate(pipeline);
  const ventasPorMedio = {};
  for (const r of agg) ventasPorMedio[r._id] = r.total;

  const balances = {};
  for (const f of fondos) {
    balances[f.medioPago] = f.monto + (ventasPorMedio[f.medioPago] || 0);
  }
  // Include medios that have ventas but no fondo
  for (const medio of Object.keys(ventasPorMedio)) {
    if (!(medio in balances)) balances[medio] = ventasPorMedio[medio];
  }

  return { fondos, balances, ventasPorMedio };
}

// ─── Cajas CRUD ────────────────────────────────────────────

async function crearCaja(req, res) {
  try {
    const adminId = req.cookies.adminId;
    const { nombre, mediosPagoHabilitados } = req.body;

    const existe = await Caja.findOne({ adminId, nombre, activa: true });
    if (existe) return fail(res, 409, 'Ya existe una caja con ese nombre.');

    const caja = await Caja.create({
      nombre,
      adminId,
      ...(mediosPagoHabilitados && { mediosPagoHabilitados }),
    });

    return created(res, caja);
  } catch (err) {
    if (err.code === 11000) return fail(res, 409, 'Ya existe una caja con ese nombre.');
    return fail(res, 500, err.message);
  }
}

async function getCajas(req, res) {
  try {
    const adminId = req.cookies.adminId;
    const cajas = await Caja.find({ adminId, activa: true }).sort({ nombre: 1 });
    return ok(res, cajas);
  } catch (err) {
    return fail(res, 500, err.message);
  }
}

async function actualizarCaja(req, res) {
  try {
    const adminId = req.cookies.adminId;
    const { cajaId } = req.params;
    const { nombre, mediosPagoHabilitados } = req.body;

    const caja = await Caja.findOne({ _id: cajaId, adminId, activa: true });
    if (!caja) return fail(res, 404, 'Caja no encontrada.');

    if (nombre !== undefined) caja.nombre = nombre;
    if (mediosPagoHabilitados !== undefined) caja.mediosPagoHabilitados = mediosPagoHabilitados;

    await caja.save();
    return ok(res, caja);
  } catch (err) {
    if (err.code === 11000) return fail(res, 409, 'Ya existe una caja con ese nombre.');
    return fail(res, 500, err.message);
  }
}

async function eliminarCaja(req, res) {
  try {
    const adminId = req.cookies.adminId;
    const { cajaId } = req.params;

    const caja = await Caja.findOne({ _id: cajaId, adminId, activa: true });
    if (!caja) return fail(res, 404, 'Caja no encontrada.');

    const turnoAbierto = await Turno.findOne({ cajaId, estado: 'abierto' });
    if (turnoAbierto) return fail(res, 400, 'No se puede eliminar: hay un turno abierto en esta caja.');

    caja.activa = false;
    await caja.save();
    return ok(res, null, 'Caja eliminada.');
  } catch (err) {
    return fail(res, 500, err.message);
  }
}

// ─── Turnos ────────────────────────────────────────────────

async function abrirTurno(req, res) {
  try {
    const adminId = req.cookies.adminId;
    const { cajaId, fondos } = req.body;

    const caja = await Caja.findOne({ _id: cajaId, adminId, activa: true });
    if (!caja) return fail(res, 404, 'Caja no encontrada.');

    const turnoExistente = await Turno.findOne({ cajaId, estado: 'abierto' });
    if (turnoExistente) return fail(res, 400, 'Ya hay un turno abierto en esta caja.');

    const turno = await Turno.create({ cajaId, adminId, abiertoPor: req.user?.email || '' });

    const fondoDocs = [];
    if (fondos && fondos.length > 0) {
      for (const f of fondos) {
        if (!MEDIOS_PAGO.includes(f.medioPago)) {
          return fail(res, 400, `Medio de pago inválido: ${f.medioPago}`);
        }
        fondoDocs.push({ turnoId: turno._id, medioPago: f.medioPago, monto: f.monto || 0 });
      }
      await Fondo.insertMany(fondoDocs);
    }

    const fondosCreados = await Fondo.find({ turnoId: turno._id });
    return created(res, { turno, fondos: fondosCreados });
  } catch (err) {
    return fail(res, 500, err.message);
  }
}

async function getTurnoActivo(req, res) {
  try {
    const adminId = req.cookies.adminId;
    const { cajaId } = req.query;

    if (!cajaId) return fail(res, 400, 'Se requiere cajaId.');

    const turno = await Turno.findOne({ cajaId, adminId, estado: 'abierto' });
    if (!turno) return fail(res, 404, 'No hay turno activo para esta caja.');

    const { fondos, balances, ventasPorMedio } = await calcularBalances(turno._id);

    const bolsillos = fondos.map(f => ({
      medioPago: f.medioPago,
      fondo: f.monto,
      ingresos: ventasPorMedio[f.medioPago] || 0,
      total: balances[f.medioPago] || f.monto,
    }));
    const totalGeneral = bolsillos.reduce((s, b) => s + b.total, 0);

    return ok(res, { turno, fondos, bolsillos, totalGeneral });
  } catch (err) {
    return fail(res, 500, err.message);
  }
}

async function getTurnos(req, res) {
  try {
    const adminId = req.cookies.adminId;
    const { cajaId, estado, desde, hasta } = req.query;

    const filtro = { adminId };
    if (cajaId) filtro.cajaId = cajaId;
    if (estado) filtro.estado = estado;
    if (desde || hasta) {
      filtro.apertura = {};
      if (desde) filtro.apertura.$gte = new Date(desde);
      if (hasta) filtro.apertura.$lte = new Date(hasta);
    }

    const turnos = await Turno.find(filtro).sort({ apertura: -1 });
    return ok(res, turnos);
  } catch (err) {
    return fail(res, 500, err.message);
  }
}

async function cerrarTurno(req, res) {
  try {
    const adminId = req.cookies.adminId;
    const { turnoId } = req.params;
    const { conteoReal, observacion } = req.body;

    const turno = await Turno.findOne({ _id: turnoId, adminId, estado: 'abierto' });
    if (!turno) return fail(res, 404, 'Turno no encontrado o ya cerrado.');

    const { fondos, balances } = await calcularBalances(turno._id);

    const esperado = new Map();
    const real = new Map();
    const diferencia = new Map();

    // Build expected from balances
    for (const [medio, total] of Object.entries(balances)) {
      esperado.set(medio, total);
    }
    // Also include fondos medios that might have 0 balance
    for (const f of fondos) {
      if (!esperado.has(f.medioPago)) esperado.set(f.medioPago, f.monto);
    }

    // Build real from conteoReal
    for (const [medio, valor] of Object.entries(conteoReal || {})) {
      real.set(medio, valor);
    }

    // Build diferencia
    const allMedios = new Set([...esperado.keys(), ...real.keys()]);
    for (const medio of allMedios) {
      const esp = esperado.get(medio) || 0;
      const re = real.get(medio) || 0;
      diferencia.set(medio, re - esp);
    }

    turno.arqueo = { esperado, real, diferencia, observacion: observacion || '' };
    turno.estado = 'cerrado';
    turno.cierre = new Date();
    turno.cerradoPor = req.user?.email || '';
    await turno.save();

    return ok(res, turno);
  } catch (err) {
    return fail(res, 500, err.message);
  }
}

// ─── Ventas ────────────────────────────────────────────────

async function crearVenta(req, res) {
  try {
    const adminId = req.cookies.adminId;
    const { turnoId, monto, descripcion, pagos, tipo = 'ingreso' } = req.body;

    const montoAbs = Math.abs(monto);

    // Validate pagos sum
    const sumaPagos = pagos.reduce((acc, p) => acc + p.monto, 0);
    if (Math.abs(sumaPagos - montoAbs) > 0.01) {
      return fail(res, 400, `La suma de pagos (${sumaPagos}) no coincide con el monto (${montoAbs}).`);
    }

    const turno = await Turno.findOne({ _id: turnoId, estado: 'abierto' });
    if (!turno) return fail(res, 404, 'Turno no encontrado o cerrado.');

    // Get caja to validate medios de pago
    const caja = await Caja.findById(turno.cajaId);
    for (const p of pagos) {
      if (!caja.mediosPagoHabilitados.includes(p.medioPago)) {
        return fail(res, 400, `Medio de pago no habilitado en esta caja: ${p.medioPago}`);
      }
    }

    const venta = await VentaPOS.create({
      turnoId,
      adminId,
      monto: montoAbs,
      tipo,
      descripcion: descripcion || '',
    });

    const pagoDocs = pagos.map((p) => ({
      ventaId: venta._id,
      medioPago: p.medioPago,
      monto: p.monto,
    }));
    const pagosCreados = await PagoPOS.insertMany(pagoDocs);

    return created(res, { venta, pagos: pagosCreados });
  } catch (err) {
    return fail(res, 500, err.message);
  }
}

async function getVentas(req, res) {
  try {
    const { turnoId } = req.query;
    if (!turnoId) return fail(res, 400, 'Se requiere turnoId.');

    const ventas = await VentaPOS.find({ turnoId }).sort({ fecha: -1 });

    const ventasConPagos = await Promise.all(
      ventas.map(async (v) => {
        const pagos = await PagoPOS.find({ ventaId: v._id });
        return { ...v.toObject(), pagos };
      })
    );

    return ok(res, ventasConPagos);
  } catch (err) {
    return fail(res, 500, err.message);
  }
}

async function editarVenta(req, res) {
  try {
    const { ventaId } = req.params;
    const { descripcion, monto, pagos } = req.body;

    const venta = await VentaPOS.findById(ventaId);
    if (!venta) return fail(res, 404, 'Venta no encontrada.');

    const turno = await Turno.findById(venta.turnoId);
    if (!turno || turno.estado !== 'abierto') {
      return fail(res, 400, 'No se puede editar: el turno ya está cerrado.');
    }

    if (descripcion !== undefined) venta.descripcion = descripcion;
    if (monto !== undefined) venta.monto = monto;
    await venta.save();

    if (pagos && pagos.length > 0) {
      const sumaPagos = pagos.reduce((acc, p) => acc + p.monto, 0);
      if (Math.abs(sumaPagos - venta.monto) > 0.01) {
        return fail(res, 400, `La suma de pagos (${sumaPagos}) no coincide con el monto (${venta.monto}).`);
      }
      await PagoPOS.deleteMany({ ventaId: venta._id });
      const pagoDocs = pagos.map((p) => ({ ventaId: venta._id, medioPago: p.medioPago, monto: p.monto }));
      await PagoPOS.insertMany(pagoDocs);
    }

    const pagosActuales = await PagoPOS.find({ ventaId: venta._id });
    return ok(res, { ...venta.toObject(), pagos: pagosActuales });
  } catch (err) {
    return fail(res, 500, err.message);
  }
}

async function anularVenta(req, res) {
  try {
    const { ventaId } = req.params;

    const venta = await VentaPOS.findById(ventaId);
    if (!venta) return fail(res, 404, 'Venta no encontrada.');

    const turno = await Turno.findById(venta.turnoId);
    if (!turno || turno.estado !== 'abierto') {
      return fail(res, 400, 'No se puede anular: el turno ya está cerrado.');
    }

    await PagoPOS.deleteMany({ ventaId: venta._id });
    await VentaPOS.deleteOne({ _id: venta._id });

    return ok(res, null, 'Venta anulada.');
  } catch (err) {
    return fail(res, 500, err.message);
  }
}

// ─── Detalle de turno (para historial de cierres) ─────────

async function getTurnoDetalle(req, res) {
  try {
    const adminId = req.cookies.adminId;
    const { turnoId } = req.params;

    const turno = await Turno.findOne({ _id: turnoId, adminId });
    if (!turno) return fail(res, 404, 'Turno no encontrado.');

    const caja = await Caja.findById(turno.cajaId);
    const fondos = await Fondo.find({ turnoId });

    const ventas = await VentaPOS.find({ turnoId }).sort({ fecha: -1 });
    const ventasConPagos = await Promise.all(
      ventas.map(async (v) => {
        const pagos = await PagoPOS.find({ ventaId: v._id });
        return { ...v.toObject(), pagos };
      })
    );

    const { balances, ventasPorMedio } = await calcularBalances(turnoId);

    const bolsillos = fondos.map(f => ({
      medioPago: f.medioPago,
      fondo: f.monto,
      ingresos: ventasPorMedio[f.medioPago] || 0,
      total: balances[f.medioPago] || f.monto,
    }));
    const totalGeneral = bolsillos.reduce((s, b) => s + b.total, 0);

    return ok(res, {
      turno,
      caja: caja ? { _id: caja._id, nombre: caja.nombre } : null,
      fondos,
      ventas: ventasConPagos,
      bolsillos,
      totalGeneral,
    });
  } catch (err) {
    return fail(res, 500, err.message);
  }
}

// ─── Resumen semanal de turnos ────────────────────────────

async function getResumenTurnos(req, res) {
  try {
    const adminId = req.cookies.adminId;
    const { desde, hasta } = req.query;

    // Default: current week (Monday to now)
    const now = new Date();
    const monday = new Date(now);
    monday.setDate(now.getDate() - ((now.getDay() + 6) % 7));
    monday.setHours(0, 0, 0, 0);

    const fechaDesde = desde ? new Date(desde) : monday;
    const fechaHasta = hasta ? new Date(hasta) : now;

    const turnos = await Turno.find({
      adminId,
      estado: 'cerrado',
      apertura: { $gte: fechaDesde, $lte: fechaHasta },
    });

    let totalIngresos = 0;
    let totalEgresos = 0;
    let totalDiferencia = 0;
    let peorDiferencia = 0;

    for (const t of turnos) {
      // Sum ventas for this turno
      const ventasAgg = await VentaPOS.aggregate([
        { $match: { turnoId: t._id } },
        {
          $group: {
            _id: '$tipo',
            total: { $sum: '$monto' },
          },
        },
      ]);
      for (const r of ventasAgg) {
        if (r._id === 'ingreso') totalIngresos += r.total;
        if (r._id === 'egreso') totalEgresos += r.total;
      }

      // Sum arqueo differences
      if (t.arqueo && t.arqueo.diferencia) {
        const difs = t.arqueo.diferencia instanceof Map
          ? Array.from(t.arqueo.diferencia.values())
          : Object.values(t.arqueo.diferencia);
        const sumDif = difs.reduce((a, v) => a + v, 0);
        totalDiferencia += sumDif;
        if (Math.abs(sumDif) > Math.abs(peorDiferencia)) peorDiferencia = sumDif;
      }
    }

    return ok(res, {
      totalTurnos: turnos.length,
      totalIngresos,
      totalEgresos,
      totalDiferencia,
      peorDiferencia,
      desde: fechaDesde,
      hasta: fechaHasta,
    });
  } catch (err) {
    return fail(res, 500, err.message);
  }
}

export const methods = {
  crearCaja,
  getCajas,
  actualizarCaja,
  eliminarCaja,
  abrirTurno,
  getTurnoActivo,
  getTurnos,
  cerrarTurno,
  getTurnoDetalle,
  getResumenTurnos,
  crearVenta,
  getVentas,
  editarVenta,
  anularVenta,
};
