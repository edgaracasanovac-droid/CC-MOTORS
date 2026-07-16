# Informe general del sistema CC Motors

## 1. Introducción

CC Motors es un sistema integrado para la gestión de una concesionaria, compuesto por un panel administrativo, un sitio web público y una API backend. El objetivo del sistema es permitir la administración de vehículos, clientes, ventas, cotizaciones, pagos, cuotas, usuarios y otros procesos operativos.

## 2. Alcance del sistema

El sistema está dividido en tres capas principales:

- Frontend administrativo: panel para gestionar operaciones internas.
- Frontend público o website: interfaz para clientes, formularios y acceso básico.
- Backend API: conjunto de servicios y rutas que administran la lógica de negocio y la seguridad.

## 3. Estructura general del proyecto

### 3.1 Panel administrativo

El panel administrativo permite:
- administrar usuarios,
- gestionar clientes,
- controlar vehículos y modelos,
- registrar ventas y pagos,
- revisar cotizaciones,
- manejar test drives y planes de financiamiento.

### 3.2 Website público

El website está orientado a interacción externa, como:
- registro de clientes,
- formularios públicos,
- cotizaciones,
- navegación de vehículos,
- acceso a procesos de compra.

### 3.3 Backend API

La API expone los servicios principales del sistema y se encarga de:
- autenticación y autorización,
- validación de datos,
- conexión con base de datos,
- seguridad y control de accesos,
- documentación y monitoreo.

## 4. Módulos principales del sistema

### 4.1 Autenticación y usuarios

Permite:
- login de usuarios,
- registro de usuarios,
- recuperación y restablecimiento de contraseña,
- gestión de perfiles.

### 4.2 Gestión de vehículos

Incluye:
- marcas,
- modelos,
- proveedores,
- vehículos disponibles o en gestión.

### 4.3 Gestión comercial

Incluye:
- clientes,
- ventas,
- cotizaciones,
- planes de financiamiento,
- cuotas,
- pagos.

### 4.4 Test drive y procesos complementarios

Permite registrar y administrar:
- solicitudes de test drive,
- seguimiento de procesos,
- interacción con clientes.

## 5. Seguridad implementada en el sistema

El backend incorpora medidas de protección para reducir ataques de fuerza bruta, abuso de endpoints y solicitudes masivas desde una misma IP.

### 5.1 Rate limit con express-rate-limit

Se implementó el middleware express-rate-limit para limitar las peticiones al servidor en un tiempo específico.

#### Funcionalidad principal
- Se limita el número de solicitudes por IP en ventanas de tiempo.
- Se controla el tráfico excesivo contra rutas sensibles como login, registro y recuperación de contraseña.
- Si se supera el límite, la API responde con estado 429 Too Many Requests.

#### Comportamiento actual
- Rate limit global: se aplica a solicitudes generales del sistema.
- Rate limit para login: limita los intentos de acceso.
- Rate limit para recuperación de contraseña: limita solicitudes repetidas de recuperación.
- Rate limit para registro y formularios públicos: limita peticiones automáticas o de abuso.

### 5.2 Identificación de IP y origen

El sistema registra información relevante de cada solicitud, incluyendo:
- IP del cliente,
- origen (Origin header),
- User-Agent.

Esto permite identificar el origen de las peticiones y facilitar auditoría o análisis de seguridad.

### 5.3 Bloqueos de IP

El backend incorpora un control de bloqueos de IP para responder ante comportamiento sospechoso.

#### Tipos de bloqueo
- Bloqueo temporal automático: cuando una IP excede el límite de solicitudes, se aplica un bloqueo temporal por unos minutos.
- Baneo manual o de lista interna: se puede agregar IPs a una lista de acceso denegado.

#### Respuesta del sistema
- Cuando una IP está temporalmente bloqueada, la API responde con 429 y un mensaje de bloqueo por actividad sospechosa.
- Si una IP está baneada, la respuesta es 403 con mensaje de acceso denegado.

## 6. Integración del control de seguridad en el login

La protección se aplicó directamente al endpoint de login para evitar ataques de fuerza bruta.

### Regla aplicada
- Se permite un número limitado de intentos de inicio de sesión en un tiempo determinado.
- Si se excede el límite, la solicitud devuelve 429 Too Many Requests.
- La IP puede ser bloqueada temporalmente durante la ventana de bloqueo.

### Efecto esperado
- Reducir la cantidad de intentos de acceso incorrectos.
- Evitar abusos automatizados.
- Proteger la autenticación del sistema.

## 7. Resumen técnico de la implementación actual

La protección de seguridad se encuentra en el backend, específicamente en:
- [backend/src/middlewares/rateLimiters.js](backend/src/middlewares/rateLimiters.js)
- [backend/src/app.js](backend/src/app.js)
- [backend/src/routes/authRoutes.js](backend/src/routes/authRoutes.js)

### Implementación destacada
- Usa express-rate-limit para controlar el tráfico.
- Registra IP, Origin y User-Agent.
- Responde con 429 cuando se excede el límite.
- Aplica bloqueos temporales de IP.
- Integra la protección en rutas clave como login, registro y recuperación de contraseña.

## 8. Recomendaciones futuras

Para reforzar aún más la seguridad del sistema, se recomienda:
- almacenar los bloqueos en base de datos o caché persistente,
- permitir activar y desactivar baneos desde un administrador,
- integrar logs centralizados,
- agregar alertas automáticas para IPs sospechosas,
- combinar rate limiting con autenticación multifactor y monitoreo de accesos.

## 9. Conclusión

El sistema CC Motors ya cuenta con una base sólida de seguridad para controlar tráfico excesivo y proteger rutas sensibles. La implementación actual de rate limit, bloqueo de IP, registro de origen e integración al login cumple con los objetivos básicos de protección contra abuso y ataques automatizados.
