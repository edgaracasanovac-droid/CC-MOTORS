const marcaModel = require('../models/marcaModel');

const registrarMarca = async (marca) => {
  return await marcaModel.crearMarca(marca);
};

const listarMarcas = async () => {
  return await marcaModel.obtenerMarcas();
};

const buscarMarcaPorId = async (id) => {
  return await marcaModel.obtenerMarcaPorId(id);
};

const editarMarca = async (id, marca) => {
  return await marcaModel.actualizarMarca(id, marca);
};

const borrarMarca = async (id) => {
  return await marcaModel.eliminarMarca(id);
};

module.exports = {
  registrarMarca,
  listarMarcas,
  buscarMarcaPorId,
  editarMarca,
  borrarMarca
};