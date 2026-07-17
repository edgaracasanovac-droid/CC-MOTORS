const rateLimit = require('express-rate-limit');

// ── Lista de IPs baneadas (en memoria) ──────────────────────────────
const bannedIps = new Set();

// ── Bloqueo temporal automático (en memoria) ────────────────────────
const blockedIps = new Map();

// ── Contador de intentos fallidos por IP (para baneo progresivo) ────
const failedAttempts = new Map();

const LOGIN_WINDOW_MS = 30 * 1000;
const LOGIN_MAX_ATTEMPTS = 3;
const LOGIN_BLOCK_DURATION_MS = 60 * 1000;

function blockIpTemporarily(ip, durationMs) {
  const expiresAt = Date.now() + durationMs;
  blockedIps.set(ip, expiresAt);
  console.warn(`[SEGURIDAD] IP bloqueada temporalmente: ${ip} hasta ${new Date(expiresAt).toISOString()}`);
}

function isIpBlocked(ip) {
  const expiresAt = blockedIps.get(ip);
  if (!expiresAt) return false;

  if (Date.now() > expiresAt) {
    blockedIps.delete(ip);
    return false;
  }

  return true;
}

function registrarIntentoFallido(ip) {
  const ahora = Date.now();
  const registro = failedAttempts.get(ip) || { conteo: 0, ventanaInicio: ahora };

  if (ahora - registro.ventanaInicio > LOGIN_WINDOW_MS) {
    registro.conteo = 1;
    registro.ventanaInicio = ahora;
  } else {
    registro.conteo += 1;
  }

  failedAttempts.set(ip, registro);

  if (registro.conteo >= LOGIN_MAX_ATTEMPTS) {
    registro.conteo = 0;
    registro.ventanaInicio = ahora;
    blockIpTemporarily(ip, LOGIN_BLOCK_DURATION_MS);
    return { accion: 'bloqueado', mensaje: 'IP bloqueada temporalmente por 1 minuto.' };
  }

  return { accion: 'registrado', intentosRestantes: LOGIN_MAX_ATTEMPTS - registro.conteo };
}

function limpiarIntentoFallido(ip) {
  failedAttempts.delete(ip);
}

function bannedIpMiddleware(req, res, next) {
  const ip = req.ip;

  if (bannedIps.has(ip)) {
    return res.status(403).json({
      mensaje: 'Acceso denegado para esta IP.',
    });
  }

  if (isIpBlocked(ip)) {
    return res.status(429).json({
      mensaje: 'IP bloqueada temporalmente por actividad sospechosa. Intenta más tarde.',
    });
  }

  next();
}

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

const globalLimiter = rateLimit({
  windowMs: 30 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    mensaje: 'Demasiadas solicitudes desde esta IP. Intenta nuevamente en 30 segundos.',
  },
});

const loginLimiter = rateLimit({
  windowMs: LOGIN_WINDOW_MS,
  max: LOGIN_MAX_ATTEMPTS,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    mensaje: 'Demasiados intentos de inicio de sesión. Intenta nuevamente en 30 segundos.',
  },
  handler: (req, res, _next, options) => {
    blockIpTemporarily(req.ip, LOGIN_BLOCK_DURATION_MS);
    res.status(options.statusCode).json(options.message);
  },
});

// ── Rate Limit para recuperación de contraseña ──────────────────────
const passwordRecoveryLimiter = rateLimit({
  windowMs: 30 * 1000,
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    mensaje: 'Demasiadas solicitudes de recuperación. Intenta nuevamente en 30 segundos.',
  },
  handler: (req, res, _next, options) => {
    blockIpTemporarily(req.ip, 30 * 1000);
    res.status(options.statusCode).json(options.message);
  },
});

// ── Rate Limit para formularios públicos ────────────────────────────
const publicFormsLimiter = rateLimit({
  windowMs: 30 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    mensaje: 'Demasiadas solicitudes desde esta IP. Intenta nuevamente en 30 segundos.',
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
  blockedIps,
  failedAttempts,
  blockIpTemporarily,
  isIpBlocked,
  registrarIntentoFallido,
  limpiarIntentoFallido,
  LOGIN_BLOCK_DURATION_MS,
};
