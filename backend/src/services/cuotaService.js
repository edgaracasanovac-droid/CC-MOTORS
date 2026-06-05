const cuotaModel = require('../models/cuotaModel');

const registrarCuota = async (cuota) => {
  return await cuotaModel.crearCuota(cuota);
};

const listarCuotas = async () => {
  return await cuotaModel.obtenerCuotas();
};

const buscarCuotaPorId = async (id) => {
  return await cuotaModel.obtenerCuotaPorId(id);
};

const editarCuota = async (id, cuota) => {
  return await cuotaModel.actualizarCuota(id, cuota);
};

const borrarCuota = async (id) => {
  return await cuotaModel.eliminarCuota(id);
};

module.exports = {
  registrarCuota,
  listarCuotas,
  buscarCuotaPorId,
  editarCuota,
  borrarCuota
};