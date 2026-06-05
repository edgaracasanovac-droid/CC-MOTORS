const cuotaService = require('../services/cuotaService');
const { cuotaSchema } = require('../validations/cuotaValidation');

const postCuota = async (req, res) => {
  try {
    const validacion = cuotaSchema.safeParse(req.body);

    if (!validacion.success) {
      return res.status(400).json(validacion.error);
    }

    const cuota = await cuotaService.registrarCuota(req.body);

    res.status(201).json({
      mensaje: 'Cuota registrada correctamente',
      cuota
    });

  } catch (error) {
    res.status(500).json({
      mensaje: 'Error al registrar cuota',
      error: error.message
    });
  }
};
const getCuotas = async (req, res) => {
  try {
    const cuotas = await cuotaService.listarCuotas();
    res.json(cuotas);
  } catch (error) {
    res.status(500).json({
      mensaje: 'Error al obtener cuotas',
      error: error.message
    });
  }
};

const getCuotaPorId = async (req, res) => {
  try {
    const { id } = req.params;

    const cuota = await cuotaService.buscarCuotaPorId(id);

    if (!cuota) {
      return res.status(404).json({
        mensaje: 'Cuota no encontrada'
      });
    }

    res.json(cuota);

  } catch (error) {
    res.status(500).json({
      mensaje: 'Error al obtener cuota',
      error: error.message
    });
  }
};

const putCuota = async (req, res) => {
  try {
    const { id } = req.params;

    const cuota = await cuotaService.editarCuota(id, req.body);

    if (!cuota) {
      return res.status(404).json({
        mensaje: 'Cuota no encontrada'
      });
    }

    res.json({
      mensaje: 'Cuota actualizada correctamente',
      cuota
    });

  } catch (error) {
    res.status(500).json({
      mensaje: 'Error al actualizar cuota',
      error: error.message
    });
  }
};

const deleteCuota = async (req, res) => {
  try {
    const { id } = req.params;

    const cuota = await cuotaService.borrarCuota(id);

    if (!cuota) {
      return res.status(404).json({
        mensaje: 'Cuota no encontrada'
      });
    }

    res.json({
      mensaje: 'Cuota eliminada correctamente',
      cuota
    });

  } catch (error) {
    res.status(500).json({
      mensaje: 'Error al eliminar cuota',
      error: error.message
    });
  }
};

module.exports = {
  postCuota,
  getCuotas,
  getCuotaPorId,
  putCuota,
  deleteCuota
};