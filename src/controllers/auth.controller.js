import Message from '../models/messageModel.js';
import { sendWhatsAppMessage } from '../services/twilioService.js';
import { sendWhatsAppTemplateMessage } from '../services/twilioService.js';
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
        let messageDoc = await Message.findOne({ from });

        if (messageDoc) {
            // Si ya existe, actualiza el documento con el nuevo tag y mensaje
            messageDoc.mensajes.push({ body, fecha });
            messageDoc.tagNumber = tagNumber;
            messageDoc.estadoPorBarra = 'en espera';
            await messageDoc.save();
            console.log("Número de tag guardado:", tagNumber);
        } else {
            // Si no existe, crea un nuevo documento con el tag y el número de teléfono
            messageDoc = new Message({
                from,
                estadoPorBarra: 'en espera',
                tagNumber: tagNumber,
                mensajes: [{ body, fecha }]
            });
            await messageDoc.save();
            console.log("Nuevo pedido guardado con tag:", tagNumber);
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
    const messageDoc = await Message.findOne({ from, estadoPorBarra: 'retiro confirmado' });

    if (messageDoc && messageDoc.tagNumber) {
        // Guardar el mensaje de confirmación en el array 'mensajes'
        messageDoc.mensajes.push({ body, fecha });
        messageDoc.confirmacionPorCliente = true;  // Confirmar el retiro
        messageDoc.estadoPorBarra = 'retiro confirmado';  // Cambiar el estado a retiro confirmado
        await messageDoc.save();
        console.log("Pedido confirmado como retirado para el tag:", messageDoc.tagNumber);

        // Puedes enviar una respuesta automática si lo deseas
        const confirmationMessage = '🎉 ¡Gracias! Tu pedido ha sido confirmado como retirado.';
        await sendWhatsAppMessage(`whatsapp:${from}`, confirmationMessage);
    } else {
        console.error("No se encontró un pedido con tag asociado para confirmar el retiro.");
    }
}
























async function notifyUserForPickUp(req, res) {
    const { tagNumber } = req.body;
    console.log("FETCH DE RETIRO!")
    try {
        // Buscar el mensaje relacionado con el tagNumber en la base de datos
        const message = await Message.findOne({ tagNumber, estadoPorBarra: 'en espera' });
        
        if (message) {
            // Enviar notificación de que el pedido está listo al número de teléfono asociado
            const phoneNumber = message.from;  // Obtener el número de teléfono
            await sendWhatsAppMessage(`whatsapp:${phoneNumber}`, '🎉 ¡Tu pedido está listo para ser retirado! 😊');

            // Actualizar el estado del pedido a 'completado'
            await Message.updateOne({ tagNumber }, { estadoPorBarra: 'a confirmar retiro' });

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
        const message = await Message.findOne({ tagNumber, estadoPorBarra: 'a confirmar retiro' });
        
        if (message) {
            // Enviar notificación de que el pedido está listo al número de teléfono asociado
            const phoneNumber = message.from;  // Obtener el número de teléfono
            await sendWhatsAppTemplateMessage(`whatsapp:${phoneNumber}`, ['1', '2' , '3']);
            

            // Actualizar el estado del pedido a 'completado'
            await Message.updateOne({ tagNumber }, { estadoPorBarra: 'retiro confirmado' });

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
