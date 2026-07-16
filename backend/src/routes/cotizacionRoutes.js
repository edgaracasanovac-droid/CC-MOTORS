const express = require('express');
const router = express.Router();

const cotizacionController = require('../controllers/cotizacionController');
const { verificarToken } = require('../middlewares/authMiddleware');
const { publicFormsLimiter } = require('../middlewares/rateLimiters');

/**
 * @swagger
 * /api/cotizaciones/publica:
 *   post:
 *     summary: Registrar cotización pública
 *     description: Permite que la website registre una cotización creando o reutilizando un cliente automáticamente.
 *     tags:
 *       - Cotizaciones
 */
router.post('/publica', publicFormsLimiter, cotizacionController.postCotizacionPublica);

/**
 * @swagger
 * /api/cotizaciones/mis-cotizaciones:
 *   get:
 *     summary: Obtener historial de cotizaciones del cliente autenticado
 *     description: Retorna todas las cotizaciones y configuraciones de compra asociadas al usuario autenticado.
 *     tags:
 *       - Cotizaciones
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cotizaciones obtenidas correctamente
 *       401:
 *         description: Token inválido o no enviado
 */
router.get(
  '/mis-cotizaciones',
  verificarToken,
  cotizacionController.getMisCotizaciones
);

/**
 * @swagger
 * /api/cotizaciones:
 *   get:
 *     summary: Obtener lista de cotizaciones
 *     description: Retorna todas las cotizaciones registradas en el sistema.
 *     tags:
 *       - Cotizaciones
 */
router.get('/', cotizacionController.getCotizaciones);

/**
 * @swagger
 * /api/cotizaciones:
 *   post:
 *     summary: Registrar cotización
 *     description: Permite registrar una nueva cotización desde el sistema administrativo.
 *     tags:
 *       - Cotizaciones
 */
router.post('/', cotizacionController.postCotizacion);

/**
 * @swagger
 * /api/cotizaciones/{id}:
 *   get:
 *     summary: Obtener cotización por ID
 *     description: Retorna una cotización específica según su ID.
 *     tags:
 *       - Cotizaciones
 */
router.get('/:id', cotizacionController.getCotizacionPorId);

/**
 * @swagger
 * /api/cotizaciones/{id}:
 *   put:
 *     summary: Actualizar cotización
 *     description: Permite actualizar una cotización existente.
 *     tags:
 *       - Cotizaciones
 */
router.put('/:id', cotizacionController.putCotizacion);

/**
 * @swagger
 * /api/cotizaciones/{id}:
 *   delete:
 *     summary: Eliminar cotización
 *     description: Elimina una cotización del sistema.
 *     tags:
 *       - Cotizaciones
 */
router.delete('/:id', cotizacionController.deleteCotizacion);

module.exports = router;