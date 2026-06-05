const API_URL = import.meta.env.PUBLIC_API_URL || "http://localhost:3000/api";

export async function getVehiculos() {
  try {
    const response = await fetch(`${API_URL}/vehiculos`);

    if (!response.ok) {
      throw new Error("Error al obtener vehículos");
    }

    return await response.json();
  } catch (error) {
    console.error("Error al obtener vehículos:", error);
    return [];
  }
}

export async function getVehiculoPorId(id) {
  try {
    const response = await fetch(`${API_URL}/vehiculos/${id}`);

    if (!response.ok) {
      throw new Error("Error al obtener vehículo");
    }

    return await response.json();
  } catch (error) {
    console.error("Error al obtener vehículo:", error);
    return null;
  }
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

export async function crearCliente(cliente) {
  const response = await fetch(`${API_URL}/clientes`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(cliente),
  });

  if (!response.ok) {
    throw new Error("Error al crear cliente");
  }

  return await response.json();
}

export async function crearCotizacion(cotizacion) {
  const response = await fetch(`${API_URL}/cotizaciones`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(cotizacion),
  });

  if (!response.ok) {
    throw new Error("Error al crear cotización");
  }

  return await response.json();
}