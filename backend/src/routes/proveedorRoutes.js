const express = require('express');
const router = express.Router();

const proveedorController = require('../controllers/proveedorController');

/**
 * @swagger
 * /api/proveedores:
 *   get:
 *     summary: Obtener lista de proveedores
 *     description: Retorna todos los proveedores registrados en el sistema.
 *     tags:
 *       - Proveedores
 *     responses:
 *       200:
 *         description: Lista de proveedores obtenida correctamente
 *         content:
 *           application/json:
 *             example:
 *               - id_proveedor: 1
 *                 nombre: Auto Import
 *                 telefono: "04141234567"
 *                 correo: contacto@autoimport.com
 *                 direccion: Caracas
 *                 estado: activo
 */
router.get('/', proveedorController.getProveedores);

/**
 * @swagger
 * /api/proveedores/{id}:
 *   get:
 *     summary: Obtener proveedor por ID
 *     description: Retorna un proveedor específico según su ID.
 *     tags:
 *       - Proveedores
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Proveedor encontrado
 *       404:
 *         description: Proveedor no encontrado
 */
router.get('/:id', proveedorController.getProveedorPorId);

/**
 * @swagger
 * /api/proveedores:
 *   post:
 *     summary: Registrar proveedor
 *     description: Permite registrar un nuevo proveedor en el sistema.
 *     tags:
 *       - Proveedores
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre
 *             properties:
 *               nombre:
 *                 type: string
 *                 example: Auto Import
 *               telefono:
 *                 type: string
 *                 example: "04141234567"
 *               correo:
 *                 type: string
 *                 example: contacto@autoimport.com
 *               direccion:
 *                 type: string
 *                 example: Caracas
 *               estado:
 *                 type: string
 *                 example: activo
 *     responses:
 *       201:
 *         description: Proveedor registrado correctamente
 *       400:
 *         description: Datos inválidos
 */
router.post('/', proveedorController.postProveedor);

/**
 * @swagger
 * /api/proveedores/{id}:
 *   put:
 *     summary: Actualizar proveedor
 *     description: Permite actualizar un proveedor existente.
 *     tags:
 *       - Proveedores
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
 *                 example: Auto Import actualizado
 *               telefono:
 *                 type: string
 *                 example: "04145556666"
 *               correo:
 *                 type: string
 *                 example: nuevo@autoimport.com
 *               estado:
 *                 type: string
 *                 example: activo
 *     responses:
 *       200:
 *         description: Proveedor actualizado correctamente
 *       404:
 *         description: Proveedor no encontrado
 */
router.put('/:id', proveedorController.putProveedor);

/**
 * @swagger
 * /api/proveedores/{id}:
 *   delete:
 *     summary: Eliminar proveedor
 *     description: Elimina un proveedor del sistema.
 *     tags:
 *       - Proveedores
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Proveedor eliminado correctamente
 *       404:
 *         description: Proveedor no encontrado
 */
router.delete('/:id', proveedorController.deleteProveedor);

module.exports = router;