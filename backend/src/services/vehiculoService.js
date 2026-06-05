const vehiculoModel = require('../models/vehiculoModel');

const listarVehiculos = async () => {
  return await vehiculoModel.obtenerVehiculos();
};

const buscarVehiculoPorId = async (id) => {
  return await vehiculoModel.obtenerVehiculoPorId(id);
};

const registrarVehiculo = async (vehiculo) => {
  return await vehiculoModel.crearVehiculo(vehiculo);
};

const editarVehiculo = async (id, vehiculo) => {
  return await vehiculoModel.actualizarVehiculo(id, vehiculo);
};

const borrarVehiculo = async (id) => {
  return await vehiculoModel.eliminarVehiculo(id);
};

module.exports = {
  listarVehiculos,
  buscarVehiculoPorId,
  registrarVehiculo,
  editarVehiculo,
  borrarVehiculo
};