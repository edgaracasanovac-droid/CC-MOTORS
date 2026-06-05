const express = require('express');
const router = express.Router();

const ventaController = require('../controllers/ventaController');

/**
 * @swagger
 * /api/ventas:
 *   get:
 *     summary: Obtener lista de ventas
 *     description: Retorna todas las ventas registradas en el sistema.
 *     tags:
 *       - Ventas
 *     responses:
 *       200:
 *         description: Lista de ventas obtenida correctamente
 */
router.get('/', ventaController.getVentas);

/**
 * @swagger
 * /api/ventas/{id}:
 *   get:
 *     summary: Obtener venta por ID
 *     description: Retorna una venta específica según su ID.
 *     tags:
 *       - Ventas
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Venta encontrada
 *       404:
 *         description: Venta no encontrada
 */
router.get('/:id', ventaController.getVentaPorId);

/**
 * @swagger
 * /api/ventas:
 *   post:
 *     summary: Registrar venta
 *     description: Permite registrar una nueva venta de vehículo.
 *     tags:
 *       - Ventas
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id_cliente
 *               - id_usuario
 *               - id_vehiculo
 *               - precio_final
 *               - tipo_venta
 *             properties:
 *               id_cliente:
 *                 type: integer
 *                 example: 1
 *               id_usuario:
 *                 type: integer
 *                 example: 1
 *               id_vehiculo:
 *                 type: integer
 *                 example: 1
 *               precio_final:
 *                 type: string
 *                 example: "15000"
 *               tipo_venta:
 *                 type: string
 *                 example: contado
 *               estado:
 *                 type: string
 *                 example: completada
 *     responses:
 *       201:
 *         description: Venta registrada correctamente
 *       400:
 *         description: Datos inválidos
 */
router.post('/', ventaController.postVenta);

/**
 * @swagger
 * /api/ventas/{id}:
 *   put:
 *     summary: Actualizar venta
 *     description: Actualiza una venta existente.
 *     tags:
 *       - Ventas
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
 *               fecha:
 *                 type: string
 *                 example: "2026-05-28"
 *               precio_final:
 *                 type: string
 *                 example: "18000"
 *               tipo_venta:
 *                 type: string
 *                 example: financiado
 *               estado:
 *                 type: string
 *                 example: completada
 *               id_cliente:
 *                 type: integer
 *                 example: 1
 *               id_usuario:
 *                 type: integer
 *                 example: 1
 *               id_vehiculo:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       200:
 *         description: Venta actualizada correctamente
 *       404:
 *         description: Venta no encontrada
 */
router.put('/:id', ventaController.putVenta);

/**
 * @swagger
 * /api/ventas/{id}:
 *   delete:
 *     summary: Eliminar venta
 *     description: Elimina una venta por ID.
 *     tags:
 *       - Ventas
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Venta eliminada correctamente
 *       404:
 *         description: Venta no encontrada
 */
router.delete('/:id', ventaController.deleteVenta);

module.exports = router;