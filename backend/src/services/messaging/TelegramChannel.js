import bot from './telegramBot.js';

const botUsername = process.env.TELEGRAM_BOT_USERNAME || '';

/** @type {import('./MessageChannel.js').MessageChannel} */
const telegramChannel = {
  name: 'telegram',

  async sendMessage(chatId, body) {
    if (!bot) {
      console.warn('Telegram bot no configurado');
      return;
    }
    try {
      await bot.api.sendMessage(chatId, body, { parse_mode: 'Markdown' });
      console.log(`Telegram mensaje enviado a chatId: ${chatId}`);
    } catch (error) {
      console.error('Error enviando mensaje Telegram:', error.message);
    }
  },

  async sendTemplateMessage(chatId, templateParams) {
    // Telegram no tiene templates nativos — formateamos el mensaje inline
    const [nombre, patente, progreso] = templateParams;
    const body = [
      `Hola *${nombre || 'cliente'}*!`,
      '',
      `Tu vehiculo con patente *${patente || ''}* esta *listo para retirar*.`,
      progreso ? `Progreso de fidelidad: ${progreso}` : '',
      '',
      'Te esperamos! Gracias por elegirnos.',
    ].filter(Boolean).join('\n');

    await this.sendMessage(chatId, body);
  },

  buildQrRedirectUrl(adminData, entityData, flowType) {
    // Deep link: https://t.me/BotUsername?start=PAYLOAD
    // Payload: flowType_adminId_entityCode (max 64 chars)
    const adminId = adminData._id.toString();
    const code = entityData._id.toString().slice(-5);
    const payload = `${flowType}_${adminId}_${code}`;

    return `https://t.me/${botUsername}?start=${payload}`;
  },
};

export default telegramChannel;
