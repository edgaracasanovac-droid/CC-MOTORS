export const obtenerMensajeError = (error, fallback = "No se pudo completar la solicitud") => {
  const data = error?.response?.data || {};

  return (
    data.mensaje ||
    data.error ||
    data.message ||
    error?.message ||
    fallback
  );
};

export const esCorreoValido = (valor) => {
  if (typeof valor !== "string") return false;
  const correo = valor.trim();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo);
};

export const esFechaValida = (valor) => {
  if (typeof valor !== "string" || !valor.trim()) return false;

  const fecha = new Date(valor);
  return !Number.isNaN(fecha.getTime());
};

export const esNumeroValido = (valor) => {
  const numero = Number(valor);
  return Number.isFinite(numero);
};

export const esNumeroMayorQueCero = (valor) => {
  const numero = Number(valor);
  return Number.isFinite(numero) && numero > 0;
};

export const esNumeroNoNegativo = (valor) => {
  const numero = Number(valor);
  return Number.isFinite(numero) && numero >= 0;
};

export const esTextoValido = (valor) => {
  return typeof valor === "string" ? valor.trim().length > 0 : Boolean(valor);
};

export const normalizarTexto = (valor) => {
  return typeof valor === "string" ? valor.trim() : valor;
};

export const obtenerNumero = (valor) => {
  const numero = Number(valor);
  return Number.isFinite(numero) ? numero : NaN;
};

export const obtenerIdValido = (valor) => {
  const numero = Number(valor);
  return Number.isFinite(numero) && numero > 0 ? numero : null;
};
