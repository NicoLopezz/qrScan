import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

const client = (accountSid && authToken) ? new twilio(accountSid, authToken) : null;


// Función para enviar mensajes de WhatsApp
export const sendWhatsAppMessage = async (to, body) => {
    if (!client) { console.warn('Twilio no configurado'); return; }
    try {
        console.log(`Enviando mensaje a: ${to}`);
        await client.messages.create({
            body,
            // from: 'whatsapp:+18643651639', // Asegúrate de usar el número correcto (sandbox o producción)
            from: `whatsapp:${process.env.TWILIO_WHATSAPP_FROM}`,
            to: `${to}`,
        });
        console.log(`Mensaje enviado a ${to}`);
    } catch (error) {
        console.error('Error al enviar mensaje:', error);
    }
};

// Función para enviar mensajes de WhatsApp utilizando una plantilla
export const sendWhatsAppTemplateMessage = async (to, templateParams) => {
    if (!client) { console.warn('Twilio no configurado'); return; }
    try {
        console.log(`Enviando mensaje a: ${to}`);

        await client.messages.create({
            from: `whatsapp:${process.env.TWILIO_WHATSAPP_FROM}`,
            to: `${to}`,
            contentSid: process.env.TWILIO_TEMPLATE_SID,
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

