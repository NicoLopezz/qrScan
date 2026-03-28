import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env') });

await mongoose.connect(process.env.MONGODB_URI);

const collections = ['CajasMayores', 'CajasChicas', 'ArqueosMayor', 'ArqueosChica', 'movimientos'];

for (const name of collections) {
  try {
    await mongoose.connection.db.dropCollection(name);
    console.log(`Dropped: ${name}`);
  } catch (e) {
    console.log(`Skip (no existe): ${name}`);
  }
}

console.log('Old caja collections cleaned up');
process.exit(0);
