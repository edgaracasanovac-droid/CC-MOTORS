const express = require('express');
const router = express.Router();

const cotizacionController = require('../controllers/cotizacionController');

/**
 * @swagger
 * /api/cotizaciones/publica:
 *   post:
 *     summary: Registrar cotización pública
 *     description: Permite que la website registre una cotización creando o reutilizando un cliente automáticamente.
 *     tags:
 *       - Cotizaciones
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre
 *               - apellido
 *               - documento
 *               - telefono
 *               - correo
 *               - direccion
 *               - id_vehiculo
 *             properties:
 *               nombre:
 *                 type: string
 *                 example: Gabriela
 *               apellido:
 *                 type: string
 *                 example: Moreno
 *               documento:
 *                 type: string
 *                 example: V12345678
 *               telefono:
 *                 type: string
 *                 example: "04141234567"
 *               correo:
 *                 type: string
 *                 example: gabriela@gmail.com
 *               direccion:
 *                 type: string
 *                 example: San Cristóbal
 *               id_vehiculo:
 *                 type: integer
 *                 example: 3
 *               mensaje:
 *                 type: string
 *                 example: Me interesa financiamiento
 *     responses:
 *       201:
 *         description: Cotización pública registrada correctamente
 *       400:
 *         description: Datos inválidos
 *       404:
 *         description: Vehículo no encontrado
 */
router.post('/publica', cotizacionController.postCotizacionPublica);

/**
 * @swagger
 * /api/cotizaciones:
 *   get:
 *     summary: Obtener lista de cotizaciones
 *     description: Retorna todas las cotizaciones registradas en el sistema.
 *     tags:
 *       - Cotizaciones
 *     responses:
 *       200:
 *         description: Lista de cotizaciones obtenida correctamente
 *         content:
 *           application/json:
 *             example:
 *               - id_cotizacion: 1
 *                 fecha: "2026-05-28"
 *                 precio_estimado: "15000"
 *                 vigencia: "2026-06-28"
 *                 estado: pendiente
 *                 cliente_nombre: Erick
 *                 cliente_apellido: Casanova
 *                 placa: ABC123
 *                 marca: Toyota
 *                 modelo: Corolla
 */
router.get('/', cotizacionController.getCotizaciones);

/**
 * @swagger
 * /api/cotizaciones/{id}:
 *   get:
 *     summary: Obtener cotización por ID
 *     description: Retorna una cotización específica según su ID.
 *     tags:
 *       - Cotizaciones
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Cotización encontrada
 *       404:
 *         description: Cotización no encontrada
 */
router.get('/:id', cotizacionController.getCotizacionPorId);

/**
 * @swagger
 * /api/cotizaciones:
 *   post:
 *     summary: Registrar cotización
 *     description: Permite registrar una nueva cotización en el sistema.
 *     tags:
 *       - Cotizaciones
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id_cliente
 *               - id_vehiculo
 *               - precio_estimado
 *             properties:
 *               id_cliente:
 *                 type: integer
 *                 example: 1
 *               id_vehiculo:
 *                 type: integer
 *                 example: 1
 *               precio_estimado:
 *                 type: string
 *                 example: "15000"
 *               vigencia:
 *                 type: string
 *                 example: "2026-06-28"
 *               estado:
 *                 type: string
 *                 example: pendiente
 *     responses:
 *       201:
 *         description: Cotización registrada correctamente
 *       400:
 *         description: Datos inválidos
 *       404:
 *         description: Cliente o vehículo no encontrado
 */
router.post('/', cotizacionController.postCotizacion);

/**
 * @swagger
 * /api/cotizaciones/{id}:
 *   put:
 *     summary: Actualizar cotización
 *     description: Permite actualizar una cotización existente.
 *     tags:
 *       - Cotizaciones
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
 *               precio_estimado:
 *                 type: string
 *                 example: "18000"
 *               vigencia:
 *                 type: string
 *                 example: "2026-07-01"
 *               estado:
 *                 type: string
 *                 example: aprobada
 *     responses:
 *       200:
 *         description: Cotización actualizada correctamente
 *       404:
 *         description: Cotización no encontrada
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
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Cotización eliminada correctamente
 *       404:
 *         description: Cotización no encontrada
 */
router.delete('/:id', cotizacionController.deleteCotizacion);

module.exports = router;