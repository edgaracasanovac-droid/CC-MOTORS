const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const { verificarToken, verificarRol } = require('../middlewares/authMiddleware');
const { loginLimiter, passwordRecoveryLimiter, registerLimiter } = require('../middlewares/rateLimiters');

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Registro público de usuario cliente
 *     description: Permite registrar un nuevo usuario cliente desde la website.
 *     tags:
 *       - Auth
 */
router.post('/register', registerLimiter, authController.register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Iniciar sesión
 *     tags:
 *       - Auth
 */
router.post('/login', loginLimiter, authController.login);

/**
 * @swagger
 * /api/auth/recuperar-contrasena:
 *   post:
 *     summary: Solicitar enlace para restablecer contraseña
 *     description: Envía un enlace seguro al correo del usuario para restablecer su contraseña.
 *     tags:
 *       - Auth
 */
router.post('/recuperar-contrasena', passwordRecoveryLimiter, authController.recuperarContrasena);

/**
 * @swagger
 * /api/auth/restablecer-contrasena:
 *   post:
 *     summary: Restablecer contraseña
 *     description: Permite crear una nueva contraseña usando el token recibido por correo.
 *     tags:
 *       - Auth
 */
router.post('/restablecer-contrasena', authController.restablecerContrasena);

/**
 * @swagger
 * /api/auth/perfil:
 *   get:
 *     summary: Obtener perfil básico
 *     tags:
 *       - Auth
 *     security:
 *       - bearerAuth: []
 */
router.get('/perfil', verificarToken, authController.perfil);

/**
 * @swagger
 * /api/auth/profile:
 *   get:
 *     summary: Obtener perfil del usuario autenticado
 *     description: Retorna los datos del usuario autenticado mediante JWT.
 *     tags:
 *       - Auth
 *     security:
 *       - bearerAuth: []
 */
router.get('/profile', verificarToken, authController.profile);

/**
 * @swagger
 * /api/auth/profile_update:
 *   put:
 *     summary: Actualizar perfil del usuario autenticado
 *     description: Permite actualizar nombre, apellido y correo del usuario autenticado.
 *     tags:
 *       - Auth
 *     security:
 *       - bearerAuth: []
 */
router.put('/profile_update', verificarToken, authController.profileUpdate);

// ── Rutas de gestión de IPs baneadas (solo para admin autenticado) ──
const { bannedIps, blockedIps, failedAttempts } = require('../middlewares/rateLimiters');

router.get('/ips-bloqueadas', verificarToken, verificarRol(1), (req, res) => {
  const ahora = Date.now();
  const bloqueosActivos = {};

  for (const [ip, expiresAt] of blockedIps) {
    if (ahora < expiresAt) {
      bloqueosActivos[ip] = {
        expira: new Date(expiresAt).toISOString(),
        tiempoRestanteMs: expiresAt - ahora,
      };
    }
  }

  res.json({
    ipsBaneadasPermanentes: Array.from(bannedIps),
    ipsBloqueadasTemporales: bloqueosActivos,
    intentosFallidos: Object.fromEntries(failedAttempts),
  });
});

router.post('/banear-ip', verificarToken, verificarRol(1), (req, res) => {
  const { ip } = req.body;

  if (!ip) {
    return res.status(400).json({ mensaje: 'Se requiere una dirección IP.' });
  }

  bannedIps.add(ip);
  blockedIps.delete(ip);
  failedAttempts.delete(ip);

  console.error(`[SEGURIDAD] IP baneada manualmente por admin: ${ip}`);

  res.json({ mensaje: `IP ${ip} baneada permanentemente.` });
});

router.post('/desbanear-ip', verificarToken, verificarRol(1), (req, res) => {
  const { ip } = req.body;

  if (!ip) {
    return res.status(400).json({ mensaje: 'Se requiere una dirección IP.' });
  }

  bannedIps.delete(ip);
  blockedIps.delete(ip);
  failedAttempts.delete(ip);

  console.log(`[SEGURIDAD] IP desbaneada manualmente por admin: ${ip}`);

  res.json({ mensaje: `IP ${ip} desbaneada correctamente.` });
});

module.exports = router;