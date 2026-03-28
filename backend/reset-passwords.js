import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env') });

await mongoose.connect(process.env.MONGODB_URI);

const Admin = (await import('./src/models/adminModel.js')).default;
const admin = await Admin.findOne({ email: 'admin@test.com' });

admin.password = await bcrypt.hash('admin123', 10);

const user = admin.usuarios.find(u => u.email === 'operador@autospa.com');
if (user) user.password = await bcrypt.hash('operador123', 10);

await admin.save();
console.log('Passwords reseteadas:');
console.log('  Admin: admin@test.com / admin123');
console.log('  User:  operador@autospa.com / operador123');
process.exit(0);
