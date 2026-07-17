const express = require('express');
const router = express.Router();

const rolModel = require('../models/rolModel');
const { verificarToken, verificarRol } = require('../middlewares/authMiddleware');

router.get('/', verificarToken, verificarRol(1, 3), async (req, res) => {
  try {
    const roles = await rolModel.obtenerRoles();

    res.json(roles);
  } catch (error) {
    res.status(500).json({
      mensaje: 'Error al obtener roles',
      error: error.message,
    });
  }
});

module.exports = router;
