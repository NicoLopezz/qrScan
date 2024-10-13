import Cliente from '../models/clienteModel.js';  // Nuevo modelo Cliente con historialPedidos
import { sendWhatsAppMessage, sendWhatsAppTemplateMessage } from '../services/twilioService.js';
import dayjs from 'dayjs'; // Recomendado para manejar fechas


//FUNCION MODULAR!
// Función principal que maneja los diferentes casos según el contenido del mensaje
// Recibir y guardar mensaje
async function reciveMessage(req, res) {
    const { From: fromWithPrefix, Body: body } = req.body;

    // Validar que los datos lleguen correctamente
    if (!fromWithPrefix || !body) {
        return res.status(400).send('Faltan datos necesarios en la solicitud');
    }

    // Quitar el prefijo 'whatsapp:' del número de teléfono
    const from = fromWithPrefix.replace('whatsapp:', '');

    try {
        // Responder inmediatamente a Twilio para evitar duplicados
        res.status(200).send('<Response></Response>');

        // Determinar el caso según el contenido del mensaje
        switch (true) {
            case /número de tag: \d+/i.test(body):
                // Caso 1: Mensaje contiene un número de tag
                await handleTagMessage(body, from);
                break;

            case /sí|ya lo tengo/i.test(body.toLowerCase()):
                // Caso 2: Mensaje de confirmación de retiro
                await handleConfirmationMessage(from, body);
                break;

            default:
                console.log("Mensaje no reconocido. Contenido del mensaje:", body);
                break;
        }

    } catch (error) {
        console.error('Error al procesar el mensaje:', error.message);
        res.status(500).send('Error al procesar el mensaje');
    }
}

// Manejar el mensaje cuando el cliente envía un número de tag
async function handleTagMessage(body, from) {
    const tagNumberMatch = body.match(/número de tag: (\d+)/); // Extraer el número de tag
    const tagNumber = tagNumberMatch ? parseInt(tagNumberMatch[1], 10) : null;
    const fecha = dayjs().format('HH:mm:ss DD/MM/YYYY');

    if (tagNumber !== null) {
        let clienteDoc = await Cliente.findOne({ from });

        const nuevoPedido = {
            tagNumber,
            fechaPedido: fecha,            // Fecha cuando se hizo el pedido
            estadoPorBarra: 'en espera',    // Estado inicial del pedido
            confirmacionPorCliente: false,  // El cliente aún no ha confirmado el retiro
            mensajes: [{ body, fecha }],    // Mensajes iniciales
            fechaRetiro: null               // No hay fecha de retiro hasta que se confirme
        };

        if (clienteDoc) {
            // Si ya existe el cliente, agregar el nuevo pedido al historial
            clienteDoc.historialPedidos.push(nuevoPedido);
            await clienteDoc.save();
            console.log("Pedido guardado para el cliente con tag:", tagNumber);
        } else {
            // Si no existe, crea un nuevo cliente con el primer pedido en el historial
            clienteDoc = new Cliente({
                from,
                historialPedidos: [nuevoPedido]  // Guardar el primer pedido
            });
            await clienteDoc.save();
            console.log("Nuevo cliente y pedido guardado con tag:", tagNumber);
        }

        // Enviar respuesta automática al cliente
        const responseMessage = '🎉 ¡Hola!\n\nTu pedido está en la lista de espera.🕒\n\nTe avisaremos cuando esté listo.';
        await sendWhatsAppMessage(`whatsapp:${from}`, responseMessage);
    } else {
        console.log("No se pudo extraer un número de tag del mensaje.");
    }
}

// Manejar el mensaje de confirmación de retiro (cuando el cliente responde "sí, ya lo tengo")
async function handleConfirmationMessage(from, body) {
    const fecha = dayjs().format('HH:mm:ss DD/MM/YYYY');
    
    // Buscar el cliente y su historial de pedidos
    const clienteDoc = await Cliente.findOne({ from });

    if (clienteDoc) {
        // Buscar el pedido en el historial que esté en estado "a confirmar retiro" y que no haya sido confirmado
        const pedido = clienteDoc.historialPedidos.find(p => p.confirmacionPorCliente === false);
        
        if (pedido) {
            // Guardar el mensaje de confirmación y actualizar el estado del pedido
            pedido.mensajes.push({ body, fecha }); // Agregar el mensaje de confirmación
            // pedido.fechaRetiro = fecha;            // Actualizar con la fecha y hora del retiro
            pedido.estadoPorBarra = 'retiro confirmado';  // Cambiar el estado a retiro confirmado
            pedido.confirmacionPorCliente = true;         // Marcar como confirmado por el cliente
            await clienteDoc.save();
            console.log("Pedido confirmado como retirado para el tag:", pedido.tagNumber);

            // Enviar respuesta automática de confirmación
            const confirmationMessage = '🎉 ¡Gracias! Tu pedido ha sido confirmado como retirado.';
            await sendWhatsAppMessage(`whatsapp:${from}`, confirmationMessage);
        } else {
            console.error("No se encontró un pedido en estado 'a confirmar retiro' o ya ha sido confirmado.");
        }
    } else {
        console.error("No se encontró un cliente con el número:", from);
    }
}


// Notificar que el pedido está listo para ser retirado
async function notifyUserForPickUp(req, res) {
    const fecha = dayjs().format('HH:mm:ss DD/MM/YYYY');
    const { tagNumber } = req.body;
    console.log("FETCH DE RETIRO!")
    try {
        // Buscar el cliente que tiene el pedido en espera
        const cliente = await Cliente.findOne({ "historialPedidos.tagNumber": tagNumber, "historialPedidos.estadoPorBarra": 'en espera' });

        if (cliente) {
            // Encontrar el pedido dentro del historial de pedidos
            const pedido = cliente.historialPedidos.find(p => p.tagNumber === tagNumber && p.estadoPorBarra === 'en espera');
            pedido.fechaRetiro = fecha;            // Actualizar con la fecha y hora del retiro

            if (pedido) {
                // Enviar notificación de que el pedido está listo
                await sendWhatsAppMessage(`whatsapp:${cliente.from}`, '🎉 ¡Tu pedido está listo para ser retirado! 😊');

                // Actualizar el estado del pedido a "a confirmar retiro"
                pedido.estadoPorBarra = 'a confirmar retiro';
                await cliente.save();

                res.json({ message: 'Notificación enviada y estado actualizado' });
            }
        } else {
            res.status(404).json({ error: 'No se encontró el pedido para este número de tag' });
        }
    } catch (error) {
        console.error('Error al notificar al usuario:', error.message);
        res.status(500).json({ error: 'Error al notificar al usuario' });
    }
}

// Notificar que el pedido fue confirmado como retirado
async function notifyUserPickedUp(req, res) {
    const { tagNumber } = req.body;

    try {
        // Buscar el cliente que tiene el pedido en "a confirmar retiro"
        const cliente = await Cliente.findOne({ "historialPedidos.tagNumber": tagNumber, "historialPedidos.estadoPorBarra": 'a confirmar retiro' });

        if (cliente) {
            // Encontrar el pedido dentro del historial de pedidos
            const pedido = cliente.historialPedidos.find(p => p.tagNumber === tagNumber && p.estadoPorBarra === 'a confirmar retiro');

            if (pedido) {
                // Enviar notificación de confirmación al cliente
                await sendWhatsAppTemplateMessage(`whatsapp:${cliente.from}`, ['1', '2', '3']);

                // Actualizar el estado del pedido a "retiro confirmado"
                pedido.estadoPorBarra = 'retiro confirmado';
                await cliente.save();

                res.json({ message: 'Notificación enviada y estado actualizado' });
            }
        } else {
            res.status(404).json({ error: 'No se encontró el pedido para este número de tag' });
        }
    } catch (error) {
        console.error('Error al notificar al usuario:', error.message);
        res.status(500).json({ error: 'Error al notificar al usuario' });
    }
}

// Exportar los métodos
export const methods = {
    reciveMessage,
    notifyUserForPickUp,
    notifyUserPickedUp,
};
