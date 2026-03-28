import Admin from '../models/adminModel.js';
import { sendWhatsAppMessage, sendWhatsAppTemplateMessage } from '../services/twilioService.js';

// AGREGAR LAVADO
async function agregarLavado(req, res) {
  const { nombre, modelo, patente, empresa, tipoDeLavado, observacion } = req.body;

  try {
    // Lógica para agregar el lavado
    const adminId = req.cookies.adminId; // Obtener el ID del admin desde la cookie
    const admin = await Admin.findById(adminId);

    if (!admin) {
      return res.status(404).json({ error: 'Admin no encontrado' });
    }

    // Agregar el lavado a la lista de lavados
    admin.lavados.push({
      nombre,
      modelo,
      patente,
      empresa,
      tipoDeLavado,
      observacion,
      estado: 'Pendiente' // Estado inicial por defecto
    });
    await admin.save();
    res.status(201).json({ success: true, message: 'Lavado agregado con éxito' });
  } catch (error) {
    console.error('Error al agregar lavado:', error);
    res.status(500).json({ success: false, error: 'Error al agregar lavado' });
  }
}

// Obtener lavaderos de un administrador específico
async function getLavados(req, res) {
  const { adminId } = req.params;

  try {
    // Buscar al administrador por su ID
    const admin = await Admin.findById(adminId);
    if (!admin) {
      return res.status(404).json({ error: 'Admin no encontrado' });
    }

    // Iterar sobre los lavados y agregar datos en historialLavados si no existe
    admin.lavados.forEach(lavado => {
      // Generar historialLavados si no existe o está vacío
      if (!lavado.historialLavados || lavado.historialLavados.length === 0) {
        lavado.historialLavados = [
          {
            confirmacionPorCliente: false,
            tipoDeLavado: lavado.tipoDeLavado || '',
            fechaIngreso: lavado.fechaDeAlta || new Date(),
            fechaEgreso: null, // Dejar el campo vacío
            tiempoEspera: 0, // Por ahora 0
            observacion: lavado.observacion || 'Sin observación',
            mensajes: lavado.mensajesEnviados || [],
            calidad: lavado.calidad || '',
            puntuacionCalidad: lavado.puntuacionCalidad || 0
          }
        ];
      }
    });

    // Guardar los cambios si hubo modificaciones
    await admin.save();

    // Enviar respuesta
    res.json(admin.lavados);
  } catch (error) {
    console.error('Error al obtener los lavaderos:', error);
    res.status(500).json({ error: 'Error al obtener los lavaderos' });
  }
}

async function actualizarSelectedLavado(req, res) {
  const lavadoId = req.params.lavadoId;

  try {
    // Encuentra el admin que contiene el lavado seleccionado
    const admin = await Admin.findOne({ "lavados._id": lavadoId });

    if (!admin) {
      return res.status(404).json({ success: false, message: 'Lavado no encontrado' });
    }

    // Establece todos los lavados en `selected: false`
    admin.lavados.forEach(lavado => {
      lavado.selected = false;
    });

    // Luego, establece el lavado seleccionado en `true`
    const lavadoSeleccionado = admin.lavados.find(lavado => lavado._id.toString() === lavadoId);
    if (lavadoSeleccionado) {
      lavadoSeleccionado.selected = true;
    } else {
      return res.status(404).json({ success: false, message: 'Lavado no encontrado en el administrador' });
    }

    // Guarda los cambios
    await admin.save();

    res.json({ success: true, message: 'Lavado actualizado correctamente', admin });
  } catch (error) {
    console.error('Error al actualizar el lavado:', error);
    res.status(500).json({ success: false, message: 'Error al actualizar el lavado' });
  }
}

// Función para validar el QR y redirigir a WhatsApp para lavados
async function qrScanUpdateLavados(req, res) {
  const adminId = req.params.localId;
  console.log("EL ADMIN QUE SE ESTA BUSCANDO CON EL QR ES: " + adminId);

  try {
    // Buscar el admin en la base de datos
    const admin = await Admin.findById(adminId);
    if (!admin) {
      console.error("Admin/local no encontrado con el ID:", adminId);
      return res.status(404).send('Admin no encontrado');
    }

    // Buscar el lavado donde selected sea true
    const lavadoSeleccionado = admin.lavados.find(lavado => lavado.selected === true);

    if (!lavadoSeleccionado) {
      console.error("No se encontró ningún lavado seleccionado.");
      return res.status(404).send('No se encontró ningún lavado seleccionado');
    }

    // Obtener los datos del lavado seleccionado
    const { nombre, modelo, patente, tipoDeLavado, observacion, _id } = lavadoSeleccionado;

    // Extraer los últimos 5 caracteres del ObjectId
    const code = _id.toString().slice(-5);

    // Construir el mensaje personalizado
    const message = `${nombre}, confirmo servicio de lavado. Código: ${code}`;

    // Construir la URL de WhatsApp con el mensaje detallado
    const whatsappNumber = process.env.TWILIO_WHATSAPP_FROM;
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;

    // Redirigir instantáneamente al cliente a la URL de WhatsApp
    res.redirect(whatsappUrl);

  } catch (error) {
    console.error('Error al procesar el QR:', error);
    res.status(500).send('Error al procesar el QR');
  }
}

// Función para enviar aviso de retiro de lavado
async function enviarAvisoRetiroLavado(req, res) {
  try {
    const { clienteId } = req.body;

    if (!clienteId) {
      console.error("No se recibió clienteId en la solicitud");
      return res.status(400).json({ success: false, message: "No se recibió clienteId" });
    }

    // Buscar el admin que tenga un lavado con el ID del cliente proporcionado
    const admin = await Admin.findOne({ 'lavados._id': clienteId });

    if (admin) {
      console.log("Admin encontrado:", admin._id);

      // Encontrar el lavado específico dentro de `admin.lavados` con el clienteId
      const lavado = admin.lavados.find(lavado => lavado._id.toString() === clienteId);

      if (lavado) {
        // Encontrar el primer elemento de historialLavados que tenga fechaEgreso null
        const historialDisponible = lavado.historialLavados.find(h => h.fechaEgreso === null);

        if (historialDisponible) {
          // Guardar la fecha de egreso (momento actual)
          const fechaActual = new Date();
          historialDisponible.fechaEgreso = fechaActual;

          // Calcular la diferencia en minutos entre fechaIngreso y fechaEgreso
          const fechaIngreso = new Date(historialDisponible.fechaIngreso);
          const diferenciaMinutos = Math.floor((fechaActual - fechaIngreso) / 60000);

          historialDisponible.tiempoEspera = diferenciaMinutos;

          // Guardar los cambios en la base de datos
          await admin.save();

          // Crear el mensaje con los datos del cliente y del lavado
          const mensaje = `Hola, ${lavado.nombre} 👋, ¡tenemos buenas noticias! 🎉
Tu vehículo con patente **${lavado.patente}** está listo para ser retirado. 🧼🚗

Gracias por confiar en nosotros y por elegir nuestro servicio.

🌟 **Promoción especial:**
¡Acumula 3 servicios de lavado y el próximo será gratis! 🎁
Con este lavado, ya tienes **1 de 3 estrellas** ⭐.

¡Gracias por tu preferencia y esperamos verte pronto! 🌟`;

          // Enviar el mensaje al número de WhatsApp almacenado en el campo `from`
          await sendWhatsAppMessage(`whatsapp:${lavado.from}`, mensaje);

          console.log(`Aviso de retiro de lavado enviado a ${lavado.from} para el cliente ${lavado.nombre}`);
          res.json({
            success: true,
            message: "Mensaje enviado con éxito",
            tiempoEspera: diferenciaMinutos
          });
        } else {
          console.log("No se encontró un historial de lavado disponible para actualizar.");
          res.status(404).json({ success: false, message: "No hay historial de lavado disponible." });
        }
      } else {
        console.log("No se encontró el lavado con el ID proporcionado en el documento del admin.");
        res.status(404).json({ success: false, message: "Lavado no encontrado" });
      }
    } else {
      console.log("No se encontró ningún admin con un lavado coincidente.");
      res.status(404).json({ success: false, message: "Admin no encontrado" });
    }
  } catch (error) {
    console.error("Error al enviar el mensaje:", error);
    res.status(500).json({ success: false, message: "Error al enviar el mensaje" });
  }
}

// ENDPOINT: Modificar lavado
async function modificarLavado(req, res) {
  const { lavadoId, medioPago, patente, estado, monto } = req.body;

  // Log para depurar los datos recibidos
  console.log("Datos recibidos en el backend:");
  console.log("Lavado ID:", lavadoId);
  console.log("Medio de Pago:", medioPago);
  console.log("Estado:", estado);
  console.log("Monto:", monto);

  // Validar que los parámetros requeridos estén presentes
  if (!lavadoId || !medioPago || !estado || monto === undefined || isNaN(parseFloat(monto))) {
    return res.status(400).json({
      success: false,
      message: "Faltan parámetros requeridos (lavadoId, medioPago, estado, monto).",
    });
  }

  try {
    // Buscar el admin que contiene el lavado específico
    const admin = await Admin.findOne({
      "lavados._id": lavadoId, // Filtrar por el ID del lavado en el array de lavados
    });

    // Validar si se encontró el admin con el lavado
    if (!admin) {
      console.log("No se encontró ningún admin con un lavado coincidente.");
      return res.status(404).json({
        success: false,
        message: "No se encontró el lavado con el ID especificado.",
      });
    }

    console.log("Admin encontrado:", admin._id);

    // Buscar el lavado específico en el array de `lavados`
    const lavado = admin.lavados.find((lavado) => lavado._id.toString() === lavadoId);

    // Validar si se encontró el lavado
    if (!lavado) {
      console.log("No se encontró el lavado específico dentro del documento del admin.");
      return res.status(404).json({
        success: false,
        message: "Lavado no encontrado en los datos del admin.",
      });
    }

    // Actualizar los campos del lavado
    lavado.medioPago = medioPago;
    lavado.estado = estado;
    lavado.monto = parseFloat(monto);

    console.log("Campos del lavado actualizados:");
    console.log("Medio de Pago:", lavado.medioPago);
    console.log("Estado:", lavado.estado);
    console.log("Monto:", lavado.monto);

    // Guardar los cambios en la base de datos
    await admin.save();

    // Responder con éxito y los datos actualizados del lavado
    res.status(200).json({
      success: true,
      message: "Lavado modificado con éxito.",
      data: lavado,
    });
  } catch (error) {
    console.error("Error al modificar el lavado:", error);
    res.status(500).json({
      success: false,
      message: "Error interno del servidor.",
      details: error.message,
    });
  }
}

// Función para enviar encuesta
async function enviarEncuesta(req, res) {
  try {
    const { clienteId } = req.body;

    if (!clienteId) {
      console.error("No se recibió clienteId en la solicitud");
      return res.status(400).json({ success: false, message: "No se recibió clienteId" });
    }

    // Buscar el admin que tenga un lavado con el ID del cliente proporcionado
    const admin = await Admin.findOne({ 'lavados._id': clienteId });

    if (admin) {
      console.log("Admin encontrado:", admin._id);

      // Encontrar el lavado específico dentro de `admin.lavados` con el clienteId
      const lavado = admin.lavados.find(lavado => lavado._id.toString() === clienteId);

      if (lavado) {
        // Parámetros de la plantilla
        const templateParams = [
          lavado.nombre,               // Nombre del cliente
          lavado.patente,              // Patente del vehículo
          '1 de 3 estrellas'           // Información sobre la promoción o cualquier otro detalle
        ];

        // Enviar el mensaje utilizando la plantilla
        await sendWhatsAppTemplateMessage(`whatsapp:${lavado.from}`, templateParams);

        console.log(`Mensaje de plantilla enviado a ${lavado.from} para el cliente ${lavado.nombre}`);
        res.json({ success: true, message: "Mensaje de plantilla enviado con éxito" });
      } else {
        console.log("No se encontró el lavado con el ID proporcionado en el documento del admin.");
        res.status(404).json({ success: false, message: "Lavado no encontrado" });
      }
    } else {
      console.log("No se encontró ningún admin con un lavado coincidente.");
      res.status(404).json({ success: false, message: "Admin no encontrado" });
    }
  } catch (error) {
    console.error("Error al enviar el mensaje:", error);
    res.status(500).json({ success: false, message: "Error al enviar el mensaje" });
  }
}

export const methods = {
  agregarLavado,
  getLavados,
  actualizarSelectedLavado,
  qrScanUpdateLavados,
  enviarAvisoRetiroLavado,
  modificarLavado,
  enviarEncuesta
};
