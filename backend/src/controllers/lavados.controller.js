import Lavado from '../models/Lavado.js';
import Admin from '../models/adminModel.js';
import { sendMessage, sendTemplateMessage, buildQrRedirectUrl } from '../services/messaging/channelRegistry.js';
import { crearVentaDesdeLavado } from '../services/ventaService.js';
import { ok, created, fail } from '../utils/apiResponse.js';

// AGREGAR LAVADO
async function agregarLavado(req, res) {
  const { nombre, modelo, patente, empresa, tipoDeLavado, observacion } = req.body;

  try {
    const adminId = req.user.adminId;

    const lavado = await Lavado.create({
      adminId,
      nombre,
      modelo,
      patente,
      empresa,
      tipoDeLavado,
      observacion,
      estado: 'Pendiente',
    });

    return created(res, lavado, 'Lavado agregado con éxito');
  } catch (error) {
    return fail(res, 500, 'Error al agregar lavado');
  }
}

// Obtener lavados de un administrador
async function getLavados(req, res) {
  const adminId = req.user.adminId;

  try {
    const lavados = await Lavado.find({ adminId }).sort({ fechaDeAlta: -1 });
    return ok(res, lavados);
  } catch (error) {
    return fail(res, 500, 'Error al obtener los lavaderos');
  }
}

async function actualizarSelectedLavado(req, res) {
  const lavadoId = req.params.lavadoId;
  const adminId = req.user.adminId;

  try {
    const lavado = await Lavado.findOne({ _id: lavadoId, adminId });
    if (!lavado) return fail(res, 404, 'Lavado no encontrado');

    // Desmarcar todos los lavados del mismo admin
    await Lavado.updateMany({ adminId }, { selected: false });

    // Marcar el seleccionado
    lavado.selected = true;
    await lavado.save();

    return ok(res, lavado, 'Lavado actualizado correctamente');
  } catch (error) {
    return fail(res, 500, 'Error al actualizar el lavado');
  }
}

// QR scan redirect — usa el canal activo del admin
async function qrScanUpdateLavados(req, res) {
  const adminId = req.params.localId;

  try {
    const lavado = await Lavado.findOne({ adminId, selected: true });
    if (!lavado) return res.status(404).send('No se encontró ningún lavado seleccionado');

    const admin = await Admin.findById(adminId);
    if (!admin) return res.status(404).send('Admin no encontrado');

    const channel = admin.activeChannel || 'telegram';
    const url = buildQrRedirectUrl(channel, admin, lavado, 'lavado');
    res.redirect(url);
  } catch (error) {
    res.status(500).send('Error al procesar el QR');
  }
}

// Función para enviar aviso de retiro de lavado
async function enviarAvisoRetiroLavado(req, res) {
  try {
    const { clienteId } = req.body;
    if (!clienteId) return fail(res, 400, 'No se recibió clienteId');

    const lavado = await Lavado.findOne({ _id: clienteId, adminId: req.user.adminId });
    if (!lavado) return fail(res, 404, 'Lavado no encontrado');

    const historialDisponible = lavado.historialLavados.find(h => h.fechaEgreso === null);
    if (!historialDisponible) return fail(res, 404, 'No hay historial de lavado disponible.');

    const fechaActual = new Date();
    historialDisponible.fechaEgreso = fechaActual;

    const fechaIngreso = new Date(historialDisponible.fechaIngreso);
    const diferenciaMinutos = Math.floor((fechaActual - fechaIngreso) / 60000);
    historialDisponible.tiempoEspera = diferenciaMinutos;

    await lavado.save();

    const mensaje = `Hola, ${lavado.nombre} 👋, ¡tenemos buenas noticias! 🎉
Tu vehículo con patente **${lavado.patente}** está listo para ser retirado. 🧼🚗

Gracias por confiar en nosotros y por elegir nuestro servicio.

🌟 **Promoción especial:**
¡Acumula 3 servicios de lavado y el próximo será gratis! 🎁
Con este lavado, ya tienes **1 de 3 estrellas** ⭐.

¡Gracias por tu preferencia y esperamos verte pronto! 🌟`;

    const channel = lavado.channel || 'whatsapp';
    const to = channel === 'telegram' ? lavado.telegramChatId : lavado.from;
    await sendMessage(channel, to, mensaje);

    return ok(res, { tiempoEspera: diferenciaMinutos }, 'Mensaje enviado con éxito');
  } catch (error) {
    return fail(res, 500, 'Error al enviar el mensaje');
  }
}

// ENDPOINT: Modificar lavado
async function modificarLavado(req, res) {
  const { lavadoId, medioPago, patente, estado, monto } = req.body;

  if (!lavadoId || !medioPago || !estado || monto === undefined || isNaN(parseFloat(monto))) {
    return fail(res, 400, 'Faltan parámetros requeridos (lavadoId, medioPago, estado, monto).');
  }

  try {
    const lavado = await Lavado.findOne({ _id: lavadoId, adminId: req.user.adminId });
    if (!lavado) return fail(res, 404, 'No se encontró el lavado con el ID especificado.');

    lavado.medioPago = medioPago;
    lavado.estado = estado;
    lavado.monto = parseFloat(monto);
    await lavado.save();

    // Auto-crear venta en POS si el lavado se completa con pago
    if (estado === 'Completado' && monto > 0 && medioPago !== '---') {
      try {
        await crearVentaDesdeLavado({
          adminId: lavado.adminId,
          lavadoId,
          monto: parseFloat(monto),
          medioPago,
          descripcion: `Lavado - ${lavado.nombre} (${lavado.patente})`,
        });
      } catch (e) {
        console.error('Auto-venta failed:', e.message);
      }
    }

    return ok(res, lavado, 'Lavado modificado con éxito.');
  } catch (error) {
    return fail(res, 500, 'Error interno del servidor.');
  }
}

// Función para enviar encuesta
async function enviarEncuesta(req, res) {
  try {
    const { clienteId } = req.body;
    if (!clienteId) return fail(res, 400, 'No se recibió clienteId');

    const lavado = await Lavado.findOne({ _id: clienteId, adminId: req.user.adminId });
    if (!lavado) return fail(res, 404, 'Lavado no encontrado');

    const templateParams = [
      lavado.nombre,
      lavado.patente,
      '1 de 3 estrellas',
    ];

    const channel = lavado.channel || 'whatsapp';
    const to = channel === 'telegram' ? lavado.telegramChatId : lavado.from;
    await sendTemplateMessage(channel, to, templateParams);

    return ok(res, null, 'Mensaje de plantilla enviado con éxito');
  } catch (error) {
    return fail(res, 500, 'Error al enviar el mensaje');
  }
}

// Perfil del cliente: historial de lavados, puntuaciones, mensajes
async function getClientePerfil(req, res) {
  try {
    const adminId = req.user.adminId;
    const { telefono } = req.query;

    if (!telefono) return fail(res, 400, 'Se requiere telefono');

    const lavadosCliente = await Lavado.find({ adminId, from: telefono }).sort({ fechaDeAlta: -1 });

    // Buscar en clientes tambien (sigue embebido en admin)
    const admin = await Admin.findById(adminId);
    const cliente = admin?.clientes.find(c => c.from === telefono);

    // Calcular stats
    const totalLavados = lavadosCliente.length;
    const completados = lavadosCliente.filter(l => l.estado === 'Completado' || l.estado === 'Retirado');
    const calificaciones = lavadosCliente.filter(l => l.puntuacionCalidad > 0);
    const promedioCalidad = calificaciones.length > 0
      ? calificaciones.reduce((s, l) => s + l.puntuacionCalidad, 0) / calificaciones.length
      : 0;
    const totalGastado = lavadosCliente.reduce((s, l) => s + (l.monto || 0), 0);

    const historialCalidad = calificaciones.map(l => ({
      fecha: l.fechaDeAlta,
      calidad: l.calidad,
      puntuacion: l.puntuacionCalidad,
      tipoDeLavado: l.tipoDeLavado,
      patente: l.patente,
    }));

    const perfil = {
      telefono,
      nombre: lavadosCliente[0]?.nombre || cliente?.nombre || 'Desconocido',
      totalLavados,
      totalCompletados: completados.length,
      promedioCalidad: Math.round(promedioCalidad * 10) / 10,
      totalGastado,
      primerVisita: lavadosCliente.length > 0
        ? lavadosCliente.reduce((min, l) => new Date(l.fechaDeAlta) < new Date(min) ? l.fechaDeAlta : min, lavadosCliente[0].fechaDeAlta)
        : null,
      ultimaVisita: lavadosCliente.length > 0
        ? lavadosCliente.reduce((max, l) => new Date(l.fechaDeAlta) > new Date(max) ? l.fechaDeAlta : max, lavadosCliente[0].fechaDeAlta)
        : null,
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
      historialCalidad,
      mensajes: cliente?.mensajesEnviados || [],
      reviews: [],
    };

    return ok(res, perfil);
  } catch (error) {
    return fail(res, 500, 'Error al obtener perfil');
  }
}

async function buscarLavados(req, res) {
  try {
    const adminId = req.user.adminId;
    const { q } = req.query;

    if (!q || q.length < 2) return ok(res, []);

    const escaped = q.replace(/\s+/g, '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escaped, 'i');

    const resultados = await Lavado.find({
      adminId,
      $or: [
        { patente: regex },
        { nombre: regex },
        { modelo: regex },
      ],
    })
      .sort({ fechaDeAlta: -1 })
      .select('nombre modelo patente tipoDeLavado estado monto medioPago calidad puntuacionCalidad from fechaDeAlta observacion');

    return ok(res, resultados);
  } catch (error) {
    return fail(res, 500, 'Error en la busqueda');
  }
}

export const methods = {
  agregarLavado,
  getLavados,
  actualizarSelectedLavado,
  qrScanUpdateLavados,
  enviarAvisoRetiroLavado,
  modificarLavado,
  enviarEncuesta,
  getClientePerfil,
  buscarLavados,
};
