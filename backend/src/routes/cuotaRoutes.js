const express = require('express');
const router = express.Router();

const cuotaController = require('../controllers/cuotaController');

/**
 * @swagger
 * /api/cuotas:
 *   get:
 *     summary: Obtener lista de cuotas
 *     description: Retorna todas las cuotas registradas en el sistema.
 *     tags:
 *       - Cuotas
 *     responses:
 *       200:
 *         description: Lista de cuotas obtenida correctamente
 */
router.get('/', cuotaController.getCuotas);

/**
 * @swagger
 * /api/cuotas/{id}:
 *   get:
 *     summary: Obtener cuota por ID
 *     description: Retorna una cuota específica según su ID.
 *     tags:
 *       - Cuotas
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Cuota encontrada
 *       404:
 *         description: Cuota no encontrada
 */
router.get('/:id', cuotaController.getCuotaPorId);

/**
 * @swagger
 * /api/cuotas:
 *   post:
 *     summary: Registrar cuota
 *     description: Permite registrar una nueva cuota asociada a un plan de financiamiento.
 *     tags:
 *       - Cuotas
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - numero_cuota
 *               - fecha_vencimiento
 *               - monto
 *             properties:
 *               numero_cuota:
 *                 type: integer
 *                 example: 1
 *               fecha_vencimiento:
 *                 type: string
 *                 example: "2026-06-28"
 *               monto:
 *                 type: string
 *                 example: "500"
 *               estado:
 *                 type: string
 *                 example: pendiente
 *               id_plan_financiamiento:
 *                 type: integer
 *                 example: 1
 *               id_venta_vehiculo:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       201:
 *         description: Cuota registrada correctamente
 */
router.post('/', cuotaController.postCuota);

/**
 * @swagger
 * /api/cuotas/{id}:
 *   put:
 *     summary: Actualizar cuota
 *     description: Actualiza una cuota existente.
 *     tags:
 *       - Cuotas
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
 *               numero:
 *                 type: integer
 *                 example: 1
 *               fecha_vencimiento:
 *                 type: string
 *                 example: "2026-06-28"
 *               monto:
 *                 type: string
 *                 example: "500"
 *               estado:
 *                 type: string
 *                 example: pagada
 *               id_plan_financiamiento:
 *                 type: integer
 *                 example: 1
 *               id_venta_vehiculo:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       200:
 *         description: Cuota actualizada correctamente
 *       404:
 *         description: Cuota no encontrada
 */
router.put('/:id', cuotaController.putCuota);

/**
 * @swagger
 * /api/cuotas/{id}:
 *   delete:
 *     summary: Eliminar cuota
 *     description: Elimina una cuota por ID.
 *     tags:
 *       - Cuotas
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Cuota eliminada correctamente
 *       404:
 *         description: Cuota no encontrada
 */
router.delete('/:id', cuotaController.deleteCuota);

module.exports = router;