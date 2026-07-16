const express = require('express');
const router = express.Router();

const testDriveController = require('../controllers/testDriveController');
const { verificarToken } = require('../middlewares/authMiddleware');

router.get('/', verificarToken, testDriveController.getTestDrivesAdmin);

router.get(
  '/mis-solicitudes',
  verificarToken,
  testDriveController.getMisTestDrives
);

router.get('/:id', verificarToken, testDriveController.getTestDrivePorIdAdmin);
router.put('/:id', verificarToken, testDriveController.actualizarTestDriveAdmin);
router.delete('/:id', verificarToken, testDriveController.eliminarTestDriveAdmin);
router.post('/', verificarToken, testDriveController.postTestDrive);

module.exports = router;