import Admin from '../models/adminModel.js';
import Lavado from '../models/Lavado.js';
import { sendMessage, sendTemplateMessage } from '../services/messaging/channelRegistry.js';
import { processIncoming } from '../services/messaging/messageHandler.js';
import { ok, fail } from '../utils/apiResponse.js';

// Webhook de WhatsApp (Twilio) — delega al messageHandler
async function reciveMessage(req, res) {
  res.status(200).send('<Response></Response>');

  const { From: fromWithPrefix, Body: body, To: toWithPrefix } = req.body;
  const from = fromWithPrefix ? fromWithPrefix.replace('whatsapp:', '') : null;
  const to = toWithPrefix ? toWithPrefix.replace('whatsapp:', '').replace('+', '') : null;

  if (!body || !from) return;

  await processIncoming({
    from,
    body,
    channel: 'whatsapp',
    chatId: from,
    adminNumber: to,
  });
}

async function addMessage(req, res) {
  const adminId = req.user.adminId;
  const { body } = req.body;

  try {
    const admin = await Admin.findById(adminId);
    if (!admin) return fail(res, 404, 'Admin/local no encontrado.');

    const client = admin.clientes.find(c => c.from === body.to);
    if (!client) return fail(res, 404, 'Cliente no encontrado.');

    client.mensajesEnviados.push({
      body: body.body,
      fecha: body.fecha,
      hora: body.hora,
    });

    await admin.save();
    return ok(res, null, 'Mensaje guardado exitosamente.');
  } catch (error) {
    return fail(res, 500, 'Error al guardar el mensaje.');
  }
}

async function enviarMensajesTemplates(req, res) {
  try {
    const { clienteId, mensaje } = req.body;
    if (!clienteId) return fail(res, 400, 'No se recibió clienteId');
    if (!mensaje) return fail(res, 400, 'No se recibió el mensaje');

    const lavado = await Lavado.findOne({ _id: clienteId, adminId: req.user.adminId });
    if (!lavado) return fail(res, 404, 'Lavado no encontrado');

    const channel = lavado.channel || 'whatsapp';
    const to = channel === 'telegram' ? lavado.telegramChatId : lavado.from;
    await sendMessage(channel, to, mensaje);

    return ok(res, null, 'Mensaje enviado con éxito');
  } catch (error) {
    return fail(res, 500, 'Error al enviar el mensaje');
  }
}

async function updateTagSelected(req, res) {
  const adminId = req.user.adminId;
  const { tagSelected } = req.body;
  const username = req.cookies.username || 'Usuario desconocido';

  try {
    const admin = await Admin.findById(adminId);
    if (!admin) return fail(res, 404, 'Admin/local no encontrado');

    admin.tagSelected = tagSelected;
    await admin.save();

    return ok(res, {
      localName: admin.localName,
      tagSelected: admin.tagSelected,
      username,
      localNumber: admin.localNumber,
    }, 'Tag seleccionado actualizado');
  } catch (error) {
    return fail(res, 500, 'Error al actualizar el tag seleccionado');
  }
}

async function notifyUserForPickUp(req, res) {
  const fechaRetiro = new Date();
  const adminId = req.user.adminId;
  const { tagNumber } = req.body;

  try {
    const localAdmin = await Admin.findById(adminId);
    if (!localAdmin) return fail(res, 404, 'No se encontró el local');

    const cliente = localAdmin.clientes.find(c =>
      c.historialPedidos.some(p => p.tagNumber === tagNumber && p.estadoPorBarra === 'en espera')
    );

    if (!cliente) return fail(res, 404, 'No se encontró el cliente con este número de tag');

    const pedido = cliente.historialPedidos.find(
      p => p.tagNumber === tagNumber && p.estadoPorBarra === 'en espera'
    );

    if (!pedido) return fail(res, 404, 'No se encontró el pedido en estado "en espera"');

    pedido.fechaRetiro = fechaRetiro;
    pedido.tiempoEspera = Math.floor((fechaRetiro - pedido.fechaPedido) / 1000);
    pedido.estadoPorBarra = 'a confirmar retiro';

    // Enviar via canal del cliente
    const channel = cliente.channel || 'whatsapp';
    const to = channel === 'telegram' ? cliente.telegramChatId : cliente.from;
    await sendMessage(channel, to, 'Tu pedido esta listo para ser retirado!');

    // Recalcular promedio
    const totalPedidos = cliente.historialPedidos.length;
    const totalTiempoEspera = cliente.historialPedidos.reduce((t, p) => t + p.tiempoEspera, 0);
    cliente.promedioTiempo = totalTiempoEspera / totalPedidos;

    await localAdmin.save();
    return ok(res, null, 'Notificación enviada y estado actualizado');
  } catch (error) {
    return fail(res, 500, 'Error al notificar al usuario');
  }
}

async function notifyUserPickedUp(req, res) {
  const { tagNumber } = req.body;

  try {
    const admin = await Admin.findById(req.user.adminId);
    if (!admin) return fail(res, 404, 'No se encontró el local/admin');

    const cliente = admin.clientes.find(c =>
      c.historialPedidos.some(p => p.tagNumber === tagNumber && p.estadoPorBarra === 'a confirmar retiro')
    );

    if (!cliente) return fail(res, 404, 'No se encontró un cliente para este número de tag');

    const pedido = cliente.historialPedidos.find(
      p => p.tagNumber === tagNumber && p.estadoPorBarra === 'a confirmar retiro'
    );

    if (!pedido) return fail(res, 404, 'No se encontró pedido en estado "a confirmar retiro"');

    const channel = cliente.channel || 'whatsapp';
    const to = channel === 'telegram' ? cliente.telegramChatId : cliente.from;
    await sendTemplateMessage(channel, to, ['1', '2', '3']);

    pedido.estadoPorBarra = 'retiro confirmado';
    await admin.save();

    return ok(res, null, 'Notificación enviada y estado actualizado');
  } catch (error) {
    return fail(res, 500, 'Error al notificar al usuario');
  }
}

// QR scan redirect — usa el canal activo del admin
async function qrScanUpdate(req, res) {
  const adminId = req.params.localId;
  const username = req.cookies.username || 'Usuario desconocido';

  try {
    const admin = await Admin.findById(adminId);
    if (!admin) return res.status(404).send('Admin no encontrado');

    const { buildQrRedirectUrl } = await import('../services/messaging/channelRegistry.js');
    const channel = admin.activeChannel || 'telegram';

    const entityData = {
      _id: admin._id,
      tagNumber: admin.tagSelected,
      nombre: username,
    };

    const url = buildQrRedirectUrl(channel, admin, entityData, 'tag');
    res.redirect(url);
  } catch (error) {
    console.error('Error al procesar el QR:', error);
    res.status(500).send('Error al procesar el QR');
  }
}

export const methods = {
  reciveMessage,
  addMessage,
  enviarMensajesTemplates,
  updateTagSelected,
  notifyUserForPickUp,
  notifyUserPickedUp,
  qrScanUpdate,
};
