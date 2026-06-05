const express = require('express');
const router = express.Router();

const vehiculoController = require('../controllers/vehiculoController');

/**
 * @swagger
 * /api/vehiculos:
 *   get:
 *     summary: Obtener lista de vehículos
 *     description: Retorna todos los vehículos registrados con marca, modelo y proveedor.
 *     tags:
 *       - Vehiculos
 *     responses:
 *       200:
 *         description: Lista de vehículos obtenida correctamente
 *         content:
 *           application/json:
 *             example:
 *               - id_vehiculo: 1
 *                 placa: ABC123
 *                 color: Negro
 *                 ano: 2024
 *                 kilometraje: "1000.00"
 *                 estado: disponible
 *                 precio_compra: "10000.00"
 *                 precio_venta: "15000.00"
 *                 id_marca: 1
 *                 id_modelo: 1
 *                 id_proveedor: 1
 *                 nombre_marca: Toyota
 *                 nombre_modelo: Corolla
 *                 nombre_proveedor: Auto Import
 */
router.get('/', vehiculoController.getVehiculos);

/**
 * @swagger
 * /api/vehiculos/{id}:
 *   get:
 *     summary: Obtener vehículo por ID
 *     description: Retorna un vehículo específico según su ID, incluyendo marca, modelo y proveedor.
 *     tags:
 *       - Vehiculos
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Vehículo encontrado
 *       404:
 *         description: Vehículo no encontrado
 */
router.get('/:id', vehiculoController.getVehiculoPorId);

/**
 * @swagger
 * /api/vehiculos:
 *   post:
 *     summary: Registrar vehículo
 *     description: Registra un nuevo vehículo con todos los campos necesarios para el frontend.
 *     tags:
 *       - Vehiculos
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - placa
 *               - color
 *               - ano
 *               - kilometraje
 *               - estado
 *               - precio_compra
 *               - precio_venta
 *               - id_marca
 *               - id_modelo
 *             properties:
 *               placa:
 *                 type: string
 *                 example: ABC123
 *               color:
 *                 type: string
 *                 example: Negro
 *               ano:
 *                 type: integer
 *                 example: 2024
 *               kilometraje:
 *                 type: number
 *                 example: 1000
 *               estado:
 *                 type: string
 *                 enum: [disponible, vendido, mantenimiento]
 *                 example: disponible
 *               precio_compra:
 *                 type: number
 *                 example: 10000
 *               precio_venta:
 *                 type: number
 *                 example: 15000
 *               id_marca:
 *                 type: integer
 *                 example: 1
 *               id_modelo:
 *                 type: integer
 *                 example: 1
 *               id_proveedor:
 *                 type: integer
 *                 nullable: true
 *                 example: 1
 *     responses:
 *       201:
 *         description: Vehículo registrado correctamente
 *       400:
 *         description: Datos inválidos
 */
router.post('/', vehiculoController.postVehiculo);

/**
 * @swagger
 * /api/vehiculos/{id}:
 *   put:
 *     summary: Actualizar vehículo
 *     description: Actualiza todos los campos principales de un vehículo existente.
 *     tags:
 *       - Vehiculos
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
 *             required:
 *               - placa
 *               - color
 *               - ano
 *               - kilometraje
 *               - estado
 *               - precio_compra
 *               - precio_venta
 *               - id_marca
 *               - id_modelo
 *             properties:
 *               placa:
 *                 type: string
 *                 example: ABC123
 *               color:
 *                 type: string
 *                 example: Blanco
 *               ano:
 *                 type: integer
 *                 example: 2024
 *               kilometraje:
 *                 type: number
 *                 example: 1200
 *               estado:
 *                 type: string
 *                 enum: [disponible, vendido, mantenimiento]
 *                 example: disponible
 *               precio_compra:
 *                 type: number
 *                 example: 10000
 *               precio_venta:
 *                 type: number
 *                 example: 15500
 *               id_marca:
 *                 type: integer
 *                 example: 1
 *               id_modelo:
 *                 type: integer
 *                 example: 1
 *               id_proveedor:
 *                 type: integer
 *                 nullable: true
 *                 example: 1
 *     responses:
 *       200:
 *         description: Vehículo actualizado correctamente
 *       400:
 *         description: Datos inválidos
 *       404:
 *         description: Vehículo no encontrado
 */
router.put('/:id', vehiculoController.putVehiculo);

/**
 * @swagger
 * /api/vehiculos/{id}:
 *   delete:
 *     summary: Eliminar vehículo
 *     description: Elimina un vehículo del sistema.
 *     tags:
 *       - Vehiculos
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Vehículo eliminado correctamente
 *       404:
 *         description: Vehículo no encontrado
 */
router.delete('/:id', vehiculoController.deleteVehiculo);

module.exports = router;