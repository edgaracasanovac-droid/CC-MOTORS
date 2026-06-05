export function guardarToken(token) {
  localStorage.setItem("token", token);
}

export function obtenerToken() {
  return localStorage.getItem("token");
}

export function eliminarToken() {
  localStorage.removeItem("token");
}

export function estaAutenticado() {
  return !!localStorage.getItem("token");
}