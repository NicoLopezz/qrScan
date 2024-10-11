import Message from '../models/messageModel.js';
import { sendWhatsAppMessage } from '../services/twilioService.js';
import dayjs from 'dayjs'; // Recomendado para manejar fechas

// Recibir y guardar mensaje
async function reciveMessage(req, res) {
    const { From: fromWithPrefix, Body: body } = req.body;

    // Validar que los datos lleguen correctamente
    if (!fromWithPrefix || !body) {
        return res.status(400).send('Faltan datos necesarios en la solicitud');
    }

    // Quitar el prefijo 'whatsapp:' del número de teléfono
    const from = fromWithPrefix.replace('whatsapp:', '');

    // Extraer el tagNumber del cuerpo del mensaje
    const tagNumberMatch = body.match(/número de tag: (\d+)/); // Busca el número de tag en el mensaje
    const tagNumber = tagNumberMatch ? parseInt(tagNumberMatch[1], 10) : null;

    console.log("Número de tag extraído:", tagNumber);


    // Validar que se haya extraído el número de tag correctamente
    if (!tagNumber) {
        return res.status(400).send('No se encontró el número de tag en el mensaje');
    }

    try {
        // Responder inmediatamente a Twilio para evitar duplicados
        res.status(200).send('<Response></Response>');

        // Formatear la fecha en formato deseado (hora:minuto:segundo día/mes/año)
        const fecha = dayjs().format('HH:mm:ss DD/MM/YYYY');

        // Buscar si ya existe un documento para este número de teléfono
        let messageDoc = await Message.findOne({ from });

        if (messageDoc) {
            // Si el número ya existe, agrega el nuevo mensaje al arreglo 'mensajes'
            messageDoc.mensajes.push({ body, fecha });
            messageDoc.status = 'en espera';  // Actualizar el estado si es necesario
            messageDoc.tagNumber = tagNumber; // Actualizar el tagNumber si es necesario
            console.log("Número de tag extraído!!!1:", tagNumber);

            await messageDoc.save();  // Aquí estamos guardando el documento actualizado
        } else {
            // Si no existe, crea un nuevo documento con el número, el estado, el tag y el primer mensaje
            messageDoc = new Message({
                from,  // Guarda solo el número de teléfono sin 'whatsapp:'
                status: 'en espera', // Estado inicial del pedido
                tagNumber: tagNumber,  // Guarda el número de tag asociado
                mensajes: [{ body, fecha }]
            });
        }

        // Guardar el documento (sea actualizado o nuevo)
        console.log("Número de tag extraído:!!!@2", tagNumber);

        await messageDoc.save();

        // Mensaje de respuesta automática
        const responseMessage = '🎉 ¡Hola!\n\nTu pedido está en la lista de espera.🕒\n\nTe avisaremos cuando esté listo.';
        
        // Envía la respuesta automática usando el servicio de Twilio
        await sendWhatsAppMessage(fromWithPrefix, responseMessage);

    } catch (error) {
        console.error('Error al recibir el mensaje:', error.message);
        res.status(500).send('Error al procesar el mensaje');
    }
}


async function notifyUserForPickUp(req, res) {
    const { tagNumber } = req.body;
    console.log("FETCH DE RETIRO!")
    try {
        // Buscar el mensaje relacionado con el tagNumber en la base de datos
        const message = await Message.findOne({ tagNumber, status: 'en espera' });
        
        if (message) {
            // Enviar notificación de que el pedido está listo al número de teléfono asociado
            const phoneNumber = message.from;  // Obtener el número de teléfono
            await sendWhatsAppMessage(`whatsapp:${phoneNumber}`, '🎉 ¡Tu pedido está listo para ser retirado! 😊');

            // Actualizar el estado del pedido a 'completado'
            await Message.updateOne({ tagNumber }, { status: 'a confirmar retiro' });

            res.json({ message: 'Notificación enviada y estado actualizado' });
        } else {
            res.status(404).json({ error: 'No se encontró el pedido para este número de tag' });
        }
    } catch (error) {
        console.error('Error al notificar al usuario:', error.message);
        res.status(500).json({ error: 'Error al notificar al usuario' });
    }
}

async function notifyUserPickedUp(req, res) {
    const { tagNumber } = req.body;

    try {
        // Buscar el mensaje relacionado con el tagNumber en la base de datos
        const message = await Message.findOne({ tagNumber, status: 'a confirmar retiro' });
        
        if (message) {
            // Enviar notificación de que el pedido está listo al número de teléfono asociado
            const phoneNumber = message.from;  // Obtener el número de teléfono
            await sendWhatsAppMessage(`whatsapp:${phoneNumber}`, '🎉 Nos inforaron que confirmaste el pedido, es asi? 😊 1:si, gracias 2:no,pero estoy en eso');

            // Actualizar el estado del pedido a 'completado'
            await Message.updateOne({ tagNumber }, { status: 'retirado' });

            res.json({ message: 'Notificación enviada y estado actualizado' });
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
    // notifyUser,
};
