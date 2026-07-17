const rateLimit = require('express-rate-limit');

// ── Lista de IPs baneadas (en memoria) ──────────────────────────────
// Agregar IPs manualmente aquí para bloqueo permanente.
// Ejemplo: bannedIps.add('192.168.1.100');
const bannedIps = new Set();

// ── Bloqueo temporal automático (en memoria) ────────────────────────
// Almacena IPs bloqueadas temporalmente con timestamp de expiración.
const blockedIps = new Map();

/**
 * Registra un bloqueo temporal para una IP.
 * @param {string} ip
 * @param {number} durationMs - duración en milisegundos
 */
function blockIpTemporarily(ip, durationMs) {
  const expiresAt = Date.now() + durationMs;
  blockedIps.set(ip, expiresAt);
  console.warn(`[SEGURIDAD] IP bloqueada temporalmente: ${ip} hasta ${new Date(expiresAt).toISOString()}`);
}

/**
 * Verifica si una IP está bloqueada temporalmente.
 * Limpia entradas expiradas automáticamente.
 * @param {string} ip
 * @returns {boolean}
 */
function isIpBlocked(ip) {
  const expiresAt = blockedIps.get(ip);
  if (!expiresAt) return false;

  if (Date.now() > expiresAt) {
    blockedIps.delete(ip);
    return false;
  }

  return true;
}

// ── Middleware: verificar IP baneada ─────────────────────────────────
function bannedIpMiddleware(req, res, next) {
  const ip = req.ip;

  if (bannedIps.has(ip)) {
    return res.status(403).json({
      mensaje: 'Acceso denegado para esta IP.',
    });
  }

  if (isIpBlocked(ip)) {
    return res.status(429).json({
      mensaje: 'IP bloqueada temporalmente por actividad sospechosa.',
    });
  }

  next();
}

// ── Middleware: logging de requests ──────────────────────────────────
function requestLogger(req, res, next) {
  const ip = req.ip;
  const origin = req.headers.origin || 'N/A';
  const userAgent = req.headers['user-agent'] || 'N/A';
  const fecha = new Date().toISOString();

  console.log(
    `[${fecha}] ${req.method} ${req.originalUrl} | IP: ${ip} | Origin: ${origin} | User-Agent: ${userAgent}`
  );

  next();
}

// ── Rate Limit Global ───────────────────────────────────────────────
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    mensaje: 'Demasiadas solicitudes desde esta IP. Intenta nuevamente más tarde.',
  },
});

// ── Rate Limit para Login ───────────────────────────────────────────
const loginLimiter = rateLimit({
  windowMs: 30 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    mensaje: 'Demasiados intentos de inicio de sesión. Intenta nuevamente en 30 segundos.',
  },
  handler: (req, res, _next, options) => {
    blockIpTemporarily(req.ip, 15 * 60 * 1000);
    res.status(options.statusCode).json(options.message);
  },
});

// ── Rate Limit para recuperación de contraseña ──────────────────────
const passwordRecoveryLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    mensaje: 'Demasiadas solicitudes de recuperación. Intenta nuevamente más tarde.',
  },
  handler: (req, res, _next, options) => {
    blockIpTemporarily(req.ip, 15 * 60 * 1000);
    res.status(options.statusCode).json(options.message);
  },
});

// ── Rate Limit para formularios públicos ────────────────────────────
const publicFormsLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    mensaje: 'Demasiadas solicitudes desde esta IP. Intenta nuevamente más tarde.',
  },
});

// ── Rate Limit para registro ────────────────────────────────────────
const registerLimiter = rateLimit({
  windowMs: 30 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    mensaje: 'Demasiados intentos de registro. Intenta nuevamente en 30 segundos.',
  },
});

module.exports = {
  globalLimiter,
  loginLimiter,
  passwordRecoveryLimiter,
  publicFormsLimiter,
  registerLimiter,
  bannedIpMiddleware,
  requestLogger,
  bannedIps,
  blockIpTemporarily,
  isIpBlocked,
};
