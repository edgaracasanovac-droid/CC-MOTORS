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

const getTestDrivesAdmin = async (req, res) => {
  try {
    const testDrives = await testDriveService.listarTestDrivesAdmin();

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

const getTestDrivePorIdAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const testDrive = await testDriveService.obtenerTestDrivePorIdAdmin(id);

    if (!testDrive) {
      return res.status(404).json({ mensaje: 'Solicitud de test drive no encontrada' });
    }

    res.json({
      mensaje: 'Solicitud de test drive obtenida correctamente',
      testDrive
    });
  } catch (error) {
    res.status(500).json({
      mensaje: 'Error al obtener la solicitud de test drive',
      error: error.message
    });
  }
};

const actualizarTestDriveAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const campos = req.body;

    const testDrive = await testDriveService.actualizarTestDriveAdmin(id, campos);

    if (!testDrive) {
      return res.status(404).json({ mensaje: 'Solicitud de test drive no encontrada' });
    }

    res.json({
      mensaje: 'Solicitud de test drive actualizada correctamente',
      testDrive
    });
  } catch (error) {
    res.status(500).json({
      mensaje: 'Error al actualizar la solicitud de test drive',
      error: error.message
    });
  }
};

const eliminarTestDriveAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const testDrive = await testDriveService.eliminarTestDriveAdmin(id);

    if (!testDrive) {
      return res.status(404).json({ mensaje: 'Solicitud de test drive no encontrada' });
    }

    res.json({
      mensaje: 'Solicitud de test drive eliminada correctamente',
      testDrive
    });
  } catch (error) {
    res.status(500).json({
      mensaje: 'Error al eliminar la solicitud de test drive',
      error: error.message
    });
  }
};

module.exports = {
  postTestDrive,
  getMisTestDrives,
  getTestDrivesAdmin,
  getTestDrivePorIdAdmin,
  actualizarTestDriveAdmin,
  eliminarTestDriveAdmin
};