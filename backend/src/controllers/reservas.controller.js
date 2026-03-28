import Admin from '../models/adminModel.js';
import { sendWhatsAppMessage } from '../services/twilioService.js';
import { ok, created, fail } from '../utils/apiResponse.js';

//AGREGAR CLIENTE
async function agregarCliente(req, res) {
  const { nombre, comensales, observacion } = req.body;

  try {
    // Lógica para agregar el cliente
    const adminId = req.user.adminId; // Obtener el ID del admin desde la cookie, si aplica
    const admin = await Admin.findById(adminId);

    if (!admin) return fail(res, 404, 'Admin no encontrado');

    admin.reservas.push({ nombre, comensales, observacion });
    await admin.save();

    return created(res, null, 'Cliente agregado con éxito');
  } catch (error) {
    return fail(res, 500, 'Error al agregar cliente');
  }
}

async function getReservas(req, res) {
  const { adminId } = req.params;

  try {
    const admin = await Admin.findById(adminId).select('reservas');
    if (!admin) return fail(res, 404, 'Admin no encontrado');
    return ok(res, admin.reservas);
  } catch (error) {
    return fail(res, 500, 'Error al obtener las reservas');
  }
}

async function actualizarSelectedCliente(req, res) {
  const clienteId = req.params.clienteId;

  try {
    // Primero, busca el admin que contiene la reserva con el clienteId y establece todas las reservas en false
    const admin = await Admin.findOneAndUpdate(
      { "reservas._id": clienteId },
      { $set: { "reservas.$[].selected": false } }, // Establece todas las reservas como false
      { new: true }
    );

    if (!admin) return fail(res, 404, 'Cliente no encontrado');

    const updatedAdmin = await Admin.findOneAndUpdate(
      { "reservas._id": clienteId },
      { $set: { "reservas.$.selected": true } },
      { new: true }
    );

    return ok(res, updatedAdmin, 'Cliente actualizado correctamente');
  } catch (error) {
    return fail(res, 500, 'Error al actualizar el cliente');
  }
}

async function eliminarCliente(req, res) {
  const clienteId = req.params.clienteId;

  try {
    // Encuentra el cliente dentro del array de reservas y lo elimina
    const admin = await Admin.findOneAndUpdate(
      { "reservas._id": clienteId }, // Busca dentro del array de reservas
      { $pull: { reservas: { _id: clienteId } } }, // Elimina la reserva que coincide con el clienteId
      { new: true }
    );

    if (!admin) return fail(res, 404, 'Cliente no encontrado');

    return ok(res, admin, 'Cliente eliminado correctamente');
  } catch (error) {
    return fail(res, 500, 'Error al eliminar el cliente');
  }
}

// Función para enviar mensaje de cuenta regresiva
async function enviarMensajeCuentaRegresiva(req, res) {
  try {
    const { clienteId } = req.body;

    if (!clienteId) {
      console.error("No se recibió clienteId en la solicitud");
      return fail(res, 400, 'No se recibió clienteId');
    }

    // Buscar el admin que tenga una reserva con el ID del cliente proporcionado
    const admin = await Admin.findOne({ 'reservas._id': clienteId });

    if (admin) {
      console.log("Admin encontrado:", admin._id);

      // Encontrar la reserva específica dentro de `admin.reservas` con el clienteId
      const reserva = admin.reservas.find(reserva => reserva._id.toString() === clienteId);

      if (reserva) {
        // Crear el mensaje con el nombre del cliente
        const mensaje = `Hola, ${reserva.nombre}, te pedimos que te acerques a tomar la reserva. Recuerda que tienes 5 minutos para efectivizarla. Gracias ☺️`;

        // Enviar el mensaje al número de WhatsApp almacenado en el campo `from`
        await sendWhatsAppMessage(`whatsapp:${reserva.from}`, mensaje);

        console.log(`Mensaje de cuenta regresiva enviado a ${reserva.from} para el cliente ${reserva.nombre}`);
        return ok(res, null, 'Mensaje enviado con éxito');
      } else {
        return fail(res, 404, 'Reserva no encontrada');
      }
    } else {
      return fail(res, 404, 'Admin no encontrado');
    }
  } catch (error) {
    return fail(res, 500, 'Error al enviar el mensaje');
  }
}

// Función para validar el QR y redirigir a WhatsApp
async function qrScanUpdateReservas(req, res) {
  const adminId = req.params.localId;
  console.log("EL ADMIN QUE SE ESTA BUSCANDO CON EL QR ES: " + adminId);

  try {
    // Buscar el admin en la base de datos
    const admin = await Admin.findById(adminId);
    if (!admin) {
      console.error("Admin/local no encontrado con el ID:", adminId);
      return res.status(404).send('Admin no encontrado');
    }

    // Buscar la reserva donde selected sea true
    const reservaSeleccionada = admin.reservas.find(reserva => reserva.selected === true);

    if (!reservaSeleccionada) {
      console.error("No se encontró ninguna reserva seleccionada.");
      return res.status(404).send('No se encontró ninguna reserva seleccionada');
    }

    // Obtener los datos de la reserva seleccionada
    const { nombre, comensales, observacion, _id } = reservaSeleccionada;

    // Extraer los últimos 5 caracteres del ObjectId
    const code = _id.toString().slice(-5);

    // Construir el mensaje personalizado
    const message = `Hola! ${nombre}, vamos a validar la reserva para ${comensales} comensales, con la observación: "${observacion}". Código: ${code}`;

    // Construir la URL de WhatsApp con el mensaje detallado
    const whatsappNumber = 5491135254661;  // Número de WhatsApp (puedes reemplazarlo según corresponda)
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;

    // Redirigir instantáneamente al cliente a la URL de WhatsApp
    res.redirect(whatsappUrl);

  } catch (error) {
    console.error('Error al obtener el admin:', error);
    res.status(500).send('Error al procesar el QR');
  }
}

export const methods = {
  agregarCliente,
  getReservas,
  actualizarSelectedCliente,
  eliminarCliente,
  enviarMensajeCuentaRegresiva,
  qrScanUpdateReservas
};
