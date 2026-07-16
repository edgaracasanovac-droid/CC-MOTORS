const TOKEN_KEY = "token";
const USUARIO_KEY = "usuario";

const puedeUsarLocalStorage = () => {
  return typeof window !== "undefined" && !!window.localStorage;
};

export function guardarToken(token) {
  if (!puedeUsarLocalStorage()) return;

  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  }
}

export function obtenerToken() {
  if (!puedeUsarLocalStorage()) return null;

  return localStorage.getItem(TOKEN_KEY);
}

export function eliminarToken() {
  if (!puedeUsarLocalStorage()) return;

  localStorage.removeItem(TOKEN_KEY);
}

export function guardarUsuario(usuario) {
  if (!puedeUsarLocalStorage()) return;

  if (usuario) {
    localStorage.setItem(USUARIO_KEY, JSON.stringify(usuario));
  }
}

export function obtenerUsuario() {
  if (!puedeUsarLocalStorage()) return null;

  const usuarioGuardado = localStorage.getItem(USUARIO_KEY);

  if (!usuarioGuardado) return null;

  try {
    return JSON.parse(usuarioGuardado);
  } catch (error) {
    console.error("Error al leer el usuario guardado:", error);
    localStorage.removeItem(USUARIO_KEY);
    return null;
  }
}

export function eliminarUsuario() {
  if (!puedeUsarLocalStorage()) return;

  localStorage.removeItem(USUARIO_KEY);
}

export function eliminarSesion() {
  if (!puedeUsarLocalStorage()) return;

  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USUARIO_KEY);
}

export function estaAutenticado() {
  return !!obtenerToken();
}