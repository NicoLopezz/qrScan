import Admin from '../models/adminModel.js';
import Caja from '../models/Caja.js';
import VerificationCode from '../models/VerificationCode.js';
import bcrypt from 'bcryptjs';
import { signToken } from '../utils/jwt.js';
import { ok, created, fail } from '../utils/apiResponse.js';
import { sendVerificationCode } from '../services/emailService.js';

const COOKIE_OPTS = {
  httpOnly: true,
  sameSite: 'Strict',
  maxAge: 7 * 24 * 60 * 60 * 1000,
  secure: process.env.NODE_ENV === 'production',
};

async function newLocal(req, res) {
  const { email, password, localName, rubro, activeChannel, horariosDeOperacion } = req.body;

  try {
    // Verificar que el email fue validado con código
    const verification = await VerificationCode.findOne({ email, verified: true });
    if (!verification) {
      return fail(res, 400, 'Debes verificar tu email antes de crear la cuenta');
    }
    await VerificationCode.deleteOne({ _id: verification._id });

    const { faker } = await import('@faker-js/faker');

    const randomUser = {
      name: faker.person.fullName(),
      password: faker.internet.password(),
      permiso: 'user'
    };

    const randomClient = {
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
      }))
    };

    const randomPayment = {
      fecha: faker.date.recent(),
      monto: faker.number.int({ min: 10, max: 1000 }),
      metodo: faker.finance.transactionType()
    };

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
      nombre: faker.person.fullName(),
      comensales: faker.number.int({ min: 1, max: 10 }),
      observacion: faker.lorem.sentence(),
      mesaId: faker.number.int({ min: 1, max: 20 })
    }));

    const hashedPassword = await bcrypt.hash(password, 10);

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
      horariosDeOperacion: horariosDeOperacion || '8 a 17hs',
      activeChannel: activeChannel || 'telegram',
      rubro: rubro || '',
      reservas: randomReservations
    });

    await newAdmin.save();

    // Crear caja por defecto para el nuevo local
    await Caja.create({ nombre: 'Mostrador', adminId: newAdmin._id });

    return created(res, { adminId: newAdmin._id }, 'Cuenta creada con éxito');
  } catch (error) {
    console.error('Error al agregar administrador:', error.message);
    // Generic error: don't reveal if it's a duplicate email (unique constraint)
    return fail(res, 500, 'No se pudo crear la cuenta. Intenta nuevamente.');
  }
}

async function sendCode(req, res) {
  const { email } = req.body;
  if (!email) return fail(res, 400, 'Email requerido');

  try {
    // Rate limit: don't send if code was sent less than 30s ago
    const existing = await VerificationCode.findOne({ email });
    if (existing && (Date.now() - existing.createdAt.getTime()) < 30000) {
      return fail(res, 429, 'Espera unos segundos antes de reenviar');
    }

    // Always respond with same message to prevent email enumeration.
    const exists = await Admin.findOne({ email }).select('_id').lean();

    let previewUrl = null;
    if (!exists) {
      const code = String(Math.floor(100000 + Math.random() * 900000));
      await VerificationCode.findOneAndUpdate(
        { email },
        { code, verified: false, createdAt: new Date() },
        { upsert: true }
      );

      const result = await sendVerificationCode(email, code);
      previewUrl = result.previewUrl || null;
    }

    return ok(res, { sent: true, previewUrl }, 'Si el email es valido, recibiras un codigo');
  } catch (error) {
    console.error('Error sending verification code:', error.message);
    return fail(res, 500, 'Error al enviar el codigo');
  }
}

async function verifyCode(req, res) {
  const { email, code } = req.body;
  if (!email || !code) return fail(res, 400, 'Email y codigo requeridos');

  const genericError = 'Codigo incorrecto o expirado';
  const stored = await VerificationCode.findOne({ email });
  if (!stored) return fail(res, 400, genericError);
  if (stored.code !== code.trim()) return fail(res, 400, genericError);

  stored.verified = true;
  await stored.save();

  return ok(res, { verified: true }, 'Email verificado');
}

// getLocales y getLocalDetails eliminados — exponían datos sensibles sin auth

async function login(req, res) {
  const { email, password } = req.body;

  try {
    const admin = await Admin.findOne({ email });

    if (admin) {
      const isPasswordValid = await bcrypt.compare(password, admin.password);

      const INVALID_CREDENTIALS = 'Email o contraseña incorrectos';

      if (!isPasswordValid) return fail(res, 401, INVALID_CREDENTIALS);

      const token = signToken({
        adminId: admin._id.toString(),
        email,
        localNumber: admin.localNumber,
        permiso: admin.permiso,
      });
      res.cookie('token', token, COOKIE_OPTS);

      return ok(res, {
        adminId: admin._id,
        localNumber: admin.localNumber,
        permiso: admin.permiso,
        localName: admin.localName,
      }, 'Inicio de sesión exitoso');
    }

    const INVALID_CREDENTIALS = 'Email o contraseña incorrectos';

    const adminConUsuario = await Admin.findOne({ 'usuarios.email': email });
    if (!adminConUsuario) return fail(res, 401, INVALID_CREDENTIALS);

    const usuario = adminConUsuario.usuarios.find(u => u.email === email);
    const isPasswordValid = await bcrypt.compare(password, usuario.password);

    if (!isPasswordValid) return fail(res, 401, INVALID_CREDENTIALS);

    const token = signToken({
      adminId: adminConUsuario._id.toString(),
      email,
      localNumber: adminConUsuario.localNumber,
      permiso: usuario.permiso,
    });
    res.cookie('token', token, COOKIE_OPTS);

    return ok(res, {
      adminId: adminConUsuario._id,
      localNumber: adminConUsuario.localNumber,
      permiso: usuario.permiso,
      localName: adminConUsuario.localName,
    }, 'Inicio de sesión exitoso');

  } catch (error) {
    console.error('Error al iniciar sesión:', error);
    return fail(res, 500, 'Error al iniciar sesión');
  }
}

function logout(req, res) {
  res.clearCookie('token');
  return ok(res, null, 'Sesión cerrada');
}

async function getMe(req, res) {
  try {
    const admin = await Admin.findById(req.user.adminId).select('email localNumber localName permiso tourCompleted');
    if (!admin) return fail(res, 404, 'Admin no encontrado');

    return ok(res, {
      adminId: req.user.adminId,
      email: admin.email,
      localNumber: admin.localNumber,
      localName: admin.localName,
      permiso: req.user.permiso,
      tourCompleted: admin.tourCompleted ?? false,
    });
  } catch (err) {
    return fail(res, 500, 'Error al obtener datos del usuario');
  }
}

async function crearUsuario(req, res) {
  const adminId = req.user.adminId;
  const { email, password, role } = req.body;

  try {
    const admin = await Admin.findById(adminId);
    if (!admin) return fail(res, 404, 'Admin no encontrado');

    const yaExiste = admin.usuarios.some(u => u.email === email);
    if (yaExiste) return fail(res, 409, 'Ya existe un usuario con ese email');

    const hashedPassword = await bcrypt.hash(password, 10);
    admin.usuarios.push({ email, password: hashedPassword, permiso: role });
    await admin.save();

    return created(res, { email, role }, 'Usuario creado correctamente');
  } catch (error) {
    console.error('Error al crear usuario:', error.message);
    return fail(res, 500, 'Error al crear usuario');
  }
}

async function listarUsuarios(req, res) {
  const adminId = req.user.adminId;

  try {
    const admin = await Admin.findById(adminId);
    if (!admin) return fail(res, 404, 'Admin no encontrado');

    const usuarios = admin.usuarios.map(u => ({
      _id: u._id,
      email: u.email,
      permiso: u.permiso,
    }));

    // Include the admin as the first team member
    const equipo = [
      { _id: admin._id, email: admin.email, permiso: 'Admin', isOwner: true },
      ...usuarios,
    ];

    return ok(res, equipo);
  } catch (error) {
    return fail(res, 500, 'Error al listar usuarios');
  }
}

async function editarUsuario(req, res) {
  const adminId = req.user.adminId;
  const { usuarioId } = req.params;
  const { email, password, role } = req.body;

  try {
    const admin = await Admin.findById(adminId);
    if (!admin) return fail(res, 404, 'Admin no encontrado');

    const usuario = admin.usuarios.id(usuarioId);
    if (!usuario) return fail(res, 404, 'Usuario no encontrado');

    if (email !== undefined) {
      const duplicado = admin.usuarios.some(u => u.email === email && u._id.toString() !== usuarioId);
      if (duplicado) return fail(res, 409, 'Ya existe un usuario con ese email');
      usuario.email = email;
    }
    if (password) {
      usuario.password = await bcrypt.hash(password, 10);
    }
    if (role !== undefined) {
      usuario.permiso = role;
    }

    await admin.save();
    return ok(res, { _id: usuario._id, email: usuario.email, permiso: usuario.permiso });
  } catch (error) {
    return fail(res, 500, 'Error al editar usuario');
  }
}

async function eliminarUsuario(req, res) {
  const adminId = req.user.adminId;
  const { usuarioId } = req.params;

  try {
    const admin = await Admin.findById(adminId);
    if (!admin) return fail(res, 404, 'Admin no encontrado');

    const usuario = admin.usuarios.id(usuarioId);
    if (!usuario) return fail(res, 404, 'Usuario no encontrado');

    usuario.deleteOne();
    await admin.save();

    return ok(res, null, 'Usuario eliminado');
  } catch (error) {
    return fail(res, 500, 'Error al eliminar usuario');
  }
}

async function updateTourStatus(req, res) {
  const { completed } = req.body;
  try {
    await Admin.findByIdAndUpdate(req.user.adminId, { tourCompleted: !!completed });
    return ok(res, { tourCompleted: !!completed });
  } catch (error) {
    return fail(res, 500, 'Error al actualizar tour');
  }
}

export const methods = {
  newLocal,
  sendCode,
  verifyCode,
  login,
  logout,
  getMe,
  crearUsuario,
  listarUsuarios,
  editarUsuario,
  eliminarUsuario,
  updateTourStatus,
};
