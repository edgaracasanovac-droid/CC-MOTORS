const API_URL = import.meta.env.PUBLIC_API_URL || "http://localhost:3000/api";

async function request(endpoint, options = {}) {
  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
      ...options,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data?.mensaje || "Error en la petición al backend");
    }

    return data;
  } catch (error) {
    console.error(`Error en ${endpoint}:`, error);
    throw error;
  }
}

export async function getVehiculos() {
  try {
    return await request("/vehiculos");
  } catch {
    return [];
  }
}

export async function getVehiculoPorId(id) {
  try {
    return await request(`/vehiculos/${id}`);
  } catch {
    return null;
  }
}

export async function crearCotizacionPublica(datosCotizacion) {
  return await request("/cotizaciones/publica", {
    method: "POST",
    body: JSON.stringify(datosCotizacion),
  });
}

export function formatPrice(value) {
  const number = Number(value);

  if (Number.isNaN(number)) {
    return "$0.00";
  }

  return `$${number.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export async function loginUsuario(credenciales) {
  return await request("/auth/login", {
    method: "POST",
    body: JSON.stringify(credenciales),
  });
}

export async function registrarUsuario(datosUsuario) {
  return await request("/auth/register", {
    method: "POST",
    body: JSON.stringify(datosUsuario),
  });
}


export async function recuperarContrasena(correo) {
  return await request("/auth/recuperar-contrasena", {
    method: "POST",
    body: JSON.stringify({ correo }),
  });
}

export { API_URL };