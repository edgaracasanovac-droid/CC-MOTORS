const express = require('express');
const router = express.Router();

const modeloController = require('../controllers/modeloController');

/**
 * @swagger
 * /api/modelos:
 *   get:
 *     summary: Obtener lista de modelos
 *     description: Retorna todos los modelos registrados en el sistema.
 *     tags:
 *       - Modelos
 *     responses:
 *       200:
 *         description: Lista de modelos obtenida correctamente
 *         content:
 *           application/json:
 *             example:
 *               - id_modelo: 1
 *                 nombre: Corolla
 *                 descripcion: Sedan compacto
 *                 id_marca: 1
 *                 marca: Toyota
 *                 estado: activo
 */
router.get('/', modeloController.getModelos);

/**
 * @swagger
 * /api/modelos/{id}:
 *   get:
 *     summary: Obtener modelo por ID
 *     description: Retorna un modelo específico según su ID.
 *     tags:
 *       - Modelos
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Modelo encontrado
 *       404:
 *         description: Modelo no encontrado
 */
router.get('/:id', modeloController.getModeloPorId);

/**
 * @swagger
 * /api/modelos:
 *   post:
 *     summary: Registrar modelo
 *     description: Permite registrar un nuevo modelo en el sistema.
 *     tags:
 *       - Modelos
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre
 *               - id_marca
 *             properties:
 *               nombre:
 *                 type: string
 *                 example: Corolla
 *               descripcion:
 *                 type: string
 *                 example: Sedan compacto
 *               id_marca:
 *                 type: integer
 *                 example: 1
 *               estado:
 *                 type: string
 *                 example: activo
 *     responses:
 *       201:
 *         description: Modelo registrado correctamente
 *       400:
 *         description: Datos inválidos
 */
router.post('/', modeloController.postModelo);

/**
 * @swagger
 * /api/modelos/{id}:
 *   put:
 *     summary: Actualizar modelo
 *     description: Permite actualizar un modelo existente.
 *     tags:
 *       - Modelos
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
 *                 example: Corolla Cross
 *               descripcion:
 *                 type: string
 *                 example: SUV compacta
 *               estado:
 *                 type: string
 *                 example: activo
 *     responses:
 *       200:
 *         description: Modelo actualizado correctamente
 *       404:
 *         description: Modelo no encontrado
 */
router.put('/:id', modeloController.putModelo);

/**
 * @swagger
 * /api/modelos/{id}:
 *   delete:
 *     summary: Eliminar modelo
 *     description: Elimina un modelo del sistema.
 *     tags:
 *       - Modelos
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Modelo eliminado correctamente
 *       404:
 *         description: Modelo no encontrado
 */
router.delete('/:id', modeloController.deleteModelo);

module.exports = router;