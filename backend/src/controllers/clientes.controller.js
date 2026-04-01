import mongoose from 'mongoose';
import Lavado from '../models/Lavado.js';
import Admin from '../models/adminModel.js';
import { ok, fail } from '../utils/apiResponse.js';

function computeSegmento(completados) {
  if (completados >= 9) return 'VIP';
  if (completados >= 5) return 'Frecuente';
  if (completados >= 2) return 'Recurrente';
  return 'Nuevo';
}

// GET /api/clientes — lista agregada de clientes desde Lavado
async function getClientes(req, res) {
  try {
    const adminId = new mongoose.Types.ObjectId(req.user.adminId);
    const { q } = req.query;

    const pipeline = [
      { $match: { adminId, from: { $ne: '' } } },
      {
        $group: {
          _id: '$from',
          nombre: { $last: '$nombre' },
          totalLavados: { $sum: 1 },
          completados: {
            $sum: {
              $cond: [{ $in: ['$estado', ['Completado', 'Retirado']] }, 1, 0],
            },
          },
          totalGastado: { $sum: { $ifNull: ['$monto', 0] } },
          sumaCalidad: {
            $sum: {
              $cond: [{ $gt: ['$puntuacionCalidad', 0] }, '$puntuacionCalidad', 0],
            },
          },
          countCalidad: {
            $sum: {
              $cond: [{ $gt: ['$puntuacionCalidad', 0] }, 1, 0],
            },
          },
          ultimaVisita: { $max: '$fechaDeAlta' },
          primerVisita: { $min: '$fechaDeAlta' },
          vehiculos: { $addToSet: '$patente' },
          channel: { $last: '$channel' },
        },
      },
      {
        $addFields: {
          promedioCalidad: {
            $cond: [
              { $gt: ['$countCalidad', 0] },
              { $round: [{ $divide: ['$sumaCalidad', '$countCalidad'] }, 1] },
              0,
            ],
          },
          segmento: {
            $switch: {
              branches: [
                { case: { $gte: ['$completados', 9] }, then: 'VIP' },
                { case: { $gte: ['$completados', 5] }, then: 'Frecuente' },
                { case: { $gte: ['$completados', 2] }, then: 'Recurrente' },
              ],
              default: 'Nuevo',
            },
          },
        },
      },
      { $project: { sumaCalidad: 0, countCalidad: 0 } },
      { $sort: { ultimaVisita: -1 } },
    ];

    // Filtro de búsqueda
    if (q && q.length >= 2) {
      const escaped = q.replace(/\s+/g, '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(escaped, 'i');
      pipeline.push({
        $match: {
          $or: [
            { nombre: { $regex: regex } },
            { _id: { $regex: regex } }, // _id es el teléfono
            { vehiculos: { $elemMatch: { $regex: regex } } },
          ],
        },
      });
    }

    const clientes = await Lavado.aggregate(pipeline);
    return ok(res, clientes);
  } catch (error) {
    console.error('Error getClientes:', error.message);
    return fail(res, 500, 'Error al obtener clientes');
  }
}

// GET /api/clientes/:telefono — perfil detallado
async function getClienteDetalle(req, res) {
  try {
    const adminId = req.user.adminId;
    const telefono = decodeURIComponent(req.params.telefono);

    const lavadosCliente = await Lavado.find({ adminId, from: telefono }).sort({ fechaDeAlta: -1 });

    if (lavadosCliente.length === 0) return fail(res, 404, 'Cliente no encontrado');

    const admin = await Admin.findById(adminId);
    const clienteEmbedido = admin?.clientes.find(c => c.from === telefono);

    const totalLavados = lavadosCliente.length;
    const completados = lavadosCliente.filter(l => l.estado === 'Completado' || l.estado === 'Retirado');
    const calificaciones = lavadosCliente.filter(l => l.puntuacionCalidad > 0);
    const promedioCalidad = calificaciones.length > 0
      ? Math.round((calificaciones.reduce((s, l) => s + l.puntuacionCalidad, 0) / calificaciones.length) * 10) / 10
      : 0;
    const totalGastado = lavadosCliente.reduce((s, l) => s + (l.monto || 0), 0);

    // Referidos
    const referidoPorLavado = lavadosCliente.find(l => l.referidoPor);
    const referidoPor = referidoPorLavado?.referidoPor || '';
    let referidoPorNombre = '';
    if (referidoPor) {
      const refLavado = await Lavado.findOne({ adminId, from: referidoPor }).select('nombre');
      referidoPorNombre = refLavado?.nombre || referidoPor;
    }

    const referidosTelefonos = await Lavado.distinct('from', { adminId, referidoPor: telefono });
    const referidos = referidosTelefonos.length;

    const vehiculos = [...new Set(lavadosCliente.map(l => l.patente).filter(Boolean))];

    const perfil = {
      telefono,
      nombre: lavadosCliente[0]?.nombre || clienteEmbedido?.nombre || 'Desconocido',
      totalLavados,
      totalCompletados: completados.length,
      segmento: computeSegmento(completados.length),
      promedioCalidad,
      totalGastado,
      vehiculos,
      channel: lavadosCliente[0]?.channel || '',
      telegramChatId: lavadosCliente[0]?.telegramChatId || '',
      primerVisita: lavadosCliente.length > 0
        ? lavadosCliente.reduce((min, l) => new Date(l.fechaDeAlta) < new Date(min) ? l.fechaDeAlta : min, lavadosCliente[0].fechaDeAlta)
        : null,
      ultimaVisita: lavadosCliente.length > 0
        ? lavadosCliente.reduce((max, l) => new Date(l.fechaDeAlta) > new Date(max) ? l.fechaDeAlta : max, lavadosCliente[0].fechaDeAlta)
        : null,
      referidoPor,
      referidoPorNombre,
      referidos,
      notas: clienteEmbedido?.notas || '',
      lavados: lavadosCliente.map(l => ({
        _id: l._id,
        fecha: l.fechaDeAlta,
        modelo: l.modelo,
        patente: l.patente,
        tipoDeLavado: l.tipoDeLavado,
        estado: l.estado,
        monto: l.monto,
        calidad: l.calidad,
        puntuacionCalidad: l.puntuacionCalidad,
      })),
      mensajes: clienteEmbedido?.mensajesEnviados || [],
    };

    return ok(res, perfil);
  } catch (error) {
    console.error('Error getClienteDetalle:', error.message);
    return fail(res, 500, 'Error al obtener perfil del cliente');
  }
}

// PUT /api/clientes/:telefono — actualizar notas y referidoPor
async function updateCliente(req, res) {
  try {
    const adminId = req.user.adminId;
    const telefono = decodeURIComponent(req.params.telefono);
    const { notas, referidoPor } = req.body;

    const admin = await Admin.findById(adminId);
    if (!admin) return fail(res, 404, 'Admin no encontrado');

    // Guardar notas en admin.clientes[]
    if (notas !== undefined) {
      let cliente = admin.clientes.find(c => c.from === telefono);
      if (!cliente) {
        const lavado = await Lavado.findOne({ adminId, from: telefono }).select('nombre');
        admin.clientes.push({ from: telefono, nombre: lavado?.nombre || '', notas });
      } else {
        cliente.notas = notas;
      }
      await admin.save();
    }

    // Guardar referidoPor en lavados sin referidoPor
    if (referidoPor !== undefined) {
      await Lavado.updateMany(
        { adminId, from: telefono, referidoPor: '' },
        { referidoPor }
      );
    }

    return ok(res, null, 'Cliente actualizado');
  } catch (error) {
    console.error('Error updateCliente:', error.message);
    return fail(res, 500, 'Error al actualizar cliente');
  }
}

export const methods = {
  getClientes,
  getClienteDetalle,
  updateCliente,
};
