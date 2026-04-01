import Admin from '../../models/adminModel.js';
import Lavado from '../../models/Lavado.js';
import { sendMessage, sendTemplateMessage } from './channelRegistry.js';

/**
 * Procesa un mensaje entrante — independiente del canal.
 * @param {{ from: string, body: string, channel: string, chatId: string, adminNumber: string }} params
 */
export async function processIncoming({ from, body, channel, chatId, adminNumber }) {
  if (!body) return;

  const text = body.toLowerCase();

  const reply = async (message) => {
    if (channel === 'telegram') {
      await sendMessage('telegram', chatId, message);
    } else {
      await sendMessage('whatsapp', from, message);
    }
  };

  try {
    if (text.includes('reserva')) {
      await handleReservaMessage(body, from, channel, chatId, reply);
    } else if (text.includes('número de tag')) {
      const localAdmin = await Admin.findOne({ localNumber: adminNumber });
      if (localAdmin) await handleTagMessage(body, from, channel, chatId, localAdmin, reply);
    } else if (text.includes('ya lo tengo')) {
      await handleConfirmationMessage(from, channel, chatId, reply);
    } else if (text.includes('lavado')) {
      await handleLavadoMessage(body, from, channel, chatId, reply);
    } else if (text.includes('baja')) {
      await handleBajaRequest(from, reply);
    } else if (['excelente', 'regular', 'bueno'].some(p => text.includes(p))) {
      const palabraClave = ['excelente', 'regular', 'bueno'].find(p => text.includes(p));
      await actualizarEncuestaEnDB(from, palabraClave);
      await reply(`Muchas gracias por completar nuestra encuesta! Tu opinion "${palabraClave}" es muy valiosa para nosotros.`);
    }
  } catch (error) {
    console.error('Error al procesar mensaje entrante:', error.message);
  }
}

/**
 * Procesa un deep link de Telegram (/start payload)
 * Payload format: flowType_adminId_entityCode
 */
export async function processDeepLink({ payload, chatId, telegramFrom }) {
  const parts = payload.split('_');
  if (parts.length < 3) return;

  const [flowType, adminId, code] = parts;
  const flow = flowType.startsWith('lav') ? 'lavado' : flowType.startsWith('res') ? 'reserva' : 'tag';

  try {
    if (flow === 'lavado') {
      const lavados = await Lavado.find({ adminId, selected: true });
      const lavado = lavados.find(l => l._id.toString().endsWith(code));

      if (!lavado) {
        await sendMessage('telegram', chatId, 'No se encontro el servicio. El codigo puede haber expirado.');
        return;
      }

      lavado.from = telegramFrom || '';
      lavado.channel = 'telegram';
      lavado.telegramChatId = String(chatId);
      lavado.selected = false;
      lavado.textConfirmation = true;
      await lavado.save();

      const msg =
        `*Servicio confirmado!*\n\n` +
        `Vehiculo: *${lavado.modelo}*\n` +
        `Tipo de lavado: *${lavado.tipoDeLavado}*\n` +
        `Patente: *${lavado.patente}*\n` +
        `Observacion: ${lavado.observacion || 'Sin observaciones'}\n\n` +
        `Te avisaremos cuando este listo para ser retirado.`;

      await sendMessage('telegram', chatId, msg);
    } else if (flow === 'reserva') {
      const admin = await Admin.findById(adminId);
      if (!admin) return;

      const reserva = admin.reservas.find(
        r => r.selected && r._id.toString().endsWith(code)
      );

      if (!reserva) {
        await sendMessage('telegram', chatId, 'No se encontro la reserva.');
        return;
      }

      reserva.textConfirmation = true;
      reserva.selected = false;
      reserva.channel = 'telegram';
      reserva.telegramChatId = String(chatId);
      reserva.from = telegramFrom || '';
      await admin.save();

      await sendMessage('telegram', chatId, 'Gracias por confirmar la reserva!\n\nTe avisaremos cuando sea hora de venir.');
    } else if (flow === 'tag') {
      const admin = await Admin.findById(adminId);
      if (!admin) return;

      const nuevoPedido = {
        tagNumber: parseInt(code) || 0,
        fechaPedido: new Date(),
        estadoPorBarra: 'en espera',
        confirmacionPorCliente: false,
        mensajes: [{ body: `deep link: ${payload}`, fecha: new Date() }],
      };

      let cliente = admin.clientes.find(c => c.telegramChatId === String(chatId));
      if (!cliente) {
        admin.clientes.push({
          from: telegramFrom || '',
          channel: 'telegram',
          telegramChatId: String(chatId),
          historialPedidos: [nuevoPedido],
        });
      } else {
        cliente.historialPedidos.push(nuevoPedido);
      }
      await admin.save();

      await sendMessage('telegram', chatId, 'Tu pedido esta en la lista de espera. Te avisaremos cuando este listo.');
    }
  } catch (error) {
    console.error('Error procesando deep link:', error.message);
  }
}

// --- Handler functions (extracted from mensajes.controller.js) ---

async function handleReservaMessage(body, from, channel, chatId, reply) {
  try {
    const nombreMatch = body.match(/Hola! ([^,]+),/);
    const comensalesMatch = body.match(/reserva para (\d+) comensales/);
    const observacionMatch = body.match(/observación: "([^"]*)"/);
    const codigoMatch = body.match(/Código: (\w{5})/);

    if (!nombreMatch || !comensalesMatch || !observacionMatch || !codigoMatch) return;

    const nombre = nombreMatch[1];
    const comensales = parseInt(comensalesMatch[1]);
    const observacion = observacionMatch[1];
    const codigo = codigoMatch[1];

    const admin = await Admin.findOne({
      'reservas.nombre': nombre,
      'reservas.comensales': comensales,
      'reservas.observacion': observacion,
      'reservas.selected': true,
    });

    if (!admin) return;

    const reserva = admin.reservas.find(
      r => r.nombre === nombre && r.comensales === comensales &&
           r.observacion === observacion && r.selected &&
           r._id.toString().endsWith(codigo)
    );

    if (!reserva) return;

    reserva.textConfirmation = true;
    reserva.selected = false;
    reserva.from = from;
    reserva.channel = channel;
    if (channel === 'telegram') reserva.telegramChatId = String(chatId);

    await admin.save();
    await reply('Gracias por confirmar la reserva!\n\nTe avisaremos cuando sea hora de venir.');
  } catch (error) {
    console.error('Error en handleReservaMessage:', error.message);
  }
}

async function handleLavadoMessage(body, from, channel, chatId, reply) {
  try {
    const codigoMatch = body.match(/Código: (\w{5})/);
    const codigo = codigoMatch ? codigoMatch[1] : null;
    if (!codigo) return;

    const lavados = await Lavado.find({ selected: true });
    const lavado = lavados.find(l => l._id.toString().endsWith(codigo));
    if (!lavado) return;

    lavado.from = from;
    lavado.channel = channel;
    if (channel === 'telegram') lavado.telegramChatId = String(chatId);
    lavado.selected = false;
    lavado.textConfirmation = true;
    await lavado.save();

    const msg =
      `*Detalle de tu servicio ${lavado.nombre}:*\n\n` +
      `Vehiculo: *${lavado.modelo}*\n` +
      `Tipo de lavado: *${lavado.tipoDeLavado}*\n` +
      `Patente: *${lavado.patente}*\n` +
      `Observacion: ${lavado.observacion || 'Sin observaciones'}\n\n` +
      `Te avisaremos cuando este listo para ser retirado.`;

    await reply(msg);
  } catch (error) {
    console.error('Error en handleLavadoMessage:', error.message);
  }
}

async function handleTagMessage(body, from, channel, chatId, localAdmin, reply) {
  const tagNumberMatch = body.match(/número de tag: (\d+)/);
  const tagNumber = tagNumberMatch ? parseInt(tagNumberMatch[1], 10) : null;
  if (tagNumber === null) return;

  const nuevoPedido = {
    tagNumber,
    fechaPedido: new Date(),
    estadoPorBarra: 'en espera',
    confirmacionPorCliente: false,
    mensajes: [{ body, fecha: new Date() }],
  };

  let cliente = localAdmin.clientes.find(c => c.from === from);
  if (!cliente) {
    localAdmin.clientes.push({
      from,
      channel,
      telegramChatId: channel === 'telegram' ? String(chatId) : '',
      historialPedidos: [nuevoPedido],
    });
  } else {
    cliente.historialPedidos.push(nuevoPedido);
    if (channel === 'telegram') cliente.telegramChatId = String(chatId);
    cliente.channel = channel;
  }

  await localAdmin.save();
  await reply('Tu pedido esta en la lista de espera. Te avisaremos cuando este listo.');
}

async function handleConfirmationMessage(from, channel, chatId, reply) {
  const admin = await Admin.findOne({ 'clientes.from': from });
  if (!admin) return;

  const cliente = admin.clientes.find(c => c.from === from);
  if (!cliente) return;

  const pedido = cliente.historialPedidos.find(p => !p.confirmacionPorCliente);
  if (!pedido) return;

  pedido.fechaRetiro = new Date();
  pedido.estadoPorBarra = 'retiro confirmado';
  pedido.confirmacionPorCliente = true;
  await admin.save();

  await reply('Gracias! Tu pedido ha sido confirmado como retirado.');
}

async function handleBajaRequest(from, reply) {
  const admin = await Admin.findOne({ 'clientes.from': from });
  if (!admin) return;

  const cliente = admin.clientes.find(c => c.from === from);
  if (!cliente) return;

  cliente.solicitudBaja = true;
  await admin.save();

  await reply('Tu solicitud de baja ha sido procesada.');
}

async function actualizarEncuestaEnDB(from, palabraClave) {
  const calidadMap = { bueno: 4, regular: 3, excelente: 5 };
  if (!calidadMap[palabraClave]) return;

  const lavado = await Lavado.findOne({ from }).sort({ fechaDeAlta: -1 });
  if (!lavado) return;

  lavado.calidad = palabraClave;
  lavado.puntuacionCalidad = calidadMap[palabraClave];

  if (lavado.historialLavados?.length > 0) {
    lavado.historialLavados[0].calidad = palabraClave;
    lavado.historialLavados[0].puntuacionCalidad = calidadMap[palabraClave];
    lavado.markModified('historialLavados');
  }

  await lavado.save();
}
