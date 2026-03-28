/**
 * Migration script: Move lavados from embedded Admin arrays to the Lavado collection.
 *
 * Usage: node scripts/migrate-lavados.js
 *
 * This script:
 * 1. Reads all Admin docs that still have embedded lavados
 * 2. Inserts each lavado into the Lavado collection with adminId
 * 3. Clears the embedded lavados array on the Admin doc
 *
 * Safe to re-run: skips admins with empty lavados arrays.
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Connect to DB
await mongoose.connect(process.env.MONGODB_URI);
console.log('Connected to DB:', mongoose.connection.name);

// We need the raw collection because the Admin model no longer has lavados field
const adminsCollection = mongoose.connection.collection('admins');
const lavadosCollection = mongoose.connection.collection('lavados');

const admins = await adminsCollection.find({ 'lavados.0': { $exists: true } }).toArray();

console.log(`Found ${admins.length} admin(s) with embedded lavados to migrate.`);

let totalMigrated = 0;

for (const admin of admins) {
  const lavados = admin.lavados || [];
  if (lavados.length === 0) continue;

  const docs = lavados.map(l => ({
    ...l,
    adminId: admin._id,
    createdAt: l.fechaDeAlta || new Date(),
    updatedAt: new Date(),
  }));

  await lavadosCollection.insertMany(docs);
  totalMigrated += docs.length;

  // Clear the embedded array
  await adminsCollection.updateOne(
    { _id: admin._id },
    { $set: { lavados: [] } }
  );

  console.log(`  Admin ${admin.email}: migrated ${docs.length} lavados`);
}

console.log(`\nMigration complete. Total lavados migrated: ${totalMigrated}`);
await mongoose.disconnect();
process.exit(0);
