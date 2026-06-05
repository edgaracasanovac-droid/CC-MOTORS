const ventaModel = require('../models/ventaModel');

const registrarVenta = async (venta) => {
  return await ventaModel.crearVenta(venta);
};

const listarVentas = async () => {
  return await ventaModel.obtenerVentas();
};

const buscarVentaPorId = async (id) => {
  return await ventaModel.obtenerVentaPorId(id);
};

const editarVenta = async (id, venta) => {
  return await ventaModel.actualizarVenta(id, venta);
};

const borrarVenta = async (id) => {
  return await ventaModel.eliminarVenta(id);
};

module.exports = {
  registrarVenta,
  listarVentas,
  buscarVentaPorId,
  editarVenta,
  borrarVenta
};
