import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env') });

await mongoose.connect(process.env.MONGODB_URI);

const Admin = (await import('./src/models/adminModel.js')).default;
const CajaMayor = (await import('./src/models/cajaMayorSchema.js')).default;
const CajaChica = (await import('./src/models/cajaChicaSchema.js')).default;
const ArqueoMayor = (await import('./src/models/arqueoMayorSchema.js')).default;
const ArqueoChica = (await import('./src/models/arqueoChicaSchema.js')).default;
const Movimiento = (await import('./src/models/Movimientos.js')).default;

const admin = await Admin.findOne({ email: 'admin@test.com' });
if (!admin) { console.error('Admin no encontrado'); process.exit(1); }

// Limpiar datos existentes de caja
await Movimiento.deleteMany({});
await ArqueoMayor.deleteMany({});
await ArqueoChica.deleteMany({});
await CajaMayor.deleteMany({});
await CajaChica.deleteMany({});

// --- CAJA MAYOR ---
const cajaMayor = await CajaMayor.create({
  adminId: admin._id,
  saldoInicial: 50000,
  saldoActual: 50000,
  estado: 'abierta',
});

// Arqueo Mayor Efectivo (cerrado - hace 3 dias)
const hace3d = new Date(); hace3d.setDate(hace3d.getDate() - 3); hace3d.setHours(8, 0, 0);
const cierre3d = new Date(hace3d); cierre3d.setHours(20, 0, 0);

const movsMayorEfCerrado = await Movimiento.insertMany([
  { cajaId: cajaMayor._id, cajaTipo: 'CajaMayor', tipo: 'ingreso', monto: 15000, descripcion: 'Lavados del dia', medioPago: 'efectivo', estadoPago: 'abonado', fecha: hace3d },
  { cajaId: cajaMayor._id, cajaTipo: 'CajaMayor', tipo: 'ingreso', monto: 8500, descripcion: 'Lavados tarde', medioPago: 'efectivo', estadoPago: 'abonado', fecha: hace3d },
  { cajaId: cajaMayor._id, cajaTipo: 'CajaMayor', tipo: 'egreso', monto: 3200, descripcion: 'Compra insumos limpieza', medioPago: 'efectivo', estadoPago: 'abonado', fecha: hace3d },
  { cajaId: cajaMayor._id, cajaTipo: 'CajaMayor', tipo: 'egreso', monto: 1500, descripcion: 'Almuerzo equipo', medioPago: 'efectivo', estadoPago: 'abonado', fecha: hace3d },
]);

const arqueoMayorEfCerrado = await ArqueoMayor.create({
  cajaId: cajaMayor._id,
  fechaApertura: hace3d,
  saldoInicial: 10000,
  saldoFinalSistema: 28800,
  saldoFinalReal: 28500,
  diferencia: -300,
  fechaCierre: cierre3d,
  estado: 'cerrado',
  tipo: 'efectivo',
  observacion: 'Faltaron $300, posible vuelto mal dado',
  movimientos: movsMayorEfCerrado.map(m => m._id),
});

// Arqueo Mayor MP (cerrado - hace 3 dias)
const movsMayorMpCerrado = await Movimiento.insertMany([
  { cajaId: cajaMayor._id, cajaTipo: 'CajaMayor', tipo: 'ingreso', monto: 12000, descripcion: 'Cobros MP manana', medioPago: 'mercado-pago', estadoPago: 'abonado', fecha: hace3d },
  { cajaId: cajaMayor._id, cajaTipo: 'CajaMayor', tipo: 'ingreso', monto: 6500, descripcion: 'Cobros MP tarde', medioPago: 'mercado-pago', estadoPago: 'abonado', fecha: hace3d },
  { cajaId: cajaMayor._id, cajaTipo: 'CajaMayor', tipo: 'egreso', monto: 2800, descripcion: 'Pago proveedor shampoo', medioPago: 'mercado-pago', estadoPago: 'abonado', fecha: hace3d },
]);

const arqueoMayorMpCerrado = await ArqueoMayor.create({
  cajaId: cajaMayor._id,
  fechaApertura: hace3d,
  saldoInicial: 5000,
  saldoFinalSistema: 20700,
  saldoFinalReal: 20700,
  diferencia: 0,
  fechaCierre: cierre3d,
  estado: 'cerrado',
  tipo: 'mercado-pago',
  observacion: 'Cierre exacto',
  movimientos: movsMayorMpCerrado.map(m => m._id),
});

// Arqueo Mayor Efectivo (abierto - hoy)
const hoy8am = new Date(); hoy8am.setHours(8, 30, 0);

const movsMayorEfAbierto = await Movimiento.insertMany([
  { cajaId: cajaMayor._id, cajaTipo: 'CajaMayor', tipo: 'ingreso', monto: 4500, descripcion: 'Lavado completo BMW', medioPago: 'efectivo', estadoPago: 'abonado', fecha: new Date(hoy8am.getTime() + 3600000) },
  { cajaId: cajaMayor._id, cajaTipo: 'CajaMayor', tipo: 'ingreso', monto: 3500, descripcion: 'Lavado simple Corolla', medioPago: 'efectivo', estadoPago: 'abonado', fecha: new Date(hoy8am.getTime() + 7200000) },
  { cajaId: cajaMayor._id, cajaTipo: 'CajaMayor', tipo: 'ingreso', monto: 6000, descripcion: 'Lavado premium Hilux', medioPago: 'efectivo', estadoPago: 'abonado', fecha: new Date(hoy8am.getTime() + 10800000) },
  { cajaId: cajaMayor._id, cajaTipo: 'CajaMayor', tipo: 'egreso', monto: 800, descripcion: 'Cafe y medialunas', medioPago: 'efectivo', estadoPago: 'abonado', fecha: new Date(hoy8am.getTime() + 5400000) },
  { cajaId: cajaMayor._id, cajaTipo: 'CajaMayor', tipo: 'ingreso', monto: 5000, descripcion: 'Lavado tapizado Golf', medioPago: 'efectivo', estadoPago: 'pendiente', fecha: new Date(hoy8am.getTime() + 14400000) },
]);

const arqueoMayorEfAbierto = await ArqueoMayor.create({
  cajaId: cajaMayor._id,
  fechaApertura: hoy8am,
  saldoInicial: 15000,
  estado: 'abierto',
  tipo: 'efectivo',
  movimientos: movsMayorEfAbierto.map(m => m._id),
});

// Arqueo Mayor MP (abierto - hoy)
const movsMayorMpAbierto = await Movimiento.insertMany([
  { cajaId: cajaMayor._id, cajaTipo: 'CajaMayor', tipo: 'ingreso', monto: 7500, descripcion: 'Lavado premium Audi', medioPago: 'mercado-pago', estadoPago: 'abonado', fecha: new Date(hoy8am.getTime() + 3600000) },
  { cajaId: cajaMayor._id, cajaTipo: 'CajaMayor', tipo: 'ingreso', monto: 4000, descripcion: 'Lavado simple Cronos', medioPago: 'mercado-pago', estadoPago: 'abonado', fecha: new Date(hoy8am.getTime() + 9000000) },
  { cajaId: cajaMayor._id, cajaTipo: 'CajaMayor', tipo: 'egreso', monto: 4500, descripcion: 'Pago sueldo parcial', medioPago: 'mercado-pago', estadoPago: 'abonado', fecha: new Date(hoy8am.getTime() + 12000000) },
]);

const arqueoMayorMpAbierto = await ArqueoMayor.create({
  cajaId: cajaMayor._id,
  fechaApertura: hoy8am,
  saldoInicial: 8000,
  estado: 'abierto',
  tipo: 'mercado-pago',
  movimientos: movsMayorMpAbierto.map(m => m._id),
});

cajaMayor.arqueos = [arqueoMayorEfCerrado._id, arqueoMayorMpCerrado._id, arqueoMayorEfAbierto._id, arqueoMayorMpAbierto._id];
await cajaMayor.save();

// --- CAJA CHICA ---
const cajaChica = await CajaChica.create({
  adminId: admin._id,
  saldoInicial: 5000,
  saldoActual: 5000,
  estado: 'abierta',
});

// Arqueo Chica Efectivo (abierto)
const movsChicaEf = await Movimiento.insertMany([
  { cajaId: cajaChica._id, cajaTipo: 'CajaChica', tipo: 'ingreso', monto: 2000, descripcion: 'Recarga desde caja mayor', medioPago: 'efectivo', estadoPago: 'abonado', fecha: new Date(hoy8am.getTime() + 1800000) },
  { cajaId: cajaChica._id, cajaTipo: 'CajaChica', tipo: 'egreso', monto: 350, descripcion: 'Bidones de agua', medioPago: 'efectivo', estadoPago: 'abonado', fecha: new Date(hoy8am.getTime() + 5400000) },
  { cajaId: cajaChica._id, cajaTipo: 'CajaChica', tipo: 'egreso', monto: 1200, descripcion: 'Trapos y esponjas', medioPago: 'efectivo', estadoPago: 'abonado', fecha: new Date(hoy8am.getTime() + 9000000) },
  { cajaId: cajaChica._id, cajaTipo: 'CajaChica', tipo: 'egreso', monto: 500, descripcion: 'Propina delivery', medioPago: 'efectivo', estadoPago: 'abonado', fecha: new Date(hoy8am.getTime() + 12000000) },
]);

const arqueoChicaEf = await ArqueoChica.create({
  cajaId: cajaChica._id,
  fechaApertura: hoy8am,
  saldoInicial: 3000,
  estado: 'abierto',
  tipo: 'efectivo',
  movimientos: movsChicaEf.map(m => m._id),
});

// Arqueo Chica MP (abierto)
const movsChicaMp = await Movimiento.insertMany([
  { cajaId: cajaChica._id, cajaTipo: 'CajaChica', tipo: 'ingreso', monto: 1500, descripcion: 'Propina cliente', medioPago: 'mercado-pago', estadoPago: 'abonado', fecha: new Date(hoy8am.getTime() + 7200000) },
  { cajaId: cajaChica._id, cajaTipo: 'CajaChica', tipo: 'egreso', monto: 800, descripcion: 'Carga celular equipo', medioPago: 'mercado-pago', estadoPago: 'abonado', fecha: new Date(hoy8am.getTime() + 10800000) },
]);

const arqueoChicaMp = await ArqueoChica.create({
  cajaId: cajaChica._id,
  fechaApertura: hoy8am,
  saldoInicial: 1000,
  estado: 'abierto',
  tipo: 'mercado-pago',
  movimientos: movsChicaMp.map(m => m._id),
});

cajaChica.arqueos = [arqueoChicaEf._id, arqueoChicaMp._id];
await cajaChica.save();

// Actualizar admin con refs
admin.cajasMayores = [cajaMayor._id];
admin.cajasChicas = [cajaChica._id];
await admin.save();

// Resumen
const totalMovs = await Movimiento.countDocuments();
console.log('Caja mock data creada:');
console.log('  Caja Mayor:');
console.log('    - 2 arqueos cerrados (efectivo + MP, hace 3 dias)');
console.log('    - 2 arqueos abiertos (efectivo + MP, hoy)');
console.log('  Caja Chica:');
console.log('    - 2 arqueos abiertos (efectivo + MP, hoy)');
console.log(`  Total movimientos: ${totalMovs}`);

process.exit(0);
