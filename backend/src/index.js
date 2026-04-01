import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// En producción (Render) las env vars se inyectan directamente.
// En desarrollo cargamos desde ../../.env como fallback.
dotenv.config();
if (!process.env.MONGODB_URI) {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  dotenv.config({ path: path.resolve(__dirname, '../../.env') });
}

// Dynamic imports para que .env esté cargado antes
const { httpServer } = await import('./app.js');
const { connectDB } = await import('./database.js');

const PORT = process.env.PORT || 3000;

try {
  await connectDB();
  httpServer.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
  });

  // Telegram bot: en dev usa polling, en prod usa webhook via Express route
  if (process.env.TELEGRAM_BOT_TOKEN) {
    const { default: bot } = await import('./services/messaging/telegramBot.js');
    if (bot) {
      // Los handlers ya se registran al importar telegram.controller.js (via routes)
      if (process.env.NODE_ENV === 'production' && process.env.TELEGRAM_WEBHOOK_URL) {
        const webhookOpts = {};
        if (process.env.TELEGRAM_WEBHOOK_SECRET) {
          webhookOpts.secret_token = process.env.TELEGRAM_WEBHOOK_SECRET;
        }
        await bot.api.setWebhook(process.env.TELEGRAM_WEBHOOK_URL, webhookOpts);
        console.log('Telegram bot: webhook mode');
      } else {
        await bot.api.deleteWebhook();
        bot.start();
        console.log('Telegram bot: polling mode (dev)');
      }
    }
  }
} catch (err) {
  console.error('No se pudo iniciar el servidor:', err.message);
  process.exit(1);
}
