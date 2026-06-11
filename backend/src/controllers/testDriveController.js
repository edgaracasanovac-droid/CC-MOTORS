const testDriveService = require('../services/testDriveService');

const postTestDrive = async (req, res) => {
  try {
    const { id_vehiculo, fecha, hora, mensaje } = req.body;

    if (!id_vehiculo || !fecha || !hora) {
      return res.status(400).json({
        mensaje: 'id_vehiculo, fecha y hora son obligatorios'
      });
    }

    const solicitud = await testDriveService.registrarTestDrive(
      req.usuario.correo,
      {
        id_vehiculo,
        fecha,
        hora,
        mensaje
      }
    );

    res.status(201).json({
      mensaje: 'Solicitud de test drive registrada correctamente',
      testDrive: solicitud
    });

  } catch (error) {
    if (error.message === 'Vehículo no encontrado') {
      return res.status(404).json({
        mensaje: 'Vehículo no encontrado'
      });
    }

    if (error.message === 'No existe un cliente asociado a este usuario') {
      return res.status(404).json({
        mensaje: 'No existe un cliente asociado a este usuario'
      });
    }

    res.status(500).json({
      mensaje: 'Error al registrar test drive',
      error: error.message
    });
  }
};

const getMisTestDrives = async (req, res) => {
  try {
    const testDrives = await testDriveService.listarMisTestDrives(
      req.usuario.correo
    );

    res.json({
      mensaje: 'Solicitudes de test drive obtenidas correctamente',
      testDrives
    });

  } catch (error) {
    res.status(500).json({
      mensaje: 'Error al obtener solicitudes de test drive',
      error: error.message
    });
  }
};

module.exports = {
  postTestDrive,
  getMisTestDrives
};