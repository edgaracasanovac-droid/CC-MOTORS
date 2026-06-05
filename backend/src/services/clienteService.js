const clienteModel = require('../models/clienteModel');

const listarClientes = async () => {
  return await clienteModel.obtenerClientes();
};

const buscarClientePorId = async (id) => {
  return await clienteModel.obtenerClientePorId(id);
};

const registrarCliente = async (cliente) => {
  return await clienteModel.crearCliente(cliente);
};

const editarCliente = async (id, cliente) => {
  return await clienteModel.actualizarCliente(id, cliente);
};

const borrarCliente = async (id) => {
  return await clienteModel.eliminarCliente(id);
};

module.exports = {
  listarClientes,
  buscarClientePorId,
  registrarCliente,
  editarCliente,
  borrarCliente
};