import Admin from '../models/adminModel.js';
import CajaMayor from '../models/cajaMayorSchema.js';
import CajaChica from '../models/cajaChicaSchema.js';
import bcrypt from 'bcryptjs';
import { faker } from '@faker-js/faker';
import { signToken } from '../utils/jwt.js';

const COOKIE_OPTS = {
  httpOnly: true,
  sameSite: 'Lax',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días
  secure: process.env.NODE_ENV === 'production',
};

//<-- FUNCIONES PARA GESTIONAR LOCALES-->
async function newLocal(req, res) {
  const { email, password, localName } = req.body;

  try {
    // Generar datos aleatorios para usuario y cliente
    const randomUser = {
      name: faker.person.fullName(),  // Nombre aleatorio para el usuario
      password: faker.internet.password(),
      permiso: 'user'
    };

    const randomClient = {
      solicitudBaja: false,
      from: faker.phone.number('+54 9 ### ### ####'),  // Número de teléfono aleatorio con formato argentino
      historialPedidos: [{
        tagNumber: faker.number.int({ min: 100, max: 999 }),
        fechaPedido: faker.date.recent(),
        fechaRetiro: faker.date.recent(),
        tiempoEspera: faker.number.int({ min: 5, max: 120 }),  // Tiempo de espera en minutos
        estadoPorBarra: 'completado',
        confirmacionPorCliente: true,
        mensajes: [
          { body: faker.lorem.sentence(), fecha: faker.date.recent().toISOString() },
          { body: faker.lorem.sentence(), fecha: faker.date.recent().toISOString() }
        ]
      }],
      promedioTiempo: faker.number.int({ min: 10, max: 60 }),
      mensajesEnviados: Array.from({ length: 5 }, () => ({
        fecha: faker.date.recent().toISOString(),
        body: faker.lorem.sentence()  // Contenido del mensaje
      }))
    };

    const randomPayment = {
      fecha: faker.date.recent(),
      monto: faker.number.int({ min: 10, max: 1000 }),
      metodo: faker.finance.transactionType()
    };

    // Generar 5 reservas aleatorias
    const randomReservations = Array.from({ length: 5 }, () => ({
      solicitudBaja: false,
      from: faker.phone.number('+54 9 ### ### ####'),
      historialPedidos: [{
        tagNumber: faker.number.int({ min: 100, max: 999 }),
        fechaPedido: faker.date.recent(),
        fechaRetiro: faker.date.recent(),
        tiempoEspera: faker.number.int({ min: 5, max: 120 }),
        estadoPorBarra: 'completado',
        confirmacionPorCliente: true,
        mensajes: [
          { body: faker.lorem.sentence(), fecha: faker.date.recent().toISOString() },
          { body: faker.lorem.sentence(), fecha: faker.date.recent().toISOString() }
        ]
      }],
      promedioTiempo: faker.number.int({ min: 10, max: 60 }),
      mensajesEnviados: Array.from({ length: 5 }, () => ({
        fecha: faker.date.recent().toISOString(),
        body: faker.lorem.sentence()
      })),
      nombre: faker.person.fullName(),         // Nombre aleatorio
      comensales: faker.number.int({ min: 1, max: 10 }), // Número aleatorio de comensales
      observacion: faker.lorem.sentence(),      // Observación aleatoria
      mesaId: faker.number.int({ min: 1, max: 20 })      // ID de mesa aleatorio
    }));

    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear el nuevo administrador con un usuario, cliente y pago generados aleatoriamente
    const newAdmin = new Admin({
      email,
      password: hashedPassword,
      localName,
      localNumber: 14155238886,
      usuarios: [randomUser],
      clientes: [randomClient],
      pagos: [randomPayment],
      facturacion: {
        cbu: faker.finance.accountNumber(),
        medioDePago: faker.finance.creditCardIssuer(),
        alias: faker.finance.iban()
      },
      tipoDeLicencia: 'premium',
      horariosDeOperacion: '8 a 17hs',
      reservas: randomReservations // Añadir las 5 reservas aleatorias generadas
    });

    // Guardar en la base de datos
    await newAdmin.save();

    // Inicializar CajaMayor y CajaChica automáticamente
    const cajaMayor = await CajaMayor.create({ adminId: newAdmin._id, saldoInicial: 0, saldoActual: 0 });
    const cajaChica = await CajaChica.create({ adminId: newAdmin._id, saldoInicial: 0, saldoActual: 0 });
    newAdmin.cajasMayores.push(cajaMayor._id);
    newAdmin.cajasChicas.push(cajaChica._id);
    await newAdmin.save();

    res.status(201).json({ message: 'Administrador agregado con éxito' });
  } catch (error) {
    console.error('Error al agregar administrador:', error.message);
    res.status(500).json({ error: 'Error al agregar administrador' });
  }
}

//FUNCION PARA TRAER INFO DE UN LOCAL---->
async function getLocales(req, res) {
  try {
    const locales = await Admin.find();
    res.status(200).json(locales);
  } catch (error) {
    console.error('Error al obtener locales:', error.message);
    res.status(500).json({ error: 'Error al obtener locales' });
  }
}

//FUNCION PARA TRAER INFO DE UN LOCAL---->
async function getLocalDetails(req, res) {
  const { id } = req.params;

  try {
    const local = await Admin.findById(id);  // Buscamos el local por su ID
    if (!local) {
      return res.status(404).json({ error: 'Local no encontrado' });
    }

    res.status(200).json(local);  // Devolver los detalles completos del local
  } catch (error) {
    console.error('Error al obtener los detalles del local:', error);
    res.status(500).json({ error: 'Error al obtener los detalles del local' });
  }
}

//<-- FUNCIONES PARA GESTIONAR EL LOGIN DEL USUARIO-->
//FUNCION PARA HACER LOGIN DEL USUARIO---->
async function login(req, res) {
  const { email, password } = req.body;

  // Esto cambia solo si es producción o desarrollo.
  // Por el tema de las cookies y el protocolo HTTPS
  const produccion = false;

  try {
    // Buscar si el email corresponde a un admin
    const admin = await Admin.findOne({ email });

    if (admin) {
      const isHashed = admin.password.startsWith('$2');
      const isPasswordValid = isHashed
        ? await bcrypt.compare(password, admin.password)
        : password === admin.password;

      if (!isPasswordValid) {
        return res.status(401).json({ error: "Contraseña incorrecta" });
      }

      // Migración: si la password estaba en texto plano, hashearla ahora
      if (!isHashed) {
        admin.password = await bcrypt.hash(password, 10);
        await admin.save();
      }

      const token = signToken({
        adminId:     admin._id.toString(),
        email,
        localNumber: admin.localNumber,
        permiso:     admin.permiso,
      });
      res.cookie('token', token, COOKIE_OPTS);
      res.cookie('adminId', admin._id.toString(), { ...COOKIE_OPTS, httpOnly: false });

      return res.status(200).json({ message: "Inicio de sesión exitoso (Admin)", adminId: admin._id, localNumber: admin.localNumber, permiso: admin.permiso });
    }

    // Si no es un admin, buscar si el email corresponde a un usuario dentro de los locales
    const adminConUsuario = await Admin.findOne({ 'usuarios.email': email });

    if (!adminConUsuario) {
      return res.status(401).json({ error: "Usuario no encontrado" });
    }

    const usuario = adminConUsuario.usuarios.find(u => u.email === email);
    const isHashed = usuario.password.startsWith('$2');
    const isPasswordValid = isHashed
      ? await bcrypt.compare(password, usuario.password)
      : password === usuario.password;

    if (!isPasswordValid) {
      return res.status(401).json({ error: "Contraseña incorrecta" });
    }

    // Migración: hashear password de usuario si estaba en texto plano
    if (!isHashed) {
      usuario.password = await bcrypt.hash(password, 10);
      await adminConUsuario.save();
    }

    const token = signToken({
      adminId:     adminConUsuario._id.toString(),
      email,
      localNumber: adminConUsuario.localNumber,
      permiso:     usuario.permiso,
    });
    res.cookie('token', token, COOKIE_OPTS);
    res.cookie('adminId', adminConUsuario._id.toString(), { ...COOKIE_OPTS, httpOnly: false });

    return res.status(200).json({ message: "Inicio de sesión exitoso (Usuario)", adminId: adminConUsuario._id, localNumber: adminConUsuario.localNumber, permiso: usuario.permiso });

  } catch (error) {
    console.error("Error al iniciar sesión:", error);
    res.status(500).json({ error: "Error al iniciar sesión" });
  }
}

// Valida que el request tenga un JWT válido (usado como middleware de ruta)
function validateUser(req, res, next) {
  if (!req.user) {
    // Sin token o token inválido → redirigir al login
    return res.redirect('/api/login');
  }
  req.isAdmin = req.user.permiso === 'Admin';
  next();
}

//FUNCION PARA TRAER INFO DE UN LOCAL (cliente-side, no es un endpoint HTTP)---->
async function cargarLocales() {
  try {
    const response = await fetch(apiUrl);  // Llamada a la API del servidor
    const locales = await response.json();
    const tarjetasContainer = document.getElementById('tarjetas-container');
    tarjetasContainer.innerHTML = '';  // Limpiar tarjetas anteriores

    locales.forEach(local => {
      const tarjeta = document.createElement('div');
      tarjeta.className = 'card';
      tarjeta.innerHTML = `
          <h2>${local.localName}</h2>
          <p>Email: ${local.email}</p>
          <p>Permiso: ${local.permiso}</p>
          <p>Fecha de Alta: ${new Date(local.fechaDeAlta).toLocaleDateString()}</p>
        `;
      tarjeta.onclick = () => mostrarDetalles(local._id);
      tarjetasContainer.appendChild(tarjeta);
    });
  } catch (error) {
    console.error('Error al cargar los locales:', error);
  }
}

async function crearUsuario(req, res) {
  const { adminId } = req.params;
  const { email, password, role } = req.body;

  if (!email || !password || !role) {
    return res.status(400).json({ error: 'Email, password y rol son requeridos' });
  }

  try {
    const admin = await Admin.findById(adminId);
    if (!admin) return res.status(404).json({ error: 'Admin no encontrado' });

    const yaExiste = admin.usuarios.some(u => u.email === email);
    if (yaExiste) return res.status(409).json({ error: 'Ya existe un usuario con ese email' });

    const hashedPassword = await bcrypt.hash(password, 10);
    admin.usuarios.push({ email, password: hashedPassword, permiso: role });
    await admin.save();

    res.status(201).json({ message: 'Usuario creado correctamente', email, role });
  } catch (error) {
    console.error('Error al crear usuario:', error.message);
    res.status(500).json({ error: 'Error al crear usuario' });
  }
}

export const methods = {
  newLocal,
  getLocales,
  getLocalDetails,
  login,
  validateUser,
  cargarLocales,
  crearUsuario
};
