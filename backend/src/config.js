import { config } from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// En producción las env vars vienen del host. Fallback a ../../.env para dev.
config();
if (!process.env.MONGODB_URI) {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  config({ path: path.resolve(__dirname, '../../.env') });
}

export default {
    mongodbURL: process.env.MONGODB_URI,
};
