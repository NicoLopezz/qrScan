import express from 'express';
import cors from 'cors';
import { createServer } from 'http'; // Necesario para crear el servidor de HTTP con Socket.IO
import { Server as SocketServer } from 'socket.io'; // Importar Socket.IO
import AuthRoutes from './routes/auth.routes.js';
import cookieParser from 'cookie-parser';



// Agregar middleware cookie-parser para gestionar cookies
// Inicializa Express
const app = express();
app.use(cookieParser());

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

export default app;
