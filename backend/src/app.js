import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { createServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import { rateLimit } from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import { verifyTokenMiddleware } from './middleware/verifyToken.js';
import { verifyToken } from './utils/jwt.js';
import cookie from 'cookie';

// Route imports
import authRoutes from './routes/auth.routes.js';
import lavadosRoutes from './routes/lavados.routes.js';
import cajaRoutes from './routes/caja.routes.js';
import reservasRoutes from './routes/reservas.routes.js';
import mensajesRoutes from './routes/mensajes.routes.js';
import automatizacionesRoutes from './routes/automatizaciones.routes.js';
import clientesRoutes from './routes/clientes.routes.js';

// Messaging channels
import { registerChannel } from './services/messaging/channelRegistry.js';
import whatsAppChannel from './services/messaging/WhatsAppChannel.js';
import telegramChannel from './services/messaging/TelegramChannel.js';

const app = express();
app.use(helmet());
app.use(cookieParser());
app.use(verifyTokenMiddleware);

// HTTP server + Socket.IO
const httpServer = createServer(app);
const io = new SocketServer(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
});

// CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Register messaging channels
registerChannel(whatsAppChannel);
registerChannel(telegramChannel);

// Rate limiting
const whatsappLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 20,
  message: { success: false, message: 'Demasiadas solicitudes. Intentá en unos minutos.' }
});
app.use('/api/enviarMensajesTemplates', whatsappLimiter);
app.use('/api/enviarMensajeCuentaRegresiva', whatsappLimiter);
app.use('/api/enviarAvisoRetiroLavado', whatsappLimiter);
app.use('/api/enviarEncuesta', whatsappLimiter);

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: 'Demasiados intentos de login. Intentá en 15 minutos.' }
});
app.use('/api/login', loginLimiter);

// Global rate limiter for authenticated API routes
const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  message: { success: false, message: 'Demasiadas solicitudes. Intentá en un momento.' },
  skip: (req) => {
    // Skip public endpoints (QR, webhooks)
    const publicPaths = ['/api/webhook', '/api/telegram/webhook', '/api/qrScan'];
    return publicPaths.some(p => req.path.startsWith(p));
  },
});
app.use('/api', apiLimiter);

// Stricter limiter for broadcast
const broadcastLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: { success: false, message: 'Límite de broadcasts alcanzado. Intentá en una hora.' },
});
app.use('/api/mensajes/broadcast', broadcastLimiter);

// Routes
app.use('/api', authRoutes);
app.use('/api', lavadosRoutes);
app.use('/api', cajaRoutes);
app.use('/api', reservasRoutes);
app.use('/api', mensajesRoutes);
app.use('/api', automatizacionesRoutes);
app.use('/api', clientesRoutes);

// Socket.IO auth middleware
io.use((socket, next) => {
  try {
    const cookies = cookie.parse(socket.handshake.headers.cookie || '');
    const token = cookies.token;
    if (!token) return next(new Error('No auth token'));
    const decoded = verifyToken(token);
    socket.user = decoded;
    next();
  } catch (err) {
    next(new Error('Invalid token'));
  }
});

// Socket.IO connection
io.on('connection', (socket) => {
  const { adminId } = socket.user;
  socket.join(adminId);

  socket.on('tagSelected', (tagNumber) => {
    io.to(adminId).emit('updateQRCode', tagNumber);
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(`[ERROR] ${req.method} ${req.path}:`, err.message);
  const message = process.env.NODE_ENV === 'production'
    ? 'Error interno del servidor'
    : err.message || 'Error interno del servidor';
  res.status(err.status || 500).json({ success: false, message });
});

export { httpServer, io };
export default app;
