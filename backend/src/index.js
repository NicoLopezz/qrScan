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
} catch (err) {
  console.error('No se pudo iniciar el servidor:', err.message);
  process.exit(1);
}
