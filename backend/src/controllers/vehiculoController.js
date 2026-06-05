const vehiculoService = require('../services/vehiculoService');
const { vehiculoSchema } = require('../validations/vehiculoValidation');

const getVehiculos = async (req, res) => {
  try {
    const vehiculos = await vehiculoService.listarVehiculos();
    res.json(vehiculos);
  } catch (error) {
    res.status(500).json({
      mensaje: 'Error al obtener vehículos',
      error: error.message
    });
  }
};

const getVehiculoPorId = async (req, res) => {
  try {
    const { id } = req.params;

    const vehiculo = await vehiculoService.buscarVehiculoPorId(id);

    if (!vehiculo) {
      return res.status(404).json({
        mensaje: 'Vehículo no encontrado'
      });
    }

    res.json(vehiculo);
  } catch (error) {
    res.status(500).json({
      mensaje: 'Error al obtener vehículo',
      error: error.message
    });
  }
};

const postVehiculo = async (req, res) => {
  try {
    const validacion = vehiculoSchema.safeParse(req.body);

    if (!validacion.success) {
      return res.status(400).json(validacion.error);
    }

    const vehiculo = await vehiculoService.registrarVehiculo(req.body);

    res.status(201).json({
      mensaje: 'Vehículo registrado correctamente',
      vehiculo
    });
  } catch (error) {
    res.status(500).json({
      mensaje: 'Error al registrar vehículo',
      error: error.message
    });
  }
};

const putVehiculo = async (req, res) => {
  try {
    const { id } = req.params;

    const validacion = vehiculoSchema.safeParse(req.body);

    if (!validacion.success) {
      return res.status(400).json(validacion.error);
    }

    const vehiculo = await vehiculoService.editarVehiculo(id, req.body);

    if (!vehiculo) {
      return res.status(404).json({
        mensaje: 'Vehículo no encontrado'
      });
    }

    res.json({
      mensaje: 'Vehículo actualizado correctamente',
      vehiculo
    });
  } catch (error) {
    res.status(500).json({
      mensaje: 'Error al actualizar vehículo',
      error: error.message
    });
  }
};

const deleteVehiculo = async (req, res) => {
  try {
    const { id } = req.params;

    const vehiculo = await vehiculoService.borrarVehiculo(id);

    if (!vehiculo) {
      return res.status(404).json({
        mensaje: 'Vehículo no encontrado'
      });
    }

    res.json({
      mensaje: 'Vehículo eliminado correctamente',
      vehiculo
    });
  } catch (error) {
    res.status(500).json({
      mensaje: 'Error al eliminar vehículo',
      error: error.message
    });
  }
};

module.exports = {
  getVehiculos,
  getVehiculoPorId,
  postVehiculo,
  putVehiculo,
  deleteVehiculo
};