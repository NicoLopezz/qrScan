export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'No autenticado' });
    }
    if (!roles.includes(req.user.permiso)) {
      return res.status(403).json({ success: false, message: 'No autorizado' });
    }
    next();
  };
}
