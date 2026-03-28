// Script de seed para datos mock
// Correr con: node scripts/seed.js

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '../.env') });

import Admin from '../src/models/adminModel.js';

const nombres = [
  'Matías Rodríguez', 'Lucía Fernández', 'Sebastián López', 'Valentina García',
  'Nicolás Martínez', 'Camila Pérez', 'Gonzalo Torres', 'Florencia Díaz',
  'Agustín Sánchez', 'Julieta Romero', 'Federico Morales', 'Sofía Herrera',
  'Tomás Ruiz', 'Martina Castro', 'Ezequiel Vargas', 'Natalia Jiménez',
  'Leandro Suárez', 'Carolina Medina', 'Ignacio Acosta', 'Paula Vega',
  'Ramiro Blanco', 'Daniela Ríos', 'Maximiliano Luna', 'Antonella Cruz',
  'Bruno Navarro'
];

const patentes = [
  'AB123CD', 'GH456IJ', 'MN789OP', 'QR012ST', 'UV345WX',
  'YZ678AB', 'CD901EF', 'GH234IJ', 'KL567MN', 'OP890QR',
  'ST123UV', 'WX456YZ', 'AB789CD', 'EF012GH', 'IJ345KL',
  'MN678OP', 'QR901ST', 'UV234WX', 'YZ567AB', 'CD890EF',
  'GH123IJ', 'KL456MN', 'OP789QR', 'ST012UV', 'WX345YZ'
];

const modelos = [
  'Toyota Corolla', 'Volkswagen Vento', 'Ford Focus', 'Chevrolet Cruze',
  'Renault Fluence', 'Peugeot 308', 'Honda Civic', 'Fiat Cronos',
  'Nissan Sentra', 'Hyundai Elantra', 'Toyota Etios', 'Volkswagen Polo',
  'Ford Ka', 'Chevrolet Onix', 'Renault Logan', 'Peugeot 208',
  'Fiat Argo', 'Suzuki Baleno', 'Citroen C3', 'Kia Rio',
  'Toyota Hilux', 'Ford Ranger', 'Volkswagen Amarok', 'Chevrolet S10',
  'Renault Oroch'
];

const servicios = ['Lavado completo', 'Lavado exterior', 'Interior y exterior', 'Encerado', 'Detailing'];
const mediosPago = ['efectivo', 'debito', 'credito', 'mercado-pago'];
const calidades = ['Excelente', 'Muy bueno', 'Bueno', 'Regular'];

const telefonos = [
  '+5491123456789', '+5491134567890', '+5491145678901', '+5491156789012',
  '+5491167890123', '+5491178901234', '+5491189012345', '+5491190123456',
  '+5491112345678', '+5491198765432', '+5491187654321', '+5491176543210',
  '+5491165432109', '+5491154321098', '+5491143210987', '+5491132109876',
  '+5491121098765', '+5491110987654', '+5491109876543', '+5491198765432',
  '+5491187654321', '+5491176543210', '+5491165432109', '+5491154321098',
  '+5491143210987'
];

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomDate(daysAgo) {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  date.setHours(randomInt(8, 20), randomInt(0, 59), 0, 0);
  return date;
}

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ Conectado a MongoDB');

  const admin = await Admin.findOne({ email: 'admin@test.com' });
  if (!admin) {
    console.error('❌ Admin no encontrado. Corré primero el servidor y creá el admin.');
    process.exit(1);
  }

  // Actualizar nombre del local
  admin.localName = 'AutoSpa Buenos Aires';

  // Limpiar datos previos
  admin.lavados = [];
  admin.clientes = [];

  // ---- GENERAR LAVADOS ----
  for (let i = 0; i < 25; i++) {
    const daysAgo = randomInt(0, 30);
    const fechaIngreso = randomDate(daysAgo);
    const tiempoEspera = randomInt(30, 180);
    const fechaEgreso = new Date(fechaIngreso.getTime() + tiempoEspera * 60 * 1000);
    const puntuacion = randomInt(3, 10);
    const calidad = puntuacion >= 8 ? 'Excelente' : puntuacion >= 6 ? 'Muy bueno' : puntuacion >= 4 ? 'Bueno' : 'Regular';
    const servicio = randomItem(servicios);
    const monto = servicio === 'Detailing' ? randomInt(8000, 15000)
                : servicio === 'Interior y exterior' ? randomInt(5000, 8000)
                : servicio === 'Encerado' ? randomInt(4000, 7000)
                : servicio === 'Lavado completo' ? randomInt(3000, 5000)
                : randomInt(2000, 3500);

    admin.lavados.push({
      fechaDeAlta: fechaIngreso,
      nombre: nombres[i],
      patente: patentes[i],
      empresa: i % 5 === 0 ? 'AutoSpa SA' : '',
      from: telefonos[i],
      tipoDeLavado: servicio,
      modelo: modelos[i],
      estado: i < 3 ? 'Pendiente' : 'Completado',
      monto,
      medioPago: randomItem(mediosPago),
      puntuacionCalidad: puntuacion,
      calidad,
      puntuacionPromedio: puntuacion,
      observacion: i % 4 === 0 ? 'Cliente frecuente. Preferencia por lavado rápido.' : '',
      lavadosAcumulados: randomInt(1, 20),
      promedioTiempo: tiempoEspera,
      selected: false,
      historialLavados: [{
        tipoDeLavado: servicio,
        fechaIngreso,
        fechaEgreso,
        tiempoEspera,
        observacion: '',
        calidad,
        puntuacionCalidad: puntuacion,
        confirmacionPorCliente: true,
        mensajes: [
          { body: '¡Tu vehículo está listo para retirar! 🚗', fecha: fechaEgreso.toISOString() }
        ]
      }],
      mensajesEnviados: [
        { fecha: fechaIngreso.toISOString(), body: `Hola ${nombres[i].split(' ')[0]}, recibimos tu vehículo.` },
        { fecha: fechaEgreso.toISOString(), body: '¡Tu vehículo ya está listo! Podés venir a buscarlo.' }
      ]
    });
  }

  // ---- GENERAR CLIENTES (mensajes) ----
  for (let i = 0; i < 10; i++) {
    const daysAgo = randomInt(0, 15);
    admin.clientes.push({
      nombre: nombres[i],
      from: telefonos[i],
      solicitudBaja: false,
      promedioTiempo: randomInt(20, 90),
      historialPedidos: [
        {
          tagNumber: randomInt(100, 999),
          fechaPedido: randomDate(daysAgo + 1),
          fechaRetiro: randomDate(daysAgo),
          tiempoEspera: randomInt(15, 60),
          estadoPorBarra: 'completado',
          confirmacionPorCliente: true,
          mensajes: [
            { body: 'Tu pedido está listo 🎉', fecha: randomDate(daysAgo).toISOString() }
          ]
        }
      ],
      mensajesEnviados: [
        { fecha: randomDate(daysAgo).toISOString(), body: '¡Hola! Tu pedido está en camino.' },
        { fecha: randomDate(daysAgo - 1).toISOString(), body: '¿Cómo calificarías nuestro servicio?' }
      ]
    });
  }

  await admin.save();

  const totalLavados = admin.lavados.length;
  const totalClientes = admin.clientes.length;
  const montoTotal = admin.lavados.reduce((acc, l) => acc + l.monto, 0);

  console.log(`✅ Seed completado:`);
  console.log(`   - ${totalLavados} lavados generados`);
  console.log(`   - ${totalClientes} clientes generados`);
  console.log(`   - Facturación total mock: $${montoTotal.toLocaleString('es-AR')}`);
  console.log(`   - Local: ${admin.localName}`);

  await mongoose.disconnect();
  console.log('✅ Desconectado de MongoDB');
  process.exit(0);
}

seed().catch(err => {
  console.error('❌ Error en seed:', err);
  process.exit(1);
});
