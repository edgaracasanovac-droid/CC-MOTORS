const express = require('express');
const router = express.Router();

const usuarioController = require('../controllers/usuarioController');

/**
 * @swagger
 * /api/usuarios:
 *   get:
 *     summary: Obtener lista de usuarios
 *     description: Retorna todos los usuarios registrados en el sistema.
 *     tags:
 *       - Usuarios
 *     responses:
 *       200:
 *         description: Lista de usuarios obtenida correctamente
 *         content:
 *           application/json:
 *             example:
 *               - id_usuario: 1
 *                 nombre: Erick
 *                 apellido: Casanova
 *                 correo: erick@gmail.com
 *                 estado: activo
 *                 id_rol: 1
 *                 rol: admin
 */
router.get('/', usuarioController.getUsuarios);

/**
 * @swagger
 * /api/usuarios/{id}:
 *   get:
 *     summary: Obtener usuario por ID
 *     description: Retorna un usuario específico según su ID.
 *     tags:
 *       - Usuarios
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Usuario encontrado
 *       404:
 *         description: Usuario no encontrado
 */
router.get('/:id', usuarioController.getUsuarioPorId);

/**
 * @swagger
 * /api/usuarios:
 *   post:
 *     summary: Registrar usuario
 *     description: Permite registrar un nuevo usuario en el sistema.
 *     tags:
 *       - Usuarios
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre
 *               - correo
 *               - contrasena
 *               - id_rol
 *             properties:
 *               nombre:
 *                 type: string
 *                 example: Erick
 *               apellido:
 *                 type: string
 *                 example: Casanova
 *               correo:
 *                 type: string
 *                 example: erick@gmail.com
 *               contrasena:
 *                 type: string
 *                 example: 123456
 *               id_rol:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       201:
 *         description: Usuario registrado correctamente
 *       400:
 *         description: Datos inválidos
 */
router.post('/', usuarioController.postUsuario);

/**
 * @swagger
 * /api/usuarios/{id}:
 *   put:
 *     summary: Actualizar usuario
 *     description: Permite actualizar un usuario existente.
 *     tags:
 *       - Usuarios
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *                 example: Erick
 *               apellido:
 *                 type: string
 *                 example: Casanova
 *               correo:
 *                 type: string
 *                 example: nuevo@gmail.com
 *               estado:
 *                 type: string
 *                 example: activo
 *               id_rol:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       200:
 *         description: Usuario actualizado correctamente
 *       404:
 *         description: Usuario no encontrado
 */
router.put('/:id', usuarioController.putUsuario);

/**
 * @swagger
 * /api/usuarios/{id}:
 *   delete:
 *     summary: Eliminar usuario
 *     description: Elimina un usuario del sistema.
 *     tags:
 *       - Usuarios
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Usuario eliminado correctamente
 *       404:
 *         description: Usuario no encontrado
 */
router.delete('/:id', usuarioController.deleteUsuario);

module.exports = router;