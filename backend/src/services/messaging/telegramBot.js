import { Bot } from 'grammy';

const token = process.env.TELEGRAM_BOT_TOKEN;

/** @type {Bot | null} */
const bot = token ? new Bot(token) : null;

if (!token) {
  console.warn('TELEGRAM_BOT_TOKEN no configurado — Telegram deshabilitado');
}

export default bot;
