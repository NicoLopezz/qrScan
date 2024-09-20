// import { config } from 'dotenv';
// import twilio from 'twilio';

// config(); // Carga las variables de entorno

// const accountSid = 'AC0b0981a4c96da25f3d72032df5f5246a';
// const authToken ='8e97bb93bf9f5fc173449e8a647995e4';


// const client = new twilio(accountSid, authToken);

// // Función para enviar un mensaje
// const sendMessage = async (to, body) => {
//     try {
//         const message = await client.messages.create({
//             body: "Ya estas en la espera, te llegara un mensaje cuando tu pedido este listo!",
//             from: 'whatsapp:+14155238886', // Tu número de Twilio para WhatsApp
//             to: `whatsapp:+5491153836633` // Número del destinatario
//         });
//         console.log(`Mensaje enviado: todo de 10!}`);
//     } catch (error) {
//         console.error('Error al enviar el mensaje:', error);
//     }
// };



// sendMessage();
// export const methods = {
//     sendMessage,
// }