import twilio from 'twilio';
import dotenv from 'dotenv';

dotenv.config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = new twilio(accountSid, authToken);

// Función para enviar mensajes de WhatsApp
export const sendWhatsAppMessage = async (to, body) => {
    try {
        console.log(`Enviando mensaje a: ${to}`);
        await client.messages.create({
            body,
            from: 'whatsapp:+14155238886', // Número de Twilio
            to: `${to}`, // Número del destinatario
        });
        console.log(`Mensaje enviado a ${to}`);
    } catch (error) {
        console.error('Error al enviar mensaje:', error);
    }
};
