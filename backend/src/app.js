import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import { rateLimit } from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import { verifyTokenMiddleware } from './middleware/verifyToken.js';

// Route imports
import authRoutes from './routes/auth.routes.js';
import lavadosRoutes from './routes/lavados.routes.js';
import cajaRoutes from './routes/caja.routes.js';
import reservasRoutes from './routes/reservas.routes.js';
import mensajesRoutes from './routes/mensajes.routes.js';

const app = express();
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

// Routes
app.use('/api', authRoutes);
app.use('/api', lavadosRoutes);
app.use('/api', cajaRoutes);
app.use('/api', reservasRoutes);
app.use('/api', mensajesRoutes);

// Socket.IO
io.on('connection', (socket) => {
  console.log('Nuevo cliente conectado');

  socket.on('tagSelected', (tagNumber) => {
    console.log(`Tag seleccionado: ${tagNumber}`);
    io.emit('updateQRCode', tagNumber);
  });

  socket.on('disconnect', () => {
    console.log('Cliente desconectado');
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(`[ERROR] ${req.method} ${req.path}:`, err.message);
  res.status(err.status || 500).json({ success: false, message: err.message || 'Error interno del servidor' });
});

export { httpServer };
export default app;
