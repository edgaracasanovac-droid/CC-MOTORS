const cotizacionModel = require('../models/cotizacionModel');

const registrarCotizacion = async (cotizacion) => {
  return await cotizacionModel.crearCotizacion(cotizacion);
};

const registrarCotizacionPublica = async (datos) => {
  return await cotizacionModel.crearCotizacionPublica(datos);
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