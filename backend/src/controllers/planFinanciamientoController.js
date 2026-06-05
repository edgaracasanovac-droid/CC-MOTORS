const planService = require('../services/planFinanciamientoService');
const { planSchema } = require('../validations/planFinanciamientoValidation');

const postPlan = async (req, res) => {
  try {
    const validacion = planSchema.safeParse(req.body);

    if (!validacion.success) {
      return res.status(400).json(validacion.error);
    }

    const plan = await planService.registrarPlan(req.body);

    res.status(201).json({
      mensaje: 'Plan de financiamiento creado correctamente',
      plan
    });

  } catch (error) {
    res.status(500).json({
      mensaje: 'Error al crear plan',
      error: error.message
    });
  }
};

const getPlanes = async (req, res) => {
  try {
    const planes = await planService.listarPlanes();
    res.json(planes);
  } catch (error) {
    res.status(500).json({
      mensaje: 'Error al obtener planes',
      error: error.message
    });
  }
};

const getPlanPorId = async (req, res) => {
  try {
    const { id } = req.params;

    const plan = await planService.buscarPlanPorId(id);

    if (!plan) {
      return res.status(404).json({
        mensaje: 'Plan de financiamiento no encontrado'
      });
    }

    res.json(plan);

  } catch (error) {
    res.status(500).json({
      mensaje: 'Error al obtener plan',
      error: error.message
    });
  }
};

const putPlan = async (req, res) => {
  try {
    const { id } = req.params;

    const plan = await planService.editarPlan(id, req.body);

    if (!plan) {
      return res.status(404).json({
        mensaje: 'Plan de financiamiento no encontrado'
      });
    }

    res.json({
      mensaje: 'Plan de financiamiento actualizado correctamente',
      plan
    });

  } catch (error) {
    res.status(500).json({
      mensaje: 'Error al actualizar plan',
      error: error.message
    });
  }
};

const deletePlan = async (req, res) => {
  try {
    const { id } = req.params;

    const plan = await planService.borrarPlan(id);

    if (!plan) {
      return res.status(404).json({
        mensaje: 'Plan de financiamiento no encontrado'
      });
    }

    res.json({
      mensaje: 'Plan de financiamiento eliminado correctamente',
      plan
    });

  } catch (error) {
    res.status(500).json({
      mensaje: 'Error al eliminar plan',
      error: error.message
    });
  }
};

module.exports = {
  postPlan,
  getPlanes,
  getPlanPorId,
  putPlan,
  deletePlan
};