import Message from '../models/messageModel.js';
import { sendWhatsAppMessage } from '../services/twilioService.js';

// Recibir y guardar mensaje
export const receiveMessage = async (req, res) => {
    const { From: from, Body: body } = req.body;
    
    try {
        const newMessage = new Message({
            from,
            body,
            status: 'en espera',
            createdAt: new Date(),
        });
        await newMessage.save();
        const responseMessage = '🎉 ¡Hola!\n\nTu pedido está en la lista de espera.🕒\n\nTe avisaremos cuando esté listo.';
        res.send(responseMessage);
    } catch (error) {
        res.status(500).send('Error al guardar el mensaje');
    }
};

// Notificar al usuario cuando su pedido esté listo
export const notifyUser = async (req, res) => {
    const { phone } = req.body;

    const message = await Message.findOne({ from: phone, status: 'en espera' });
    if (message) {
        await sendWhatsAppMessage(phone, '🎉 ¡Tu pedido está listo para ser retirado! 😊');
        await Message.updateOne({ from: phone }, { status: 'completado' });
        res.send('Notificación enviada y estado actualizado');
    } else {
        res.status(404).send('No se encontró el pedido');
    }
};
