const express = require('express');
const router = express.Router();

const testDriveController = require('../controllers/testDriveController');
const { verificarToken } = require('../middlewares/authMiddleware');

router.post('/', verificarToken, testDriveController.postTestDrive);

router.get(
  '/mis-solicitudes',
  verificarToken,
  testDriveController.getMisTestDrives
);

module.exports = router;