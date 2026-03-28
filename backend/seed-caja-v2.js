import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env') });

await mongoose.connect(process.env.MONGODB_URI);

const Admin = (await import('./src/models/adminModel.js')).default;
const Caja = (await import('./src/models/Caja.js')).default;
const Turno = (await import('./src/models/Turno.js')).default;
const Fondo = (await import('./src/models/Fondo.js')).default;
const VentaPOS = (await import('./src/models/VentaPOS.js')).default;
const PagoPOS = (await import('./src/models/PagoPOS.js')).default;

const admin = await Admin.findOne({ email: 'admin@test.com' });
if (!admin) { console.error('Admin no encontrado'); process.exit(1); }

// Limpiar
await PagoPOS.deleteMany({});
await VentaPOS.deleteMany({});
await Fondo.deleteMany({});
await Turno.deleteMany({});
await Caja.deleteMany({});

// --- Crear 2 cajas ---
const cajaMostrador = await Caja.create({
  nombre: 'Mostrador',
  adminId: admin._id,
  mediosPagoHabilitados: ['efectivo', 'mercado-pago', 'tarjeta'],
});

const cajaOnline = await Caja.create({
  nombre: 'Online',
  adminId: admin._id,
  mediosPagoHabilitados: ['mercado-pago', 'tarjeta'],
});

// --- Turno cerrado (ayer) en Mostrador ---
const ayer8am = new Date(); ayer8am.setDate(ayer8am.getDate() - 1); ayer8am.setHours(8, 0, 0, 0);
const ayer20 = new Date(ayer8am); ayer20.setHours(20, 0, 0, 0);

const turnoCerrado = await Turno.create({
  cajaId: cajaMostrador._id,
  adminId: admin._id,
  usuarioId: 'operador@autospa.com',
  estado: 'cerrado',
  apertura: ayer8am,
  cierre: ayer20,
  arqueo: {
    esperado: { efectivo: 42500, 'mercado-pago': 23000, tarjeta: 8500 },
    real: { efectivo: 42200, 'mercado-pago': 23000, tarjeta: 8500 },
    diferencia: { efectivo: -300, 'mercado-pago': 0, tarjeta: 0 },
    observacion: 'Faltaron $300 en efectivo, posible error de vuelto',
  },
});

await Fondo.insertMany([
  { turnoId: turnoCerrado._id, medioPago: 'efectivo', monto: 15000 },
  { turnoId: turnoCerrado._id, medioPago: 'mercado-pago', monto: 5000 },
  { turnoId: turnoCerrado._id, medioPago: 'tarjeta', monto: 0 },
]);

// Ventas del turno cerrado
const ventasCerradas = [
  { desc: 'Lavado Premium BMW', monto: 7500, pagos: [{ m: 'efectivo', a: 7500 }] },
  { desc: 'Lavado Completo Golf', monto: 5000, pagos: [{ m: 'mercado-pago', a: 5000 }] },
  { desc: 'Lavado Simple Corolla', monto: 3500, pagos: [{ m: 'efectivo', a: 3500 }] },
  { desc: 'Lavado Premium Audi', monto: 8000, pagos: [{ m: 'efectivo', a: 5000 }, { m: 'tarjeta', a: 3000 }] },
  { desc: 'Lavado Motor Hilux', monto: 4500, pagos: [{ m: 'mercado-pago', a: 4500 }] },
  { desc: 'Lavado Tapizado Civic', monto: 6000, pagos: [{ m: 'tarjeta', a: 6000 }] },
  { desc: 'Lavado Completo Ranger', monto: 5000, pagos: [{ m: 'efectivo', a: 3000 }, { m: 'mercado-pago', a: 2000 }] },
  { desc: 'Insumos limpieza', monto: 3200, pagos: [{ m: 'efectivo', a: 3200 }], egreso: true },
  { desc: 'Lavado Simple Cronos', monto: 3500, pagos: [{ m: 'mercado-pago', a: 3500 }] },
  { desc: 'Lavado Premium Duster', monto: 6500, pagos: [{ m: 'efectivo', a: 6500 }] },
  { desc: 'Almuerzo equipo', monto: 2800, pagos: [{ m: 'efectivo', a: 2800 }], egreso: true },
  { desc: 'Lavado Completo 208', monto: 4000, pagos: [{ m: 'mercado-pago', a: 4000 }] },
];

for (let i = 0; i < ventasCerradas.length; i++) {
  const v = ventasCerradas[i];
  const hora = new Date(ayer8am.getTime() + (i + 1) * 3600000);
  const venta = await VentaPOS.create({
    turnoId: turnoCerrado._id,
    adminId: admin._id,
    monto: v.monto,
    descripcion: v.desc,
    origen: v.egreso ? 'manual' : 'lavado',
    fecha: hora,
  });
  for (const p of v.pagos) {
    await PagoPOS.create({ ventaId: venta._id, medioPago: p.m, monto: p.a });
  }
}

// --- Turno abierto (hoy) en Mostrador ---
const hoy8am = new Date(); hoy8am.setHours(8, 30, 0, 0);

const turnoAbierto = await Turno.create({
  cajaId: cajaMostrador._id,
  adminId: admin._id,
  usuarioId: 'operador@autospa.com',
  estado: 'abierto',
  apertura: hoy8am,
});

await Fondo.insertMany([
  { turnoId: turnoAbierto._id, medioPago: 'efectivo', monto: 10000 },
  { turnoId: turnoAbierto._id, medioPago: 'mercado-pago', monto: 3000 },
  { turnoId: turnoAbierto._id, medioPago: 'tarjeta', monto: 0 },
]);

const ventasHoy = [
  { desc: 'Lavado Completo Corolla', monto: 4500, pagos: [{ m: 'efectivo', a: 4500 }], h: 1 },
  { desc: 'Lavado Premium Golf GTI', monto: 7500, pagos: [{ m: 'mercado-pago', a: 7500 }], h: 1.5 },
  { desc: 'Lavado Simple Cronos', monto: 3000, pagos: [{ m: 'efectivo', a: 3000 }], h: 2 },
  { desc: 'Lavado Motor Ranger', monto: 5000, pagos: [{ m: 'efectivo', a: 2500 }, { m: 'mercado-pago', a: 2500 }], h: 3 },
  { desc: 'Cafe y medialunas', monto: 1200, pagos: [{ m: 'efectivo', a: 1200 }], h: 3.5, egreso: true },
  { desc: 'Lavado Tapizado Civic', monto: 8000, pagos: [{ m: 'tarjeta', a: 8000 }], h: 4 },
  { desc: 'Lavado Premium Mercedes', monto: 10000, pagos: [{ m: 'mercado-pago', a: 6000 }, { m: 'tarjeta', a: 4000 }], h: 5 },
];

for (const v of ventasHoy) {
  const hora = new Date(hoy8am.getTime() + v.h * 3600000);
  const venta = await VentaPOS.create({
    turnoId: turnoAbierto._id,
    adminId: admin._id,
    monto: v.monto,
    descripcion: v.desc,
    origen: v.egreso ? 'manual' : 'lavado',
    fecha: hora,
  });
  for (const p of v.pagos) {
    await PagoPOS.create({ ventaId: venta._id, medioPago: p.m, monto: p.a });
  }
}

// Resumen
const totalVentas = await VentaPOS.countDocuments();
const totalPagos = await PagoPOS.countDocuments();
console.log('Caja v2 mock data creada:');
console.log(`  2 cajas: Mostrador (3 medios), Online (2 medios)`);
console.log(`  1 turno cerrado (ayer, 12 ventas)`);
console.log(`  1 turno abierto (hoy, 7 ventas)`);
console.log(`  Total: ${totalVentas} ventas, ${totalPagos} pagos`);

process.exit(0);
