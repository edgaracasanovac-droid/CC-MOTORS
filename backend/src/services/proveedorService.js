const proveedorModel = require('../models/proveedorModel');

const registrarProveedor = async (proveedor) => {
  return await proveedorModel.crearProveedor(proveedor);
};

const listarProveedores = async () => {
  return await proveedorModel.obtenerProveedores();
};

const buscarProveedorPorId = async (id) => {
  return await proveedorModel.obtenerProveedorPorId(id);
};

const editarProveedor = async (id, proveedor) => {
  return await proveedorModel.actualizarProveedor(id, proveedor);
};

const borrarProveedor = async (id) => {
  return await proveedorModel.eliminarProveedor(id);
};

module.exports = {
  registrarProveedor,
  listarProveedores,
  buscarProveedorPorId,
  editarProveedor,
  borrarProveedor
};