const cotizacionModel = require('../models/cotizacionModel');
const emailService = require('./emailService');

const registrarCotizacion = async (cotizacion) => {
  return await cotizacionModel.crearCotizacion(cotizacion);
};

const registrarCotizacionPublica = async (datos) => {
  const resultado = await cotizacionModel.crearCotizacionPublica(datos);

  try {
    await emailService.enviarCorreoCotizacionPublica({
      cliente: resultado.cliente,
      cotizacion: resultado.cotizacion,
      datos
    });
  } catch (error) {
    console.error('Error al enviar correo de cotización pública:', error.message);
  }

  return resultado;
};

const listarCotizaciones = async () => {
  return await cotizacionModel.obtenerCotizaciones();
};

const buscarCotizacionPorId = async (id) => {
  return await cotizacionModel.obtenerCotizacionPorId(id);
};

const editarCotizacion = async (id, cotizacion) => {
  return await cotizacionModel.actualizarCotizacion(id, cotizacion);
};

const borrarCotizacion = async (id) => {
  return await cotizacionModel.eliminarCotizacion(id);
};

module.exports = {
  registrarCotizacion,
  registrarCotizacionPublica,
  listarCotizaciones,
  buscarCotizacionPorId,
  editarCotizacion,
  borrarCotizacion
};