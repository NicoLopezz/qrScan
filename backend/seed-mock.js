import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env') });

await mongoose.connect(process.env.MONGODB_URI);

const Admin = (await import('./src/models/adminModel.js')).default;
const admin = await Admin.findOne({ email: 'admin@test.com' });

if (!admin) {
  console.error('Admin no encontrado');
  process.exit(1);
}

// Vehiculos mock realistas
const vehiculos = [
  { nombre: 'Martin Gonzalez', modelo: 'Toyota Corolla 2022', patente: 'AB 123 CD', empresa: '' },
  { nombre: 'Lucia Fernandez', modelo: 'VW Golf GTI', patente: 'AC 456 EF', empresa: '' },
  { nombre: 'Carlos Medina', modelo: 'Ford Ranger 2024', patente: 'AD 789 GH', empresa: 'Transportes Sur' },
  { nombre: 'Ana Rodriguez', modelo: 'Chevrolet Cruze', patente: 'AE 012 IJ', empresa: '' },
  { nombre: 'Diego Sanchez', modelo: 'Fiat Cronos', patente: 'AF 345 KL', empresa: '' },
  { nombre: 'Valentina Lopez', modelo: 'Peugeot 208', patente: 'AG 678 MN', empresa: '' },
  { nombre: 'Federico Torres', modelo: 'Renault Duster', patente: 'AH 901 OP', empresa: 'Logistica Norte' },
  { nombre: 'Camila Diaz', modelo: 'Honda Civic', patente: 'AI 234 QR', empresa: '' },
  { nombre: 'Mateo Ramirez', modelo: 'Nissan Kicks', patente: 'AJ 567 ST', empresa: '' },
  { nombre: 'Sofia Martinez', modelo: 'Jeep Renegade', patente: 'AK 890 UV', empresa: '' },
  { nombre: 'Nicolas Herrera', modelo: 'BMW 320i', patente: 'AL 123 WX', empresa: '' },
  { nombre: 'Paula Castro', modelo: 'Audi A3', patente: 'AM 456 YZ', empresa: '' },
  { nombre: 'Ignacio Moreno', modelo: 'Mercedes GLA', patente: 'AN 789 AB', empresa: 'Corp Solutions' },
  { nombre: 'Julieta Vargas', modelo: 'Hyundai Tucson', patente: 'AO 012 CD', empresa: '' },
  { nombre: 'Tomas Ruiz', modelo: 'Toyota Hilux', patente: 'AP 345 EF', empresa: 'Agro Plus' },
  { nombre: 'Milagros Silva', modelo: 'VW Taos', patente: 'AQ 678 GH', empresa: '' },
  { nombre: 'Santiago Ortiz', modelo: 'Ford EcoSport', patente: 'AR 901 IJ', empresa: '' },
  { nombre: 'Rocio Mendez', modelo: 'Citroen C4 Cactus', patente: 'AS 234 KL', empresa: '' },
];

const tiposLavado = ['Completo', 'Simple', 'Premium', 'Motor', 'Tapizado'];
const estados = ['Pendiente', 'Pendiente', 'En Proceso', 'En Proceso', 'Completado', 'Completado', 'Completado', 'Retirado', 'Retirado', 'Retirado'];
const calidades = ['', '', '', 'bueno', 'bueno', 'excelente', 'excelente', 'regular'];
const calidadScore = { '': 0, bueno: 4, excelente: 5, regular: 3 };
const mediosPago = ['efectivo', 'efectivo', 'mercado-pago', 'debito', 'credito', '---'];
const montos = [3500, 4000, 4500, 5000, 6000, 7500, 8000, 2500, 3000, 10000];
const phones = [
  '+5491123456789', '+5491134567890', '+5491145678901', '+5491156789012',
  '+5491167890123', '+5491178901234', '+5491189012345', '+5491190123456',
];

// Generar lavados con fechas distribuidas en los ultimos 14 dias
const lavados = vehiculos.map((v, i) => {
  const daysAgo = Math.floor(Math.random() * 14);
  const hoursAgo = Math.floor(Math.random() * 12);
  const fecha = new Date();
  fecha.setDate(fecha.getDate() - daysAgo);
  fecha.setHours(fecha.getHours() - hoursAgo);

  const estado = estados[i % estados.length];
  const tipo = tiposLavado[i % tiposLavado.length];
  const calidad = estado === 'Retirado' ? calidades[i % calidades.length] : '';
  const monto = montos[i % montos.length];
  const medioPago = estado === 'Retirado' || estado === 'Completado' ? mediosPago[i % mediosPago.length] : '---';
  const from = i < phones.length ? phones[i] : '';

  const fechaEgreso = (estado === 'Completado' || estado === 'Retirado')
    ? new Date(fecha.getTime() + (30 + Math.random() * 90) * 60000)
    : null;

  return {
    nombre: v.nombre,
    modelo: v.modelo,
    patente: v.patente,
    empresa: v.empresa,
    tipoDeLavado: tipo,
    estado,
    monto,
    medioPago,
    from,
    calidad,
    puntuacionCalidad: calidadScore[calidad] || 0,
    fechaDeAlta: fecha,
    selected: false,
    textConfirmation: !!from,
    observacion: i % 3 === 0 ? 'Sin rayones' : '',
    historialLavados: [{
      confirmacionPorCliente: !!from,
      tipoDeLavado: tipo,
      fechaIngreso: fecha,
      fechaEgreso,
      tiempoEspera: fechaEgreso ? Math.floor((fechaEgreso - fecha) / 60000) : 0,
      observacion: '',
      calidad,
      puntuacionCalidad: calidadScore[calidad] || 0,
    }],
  };
});

// Reservas mock
const reservas = [
  { nombre: 'Fernando Gutierrez', comensales: 4, observacion: 'Mesa cerca de la ventana', from: '+5491123456789', textConfirmation: true, selected: false },
  { nombre: 'Laura Perez', comensales: 2, observacion: 'Cumpleanos', from: '+5491134567890', textConfirmation: true, selected: false },
  { nombre: 'Roberto Aguirre', comensales: 6, observacion: 'Reunion de trabajo', from: '', textConfirmation: false, selected: false },
  { nombre: 'Maria Jose Blanco', comensales: 3, observacion: 'Preferencia vegetariana', from: '+5491145678901', textConfirmation: false, selected: false },
  { nombre: 'Esteban Navarro', comensales: 8, observacion: 'Evento corporativo', from: '', textConfirmation: false, selected: false },
];

// Replace existing data
admin.lavados = lavados;
admin.reservas = reservas;

await admin.save();

console.log(`Mock data creada:`);
console.log(`  ${lavados.length} lavados (${lavados.filter(l => l.estado === 'Pendiente').length} pendientes, ${lavados.filter(l => l.estado === 'En Proceso').length} en proceso, ${lavados.filter(l => l.estado === 'Completado').length} completados, ${lavados.filter(l => l.estado === 'Retirado').length} retirados)`);
console.log(`  ${reservas.length} reservas`);

process.exit(0);
