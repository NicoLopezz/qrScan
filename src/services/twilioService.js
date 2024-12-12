import twilio from 'twilio';
import dotenv from 'dotenv';

dotenv.config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

console.log(accountSid)
console.log(authToken)

const client = new twilio(accountSid, authToken);

// Verificar que las variables de entorno existan
if (!accountSid || !authToken) {
    throw new Error('Faltan las credenciales de Twilio en las variables de entorno');
}


// Función para enviar mensajes de WhatsApp
export const sendWhatsAppMessage = async (to, body) => {
    try {
        console.log(`Enviando mensaje a: ${to}`);
        await client.messages.create({
            body,
            // from: 'whatsapp:+18643651639', // Asegúrate de usar el número correcto (sandbox o producción)
            from: 'whatsapp:+5491135254661', // Asegúrate de usar el número correcto (sandbox o producción)
            to: `${to}`, 
        });
        console.log(`Mensaje enviado a ${to}`);
    } catch (error) {
        console.error('Error al enviar mensaje:', error);
    }
};

// Función para enviar mensajes de WhatsApp utilizando una plantilla
export const sendWhatsAppTemplateMessage = async (to, templateParams) => {
    try {
        console.log(`Enviando mensaje a: ${to}`);

        await client.messages.create({
            from: 'whatsapp:+5491135254661', // Número de WhatsApp de Twilio (sandbox o producción)
            to: `${to}`,           // El número de WhatsApp del destinatario, con el formato correcto
            contentSid: 'HX44c6ba98aab36cb65ddd698044da3e70', // El SID de la plantilla
            contentVariables: JSON.stringify({
                1: templateParams[0],   // Parsea los parámetros de la plantilla, asegurando que coincidan
                2: templateParams[1],   // con los campos que definiste en la plantilla.
                3: templateParams[2],   // Agrega tantos parámetros como sea necesario.
            }),
        });

        console.log(`Mensaje enviado a ${to}`);
    } catch (error) {
        console.error('Error al enviar mensaje:', error);
    }
}

