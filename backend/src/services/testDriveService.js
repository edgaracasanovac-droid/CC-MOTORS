const testDriveModel = require('../models/testDriveModel');

const registrarTestDrive = async (correoUsuario, datos) => {
  const cliente = await testDriveModel.buscarClientePorCorreo(correoUsuario);

  if (!cliente) {
    throw new Error('No existe un cliente asociado a este usuario');
  }

  const vehiculo = await testDriveModel.buscarVehiculoPorId(datos.id_vehiculo);

  if (!vehiculo) {
    throw new Error('Vehículo no encontrado');
  }

  return await testDriveModel.crearSolicitudTestDrive({
    id_cliente: cliente.id_cliente,
    id_vehiculo: datos.id_vehiculo,
    fecha: datos.fecha,
    hora: datos.hora,
    mensaje: datos.mensaje
  });
};

const listarMisTestDrives = async (correoUsuario) => {
  return await testDriveModel.obtenerMisTestDrives(correoUsuario);
};

module.exports = {
  registrarTestDrive,
  listarMisTestDrives
};