import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const adminSchema = new mongoose.Schema({}, { strict: false });
const Admin = mongoose.model('Admin', adminSchema, 'admins');

const ADMIN_EMAIL = 'admin@test.com';
const NEW_USER = {
  email: 'operador@autospa.com',
  password: '1234',
  permiso: 'user'
};

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Conectado a MongoDB');

  const admin = await Admin.findOne({ email: ADMIN_EMAIL });
  if (!admin) {
    console.error(`No se encontró admin con email: ${ADMIN_EMAIL}`);
    process.exit(1);
  }

  console.log(`Admin encontrado: ${admin.localName} (${admin._id})`);

  const result = await Admin.updateOne(
    { email: ADMIN_EMAIL },
    { $push: { usuarios: NEW_USER } }
  );

  console.log(`Usuario creado: ${result.modifiedCount === 1 ? '✓ OK' : '✗ Error'}`);
  console.log(`  Email:    ${NEW_USER.email}`);
  console.log(`  Password: ${NEW_USER.password}`);
  console.log(`  Permiso:  ${NEW_USER.permiso}`);

  await mongoose.disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
