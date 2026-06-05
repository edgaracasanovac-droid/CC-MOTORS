const planModel = require('../models/planFinanciamientoModel');

const registrarPlan = async (plan) => {
  return await planModel.crearPlan(plan);
};

const listarPlanes = async () => {
  return await planModel.obtenerPlanes();
};

const buscarPlanPorId = async (id) => {
  return await planModel.obtenerPlanPorId(id);
};

const editarPlan = async (id, plan) => {
  return await planModel.actualizarPlan(id, plan);
};

const borrarPlan = async (id) => {
  return await planModel.eliminarPlan(id);
};

module.exports = {
  registrarPlan,
  listarPlanes,
  buscarPlanPorId,
  editarPlan,
  borrarPlan
};