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

    try {
        // Responder inmediatamente a Twilio para evitar duplicados
        res.status(200).send('<Response></Response>');

        // Buscar si ya existe un documento para este número
        let messageDoc = await Message.findOne({ from });

        // Formatear la fecha en formato deseado (hora:minuto:segundo día/mes/año)
        const fecha = dayjs().format('HH:mm:ss DD/MM/YYYY');

        if (messageDoc) {
            // Si el número ya existe, agrega el nuevo mensaje al arreglo 'mensajes'
            messageDoc.mensajes.push({ body, fecha });
            messageDoc.status = 'en espera';  // Actualizar el estado si es necesario
            await messageDoc.save();
        } else {
            // Si no existe, crea un nuevo documento con el número, el estado y el primer mensaje
            const newMessage = new Message({
                from,  // Guarda solo el número de teléfono sin 'whatsapp:'
                status: 'en espera', // Estado inicial del pedido
                mensajes: [{ body, fecha }]
            });
            await newMessage.save();
        }

        // Mensaje de respuesta automática
        const responseMessage = '🎉 ¡Hola!\n\nTu pedido está en la lista de espera.🕒\n\nTe avisaremos cuando esté listo.';
        
        // Envía la respuesta automática usando el servicio de Twilio
        await sendWhatsAppMessage(fromWithPrefix, responseMessage);

    } catch (error) {
        console.error('Error al recibir el mensaje:', error.message);
    }
}



// Notificar al usuario cuando su pedido esté listo
async function notifyUser(req, res) {
    const { phone } = req.body;

    try {
        const message = await Message.findOne({ from: phone, status: 'en espera' });
        if (message) {
            // Enviar notificación de que el pedido está listo
            await sendWhatsAppMessage(phone, '🎉 ¡Tu pedido está listo para ser retirado! 😊');
            // Actualizar el estado del pedido a 'completado'
            await Message.updateOne({ from: phone }, { status: 'completado' });
            res.send('Notificación enviada y estado actualizado');
        } else {
            res.status(404).send('No se encontró el pedido');
        }
    } catch (error) {
        console.error('Error al notificar al usuario:', error.message);
        res.status(500).send('Error al notificar al usuario');
    }
};



export const methods = {
    reciveMessage,  // Corregido el nombre de la función
    notifyUser,
};
