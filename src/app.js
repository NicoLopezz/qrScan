import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import { rateLimit } from 'express-rate-limit';
import AuthRoutes from './routes/auth.routes.js';
import cookieParser from 'cookie-parser';
import { verifyTokenMiddleware } from './middleware/verifyToken.js';



// Inicializa Express
const app = express();
app.use(cookieParser());
app.use(verifyTokenMiddleware); // Decodifica JWT en cada request

// Configura el servidor HTTP para usar Socket.IO
const httpServer = createServer(app); // Crea el servidor HTTP
const io = new SocketServer(httpServer, {
  cors: {
    origin: '*', // Permite todas las conexiones (puedes restringirlo a ciertos dominios)
  },
});

// Configura CORS
app.use(cors());

// Permite procesar el cuerpo de las solicitudes en formato JSON
app.use(express.json());

// Permite decodificar los mensajes de Twilio y otras solicitudes URL-encoded
app.use(express.urlencoded({ extended: true }));

// Sirve archivos estáticos de la carpeta 'public'
app.use(express.static('public')); // Esta línea sirve archivos estáticos, incluyendo dashboard.js

// Rate limiting: máx 20 mensajes WhatsApp por IP cada 10 minutos
const whatsappLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 20,
  message: { error: 'Demasiadas solicitudes de mensajes. Intentá en unos minutos.' }
});
app.use('/api/enviarMensajesTemplates', whatsappLimiter);
app.use('/api/enviarMensajeCuentaRegresiva', whatsappLimiter);
app.use('/api/enviarAvisoRetiroLavado', whatsappLimiter);
app.use('/api/enviarEncuesta', whatsappLimiter);

// Rate limiting general en login: máx 10 intentos por IP cada 15 minutos
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Demasiados intentos de login. Intentá en 15 minutos.' }
});
app.use('/api/login', loginLimiter);

// Prefijo para acceder a las rutas API
app.use('/api', AuthRoutes);

// Manejo de conexión de Socket.IO
io.on('connection', (socket) => {
  console.log('Nuevo cliente conectado');

  // Recibe un evento cuando se selecciona un tag en /dashboard
  socket.on('tagSelected', (tagNumber) => {
    console.log(`Tag seleccionado: ${tagNumber}`);

    // Envía el número de tag a todos los clientes conectados, incluyendo /index
    io.emit('updateQRCode', tagNumber);
  });

  socket.on('disconnect', () => {
    console.log('Cliente desconectado');
  });
});

// Configura el puerto y levanta el servidor
const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(`[ERROR] ${req.method} ${req.path}:`, err.message);
  res.status(err.status || 500).json({ error: err.message || 'Error interno del servidor' });
});

export default app;
