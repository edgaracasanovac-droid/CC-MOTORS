const cotizacionService = require('../services/cotizacionService');
const { cotizacionSchema } = require('../validations/cotizacionValidation');

const postCotizacion = async (req, res) => {
  try {
    const validacion = cotizacionSchema.safeParse(req.body);

    if (!validacion.success) {
      return res.status(400).json(validacion.error);
    }

    const cotizacion = await cotizacionService.registrarCotizacion(req.body);

    res.status(201).json({
      mensaje: 'Cotización registrada correctamente',
      cotizacion
    });

  } catch (error) {
    res.status(500).json({
      mensaje: 'Error al registrar cotización',
      error: error.message
    });
  }
};

const postCotizacionPublica = async (req, res) => {
  try {
    const resultado = await cotizacionService.registrarCotizacionPublica(req.body);

    res.status(201).json({
      mensaje: 'Cotización pública registrada correctamente',
      cliente: resultado.cliente,
      cotizacion: resultado.cotizacion
    });

  } catch (error) {

    if (error.message === 'Vehículo no encontrado') {
      return res.status(404).json({
        mensaje: 'Vehículo no encontrado'
      });
    }

    res.status(500).json({
      mensaje: 'Error al registrar cotización pública',
      error: error.message
    });
  }
};

const getCotizaciones = async (req, res) => {
  try {
    const cotizaciones = await cotizacionService.listarCotizaciones();
    res.json(cotizaciones);
  } catch (error) {
    res.status(500).json({
      mensaje: 'Error al obtener cotizaciones',
      error: error.message
    });
  }
};

const getCotizacionPorId = async (req, res) => {
  try {
    const { id } = req.params;

    const cotizacion = await cotizacionService.buscarCotizacionPorId(id);

    if (!cotizacion) {
      return res.status(404).json({
        mensaje: 'Cotización no encontrada'
      });
    }

    res.json(cotizacion);

  } catch (error) {
    res.status(500).json({
      mensaje: 'Error al obtener cotización',
      error: error.message
    });
  }
};

const putCotizacion = async (req, res) => {
  try {
    const { id } = req.params;

    const validacion = cotizacionSchema.safeParse(req.body);

    if (!validacion.success) {
      return res.status(400).json(validacion.error);
    }

    const cotizacion = await cotizacionService.editarCotizacion(id, req.body);

    if (!cotizacion) {
      return res.status(404).json({
        mensaje: 'Cotización no encontrada'
      });
    }

    res.json(cotizacion);

  } catch (error) {
    res.status(500).json({
      mensaje: 'Error al actualizar cotización',
      error: error.message
    });
  }
};

const deleteCotizacion = async (req, res) => {
  try {
    const { id } = req.params;

    const cotizacion = await cotizacionService.borrarCotizacion(id);

    if (!cotizacion) {
      return res.status(404).json({
        mensaje: 'Cotización no encontrada'
      });
    }

    res.json({
      mensaje: 'Cotización eliminada correctamente',
      cotizacion
    });

  } catch (error) {
    res.status(500).json({
      mensaje: 'Error al eliminar cotización',
      error: error.message
    });
  }
};

const getMisCotizaciones = async (req, res) => {
  try {
    const correo = req.usuario.correo;

    const cotizaciones = await cotizacionService.listarMisCotizaciones(correo);

    res.json({
      mensaje: 'Cotizaciones del cliente obtenidas correctamente',
      cotizaciones
    });

  } catch (error) {
    res.status(500).json({
      mensaje: 'Error al obtener cotizaciones del cliente',
      error: error.message
    });
  }
};

module.exports = {
  postCotizacion,
  postCotizacionPublica,
  getCotizaciones,
  getMisCotizaciones,
  getCotizacionPorId,
  putCotizacion,
  deleteCotizacion
};