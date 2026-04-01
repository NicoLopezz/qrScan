import { sendWhatsAppMessage, sendWhatsAppTemplateMessage } from '../twilioService.js';

/** @type {import('./MessageChannel.js').MessageChannel} */
const whatsAppChannel = {
  name: 'whatsapp',

  async sendMessage(to, body) {
    await sendWhatsAppMessage(`whatsapp:${to}`, body);
  },

  async sendTemplateMessage(to, templateParams) {
    await sendWhatsAppTemplateMessage(`whatsapp:${to}`, templateParams);
  },

  buildQrRedirectUrl(adminData, entityData, flowType) {
    const number = adminData.localNumber;
    let message = '';

    if (flowType === 'lavado') {
      const code = entityData._id.toString().slice(-5);
      message = `${entityData.nombre}, confirmo servicio de lavado. Código: ${code}`;
    } else if (flowType === 'reserva') {
      const code = entityData._id.toString().slice(-5);
      message = `Hola! ${entityData.nombre}, vamos a validar la reserva para ${entityData.comensales} comensales, con la observación: "${entityData.observacion}". Código: ${code}`;
    } else if (flowType === 'tag') {
      message = `Pedido - Tag: ${entityData.tagNumber}, Local: ${adminData.localName}, Tel: ${number}, Usuario: ${adminData.username}, ID: ${adminData._id}`;
    }

    return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
  },
};

export default whatsAppChannel;
