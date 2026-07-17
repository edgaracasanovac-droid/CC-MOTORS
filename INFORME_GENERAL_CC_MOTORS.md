# INFORME GENERAL DEL SISTEMA CC MOTORS
## Casanova Contreras Motors - Sistema Integral de Gestión de Concesionaria

---

## 1. Datos del Proyecto

| Campo               | Valor                                         |
| ------------------- | --------------------------------------------- |
| **Nombre del sistema** | CC Motors (Casanova Contreras Motors)      |
| **Autor**           | Edgar Alexander Casanova Contreras            |
| **Institución**     | UNEFA Núcleo Táchira                          |
| **Asignatura**      | Lenguaje de Programación III                  |
| **Año**             | 2026                                          |
| **Sector**          | Comercialización de vehículos / Concesionaria |
| **Ubicación**       | San Cristóbal, estado Táchira, Venezuela      |
| **Contacto**        | +58 414 3797087 / contacto@ccmotors.com       |

---

## 2. Arquitectura General

El sistema sigue una arquitectura de **tres capas (3-tier)**:

```
┌─────────────────────┐     ┌─────────────────────┐
│   WEBSITE PÚBLICO   │     │   PANEL ADMINIST.   │
│   (Astro + React)   │     │   (Astro + React)   │
│   netlify.app       │     │   netlify.app       │
└────────┬────────────┘     └────────┬────────────┘
         │                           │
         └──────────┬────────────────┘
                    │ API REST
                    ▼
         ┌─────────────────────┐
         │   BACKEND API       │
         │   (Node + Express)  │
         │   Render.com        │
         ├─────────────────────┤
         │   PostgreSQL        │
         │   (Neon)            │
         └─────────────────────┘
```

### Capas del sistema:

| Capa          | Tecnología                        | Función principal                          |
| ------------- | --------------------------------- | ------------------------------------------ |
| **Website público** | Astro 6 + React 19 + TailwindCSS 4 | Interfaz para clientes, catálogo, cotizaciones |
| **Panel administrativo** | Astro 6 + React 19 + TailwindCSS 4 + shadcn/ui | Gestión interna de operaciones |
| **Backend API** | Node.js (Express 5) + PostgreSQL | Lógica de negocio, seguridad, persistencia |

---

## 3. Componentes del Sistema

### 3.1 Website Público

**Stack:** Astro 6 + React 19 + TailwindCSS 4

**Páginas:**

| Ruta                  | Página              | Descripción                                                       |
| --------------------- | ------------------- | ----------------------------------------------------------------- |
| `/`                   | Inicio              | Landing page con Hero, vehículos destacados, estadísticas en vivo |
| `/catalogo`           | Catálogo            | Cuadrícula de vehículos con filtros y ordenamiento                |
| `/vehiculo/[id]`      | Detalle vehículo    | Página dinámica con imagen, precio y datos completos              |
| `/galeria`            | Galería             | Galería visual con categorías y lightbox modal                    |
| `/nosotros`           | Quiénes somos       | Historia, misión, visión y valores de la empresa                  |
| `/contacto`           | Contacto            | Formulario + datos de contacto (teléfono, email, ubicación)       |
| `/cotizacion`         | Cotizar             | Solicitud de cotización con selección de vehículo                 |
| `/login`              | Inicio sesión       | Login y registro de usuarios con validación                       |
| `/mi-cuenta`          | Mi cuenta           | Panel de cliente: perfil e historial de cotizaciones              |
| `/recuperar-contrasena` | Recuperar contraseña | Solicitud de restablecimiento vía email                         |
| `/restablecer-contrasena` | Restablecer      | Creación de nueva contraseña con token seguro                     |
| `404`                 | No encontrada       | Página personalizada de error                                     |

**Componentes principales:**
- **Comunes:** Navbar, Footer, Logo, WhatsappButton
- **Home:** Hero, FeaturedVehicles, Gallery, Stats, Benefits, Brands, Financing, FAQ, Testimonials, CTA
- **Servicios:** api.js (cliente HTTP con funciones para vehículos, marcas, modelos, auth)

### 3.2 Panel Administrativo

**Stack:** Astro 6 + React 19 + TailwindCSS 4 + shadcn/ui

**Páginas públicas:**

| Ruta                     | Página                     |
| ------------------------ | -------------------------- |
| `/`                      | Landing informativo        |
| `/login`                 | Inicio de sesión           |
| `/recuperar-contrasena`  | Recuperación de contraseña |
| `404`                    | Página no encontrada       |

**Páginas del dashboard (protegidas con autenticación JWT):**

| Ruta                                | Componente React              | Descripción                              |
| ----------------------------------- | ----------------------------- | ---------------------------------------- |
| `/dashboard`                        | DashboardStats                | Panel principal con estadísticas         |
| `/dashboard/vehiculos`              | VehiculosList                 | CRUD de vehículos del inventario         |
| `/dashboard/marcas`                 | MarcasList                    | CRUD de marcas                           |
| `/dashboard/modelos`                | ModelosList                   | CRUD de modelos                          |
| `/dashboard/proveedores`            | ProveedoresList               | CRUD de proveedores                      |
| `/dashboard/clientes`               | ClientesList                  | CRUD de clientes                         |
| `/dashboard/usuarios`               | UsuariosList                  | CRUD de usuarios del sistema             |
| `/dashboard/cotizaciones`           | CotizacionesList              | Gestión de cotizaciones recibidas        |
| `/dashboard/ventas`                 | VentasList                    | Registro de ventas realizadas            |
| `/dashboard/pagos`                  | PagosList                     | Registro de pagos                        |
| `/dashboard/planes-financiamiento`  | PlanesFinanciamientoList      | Planes de financiamiento                 |
| `/dashboard/cuotas`                 | CuotasList                    | Gestión de cuotas                        |
| `/dashboard/perfil`                 | PerfilUsuario                 | Perfil del usuario autenticado           |
| `/dashboard/acerca`                 | *(Astro estático)*            | Información del sistema                  |

**Bibliotecas del admin panel:**
- **shadcn/ui** + **Radix UI** — Componentes de interfaz accesibles
- **lucide-react** — Iconografía
- **recharts** — Gráficos y estadísticas
- **react-hot-toast** — Notificaciones toast
- **class-variance-authority** + **tailwind-merge** — Utilidades de estilos
- **axios** — Cliente HTTP con interceptores (JWT + manejo de errores 401/429/403)

### 3.3 Backend API

**Stack:** Node.js (Express 5) + PostgreSQL (Neon)

**Módulos del backend:**

| Módulo                | Endpoints principales                                      | Descripción                              |
| --------------------- | ---------------------------------------------------------- | ---------------------------------------- |
| **Auth**              | `POST /api/auth/login`, `/register`, `/recuperar-contrasena`, `/restablecer-contrasena`<br>`GET /api/auth/perfil`, `/profile`<br>`PUT /api/auth/profile_update`<br>`GET /api/auth/ips-bloqueadas`<br>`POST /api/auth/banear-ip`, `/desbanear-ip` | Autenticación JWT, registro, recuperación de contraseña, gestión de IPs |
| **Vehículos**         | CRUD `/api/vehiculos`                                      | Inventario de vehículos con imágenes     |
| **Marcas**            | CRUD `/api/marcas`                                         | Marcas de vehículos                      |
| **Modelos**           | CRUD `/api/modelos`                                        | Modelos por marca                        |
| **Proveedores**       | CRUD `/api/proveedores`                                    | Proveedores de vehículos                 |
| **Clientes**          | CRUD `/api/clientes`                                       | Clientes registrados                     |
| **Usuarios**          | CRUD `/api/usuarios`                                       | Usuarios del sistema con roles           |
| **Cotizaciones**      | CRUD `/api/cotizaciones` + ruta pública                    | Solicitudes de cotización                |
| **Ventas**            | CRUD `/api/ventas`                                         | Ventas realizadas                        |
| **Pagos**             | CRUD `/api/pagos`                                          | Pagos registrados                        |
| **Planes Financiamiento** | CRUD `/api/planes-financiamiento`                      | Planes de crédito                        |
| **Cuotas**            | CRUD `/api/cuotas`                                         | Cuotas generadas por ventas financiadas  |
| **Documentación**     | `GET /api-docs`                                            | Swagger UI interactiva                   |

**Arquitectura del backend:**

```
src/
├── app.js                  # Configuración Express (middlewares, rutas)
├── config/
│   ├── db.js               # Conexión PostgreSQL
│   ├── mailer.js            # Configuración SMTP/Nodemailer
│   └── swagger.js          # Configuración Swagger
├── middlewares/
│   ├── rateLimiters.js     # Rate limiting, bloqueo IP, logging
│   └── authMiddleware.js   # Verificación de token JWT
├── controllers/            # Controladores (12 módulos)
├── services/               # Lógica de negocio
├── models/                 # Consultas a base de datos
├── validations/            # Esquemas Zod de validación
├── routes/                 # Definición de rutas Express
└── tests/
    └── integration.test.js # Pruebas de integración
```

---

## 4. Seguridad Implementada

### 4.1 Rate Limiting (express-rate-limit)

| Limiter                    | Ventana | Máx. solicitudes | Bloqueo IP |
| -------------------------- | ------- | ---------------- | ---------- |
| **Global**                 | 15 min  | 100              | No         |
| **Login**                  | 30 seg  | 3                | 1 minuto   |
| **Registro**               | 30 seg  | 5                | No         |
| **Recuperación contraseña** | 15 min | 3                | 15 minutos |
| **Formularios públicos**   | 10 min  | 10               | No         |

### 4.2 Sistema de bloqueo de IP

El sistema cuenta con un mecanismo de bloqueo progresivo de IPs:

1. **Contador de intentos fallidos:** Por cada intento de login fallido se incrementa un contador por IP
2. **Ventana de 30 segundos:** Si el contador llega a 3 intentos fallidos dentro de la misma ventana de 30 segundos, se activa el bloqueo
3. **Bloqueo temporal de 1 minuto:** La IP queda bloqueada por 60 segundos, respondiendo con código `429 Too Many Requests`
4. **Baneo permanente manual:** El administrador puede banear o desbanear IPs manualmente mediante endpoints protegidos
5. **Limpieza automática:** Una vez pasado el tiempo de bloqueo, la IP queda liberada automáticamente sin acumulación de histórico

**Respuestas del sistema ante IPs bloqueadas:**
- IP bloqueada temporalmente → `429` con mensaje de bloqueo por actividad sospechosa
- IP baneada permanentemente → `403` con mensaje de acceso denegado
- Límite de login excedido → `429` con mensaje de demasiados intentos

### 4.3 Gestión de IPs desde el panel

Endpoints protegidos (requieren token JWT) para administrar IPs:

| Método | Ruta                              | Descripción                     |
| ------ | --------------------------------- | ------------------------------- |
| GET    | `/api/auth/ips-bloqueadas`        | Listar IPs baneadas/bloqueadas  |
| POST   | `/api/auth/banear-ip`             | Banear una IP manualmente       |
| POST   | `/api/auth/desbanear-ip`          | Desbanear una IP                |

### 4.4 Seguridad en el login

El endpoint `/api/auth/login` concentra las siguientes protecciones:

1. **Rate limit:** Máximo 3 intentos en 30 segundos por IP
2. **Registro de intentos fallidos:** Seguimiento progresivo con contador por IP
3. **Validación Zod:** Esquema de validación para correo y contraseña
4. **bcrypt:** Las contraseñas se verifican con comparación segura
5. **JWT:** Token de 2 horas de expiración
6. **Mensajes genéricos:** No se revela si el correo existe o no (seguridad por oscuridad)

### 4.5 Otras medidas de seguridad

| Medida            | Implementación                                            |
| ----------------- | --------------------------------------------------------- |
| **Helmet**        | Headers de seguridad HTTP (XSS, content-type, etc.)       |
| **CORS**          | Validación de orígenes permitidos (dominios específicos)  |
| **Trust proxy**   | Lectura correcta de IP detrás de proxies (Render/Netlify) |
| **JWT**           | Tokens con expiración de 2 horas                          |
| **bcrypt**        | Contraseñas hasheadas con 10 rondas de salt               |
| **Zod**           | Validación de datos en todos los endpoints                |
| **Request logging** | Cada solicitud registra IP, Origin y User-Agent         |

---

## 5. Tecnologías Utilizadas

### Backend

| Tecnología             | Versión  | Propósito                                  |
| ---------------------- | -------- | ------------------------------------------ |
| Node.js                | ≥22.12.0 | Entorno de ejecución                       |
| Express                | 5.2.1    | Framework web                              |
| PostgreSQL (pg)        | 8.20.0   | Base de datos relacional                   |
| bcrypt                 | 6.0.0    | Hash de contraseñas                        |
| jsonwebtoken           | 9.0.3    | Generación y verificación de tokens JWT    |
| zod                    | 4.4.3    | Validación de esquemas de datos            |
| helmet                 | 8.3.0    | Headers de seguridad HTTP                  |
| cors                   | 2.8.6    | Control de acceso CORS                     |
| express-rate-limit     | 8.5.2    | Limitación de solicitudes por IP           |
| resend                 | 6.12.4   | Envío de emails (restablecer contraseña)   |
| swagger-jsdoc          | 6.3.0    | Generación de documentación OpenAPI        |
| swagger-ui-express     | 5.0.1    | Interfaz visual de Swagger                 |
| nodemailer             | 8.0.10   | Cliente SMTP alternativo                   |
| dotenv                 | 17.4.2   | Variables de entorno                       |

### Website Público

| Tecnología       | Versión | Propósito                      |
| ---------------- | ------- | ------------------------------ |
| Astro            | 6.4.2   | Framework de construcción web  |
| React            | 19.2.6  | Componentes interactivos       |
| React DOM        | 19.2.3  | Renderizado de componentes     |
| TailwindCSS      | 4.3.0   | Framework de estilos CSS       |
| @astrojs/react   | 5.0.6   | Integración de React en Astro  |

### Panel Administrativo

| Tecnología               | Versión | Propósito                            |
| ------------------------ | ------- | ------------------------------------ |
| Astro                    | 6.3.8   | Framework de construcción web        |
| React                    | 19.2.6  | Componentes interactivos             |
| TailwindCSS              | 4.3.0   | Framework de estilos CSS             |
| shadcn/ui                | 4.8.2   | Componentes de interfaz              |
| Radix UI                 | 1.4.3   | Componentes accesibles primitivos    |
| lucide-react             | 1.16.0  | Iconos vectoriales                   |
| recharts                 | 3.9.2   | Gráficos y visualización de datos    |
| react-hot-toast          | 2.6.0   | Notificaciones toast                 |
| axios                    | 1.16.1  | Cliente HTTP con interceptores       |
| class-variance-authority | 0.7.1   | Utilidades de variantes CSS          |
| tailwind-merge           | 3.6.0   | Fusión inteligente de clases         |
| @fontsource-variable/geist | 5.2.9 | Tipografía Geist Variable          |

---

## 6. Funcionalidades Clave

### Para el cliente (Website)

- Navegar el catálogo completo de vehículos con filtros interactivos (búsqueda, marca, orden por precio/año)
- Ver detalle completo de cada vehículo (imagen, precio, año, color, kilometraje, estado)
- Solicitar cotización personalizada con selección de vehículo y tipo de compra (contado o financiamiento)
- Registrarse como usuario y crear una cuenta personal
- Iniciar sesión y acceder al panel de cliente
- Consultar el historial completo de cotizaciones realizadas
- Editar datos personales desde la sección "Mi cuenta"
- Recuperar contraseña mediante enlace enviado por correo electrónico
- Ver galería visual de vehículos con categorías y modal de visualización
- Contactar directamente a la concesionaria vía formulario o WhatsApp flotante
- Conocer la historia, misión, visión y valores de la empresa

### Para la administración (Panel)

- Dashboard principal con estadísticas generales y resúmenes operativos
- CRUD completo de vehículos (alta, baja, modificación, consulta)
- Gestión de marcas y modelos del catálogo
- Administración de proveedores que abastecen el inventario
- Registro y consulta de clientes
- Gestión de usuarios internos del sistema con roles
- Administración de cotizaciones recibidas desde el website
- Registro de ventas (tanto al contado como financiadas)
- Control de pagos asociados a ventas y cuotas
- Definición y gestión de planes de financiamiento
- Seguimiento de cuotas generadas por ventas financiadas
- Gestión de IPs bloqueadas (listar, banear, desbanear)
- Consulta y edición del perfil del usuario autenticado

---

## 7. Flujo de Autenticación

```
Usuario → Login → Rate Limit (3 intentos / 30s) → Controller → Zod Validation
                                                      │
                                                      ▼
                                              authService.login()
                                                      │
                                                      ▼
                                         bcrypt.compare(password)
                                                      │
                                          ┌───────────┴───────────┐
                                          ▼                       ▼
                                      Correcta                Incorrecta
                                          │                       │
                                          ▼                       ▼
                                  Generar JWT           registrarIntentoFallido()
                                  (2h expiración)               │
                                          │               ┌──────┴──────┐
                                          ▼               ▼             ▼
                                  Limpiar intentos    3 fallos?    < 3 fallos
                                  fallidos de la IP     │               │
                                          │          Bloqueo 1min   Devolver
                                          ▼               │          intentos
                                  Respuesta 200      Respuesta 429  restantes
                                  + token JWT                        │
                                                              Respuesta 401
```

---

## 8. Flujo de Cotización

```
Cliente (Website)                  Backend                    Admin (Panel)
       │                              │                           │
       ▼                              │                           │
  Completa formulario                  │                           │
  de cotización                        │                           │
       │                              │                           │
       └──────── POST /api/cotizaciones/publica ──►              │
                                          │                       │
                                     Validar datos                │
                                     (Zod)                        │
                                          │                       │
                                      Guardar en                  │
                                      base de datos               │
                                          │                       │
                                      Enviar notificación         │
                                      al correo del admin         │
                                          │                       │
                                          └──► Admin puede ──────►│
                                               ver cotización     │
                                               en el panel        │
```

---

## 9. Despliegue en Producción

| Capa              | Proveedor  | URL                                         |
| ----------------- | ---------- | ------------------------------------------- |
| **Backend API**   | Render.com | `https://cc-motors.onrender.com`            |
| **Website**       | Netlify    | `https://[proyecto].netlify.app`            |
| **Admin Panel**   | Netlify    | `https://[proyecto-admin].netlify.app`      |
| **Base de datos** | Neon       | PostgreSQL cloud con conexión SSL           |

### Variables de entorno requeridas:

**Backend (`.env`):**
```
DATABASE_URL=postgresql://...
JWT_SECRET=...
RESEND_API_KEY=...
FRONTEND_URL=https://...
WEBSITE_URL=https://...
ADMIN_PANEL_URL=https://...
```

**Website (`.env`):**
```
PUBLIC_API_URL=https://cc-motors.onrender.com/api
```

**Admin Panel (`.env`):**
```
PUBLIC_API_URL=https://cc-motors.onrender.com/api
```

---

## 10. Estructura Completa del Proyecto

```
CC MOTORS/
├── backend/                          # API REST (Express + PostgreSQL)
│   ├── .env                          # Variables de entorno
│   ├── index.js                      # Punto de entrada
│   ├── package.json
│   ├── API_DOCUMENTACION_ADMIN_PANEL.md
│   └── src/
│       ├── app.js                    # Configuración de Express
│       ├── config/
│       │   ├── db.js                 # Conexión a base de datos
│       │   ├── mailer.js             # Configuración SMTP
│       │   └── swagger.js            # Configuración Swagger
│       ├── controllers/              # Controladores (auth, cliente, cotizacion, cuota,
│       │                             #   marca, modelo, pago, planFinanciamiento,
│       │                             #   proveedor, usuario, vehiculo, venta)
│       ├── middlewares/
│       │   ├── rateLimiters.js       # Rate limiting, bloqueo IP, logging
│       │   └── authMiddleware.js     # Verificación JWT
│       ├── models/                   # Consultas a base de datos
│       ├── routes/                   # Rutas Express
│       ├── services/                 # Lógica de negocio
│       ├── validations/              # Esquemas Zod
│       └── tests/
│           └── integration.test.js
│
├── website/                          # Website público (Astro + React)
│   ├── .env
│   ├── package.json
│   ├── astro.config.mjs
│   ├── tsconfig.json
│   ├── public/
│   │   ├── favicon.svg
│   │   ├── favicon.ico
│   │   └── images/logo-cc-motors.png
│   └── src/
│       ├── layouts/
│       │   ├── Layout.astro
│       │   └── MainLayout.astro
│       ├── pages/
│       │   ├── index.astro           # Inicio
│       │   ├── catalogo.astro        # Catálogo
│       │   ├── contacto.astro        # Contacto
│       │   ├── cotizacion.astro      # Cotización
│       │   ├── galeria.astro         # Galería
│       │   ├── login.astro           # Login/Registro
│       │   ├── mi-cuenta.astro       # Panel de cliente
│       │   ├── nosotros.astro        # Quiénes somos
│       │   ├── recuperar-contrasena.astro
│       │   ├── restablecer-contrasena.astro
│       │   ├── vehiculo/[id].astro   # Detalle vehículo
│       │   └── 404.astro
│       ├── components/
│       │   ├── common/
│       │   │   ├── Navbar.astro
│       │   │   ├── Footer.astro
│       │   │   ├── Logo.astro
│       │   │   └── WhatsappButton.astro
│       │   └── home/
│       │       ├── Hero.astro
│       │       ├── FeaturedVehicles.astro
│       │       ├── Gallery.astro
│       │       ├── Stats.astro
│       │       ├── Benefits.astro
│       │       ├── Brands.astro
│       │       ├── Financing.astro
│       │       ├── FAQ.astro
│       │       ├── Testimonials.astro
│       │       └── CTA.astro
│       ├── services/
│       │   └── api.js
│       └── styles/
│           └── global.css
│
├── admin_panel/                      # Panel administrativo (Astro + React + shadcn)
│   ├── .env
│   ├── package.json
│   ├── astro.config.mjs
│   ├── tsconfig.json
│   ├── components.json
│   ├── public/
│   │   ├── favicon.svg
│   │   ├── favicon.ico
│   │   └── logo-cc-motors.png
│   └── src/
│       ├── layouts/
│       │   ├── PublicLayout.astro
│       │   └── DashboardLayout.astro
│       ├── pages/
│       │   ├── index.astro
│       │   ├── login.astro
│       │   ├── recuperar-contrasena.astro
│       │   ├── 404.astro
│       │   └── dashboard/
│       │       ├── index.astro       # Dashboard principal
│       │       ├── vehiculos.astro
│       │       ├── marcas.astro
│       │       ├── modelos.astro
│       │       ├── proveedores.astro
│       │       ├── clientes.astro
│       │       ├── usuarios.astro
│       │       ├── cotizaciones.astro
│       │       ├── ventas.astro
│       │       ├── pagos.astro
│       │       ├── planes-financiamiento.astro
│       │       ├── cuotas.astro
│       │       ├── perfil.astro
│       │       └── acerca.astro
│       ├── components/
│       │   ├── auth/                 # LoginForm, ProtectedRoute, RecuperarPasswordForm
│       │   ├── dashboard/            # DashboardStats, NotificationPanel, Sidebar
│       │   ├── ui/                   # Button, Card, Input, Label (shadcn)
│       │   ├── vehiculos/            # VehiculosList
│       │   ├── marcas/               # MarcasList
│       │   ├── modelos/              # ModelosList
│       │   ├── proveedores/          # ProveedoresList
│       │   ├── clientes/             # ClientesList
│       │   ├── usuarios/             # UsuariosList
│       │   ├── cotizaciones/         # CotizacionesList
│       │   ├── ventas/               # VentasList
│       │   ├── pagos/                # PagosList
│       │   ├── planes/               # PlanesFinanciamientoList
│       │   ├── cuotas/               # CuotasList
│       │   └── perfil/               # PerfilUsuario
│       ├── lib/
│       │   ├── api.js                # Cliente Axios con interceptores
│       │   ├── auth.js               # Gestión de sesión (localStorage)
│       │   └── validaciones.js       # Utilidades de validación
│       ├── middleware/
│       │   └── auth.js               # Middleware de autenticación Astro
│       └── styles/
│           └── global.css
│
├── INFORME_SISTEMA_CC_MOTORS.md      # Informe anterior del sistema
├── INFORME_GENERAL_CC_MOTORS.md      # Este informe
└── .gitignore
```

---

## 11. Conclusión

CC Motors es un sistema integral de gestión para concesionaria desarrollado con tecnologías web modernas. Su arquitectura de tres capas (website público, panel administrativo y backend API) separa claramente la lógica de negocio, la interfaz de cliente y la administración interna.

El sistema incorpora medidas de seguridad robustas como rate limiting progresivo (3 intentos en 30 segundos con bloqueo de 1 minuto), autenticación JWT, validación de datos con Zod, headers de seguridad HTTP con Helmet y control de acceso CORS. La funcionalidad de bloqueo de IP permite proteger el sistema contra ataques de fuerza bruta y abuso automatizado.

El backend expone 12 módulos funcionales completos con operaciones CRUD, documentados mediante Swagger UI. El website público ofrece una experiencia moderna con catálogo interactivo, galería visual y panel de cliente. El panel administrativo proporciona 14 secciones para la gestión completa de la concesionaria, desde vehículos y clientes hasta ventas, pagos y financiamiento.

El sistema se encuentra desplegado en producción utilizando Render para el backend y Netlify para los frontends, con base de datos PostgreSQL en Neon.

---

*Documento generado el 17 de julio de 2026*
*Autor: Edgar Alexander Casanova Contreras*
*UNEFA Núcleo Táchira - Lenguaje de Programación III*
