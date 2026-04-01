import { verifyToken as verify } from '../utils/jwt.js';

const PUBLIC_PATHS = [
  '/api/login',
  '/api/logout',
  '/api/webhook',
  '/api/telegram/webhook',
  '/api/newLocal',
  '/api/send-code',
  '/api/verify-code',
  '/api/qrScanUpdate',
  '/api/qrScanUpdateReservas',
  '/api/qrScanUpdateLavados',
];

export function verifyTokenMiddleware(req, res, next) {
  if (PUBLIC_PATHS.some(p => req.path.startsWith(p))) return next();

  const token = req.cookies.token;
  if (!token) return next();

  try {
    const decoded = verify(token);
    req.user = decoded;
    req.cookies.adminId = decoded.adminId;
    req.cookies.username = decoded.email;
    req.cookies.localNumber = decoded.localNumber;
    next();
  } catch (err) {
    res.clearCookie('token');
    next();
  }
}
