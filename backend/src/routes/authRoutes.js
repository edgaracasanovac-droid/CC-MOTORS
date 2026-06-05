const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const { verificarToken } = require('../middlewares/authMiddleware');

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Iniciar sesión
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - correo
 *               - contrasena
 *             properties:
 *               correo:
 *                 type: string
 *                 example: admin@gmail.com
 *               contrasena:
 *                 type: string
 *                 example: 123456
 *     responses:
 *       200:
 *         description: Login exitoso
 *       401:
 *         description: Credenciales inválidas
 */
router.post('/login', authController.login);

/**
 * @swagger
 * /api/auth/recuperar-contrasena:
 *   post:
 *     summary: Recuperar contraseña
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - correo
 *             properties:
 *               correo:
 *                 type: string
 *                 example: admin@gmail.com
 *     responses:
 *       200:
 *         description: Nueva contraseña enviada al correo
 *       404:
 *         description: Correo no encontrado
 */
router.post('/recuperar-contrasena', authController.recuperarContrasena);

/**
 * @swagger
 * /api/auth/perfil:
 *   get:
 *     summary: Obtener perfil básico
 *     tags:
 *       - Auth
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Perfil obtenido correctamente
 *       401:
 *         description: Token inválido
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
 *     responses:
 *       200:
 *         description: Perfil obtenido correctamente
 *         content:
 *           application/json:
 *             example:
 *               mensaje: Perfil obtenido correctamente
 *               perfil:
 *                 id: 11
 *                 email: adminnuevo@gmail.com
 *                 nombre: Admin
 *                 apellido: Casanova
 *                 rol: admin
 *       401:
 *         description: Token inválido o no enviado
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre
 *               - apellido
 *               - correo
 *             properties:
 *               nombre:
 *                 type: string
 *                 example: Admin
 *               apellido:
 *                 type: string
 *                 example: Casanova
 *               correo:
 *                 type: string
 *                 example: adminnuevo@gmail.com
 *     responses:
 *       200:
 *         description: Perfil actualizado correctamente
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: Token inválido o no enviado
 */
router.put('/profile_update', verificarToken, authController.profileUpdate);

module.exports = router;