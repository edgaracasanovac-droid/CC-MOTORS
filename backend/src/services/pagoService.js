const pagoModel = require('../models/pagoModel');

const registrarPago = async (pago) => {
  return await pagoModel.crearPago(pago);
};

const listarPagos = async () => {
  return await pagoModel.obtenerPagos();
};

const buscarPagoPorId = async (id) => {
  return await pagoModel.obtenerPagoPorId(id);
};

const editarPago = async (id, pago) => {
  return await pagoModel.actualizarPago(id, pago);
};

const borrarPago = async (id) => {
  return await pagoModel.eliminarPago(id);
};

module.exports = {
  registrarPago,
  listarPagos,
  buscarPagoPorId,
  editarPago,
  borrarPago
};