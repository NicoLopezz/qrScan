import { verifyToken as verify } from '../utils/jwt.js';

// Rutas que no requieren autenticación
const PUBLIC_PATHS = ['/api/login', '/api/webhook', '/api/newLocal', '/api/dashboardAdmin'];

export function verifyTokenMiddleware(req, res, next) {
  // Dejar pasar rutas públicas
  if (PUBLIC_PATHS.some(p => req.path.startsWith(p))) return next();

  const token = req.cookies.token;
  if (!token) return next(); // Sin token → sigue (validateUser se encargará si la ruta lo requiere)

  try {
    const decoded = verify(token);

    // Poblar req.user con el payload del JWT
    req.user = decoded;

    // Backward compat: todos los controllers usan req.cookies.adminId directamente
    req.cookies.adminId    = decoded.adminId;
    req.cookies.username   = decoded.email;
    req.cookies.localNumber = decoded.localNumber;

    next();
  } catch (err) {
    // Token inválido o expirado → limpiar cookie y continuar sin sesión
    res.clearCookie('token');
    next();
  }
}
