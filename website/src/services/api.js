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

export async function getMarcas() {
  try {
    return await request("/marcas");
  } catch {
    return [];
  }
}

export async function getModelos() {
  try {
    return await request("/modelos");
  } catch {
    return [];
  }
}

export function getPlaceholderImage(marca, modelo) {
  const label = `${marca} ${modelo}`.trim();
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
  <defs>
    <linearGradient id="bg" x1="0%25" y1="0%25" x2="100%25" y2="100%25">
      <stop offset="0%25" stop-color="%23111217"/>
      <stop offset="100%25" stop-color="%23171820"/>
    </linearGradient>
    <linearGradient id="accent" x1="0%25" y1="0%25" x2="100%25" y2="0%25">
      <stop offset="0%25" stop-color="%23dc2626"/>
      <stop offset="100%25" stop-color="%23991b1b"/>
    </linearGradient>
  </defs>
  <rect width="800" height="600" fill="url(%23bg)"/>
  <rect x="0" y="560" width="800" height="4" fill="url(%23accent)" opacity="0.6"/>
  <g transform="translate(400,250)" fill="none" stroke="%23dc2626" stroke-width="3" opacity="0.5">
    <path d="M-120,40 L-100,0 L-40,-20 L40,-20 L100,0 L120,40 L120,60 L-120,60 Z" fill="%23dc2626" fill-opacity="0.08"/>
    <circle cx="-70" cy="60" r="22" fill="%23171820"/>
    <circle cx="-70" cy="60" r="12"/>
    <circle cx="70" cy="60" r="22" fill="%23171820"/>
    <circle cx="70" cy="60" r="12"/>
    <line x1="-40" y1="-20" x2="-30" y2="-45" stroke-width="2"/>
    <line x1="40" y1="-20" x2="30" y2="-45" stroke-width="2"/>
    <line x1="-30" y1="-45" x2="30" y2="-45" stroke-width="2"/>
  </g>
  <text x="400" y="370" text-anchor="middle" font-family="Arial,sans-serif" font-weight="900" font-size="28" fill="%23ffffff" opacity="0.9">${label.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</text>
  <text x="400" y="405" text-anchor="middle" font-family="Arial,sans-serif" font-weight="700" font-size="14" fill="%23dc2626" letter-spacing="4">CC MOTORS</text>
</svg>`;

  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

export function getGalleryPlaceholderImage(marca, modelo, index) {
  const hue = (index * 37) % 360;
  const label = `${marca} ${modelo}`.trim();
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
  <defs>
    <linearGradient id="bg" x1="0%25" y1="0%25" x2="100%25" y2="100%25">
      <stop offset="0%25" stop-color="%230f1015"/>
      <stop offset="100%25" stop-color="%231a1b25"/>
    </linearGradient>
    <radialGradient id="glow" cx="50%25" cy="40%25" r="50%25">
      <stop offset="0%25" stop-color="%23dc2626" stop-opacity="0.12"/>
      <stop offset="100%25" stop-color="transparent"/>
    </radialGradient>
  </defs>
  <rect width="800" height="600" fill="url(%23bg)"/>
  <rect width="800" height="600" fill="url(%23glow)"/>
  <rect x="0" y="580" width="800" height="3" fill="%23dc2626" opacity="0.4"/>
  <g transform="translate(400,240)" fill="none" stroke="%23dc2626" stroke-width="2.5" opacity="0.4">
    <path d="M-100,35 L-82,0 L-35,-18 L35,-18 L82,0 L100,35 L100,52 L-100,52 Z" fill="%23dc2626" fill-opacity="0.06"/>
    <circle cx="-58" cy="52" r="18" fill="%231a1b25"/>
    <circle cx="-58" cy="52" r="10"/>
    <circle cx="58" cy="52" r="18" fill="%231a1b25"/>
    <circle cx="58" cy="52" r="10"/>
  </g>
  <text x="400" y="350" text-anchor="middle" font-family="Arial,sans-serif" font-weight="900" font-size="26" fill="%23ffffff" opacity="0.85">${label.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</text>
  <text x="400" y="385" text-anchor="middle" font-family="Arial,sans-serif" font-weight="700" font-size="13" fill="%23dc2626" letter-spacing="4">CC MOTORS</text>
</svg>`;

  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

export function getDecorativePlaceholder(width = 2200, height = 1200) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="%23000000"/>
      <stop offset="50%" stop-color="%230a0a0f"/>
      <stop offset="100%" stop-color="%23111217"/>
    </linearGradient>
    <radialGradient id="glow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="%23dc2626" stop-opacity="0.08"/>
      <stop offset="100%" stop-color="transparent"/>
    </radialGradient>
  </defs>
  <rect width="${width}" height="${height}" fill="url(%23bg)"/>
  <rect width="${width}" height="${height}" fill="url(%23glow)"/>
  <g transform="translate(${width * 0.5},${height * 0.45})" fill="none" stroke="%23dc2626" stroke-width="2" opacity="0.12">
    <path d="M-180,60 L-150,0 L-60,-35 L60,-35 L150,0 L180,60 L180,100 L-180,100 Z"/>
    <circle cx="-105" cy="100" r="35"/>
    <circle cx="-105" cy="100" r="20"/>
    <circle cx="105" cy="100" r="35"/>
    <circle cx="105" cy="100" r="20"/>
  </g>
  <text x="${width * 0.5}" y="${height * 0.7}" text-anchor="middle" font-family="Arial,sans-serif" font-weight="900" font-size="32" fill="%23ffffff" opacity="0.06" letter-spacing="12">CC MOTORS</text>
</svg>`;

  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

export function getHeroPlaceholder() {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="2200" height="1200" viewBox="0 0 2200 1200">
  <defs>
    <linearGradient id="bg" x1="0%25" y1="0%25" x2="100%25" y2="100%25">
      <stop offset="0%25" stop-color="%23000000"/>
      <stop offset="50%25" stop-color="%230a0a0f"/>
      <stop offset="100%25" stop-color="%23111217"/>
    </linearGradient>
    <radialGradient id="glow" cx="30%25" cy="40%25" r="60%25">
      <stop offset="0%25" stop-color="%23dc2626" stop-opacity="0.15"/>
      <stop offset="100%25" stop-color="transparent"/>
    </radialGradient>
  </defs>
  <rect width="2200" height="1200" fill="url(%23bg)"/>
  <rect width="2200" height="1200" fill="url(%23glow)"/>
  <g transform="translate(1400,650)" fill="none" stroke="%23dc2626" stroke-width="2" opacity="0.15">
    <path d="M-250,80 L-200,0 L-80,-50 L80,-50 L200,0 L250,80 L250,130 L-250,130 Z"/>
    <circle cx="-145" cy="130" r="45"/>
    <circle cx="-145" cy="130" r="25"/>
    <circle cx="145" cy="130" r="45"/>
    <circle cx="145" cy="130" r="25"/>
  </g>
</svg>`;

  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

export { API_URL };