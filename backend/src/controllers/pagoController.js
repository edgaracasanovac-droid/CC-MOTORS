const pagoService = require('../services/pagoService');
const { pagoSchema } = require('../validations/pagoValidation');

const postPago = async (req, res) => {
  try {
    const validacion = pagoSchema.safeParse(req.body);

    if (!validacion.success) {
      return res.status(400).json(validacion.error);
    }

    const pago = await pagoService.registrarPago(req.body);

    res.status(201).json({
      mensaje: 'Pago registrado correctamente',
      pago
    });

  } catch (error) {
    res.status(500).json({
      mensaje: 'Error al registrar pago',
      error: error.message
    });
  }
};

const getPagos = async (req, res) => {
  try {
    const pagos = await pagoService.listarPagos();
    res.json(pagos);
  } catch (error) {
    res.status(500).json({
      mensaje: 'Error al obtener pagos',
      error: error.message
    });
  }
};

const getPagoPorId = async (req, res) => {
  try {
    const { id } = req.params;

    const pago = await pagoService.buscarPagoPorId(id);

    if (!pago) {
      return res.status(404).json({
        mensaje: 'Pago no encontrado'
      });
    }

    res.json(pago);

  } catch (error) {
    res.status(500).json({
      mensaje: 'Error al obtener pago',
      error: error.message
    });
  }
};

const putPago = async (req, res) => {
  try {
    const { id } = req.params;

    const pago = await pagoService.editarPago(id, req.body);

    if (!pago) {
      return res.status(404).json({
        mensaje: 'Pago no encontrado'
      });
    }

    res.json({
      mensaje: 'Pago actualizado correctamente',
      pago
    });

  } catch (error) {
    res.status(500).json({
      mensaje: 'Error al actualizar pago',
      error: error.message
    });
  }
};

const deletePago = async (req, res) => {
  try {
    const { id } = req.params;

    const pago = await pagoService.borrarPago(id);

    if (!pago) {
      return res.status(404).json({
        mensaje: 'Pago no encontrado'
      });
    }

    res.json({
      mensaje: 'Pago eliminado correctamente',
      pago
    });

  } catch (error) {
    res.status(500).json({
      mensaje: 'Error al eliminar pago',
      error: error.message
    });
  }
};

module.exports = {
  postPago,
  getPagos,
  getPagoPorId,
  putPago,
  deletePago
};