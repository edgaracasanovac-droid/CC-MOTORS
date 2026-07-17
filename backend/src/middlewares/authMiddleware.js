const jwt = require('jsonwebtoken');

const ROLES = {
  ADMIN: 1,
  CLIENTE: 2,
  GERENTE: 3,
  VENDEDOR: 4,
};

const verificarToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        mensaje: 'Token requerido',
      });
    }

    const token = authHeader.split(' ')[1];

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'secret_key'
    );

    req.usuario = decoded;

    next();
  } catch (error) {
    return res.status(401).json({
      mensaje: 'Token inválido',
    });
  }
};

const verificarRol = (...rolesPermitidos) => {
  return (req, res, next) => {
    const { id_rol, rol } = req.usuario || {};

    if (!id_rol && !rol) {
      return res.status(403).json({
        mensaje: 'No se pudo determinar el rol del usuario.',
      });
    }

    const rolUsuario = id_rol || ROLES[rol?.toUpperCase()];

    if (!rolesPermitidos.includes(rolUsuario)) {
      return res.status(403).json({
        mensaje: 'No tienes permisos para acceder a este recurso.',
      });
    }

    next();
  };
};

module.exports = {
  verificarToken,
  verificarRol,
  ROLES,
};