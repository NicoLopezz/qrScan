import twilio from 'twilio';
import dotenv from 'dotenv';

dotenv.config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

// Verificar que las variables de entorno existan
if (!accountSid || !authToken) {
    throw new Error('Faltan las credenciales de Twilio en las variables de entorno');
}

const client = new twilio(accountSid, authToken);

// Función para enviar mensajes de WhatsApp
export const sendWhatsAppMessage = async (to, body) => {
    try {
        console.log(`Enviando mensaje a: ${to}`);
        await client.messages.create({
            body,
            from: 'whatsapp:+14155238886', // Asegúrate de usar el número correcto (sandbox o producción)
            to: `${to}`, // Número del destinatario con el prefijo 'whatsapp:'
        });
        console.log(`Mensaje enviado a ${to}`);
    } catch (error) {
        console.error('Error al enviar mensaje:', error);
    }
};
