import { config } from 'dotenv';
import twilio from 'twilio';

config(); // Carga las variables de entorno

const accountSid = process.env.ACCOUNT_SID;
const authToken = process.env.AUTH_TOKEN;

const client = new twilio(accountSid, authToken);

// Función para enviar un mensaje
const sendMessage = async (to, body) => {
    try {
        const message = await client.messages.create({
            body: "Ya estas en la espera, te llegara un mensaje cuando tu pedido este listo!",
            from: 'whatsapp:+14155238886', // Tu número de Twilio para WhatsApp
            to: `whatsapp:+5491153836633` // Número del destinatario
        });
        console.log(`Mensaje enviado: todo de 10!}`);
    } catch (error) {
        console.error('Error al enviar el mensaje:', error);
    }
};

client.messages
    .create({
        body: '🎉 ¡Hola! Tu pedido está en la lista de espera.🕒 Estaremos procesando tu solicitud y te notificaremos cuando sea el momento de pasar a retirarlo. ¡Gracias por tu paciencia! 😋',
        from: 'whatsapp:+14155238886',
        to: 'whatsapp:+5491153836633'
    })
    .then(message => console.log(message.sid))
    .done();



sendMessage();
export const methods = {
    sendMessage,
}