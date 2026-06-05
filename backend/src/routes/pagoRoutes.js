const express = require('express');
const router = express.Router();

const pagoController = require('../controllers/pagoController');

/**
 * @swagger
 * /api/pagos:
 *   get:
 *     summary: Obtener lista de pagos
 *     description: Retorna todos los pagos registrados en el sistema.
 *     tags:
 *       - Pagos
 *     responses:
 *       200:
 *         description: Lista de pagos obtenida correctamente
 */
router.get('/', pagoController.getPagos);

/**
 * @swagger
 * /api/pagos/{id}:
 *   get:
 *     summary: Obtener pago por ID
 *     description: Retorna un pago específico según su ID.
 *     tags:
 *       - Pagos
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Pago encontrado
 *       404:
 *         description: Pago no encontrado
 */
router.get('/:id', pagoController.getPagoPorId);

/**
 * @swagger
 * /api/pagos:
 *   post:
 *     summary: Registrar pago
 *     description: Permite registrar un nuevo pago relacionado a una venta o cuota.
 *     tags:
 *       - Pagos
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - monto
 *               - metodo_pago
 *             properties:
 *               fecha:
 *                 type: string
 *                 example: "2026-05-28"
 *               id_venta_vehiculo:
 *                 type: integer
 *                 example: 1
 *               id_cuota:
 *                 type: integer
 *                 example: 1
 *               id_usuario:
 *                 type: integer
 *                 example: 1
 *               monto:
 *                 type: string
 *                 example: "500"
 *               metodo_pago:
 *                 type: string
 *                 example: transferencia
 *               referencia:
 *                 type: string
 *                 example: REF12345
 *               estado:
 *                 type: string
 *                 example: confirmado
 *     responses:
 *       201:
 *         description: Pago registrado correctamente
 */
router.post('/', pagoController.postPago);

/**
 * @swagger
 * /api/pagos/{id}:
 *   put:
 *     summary: Actualizar pago
 *     description: Actualiza un pago existente.
 *     tags:
 *       - Pagos
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
 *               monto:
 *                 type: string
 *                 example: "500"
 *               metodo_pago:
 *                 type: string
 *                 example: transferencia
 *               referencia:
 *                 type: string
 *                 example: REF12345
 *               estado:
 *                 type: string
 *                 example: confirmado
 *               id_usuario:
 *                 type: integer
 *                 example: 1
 *               id_venta_vehiculo:
 *                 type: integer
 *                 example: 1
 *               id_cuota:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       200:
 *         description: Pago actualizado correctamente
 *       404:
 *         description: Pago no encontrado
 */
router.put('/:id', pagoController.putPago);

/**
 * @swagger
 * /api/pagos/{id}:
 *   delete:
 *     summary: Eliminar pago
 *     description: Elimina un pago por ID.
 *     tags:
 *       - Pagos
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Pago eliminado correctamente
 *       404:
 *         description: Pago no encontrado
 */
router.delete('/:id', pagoController.deletePago);

module.exports = router;