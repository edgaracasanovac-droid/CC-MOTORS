const ventaService = require('../services/ventaService');
const { ventaSchema } = require('../validations/ventaValidation');

const postVenta = async (req, res) => {
  try {
    const validacion = ventaSchema.safeParse(req.body);

    if (!validacion.success) {
      return res.status(400).json(validacion.error);
    }

    const venta = await ventaService.registrarVenta(req.body);

    res.status(201).json({
      mensaje: 'Venta registrada correctamente',
      venta
    });

  } catch (error) {
    res.status(500).json({
      mensaje: 'Error al registrar venta',
      error: error.message
    });
  }
};

const getVentas = async (req, res) => {
  try {
    const ventas = await ventaService.listarVentas();
    res.json(ventas);
  } catch (error) {
    res.status(500).json({
      mensaje: 'Error al obtener ventas',
      error: error.message
    });
  }
};

const getVentaPorId = async (req, res) => {
  try {
    const { id } = req.params;

    const venta = await ventaService.buscarVentaPorId(id);

    if (!venta) {
      return res.status(404).json({
        mensaje: 'Venta no encontrada'
      });
    }

    res.json(venta);

  } catch (error) {
    res.status(500).json({
      mensaje: 'Error al obtener venta',
      error: error.message
    });
  }
};

const putVenta = async (req, res) => {
  try {
    const { id } = req.params;

    const venta = await ventaService.editarVenta(id, req.body);

    if (!venta) {
      return res.status(404).json({
        mensaje: 'Venta no encontrada'
      });
    }

    res.json({
      mensaje: 'Venta actualizada correctamente',
      venta
    });

  } catch (error) {
    res.status(500).json({
      mensaje: 'Error al actualizar venta',
      error: error.message
    });
  }
};

const deleteVenta = async (req, res) => {
  try {
    const { id } = req.params;

    const venta = await ventaService.borrarVenta(id);

    if (!venta) {
      return res.status(404).json({
        mensaje: 'Venta no encontrada'
      });
    }

    res.json({
      mensaje: 'Venta eliminada correctamente',
      venta
    });

  } catch (error) {
    res.status(500).json({
      mensaje: 'Error al eliminar venta',
      error: error.message
    });
  }
};

module.exports = {
  postVenta,
  getVentas,
  getVentaPorId,
  putVenta,
  deleteVenta
};
