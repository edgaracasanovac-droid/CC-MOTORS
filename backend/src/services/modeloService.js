const modeloModel = require('../models/modeloModel');

const registrarModelo = async (modelo) => {
  return await modeloModel.crearModelo(modelo);
};

const listarModelos = async () => {
  return await modeloModel.obtenerModelos();
};

const buscarModeloPorId = async (id) => {
  return await modeloModel.obtenerModeloPorId(id);
};

const editarModelo = async (id, modelo) => {
  return await modeloModel.actualizarModelo(id, modelo);
};

const borrarModelo = async (id) => {
  return await modeloModel.eliminarModelo(id);
};

module.exports = {
  registrarModelo,
  listarModelos,
  buscarModeloPorId,
  editarModelo,
  borrarModelo
};