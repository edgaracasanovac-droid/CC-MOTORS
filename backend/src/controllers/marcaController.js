const marcaService = require('../services/marcaService');
const { marcaSchema } = require('../validations/marcaValidation');

const postMarca = async (req, res) => {

  try {

    const validacion = marcaSchema.safeParse(req.body);

    if (!validacion.success) {
      return res.status(400).json(validacion.error);
    }

    const marca = await marcaService.registrarMarca(req.body);

    res.status(201).json(marca);

  } catch (error) {

    res.status(500).json({
      mensaje: 'Error al registrar marca',
      error: error.message
    });

  }

};

const getMarcas = async (req, res) => {

  try {

    const marcas = await marcaService.listarMarcas();

    res.json(marcas);

  } catch (error) {

    res.status(500).json({
      mensaje: 'Error al obtener marcas',
      error: error.message
    });

  }

};

const getMarcaPorId = async (req, res) => {

  try {

    const { id } = req.params;

    const marca = await marcaService.buscarMarcaPorId(id);

    if (!marca) {
      return res.status(404).json({
        mensaje: 'Marca no encontrada'
      });
    }

    res.json(marca);

  } catch (error) {

    res.status(500).json({
      mensaje: 'Error al obtener marca',
      error: error.message
    });

  }

};

const putMarca = async (req, res) => {

  try {

    const { id } = req.params;

    const validacion = marcaSchema.safeParse(req.body);

    if (!validacion.success) {
      return res.status(400).json(validacion.error);
    }

    const marca = await marcaService.editarMarca(id, req.body);

    if (!marca) {
      return res.status(404).json({
        mensaje: 'Marca no encontrada'
      });
    }

    res.json(marca);

  } catch (error) {

    res.status(500).json({
      mensaje: 'Error al actualizar marca',
      error: error.message
    });

  }

};

const deleteMarca = async (req, res) => {

  try {

    const { id } = req.params;

    const marca = await marcaService.borrarMarca(id);

    if (!marca) {
      return res.status(404).json({
        mensaje: 'Marca no encontrada'
      });
    }

    res.json({
      mensaje: 'Marca eliminada correctamente',
      marca
    });

  } catch (error) {

    res.status(500).json({
      mensaje: 'Error al eliminar marca',
      error: error.message
    });

  }

};

module.exports = {
  postMarca,
  getMarcas,
  getMarcaPorId,
  putMarca,
  deleteMarca
};