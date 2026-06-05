const express = require('express');
const router = express.Router();

const clienteController = require('../controllers/clienteController');

/**
 * @swagger
 * /api/clientes:
 *   get:
 *     summary: Obtener lista de clientes
 *     description: Retorna todos los clientes registrados en el sistema.
 *     tags:
 *       - Clientes
 *     responses:
 *       200:
 *         description: Lista de clientes obtenida correctamente
 *         content:
 *           application/json:
 *             example:
 *               - id_cliente: 1
 *                 nombre: Erick
 *                 apellido: Casanova
 *                 documento: V12345678
 *                 telefono: "04141234567"
 *                 correo: erick@gmail.com
 *                 direccion: San Cristobal
 */
router.get('/', clienteController.getClientes);

/**
 * @swagger
 * /api/clientes/{id}:
 *   get:
 *     summary: Obtener cliente por ID
 *     description: Retorna un cliente específico según su ID.
 *     tags:
 *       - Clientes
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Cliente encontrado
 *       404:
 *         description: Cliente no encontrado
 */
router.get('/:id', clienteController.getClientePorId);

/**
 * @swagger
 * /api/clientes:
 *   post:
 *     summary: Registrar cliente
 *     description: Permite registrar un nuevo cliente.
 *     tags:
 *       - Clientes
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre
 *               - apellido
 *             properties:
 *               nombre:
 *                 type: string
 *                 example: Erick
 *               apellido:
 *                 type: string
 *                 example: Casanova
 *               documento:
 *                 type: string
 *                 example: V12345678
 *               telefono:
 *                 type: string
 *                 example: "04141234567"
 *               correo:
 *                 type: string
 *                 example: erick@gmail.com
 *               direccion:
 *                 type: string
 *                 example: San Cristobal
 *     responses:
 *       201:
 *         description: Cliente registrado correctamente
 *       400:
 *         description: Datos inválidos
 */
router.post('/', clienteController.postCliente);

/**
 * @swagger
 * /api/clientes/{id}:
 *   put:
 *     summary: Actualizar cliente
 *     description: Permite actualizar un cliente existente.
 *     tags:
 *       - Clientes
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
 *               telefono:
 *                 type: string
 *                 example: "04145556666"
 *               correo:
 *                 type: string
 *                 example: nuevo@gmail.com
 *     responses:
 *       200:
 *         description: Cliente actualizado correctamente
 *       404:
 *         description: Cliente no encontrado
 */
router.put('/:id', clienteController.putCliente);

/**
 * @swagger
 * /api/clientes/{id}:
 *   delete:
 *     summary: Eliminar cliente
 *     description: Elimina un cliente del sistema.
 *     tags:
 *       - Clientes
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Cliente eliminado correctamente
 *       404:
 *         description: Cliente no encontrado
 */
router.delete('/:id', clienteController.deleteCliente);

module.exports = router;