const express = require('express');
const router = express.Router();

const planController = require('../controllers/planFinanciamientoController');

/**
 * @swagger
 * /api/planes-financiamiento:
 *   get:
 *     summary: Obtener lista de planes de financiamiento
 *     description: Retorna todos los planes de financiamiento registrados en el sistema.
 *     tags:
 *       - PlanesFinanciamiento
 *     responses:
 *       200:
 *         description: Lista de planes obtenida correctamente
 */
router.get('/', planController.getPlanes);

/**
 * @swagger
 * /api/planes-financiamiento/{id}:
 *   get:
 *     summary: Obtener plan de financiamiento por ID
 *     description: Retorna un plan específico según su ID.
 *     tags:
 *       - PlanesFinanciamiento
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Plan encontrado
 *       404:
 *         description: Plan no encontrado
 */
router.get('/:id', planController.getPlanPorId);

/**
 * @swagger
 * /api/planes-financiamiento:
 *   post:
 *     summary: Registrar plan de financiamiento
 *     description: Permite registrar un nuevo plan de financiamiento para una venta.
 *     tags:
 *       - PlanesFinanciamiento
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id_venta_vehiculo
 *               - monto_inicial
 *               - cantidad_cuotas
 *               - tasa_interes
 *             properties:
 *               id_venta_vehiculo:
 *                 type: integer
 *                 example: 1
 *               monto_inicial:
 *                 type: string
 *                 example: "5000"
 *               cantidad_cuotas:
 *                 type: integer
 *                 example: 24
 *               tasa_interes:
 *                 type: string
 *                 example: "10"
 *               estado:
 *                 type: string
 *                 example: activo
 *     responses:
 *       201:
 *         description: Plan registrado correctamente
 */
router.post('/', planController.postPlan);

/**
 * @swagger
 * /api/planes-financiamiento/{id}:
 *   put:
 *     summary: Actualizar plan de financiamiento
 *     description: Actualiza un plan existente.
 *     tags:
 *       - PlanesFinanciamiento
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
 *               monto_inicial:
 *                 type: string
 *                 example: "6000"
 *               cantidad_cuotas:
 *                 type: integer
 *                 example: 36
 *               tasa_interes:
 *                 type: string
 *                 example: "12"
 *               estado:
 *                 type: string
 *                 example: activo
 *               id_venta_vehiculo:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       200:
 *         description: Plan actualizado correctamente
 *       404:
 *         description: Plan no encontrado
 */
router.put('/:id', planController.putPlan);

/**
 * @swagger
 * /api/planes-financiamiento/{id}:
 *   delete:
 *     summary: Eliminar plan de financiamiento
 *     description: Elimina un plan de financiamiento por ID.
 *     tags:
 *       - PlanesFinanciamiento
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Plan eliminado correctamente
 *       404:
 *         description: Plan no encontrado
 */
router.delete('/:id', planController.deletePlan);

module.exports = router;