import Admin from '../models/adminModel.js';
import { sendWhatsAppMessage, sendWhatsAppTemplateMessage } from '../services/twilioService.js';

// Función para actualizar la encuesta en la base de datos
async function actualizarEncuestaEnDB(from, palabraClave) {
  try {
    const numeroCliente = from.replace('whatsapp:', '');

    // Mapeo de palabras clave a puntuaciones
    const calidadMap = {
      bueno: 4,
      regular: 3,
      excelente: 5
    };

    if (!calidadMap[palabraClave.toLowerCase()]) {
      console.log(`La palabra clave "${palabraClave}" no es válida.`);
      return;
    }

    const admin = await Admin.findOne({ 'lavados.from': numeroCliente });

    if (admin) {
      const lavado = admin.lavados
        .filter(l => l.from === numeroCliente)
        .sort((a, b) => b.fechaDeAlta - a.fechaDeAlta)[0];

      if (lavado) {
        console.log(`Actualizando calidad para el cliente ${lavado.nombre} con la respuesta: ${palabraClave}`);

        // Actualizar lavado principal
        lavado.calidad = palabraClave.toLowerCase();
        lavado.puntuacionCalidad = calidadMap[palabraClave.toLowerCase()];

        // Actualizar el primer elemento de historialLavados
        if (lavado.historialLavados && lavado.historialLavados.length > 0) {
          lavado.historialLavados[0].calidad = palabraClave.toLowerCase();
          lavado.historialLavados[0].puntuacionCalidad = calidadMap[palabraClave.toLowerCase()];

          // Marcar como modificado
          lavado.markModified('historialLavados');
        }

        // Guardar los cambios
        await admin.save();
        console.log("Encuesta actualizada correctamente en la base de datos.");
      } else {
        console.log("No se encontró un lavado asociado al cliente.");
      }
    } else {
      console.log("No se encontró ningún admin con un lavado asociado al cliente.");
    }
  } catch (error) {
    console.error("Error al actualizar la encuesta en la base de datos:", error);
  }
}

// Función para manejar mensajes de "reserva"
async function handleReservaMessage(body, fromWithPrefix) {
  try {
    // Extrae solo el número de teléfono, eliminando el prefijo 'whatsapp:'
    const from = fromWithPrefix.replace('whatsapp:', '');

    // Expresiones regulares para extraer los datos
    const nombreMatch = body.match(/Hola! ([^,]+),/);
    const comensalesMatch = body.match(/reserva para (\d+) comensales/);
    const observacionMatch = body.match(/observación: "([^"]*)"/);
    const codigoMatch = body.match(/Código: (\w{5})/);

    console.log("EL CODIGO DEL MENSAJE ES en reservas: " + codigoMatch)

    // Verificar que todos los datos fueron extraídos correctamente
    if (!nombreMatch || !comensalesMatch || !observacionMatch || !codigoMatch) {
      console.log("No se pudo extraer el nombre, comensales, observación o código del mensaje.");
      console.log("Datos extraídos:", {
        nombre: nombreMatch ? nombreMatch[1] : null,
        comensales: comensalesMatch ? parseInt(comensalesMatch[1]) : null,
        observacion: observacionMatch ? observacionMatch[1] : null,
        codigo: codigoMatch ? codigoMatch[1] : null,
      });
      return;
    }

    // Extraer los datos del mensaje
    const nombre = nombreMatch[1];
    const comensales = parseInt(comensalesMatch[1]);
    const observacion = observacionMatch[1];
    const codigo = codigoMatch[1];

    console.log("Datos extraídos:", { nombre, comensales, observacion, codigo });

    // Buscar el admin en la base de datos que tenga una reserva con los criterios
    const admin = await Admin.findOne({
      'reservas.nombre': nombre,
      'reservas.comensales': comensales,
      'reservas.observacion': observacion,
      'reservas.selected': true
    });

    if (admin) {
      console.log("Admin encontrado:", admin._id);

      // Filtrar la reserva específica dentro de `admin.reservas`
      const reserva = admin.reservas.find(reserva =>
        reserva.nombre === nombre &&
        reserva.comensales === comensales &&
        reserva.observacion === observacion &&
        reserva.selected === true &&
        reserva._id.toString().endsWith(codigo)
      );

      if (reserva) {
        // Actualizar los campos solicitados
        reserva.textConfirmation = true;
        reserva.selected = false; // Cambiar `selected` a false
        reserva.from = from; // Cargar el número de teléfono sin el prefijo

        // Guardar los cambios en la base de datos
        await admin.save();

        // Enviar un mensaje de confirmación al cliente
        const responseMessage = "🎉 Gracias por confirmar la reserva!\n\nTe avisaremos cuando sea hora de venir, mientras sigue disfrutando del complejo 🥂🕺😃.";
        await sendWhatsAppMessage(`whatsapp:${from}`, responseMessage);
        console.log("Reserva confirmada y mensaje de confirmación enviado al cliente.");
      } else {
        console.log("No se encontró la reserva específica en el documento del admin.");
      }
    } else {
      console.log("No se encontró ningún admin con una reserva coincidente.");
    }
  } catch (error) {
    console.error("Error al manejar el mensaje de reserva:", error);
  }
}

// Función para manejar mensajes de "lavado"
async function handleLavadoMessage(body, fromWithPrefix) {
  try {
    // Extrae solo el número de teléfono, eliminando el prefijo 'whatsapp:'
    const from = fromWithPrefix.replace('whatsapp:', '');

    console.log("Mensaje recibido en Body:", body);

    // Extraer el código del mensaje
    const codigoMatch = body.match(/Código: (\w{5})/);
    const codigo = codigoMatch ? codigoMatch[1] : null;

    if (!codigo) {
      console.log("No se pudo extraer el código del mensaje.");
      return;
    }

    console.log("Código extraído:", codigo);

    // Buscar el admin en la base de datos que tenga un lavado con los criterios
    const admin = await Admin.findOne({
      'lavados.selected': true
    });

    if (admin) {
      console.log("Admin encontrado:", admin._id);

      // Filtrar el lavado específico dentro de `admin.lavados`
      const lavado = admin.lavados.find(lavado =>
        lavado.selected === true &&
        lavado._id.toString().endsWith(codigo) // Comparación con los últimos 5 caracteres del ID
      );

      // Validar si se encontró el lavado
      if (!lavado) {
        console.log("No se encontró el lavado específico en el documento del admin.");
        return;
      }

      // Actualizar los campos del lavado encontrado
      lavado.from = from; // Guardar el número del cliente
      lavado.selected = false; // Desmarcar el lavado como seleccionado
      lavado.textConfirmation = true;

      // Guardar los cambios en la base de datos
      await admin.save();

      // Crear el mensaje personalizado para confirmación
      const responseMessage =
        `*Aquí está el detalle de tu servicio ${lavado.nombre}:*\n
      🚗 *Vehículo:* ${lavado.modelo}
      🧼 *Tipo de lavado:* ${lavado.tipoDeLavado}
      📄 *Patente:* ${lavado.patente}
      📝 *Observación:* ${lavado.observacion || 'Sin observaciones'}\n
      Te avisaremos cuando este listo para ser retirado.`.trim();

      // Enviar un mensaje de confirmación al cliente
      await sendWhatsAppMessage(`whatsapp:${from}`, responseMessage);
      console.log("Lavado confirmado y mensaje de confirmación enviado al cliente.");
    } else {
      console.log("No se encontró ningún admin con un lavado coincidente.");
    }
  } catch (error) {
    console.error("Error al manejar el mensaje de lavado:", error);
  }
}

//FUNCION PARA GESTIONAR EN BASE A LA RESPUESTA CON EL TAG N:---->
async function handleTagMessage(body, from, localAdmin) {
  const tagNumberMatch = body.match(/número de tag: (\d+)/); // Extraer el número de tag del mensaje
  const tagNumber = tagNumberMatch ? parseInt(tagNumberMatch[1], 10) : null;
  const fechaPedido = new Date();  // Fecha actual como un objeto de tipo Date

  if (tagNumber !== null) {
    console.log(`Procesando tag ${tagNumber} para ${from}`);

    // Crear un nuevo pedido
    const nuevoPedido = {
      tagNumber,
      fechaPedido,
      estadoPorBarra: 'en espera',
      confirmacionPorCliente: false,
      mensajes: [{ body, fecha: fechaPedido }],
      fechaRetiro: null,
      tiempoEspera: 0
    };

    // Buscar si el cliente ya existe en el local
    let cliente = localAdmin.clientes.find(c => c.from === from);

    if (!cliente) {
      // Si el cliente no existe, agregarlo
      localAdmin.clientes.push({
        from,
        solicitudBaja: false,
        historialPedidos: [nuevoPedido],
        promedioTiempo: null
      });
      console.log(`Nuevo cliente agregado: ${from}`);
    } else {
      // Si el cliente ya existe, agregar el nuevo pedido a su historial
      cliente.historialPedidos.push(nuevoPedido);
      console.log(`Nuevo pedido agregado para el cliente: ${from}`);
    }

    // Guardar los cambios en la base de datos
    await localAdmin.save();

    // Enviar respuesta automática al cliente
    const responseMessage = '🎉 ¡Hola!\n\nTu pedido está en la lista de espera.🕒\n\nTe avisaremos cuando esté listo.';
    await sendWhatsAppMessage(`whatsapp:${from}`, responseMessage);
  } else {
    console.log('No se encontró un número de tag en el mensaje.');
  }
}

//FUNCION PARA LA CONFIRMACION DEL RETIRO DEL PEDIDO---->
async function handleConfirmationMessage(from, body) {
  const fecha = new Date();  // Fecha actual como un objeto de tipo Date

  // Buscar al cliente en la base de datos
  const admin = await Admin.findOne({ "clientes.from": from });

  if (admin) {
    // Buscar el cliente y su historial de pedidos
    let cliente = admin.clientes.find(c => c.from === from);

    if (cliente) {
      // Buscar el pedido en espera de confirmación
      const pedido = cliente.historialPedidos.find(p => p.confirmacionPorCliente === false);
      if (pedido) {
        // Confirmar el retiro del pedido
        pedido.mensajes.push({ body, fecha });
        pedido.fechaRetiro = fecha;
        pedido.estadoPorBarra = 'retiro confirmado';
        pedido.confirmacionPorCliente = true;

        await admin.save();
        console.log(`Pedido confirmado como retirado para el cliente: ${from}`);

        // Enviar respuesta automática de confirmación
        const confirmationMessage = '🎉 ¡Gracias! Tu pedido ha sido confirmado como retirado.';
        await sendWhatsAppMessage(`whatsapp:${from}`, confirmationMessage);
      } else {
        console.log('No se encontró un pedido en estado a confirmar retiro.');
      }
    } else {
      console.log('Cliente no encontrado.');
    }
  } else {
    console.log('No se encontró el cliente en la base de datos.');
  }
}

//FUNCION PARA LA CONFIRMACION DE BAJA---->
async function handleBajaRequest(from) {
  const admin = await Admin.findOne({ "clientes.from": from });

  if (admin) {
    let cliente = admin.clientes.find(c => c.from === from);
    if (cliente) {
      cliente.solicitudBaja = true;
      await admin.save();
      console.log(`Solicitud de baja registrada para el cliente: ${from}`);

      // Enviar una confirmación al cliente
      const responseMessage = '🚨 ¡Tu solicitud de baja ha sido procesada!';
      await sendWhatsAppMessage(`whatsapp:${from}`, responseMessage);
    } else {
      console.log('No se encontró el cliente para procesar la solicitud de baja.');
    }
  } else {
    console.log('No se encontró el cliente en la base de datos.');
  }
}

async function reciveMessage(req, res) {
  res.status(200).send('<Response></Response>');

  console.log("Contenido completo de req.body:", req.body);

  const { From: fromWithPrefix, Body: body, To: toWithPrefix } = req.body;
  const from = fromWithPrefix ? fromWithPrefix.replace('whatsapp:', '') : null;
  const to = toWithPrefix ? toWithPrefix.replace('whatsapp:', '').replace('+', '') : null;

  if (!body) {
    console.error("El contenido del mensaje (Body) está vacío o no se encuentra.");
    return;
  }

  try {
    const localAdmin = await Admin.findOne({ localNumber: to });

    if (!localAdmin) {
      console.log(`No se encontró un local para el número de WhatsApp: ${to}`);
      // Respuesta para números desconocidos
      await sendWhatsAppMessage(`whatsapp:${from}`, "Hola, no tenemos tu número registrado en nuestro sistema. Por favor, contacta a soporte.");
      return;
    }

    // Procesar el mensaje según el contenido
    if (body.toLowerCase().includes('reserva')) {
      await handleReservaMessage(body, from, localAdmin);
    } else if (body.toLowerCase().includes('número de tag')) {
      await handleTagMessage(body, from, localAdmin);
    } else if (body.toLowerCase().includes('ya lo tengo')) {
      await handleConfirmationMessage(from, body);
    } else if (body.toLowerCase().includes('lavado')) {
      console.log("DETECTE LA PALABRA LAVADO!");
      await handleLavadoMessage(body, from, localAdmin);
    } else if (body.toLowerCase().includes('baja')) {
      await handleBajaRequest(from);
    } else if (
      ['excelente', 'regular', 'bueno'].some(palabra =>
        body.toLowerCase().includes(palabra)
      )
    ) {
      console.log("Respuesta de encuesta detectada:", body);

      const palabraClave = ['excelente', 'regular', 'bueno'].find(palabra =>
        body.toLowerCase().includes(palabra)
      );

      // Actualizar la base de datos con la palabra clave
      await actualizarEncuestaEnDB(from, palabraClave);

      // Mensaje de agradecimiento
      const mensajeAgradecimiento = `¡Muchas gracias por completar nuestra encuesta! 🥳 Tu opinión "${palabraClave}" es muy valiosa para nosotros.`;

      await sendWhatsAppMessage(`whatsapp:${from}`, mensajeAgradecimiento);
    }
  } catch (error) {
    console.error('Error al procesar el mensaje:', error.message);
  }
}

async function addMessage(req, res) {
  const { adminId } = req.params; // ID del admin/local
  const { body } = req.body; // Mensaje a agregar, incluyendo `to`, `body`, `fecha`, `hora`

  try {
    // Encuentra el admin/local por su ID
    const admin = await Admin.findById(adminId);

    if (!admin) {
      return res.status(404).json({ message: 'Admin/local no encontrado.' });
    }

    // Encuentra el cliente en la lista de `clientes` cuyo `from` coincida con `to` en el mensaje
    const client = admin.clientes.find(c => c.from === body.to);

    if (!client) {
      return res.status(404).json({ message: 'Cliente no encontrado.' });
    }

    // Agrega el nuevo mensaje al array `mensajesEnviados` del cliente
    client.mensajesEnviados.push({
      body: body.body,
      fecha: body.fecha,
      hora: body.hora
    });

    // Guarda los cambios en la base de datos
    await admin.save();

    res.status(200).json({ message: 'Mensaje guardado exitosamente.' });
  } catch (error) {
    console.error('Error al guardar el mensaje:', error);
    res.status(500).json({ message: 'Error al guardar el mensaje.' });
  }
}

async function enviarMensajesTemplates(req, res) {
  try {
    const { clienteId, mensaje } = req.body;
    console.log("en teoria el mensaje enviado es:" + mensaje)
    if (!clienteId) {
      return res.status(400).json({ success: false, message: "No se recibió clienteId" });
    }

    if (!mensaje) {
      return res.status(400).json({ success: false, message: "No se recibió el mensaje" });
    }

    // Buscar al admin que tenga un lavado con el ID del cliente proporcionado
    const admin = await Admin.findOne({ 'lavados._id': clienteId });

    if (admin) {
      const lavado = admin.lavados.find(lavado => lavado._id.toString() === clienteId);

      if (lavado) {
        // Enviar el mensaje al número de WhatsApp del cliente
        await sendWhatsAppMessage(`whatsapp:${lavado.from}`, mensaje);

        console.log(`Mensaje enviado a ${lavado.from} para el cliente ${lavado.nombre}`);
        res.json({ success: true, message: "Mensaje enviado con éxito" });
      } else {
        return res.status(404).json({ success: false, message: "Lavado no encontrado" });
      }
    } else {
      return res.status(404).json({ success: false, message: "Admin no encontrado" });
    }
  } catch (error) {
    console.error("Error al enviar el mensaje:", error);
    res.status(500).json({ success: false, message: "Error al enviar el mensaje" });
  }
}

// Función para actualizar el tag seleccionado
async function updateTagSelected(req, res) {
  console.log("ENTRE DENTRO DE UPDATE!!");

  const idLocal = req.params.idLocal; // ID del local
  const { tagSelected } = req.body; // Nuevo valor del tag

  console.log("ID Local:", idLocal);  // Verificar si el ID es correcto
  console.log("Tag seleccionado enviado:", tagSelected);  // Verificar si el tag enviado es el correcto

  // Obtener el nombre del usuario desde la cookie
  const username = req.cookies.username || "Usuario desconocido";

  try {
    // Recuperar el documento antes de la actualización
    const admin = await Admin.findById(idLocal);
    if (!admin) {
      console.error("Admin/local no encontrado con el ID:", idLocal);
      return res.status(404).json({ error: 'Admin/local no encontrado' });
    }

    // Imprimir información detallada en la consola antes de la actualización
    console.log("Detalles del admin encontrado:");
    console.log(" - Nombre del Local:", admin.localName);
    console.log(" - Número de Teléfono del Local:", admin.localNumber);
    console.log(" - Tag Actual:", admin.tagSelected);
    console.log(" - Usuario que inició sesión:", username);

    // Actualizar el campo tagSelected
    admin.tagSelected = tagSelected;
    console.log("Tag seleccionado después de la actualización:", admin.tagSelected);  // Verificar si el campo se actualizó

    // Guardar el documento actualizado
    await admin.save();

    // Verificar si el documento se guardó correctamente y recuperar información actualizada
    const updatedAdmin = await Admin.findById(idLocal);

    // Respuesta JSON con información detallada de la actualización
    res.status(200).json({
      message: "Tag seleccionado actualizado",
      localName: updatedAdmin.localName,
      tagSelected: updatedAdmin.tagSelected,
      username: username,  // Nombre del usuario que inició sesión
      localNumber: updatedAdmin.localNumber  // Número de teléfono del local
    });

    // Imprimir confirmación final en la consola
    console.log("Actualización completada:");
    console.log(" - Nombre del Local:", updatedAdmin.localName);
    console.log(" - Nuevo Tag Seleccionado:", updatedAdmin.tagSelected);
    console.log(" - Usuario que inició sesión:", username);

  } catch (error) {
    console.error('Error al actualizar el tag seleccionado:', error);
    res.status(500).json({ error: 'Error al actualizar el tag seleccionado' });
  }
}

//FUNCION PARA AVISAR AL USUARIO QUE SU PEDIDO ESTA LISTO---->
async function notifyUserForPickUp(req, res) {
  const fechaRetiro = new Date();  // Fecha actual cuando el pedido es retirado
  const idLocal = req.params.idLocal; // ID del local pasado por la cookie
  const { tagNumber } = req.body;

  console.log("ID Local:", idLocal);  // Verificar si el ID es correcto
  console.log("Tag seleccionado enviado:", tagNumber);  // Verificar si el tag enviado es correcto

  try {
    // Buscar el local en función del idLocal
    const localAdmin = await Admin.findById(idLocal);

    if (!localAdmin) {
      return res.status(404).json({ error: 'No se encontró el local' });
    }

    // Buscar el cliente que tiene el pedido en espera en función del número de tag
    const cliente = localAdmin.clientes.find(cliente =>
      cliente.historialPedidos.some(p => p.tagNumber === tagNumber && p.estadoPorBarra === 'en espera')
    );

    if (cliente) {
      // Encontrar el pedido dentro del historial de pedidos
      const pedido = cliente.historialPedidos.find(p => p.tagNumber === tagNumber && p.estadoPorBarra === 'en espera');

      if (pedido) {
        // Actualizar con la fecha y hora del retiro
        pedido.fechaRetiro = fechaRetiro;

        // Calcular la diferencia en milisegundos
        const diferenciaMs = fechaRetiro - pedido.fechaPedido;

        // Convertir la diferencia en segundos
        const segundos = Math.floor(diferenciaMs / 1000);

        // Almacenar el tiempo de espera en segundos
        pedido.tiempoEspera = segundos;

        console.log("Tiempo de espera en segundos:", pedido.tiempoEspera);

        // Enviar notificación de que el pedido está listo
        await sendWhatsAppMessage(`whatsapp:${cliente.from}`, '🎉 ¡Tu pedido está listo para ser retirado! 😊');

        // Actualizar el estado del pedido a "a confirmar retiro"
        pedido.estadoPorBarra = 'a confirmar retiro';

        // Guardar el estado actualizado del pedido en el cliente
        await localAdmin.save();

        // Calcular el promedio de tiempo de espera para todos los pedidos de este cliente
        const totalPedidos = cliente.historialPedidos.length;
        const totalTiempoEspera = cliente.historialPedidos.reduce((total, p) => total + p.tiempoEspera, 0);

        // Calcular el promedio del tiempo de espera
        const promedioTiempo = totalTiempoEspera / totalPedidos;

        // Guardar el promedio en el cliente
        cliente.promedioTiempo = promedioTiempo;

        // Convertir el promedio a horas, minutos y segundos
        const horasPromedio = Math.floor(promedioTiempo / 3600);
        const minutosPromedio = Math.floor((promedioTiempo % 3600) / 60);
        const segundosPromedio = Math.floor(promedioTiempo % 60);

        console.log(`Promedio de espera: ${horasPromedio} horas, ${minutosPromedio} minutos y ${segundosPromedio} segundos`);

        // Guardar nuevamente el local con el promedio actualizado
        await localAdmin.save();

        res.json({ message: 'Notificación enviada y estado actualizado' });
      } else {
        res.status(404).json({ error: 'No se encontró el pedido en estado "en espera"' });
      }
    } else {
      res.status(404).json({ error: 'No se encontró el cliente con este número de tag en estado "en espera"' });
    }
  } catch (error) {
    console.error('Error al notificar al usuario:', error.message);
    res.status(500).json({ error: 'Error al notificar al usuario' });
  }
}

//FUNCION PARA CONFIRMACION DE ENTREGA DE SU PEDIDO---->
async function notifyUserPickedUp(req, res) {
  const { tagNumber } = req.body;
  const localNumber = req.cookies.localNumber; // Aquí obtenemos el localNumber desde la cookie

  if (!localNumber) {
    return res.status(400).json({ error: 'No se proporcionó el número de local (localNumber) en la cookie' });
  }

  try {
    // Buscar el admin por su número de local (localNumber)
    const admin = await Admin.findOne({ localNumber });

    if (!admin) {
      return res.status(404).json({ error: 'No se encontró el local/admin con ese número' });
    }

    // Buscar el cliente que tiene un pedido con el estado "a confirmar retiro" y el número de tag correspondiente
    const cliente = admin.clientes.find(c =>
      c.historialPedidos.some(p => p.tagNumber === tagNumber && p.estadoPorBarra === 'a confirmar retiro')
    );

    if (cliente) {
      // Encontrar el pedido dentro del historial de pedidos
      const pedido = cliente.historialPedidos.find(p =>
        p.tagNumber === tagNumber && p.estadoPorBarra === 'a confirmar retiro'
      );

      if (pedido) {
        // Enviar notificación de confirmación al cliente
        console.log(`Enviando notificación de retiro confirmado al cliente con el número: ${cliente.from}`);
        await sendWhatsAppTemplateMessage(`whatsapp:${cliente.from}`, ['1', '2', '3']);

        // Actualizar el estado del pedido a "retiro confirmado"
        pedido.estadoPorBarra = 'retiro confirmado';
        await admin.save();

        // Responder con éxito
        res.json({ message: 'Notificación enviada y estado actualizado a "retiro confirmado"' });
      } else {
        res.status(404).json({ error: 'No se encontró un pedido con el estado "a confirmar retiro" para este número de tag' });
      }
    } else {
      res.status(404).json({ error: 'No se encontró un cliente para este número de tag' });
    }
  } catch (error) {
    console.error('Error al notificar al usuario:', error.message);
    res.status(500).json({ error: 'Error al notificar al usuario' });
  }
}

// Función para validar el QR y redirigir a WhatsApp
async function qrScanUpdate(req, res) {
  const adminId = req.params.localId;
  console.log("EL ADMIN QUE SE ESTA BUSCANDO CON EL QR ES: " + adminId);

  // Obtener el nombre del usuario desde la cookie
  const username = req.cookies.username || "Usuario desconocido";

  try {
    // Buscar el admin en la base de datos
    const admin = await Admin.findById(adminId);
    if (!admin) {
      console.error("Admin/local no encontrado con el ID:", adminId);
      return res.status(404).send('Admin no encontrado');
    }

    // Obtener información adicional del admin
    const localName = admin.localName;
    const localNumber = admin.localNumber;
    const tagSelected = admin.tagSelected;

    // Construir el mensaje simplificado para WhatsApp
    const message = `Pedido - Tag: ${tagSelected}, Local: ${localName}, Tel: ${localNumber}, Usuario: ${username}, ID: ${adminId}`;

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

// //FUNCION PARA VALIDAR EL QR---->
async function catchDbData(req, res) {
  const adminId = req.params.adminId; // Actualiza para recibir adminId
  try {
    const admin = await Admin.findById(adminId); // Busca por ID

    if (admin) {
      return res.status(200).json({ message: 'Información del usuario', data: admin });
    } else {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
  } catch (error) {
    console.error("Error al acceder a la base de datos:", error);
    return res.status(500).json({ message: 'Error interno del servidor' });
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
  catchDbData
};
