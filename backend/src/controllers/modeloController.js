const modeloService = require('../services/modeloService');
const { modeloSchema } = require('../validations/modeloValidation');

const postModelo = async (req, res) => {
  try {
    const validacion = modeloSchema.safeParse(req.body);

    if (!validacion.success) {
      return res.status(400).json(validacion.error);
    }

    const modelo = await modeloService.registrarModelo(req.body);

    res.status(201).json(modelo);

  } catch (error) {
    res.status(500).json({
      mensaje: 'Error al registrar modelo',
      error: error.message
    });
  }
};

const getModelos = async (req, res) => {
  try {
    const modelos = await modeloService.listarModelos();
    res.json(modelos);
  } catch (error) {
    res.status(500).json({
      mensaje: 'Error al obtener modelos',
      error: error.message
    });
  }
};

const getModeloPorId = async (req, res) => {
  try {
    const { id } = req.params;

    const modelo = await modeloService.buscarModeloPorId(id);

    if (!modelo) {
      return res.status(404).json({
        mensaje: 'Modelo no encontrado'
      });
    }

    res.json(modelo);

  } catch (error) {
    res.status(500).json({
      mensaje: 'Error al obtener modelo',
      error: error.message
    });
  }
};

const putModelo = async (req, res) => {
  try {
    const { id } = req.params;

    const validacion = modeloSchema.safeParse(req.body);

    if (!validacion.success) {
      return res.status(400).json(validacion.error);
    }

    const modelo = await modeloService.editarModelo(id, req.body);

    if (!modelo) {
      return res.status(404).json({
        mensaje: 'Modelo no encontrado'
      });
    }

    res.json(modelo);

  } catch (error) {
    res.status(500).json({
      mensaje: 'Error al actualizar modelo',
      error: error.message
    });
  }
};

const deleteModelo = async (req, res) => {
  try {
    const { id } = req.params;

    const modelo = await modeloService.borrarModelo(id);

    if (!modelo) {
      return res.status(404).json({
        mensaje: 'Modelo no encontrado'
      });
    }

    res.json({
      mensaje: 'Modelo eliminado correctamente',
      modelo
    });

  } catch (error) {
    res.status(500).json({
      mensaje: 'Error al eliminar modelo',
      error: error.message
    });
  }
};

module.exports = {
  postModelo,
  getModelos,
  getModeloPorId,
  putModelo,
  deleteModelo
};