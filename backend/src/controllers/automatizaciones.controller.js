import Automatizacion from '../models/Automatizacion.js';
import MensajeLog from '../models/MensajeLog.js';
import Admin from '../models/adminModel.js';
import Lavado from '../models/Lavado.js';
import { sendMessage } from '../services/messaging/channelRegistry.js';

// ── Automatizaciones CRUD ──────────────────────────────────────

async function listar(req, res) {
  const autos = await Automatizacion.find({ adminId: req.user.adminId }).sort({ createdAt: -1 });
  res.json({ data: autos });
}

async function crear(req, res) {
  const { nombre, trigger, triggerValor, mensaje, destino } = req.body;
  const auto = await Automatizacion.create({
    adminId: req.user.adminId,
    nombre,
    trigger,
    triggerValor,
    mensaje,
    destino,
  });
  res.status(201).json({ data: auto });
}

async function actualizar(req, res) {
  const { nombre, trigger, triggerValor, mensaje, destino, activa } = req.body;
  const auto = await Automatizacion.findOneAndUpdate(
    { _id: req.params.id, adminId: req.user.adminId },
    { nombre, trigger, triggerValor, mensaje, destino, activa },
    { new: true }
  );
  if (!auto) return res.status(404).json({ message: 'Automatizacion no encontrada' });
  res.json({ data: auto });
}

async function eliminar(req, res) {
  const auto = await Automatizacion.findOneAndDelete({ _id: req.params.id, adminId: req.user.adminId });
  if (!auto) return res.status(404).json({ message: 'Automatizacion no encontrada' });
  res.json({ message: 'Eliminada' });
}

async function toggle(req, res) {
  const auto = await Automatizacion.findOne({ _id: req.params.id, adminId: req.user.adminId });
  if (!auto) return res.status(404).json({ message: 'Automatizacion no encontrada' });
  auto.activa = !auto.activa;
  await auto.save();
  res.json({ data: auto });
}

// ── Broadcast ──────────────────────────────────────────────────

async function broadcast(req, res) {
  const { mensaje, segmento } = req.body;
  if (!mensaje?.trim()) return res.status(400).json({ message: 'Mensaje requerido' });

  const adminId = req.user.adminId;
  const admin = await Admin.findById(adminId);
  if (!admin) return res.status(404).json({ message: 'Admin no encontrado' });

  // Get lavados with phone numbers
  const lavados = await Lavado.find({ adminId }).lean();
  let destinatarios = lavados.filter(l => l.from);

  // Apply segment filter
  if (segmento === 'activos') {
    const hace30 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    destinatarios = destinatarios.filter(l => new Date(l.fechaDeAlta) >= hace30);
  } else if (segmento === 'inactivos') {
    const hace30 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    destinatarios = destinatarios.filter(l => new Date(l.fechaDeAlta) < hace30);
  } else if (segmento === 'vip') {
    destinatarios = destinatarios.filter(l => (l.historialLavados?.length || 0) >= 3);
  }

  // Deduplicate by phone
  const seen = new Set();
  destinatarios = destinatarios.filter(l => {
    if (seen.has(l.from)) return false;
    seen.add(l.from);
    return true;
  });

  // Send messages
  let enviados = 0;
  let errores = 0;
  const channel = admin.activeChannel || 'telegram';

  for (const dest of destinatarios) {
    try {
      const msgPersonalizado = mensaje.replace(/\{nombre\}/g, dest.nombre || 'Cliente');
      const to = dest.channel === 'telegram' ? dest.telegramChatId : dest.from;
      if (to) {
        await sendMessage(dest.channel || channel, to, msgPersonalizado);
        enviados++;
      }
    } catch {
      errores++;
    }
  }

  // Log
  await MensajeLog.create({
    adminId,
    clienteNombre: 'Broadcast',
    tipo: 'broadcast',
    etiqueta: segmento === 'todos' ? 'Todos' : segmento,
    estado: 'enviado',
    mensaje,
    cantidadDestinatarios: enviados,
  });

  res.json({ data: { enviados, errores, total: destinatarios.length } });
}

// ── Historial ──────────────────────────────────────────────────

async function historial(req, res) {
  const { tipo, busqueda, page = 1, limit = 50 } = req.query;
  const filter = { adminId: req.user.adminId };

  if (tipo && tipo !== 'todos') filter.tipo = tipo;
  if (busqueda) {
    const escaped = String(busqueda).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    filter.clienteNombre = { $regex: escaped, $options: 'i' };
  }

  const [logs, total] = await Promise.all([
    MensajeLog.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(Number(limit)).lean(),
    MensajeLog.countDocuments(filter),
  ]);

  res.json({ data: logs, total, page: Number(page), limit: Number(limit) });
}

// ── Stats ──────────────────────────────────────────────────────

async function stats(req, res) {
  const adminId = req.user.adminId;
  const inicioMes = new Date();
  inicioMes.setDate(1);
  inicioMes.setHours(0, 0, 0, 0);

  const filter = { adminId, createdAt: { $gte: inicioMes } };

  const [totalEnviados, reviews, respuestas, recuperados] = await Promise.all([
    MensajeLog.countDocuments(filter),
    MensajeLog.countDocuments({ ...filter, etiqueta: { $regex: /review/i } }),
    MensajeLog.countDocuments({ ...filter, estado: { $in: ['respondio', 'volvio', 'uso_cupon'] } }),
    MensajeLog.countDocuments({ ...filter, estado: 'volvio' }),
  ]);

  const tasaRespuesta = totalEnviados > 0 ? Math.round((respuestas / totalEnviados) * 100) : 0;

  res.json({
    data: {
      totalEnviados,
      reviews,
      tasaRespuesta,
      recuperados,
    },
  });
}

// ── Conversacion de un cliente ─────────────────────────────────

async function conversacion(req, res) {
  const { telefono } = req.query;
  if (!telefono) return res.status(400).json({ message: 'Telefono requerido' });

  const adminId = req.user.adminId;

  // Get lavado data for this client
  const lavado = await Lavado.findOne({ adminId, from: telefono }).lean();

  // Get sent message logs
  const logs = await MensajeLog.find({
    adminId,
    clienteTelefono: telefono,
  }).sort({ createdAt: 1 }).lean();

  // Build conversation from logs + lavado.mensajesEnviados
  const mensajes = [];

  // Messages from MensajeLog
  for (const log of logs) {
    mensajes.push({
      _id: log._id.toString(),
      body: log.mensaje,
      fecha: log.createdAt,
      direccion: 'enviado',
    });
    if (log.respuesta) {
      mensajes.push({
        _id: log._id.toString() + '_r',
        body: log.respuesta,
        fecha: new Date(new Date(log.createdAt).getTime() + 60000), // approximate
        direccion: 'recibido',
      });
    }
  }

  // Messages from lavado.mensajesEnviados (legacy)
  if (lavado?.mensajesEnviados) {
    for (const m of lavado.mensajesEnviados) {
      mensajes.push({
        _id: 'legacy_' + m._id,
        body: m.body,
        fecha: m.fecha,
        direccion: 'enviado',
      });
    }
  }

  // Sort by date
  mensajes.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));

  res.json({
    data: {
      _id: lavado?._id?.toString() || telefono,
      nombre: lavado?.nombre || 'Cliente',
      telefono,
      totalLavados: lavado?.historialLavados?.length || 0,
      calidad: lavado?.puntuacionCalidad || null,
      mensajes,
    },
  });
}

// ── Segmentos (conteos) ────────────────────────────────────────

async function segmentos(req, res) {
  const adminId = req.user.adminId;
  const lavados = await Lavado.find({ adminId, from: { $exists: true, $ne: '' } }).lean();

  // Deduplicate by phone
  const uniquePhones = new Set();
  const unique = lavados.filter(l => {
    if (uniquePhones.has(l.from)) return false;
    uniquePhones.add(l.from);
    return true;
  });

  const hace30 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const activos = unique.filter(l => new Date(l.fechaDeAlta) >= hace30);
  const inactivos = unique.filter(l => new Date(l.fechaDeAlta) < hace30);
  const vip = unique.filter(l => (l.historialLavados?.length || 0) >= 3);

  res.json({
    data: {
      todos: unique.length,
      activos: activos.length,
      inactivos: inactivos.length,
      vip: vip.length,
    },
  });
}

export const methods = {
  listar,
  crear,
  actualizar,
  eliminar,
  toggle,
  broadcast,
  historial,
  stats,
  conversacion,
  segmentos,
};
