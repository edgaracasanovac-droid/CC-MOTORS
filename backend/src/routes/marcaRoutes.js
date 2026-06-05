const express = require('express');
const router = express.Router();

const marcaController = require('../controllers/marcaController');

/**
 * @swagger
 * /api/marcas:
 *   get:
 *     summary: Obtener lista de marcas
 *     description: Retorna todas las marcas registradas en el sistema.
 *     tags:
 *       - Marcas
 *     responses:
 *       200:
 *         description: Lista de marcas obtenida correctamente
 *         content:
 *           application/json:
 *             example:
 *               - id_marca: 1
 *                 nombre: Toyota
 *                 descripcion: Marca japonesa
 *                 pais_origen: Japón
 *                 sitio_web: https://www.toyota.com
 *                 estado: activo
 */
router.get('/', marcaController.getMarcas);

/**
 * @swagger
 * /api/marcas/{id}:
 *   get:
 *     summary: Obtener marca por ID
 *     description: Retorna una marca específica según su ID.
 *     tags:
 *       - Marcas
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Marca encontrada
 *       404:
 *         description: Marca no encontrada
 */
router.get('/:id', marcaController.getMarcaPorId);

/**
 * @swagger
 * /api/marcas:
 *   post:
 *     summary: Registrar marca
 *     description: Permite registrar una nueva marca en el sistema.
 *     tags:
 *       - Marcas
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
 *                 example: Toyota
 *               descripcion:
 *                 type: string
 *                 example: Marca japonesa
 *               pais_origen:
 *                 type: string
 *                 example: Japón
 *               sitio_web:
 *                 type: string
 *                 example: https://www.toyota.com
 *               estado:
 *                 type: string
 *                 example: activo
 *     responses:
 *       201:
 *         description: Marca registrada correctamente
 *       400:
 *         description: Datos inválidos
 */
router.post('/', marcaController.postMarca);

/**
 * @swagger
 * /api/marcas/{id}:
 *   put:
 *     summary: Actualizar marca
 *     description: Permite actualizar una marca existente.
 *     tags:
 *       - Marcas
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
 *                 example: Toyota
 *               descripcion:
 *                 type: string
 *                 example: Marca japonesa actualizada
 *               estado:
 *                 type: string
 *                 example: activo
 *     responses:
 *       200:
 *         description: Marca actualizada correctamente
 *       404:
 *         description: Marca no encontrada
 */
router.put('/:id', marcaController.putMarca);

/**
 * @swagger
 * /api/marcas/{id}:
 *   delete:
 *     summary: Eliminar marca
 *     description: Elimina una marca del sistema.
 *     tags:
 *       - Marcas
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Marca eliminada correctamente
 *       404:
 *         description: Marca no encontrada
 */
router.delete('/:id', marcaController.deleteMarca);

module.exports = router;