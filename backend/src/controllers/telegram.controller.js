import bot from '../services/messaging/telegramBot.js';
import { processDeepLink, processIncoming } from '../services/messaging/messageHandler.js';

// Registrar handlers del bot (se ejecuta una sola vez al importar)
if (bot) {
  bot.command('start', async (ctx) => {
    const payload = ctx.match;
    if (payload) {
      await processDeepLink({
        payload,
        chatId: ctx.chat.id,
        telegramFrom: ctx.from?.username || String(ctx.from?.id) || '',
      });
    } else {
      await ctx.reply(
        'Bienvenido a *PickUp Time*!\n\nEscanea el codigo QR en el local para confirmar tu servicio.',
        { parse_mode: 'Markdown' }
      );
    }
  });

  bot.on('message:text', async (ctx) => {
    const text = ctx.message.text;
    if (text.startsWith('/')) return;

    await processIncoming({
      from: ctx.from?.username || String(ctx.from?.id) || '',
      body: text,
      channel: 'telegram',
      chatId: String(ctx.chat.id),
      adminNumber: null,
    });
  });
}

/**
 * Express middleware para el webhook de Telegram.
 * Se crea lazy (solo en prod) para no conflictuar con polling en dev.
 */
let _webhookHandler = null;

export const telegramWebhook = async (req, res) => {
  if (!bot) return res.sendStatus(200);

  // Validate secret token to prevent fake webhook calls
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (secret && req.headers['x-telegram-bot-api-secret-token'] !== secret) {
    return res.sendStatus(403);
  }

  if (!_webhookHandler) {
    const { webhookCallback } = await import('grammy');
    _webhookHandler = webhookCallback(bot, 'express');
  }
  return _webhookHandler(req, res);
};
