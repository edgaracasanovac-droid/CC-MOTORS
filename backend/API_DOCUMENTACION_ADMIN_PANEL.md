# Documentación de la API backend para el admin-panel

Documento generado a partir del código real existente en el backend de CC Motors.

> Alcance: solo se documentan los endpoints, cuerpos, respuestas y comportamientos que existen realmente en el backend. No se inventan rutas, estados ni respuestas.

---

## 1. URL base del backend

### Desarrollo local
- Base URL: http://localhost:3000/api

### Producción
- No existe una URL base fija definida en el backend.
- La API se expone en el host del despliegue con el prefijo /api.
- El código usa variables de entorno para configuración como:
  - PORT
  - DATABASE_URL
  - FRONTEND_URL

### Documentación Swagger
- Disponible en: http://localhost:3000/api-docs

---

## 2. Autenticación JWT

### Endpoint de login
- Método: POST
- Ruta: /api/auth/login
- Protegido con JWT: No
- Middleware usado: Ninguno
- Rol requerido: No
- Body esperado:
  ```json
  {
    "correo": "usuario@dominio.com",
    "contrasena": "123456"
  }
  ```
- Query params disponibles: Ninguno
- Respuesta exitosa:
  ```json
  {
    "mensaje": "Login exitoso",
    "token": "<jwt>",
    "usuario": {
      "id_usuario": 1,
      "nombre": "Juan",
      "apellido": "Pérez",
      "correo": "juan@dominio.com"
    }
  }
  ```
- Respuesta con error:
  ```json
  {
    "mensaje": "Usuario no encontrado"
  }
  ```
  o
  ```json
  {
    "mensaje": "Contraseña incorrecta"
  }
  ```
- Archivo route: backend/src/routes/authRoutes.js
- Archivo controller: backend/src/controllers/authController.js
- Archivo service: backend/src/services/authService.js
- Archivo model: backend/src/models/usuarioModel.js

### Detalles técnicos del JWT
- Nombre del token en la respuesta: token
- Formato del header esperado: Authorization: Bearer TOKEN
- Middleware usado: verificarToken (backend/src/middlewares/authMiddleware.js)
- Campo donde viene el id del usuario: req.usuario.id_usuario
- Campo donde viene el correo: req.usuario.correo
- Campo donde viene el rol: No se incluye en el JWT actual. El backend no firma el rol en el payload.
- Duración del token: 2 horas (expiresIn: '2h')
- Nota importante: el servicio firma con process.env.JWT_SECRET o 'secret_key', mientras que el middleware valida con 'secret_key' de forma fija en el código actual.

### Roles existentes
- Los roles no están definidos explícitamente en el backend.
- El backend consulta la tabla rol desde la base de datos.
- En el registro público se asigna id_rol = 2.

---

## 3. Perfil de usuario

### GET /api/auth/perfil
- Método: GET
- Ruta: /api/auth/perfil
- Protegido con JWT: Sí
- Middleware usado: verificarToken
- Rol requerido: No
- Body esperado: Ninguno
- Query params disponibles: Ninguno
- Respuesta exitosa:
  ```json
  {
    "mensaje": "Perfil del usuario",
    "usuario": {
      "id_usuario": 1,
      "correo": "usuario@dominio.com"
    }
  }
  ```
- Respuesta con error:
  ```json
  {
    "mensaje": "Token inválido"
  }
  ```
- Archivo route: backend/src/routes/authRoutes.js
- Archivo controller: backend/src/controllers/authController.js
- Archivo service: backend/src/services/authService.js
- Archivo model: backend/src/models/usuarioModel.js

### GET /api/auth/profile
- Método: GET
- Ruta: /api/auth/profile
- Protegido con JWT: Sí
- Middleware usado: verificarToken
- Rol requerido: No
- Body esperado: Ninguno
- Query params disponibles: Ninguno
- Respuesta exitosa:
  ```json
  {
    "mensaje": "Perfil obtenido correctamente",
    "perfil": {
      "id": 1,
      "email": "usuario@dominio.com",
      "nombre": "Juan",
      "apellido": "Pérez",
      "rol": "admin"
    }
  }
  ```
- Respuesta con error:
  ```json
  {
    "mensaje": "Error al obtener perfil",
    "error": "..."
  }
  ```
- Archivo route: backend/src/routes/authRoutes.js
- Archivo controller: backend/src/controllers/authController.js
- Archivo service: backend/src/services/authService.js
- Archivo model: backend/src/models/usuarioModel.js

### PUT /api/auth/profile_update
- Método: PUT
- Ruta: /api/auth/profile_update
- Protegido con JWT: Sí
- Middleware usado: verificarToken
- Rol requerido: No
- Body esperado:
  ```json
  {
    "nombre": "Juan",
    "apellido": "Pérez",
    "correo": "nuevo@dominio.com"
  }
  ```
- Query params disponibles: Ninguno
- Respuesta exitosa:
  ```json
  {
    "mensaje": "Perfil actualizado correctamente",
    "perfil": {
      "id": 1,
      "email": "nuevo@dominio.com",
      "nombre": "Juan",
      "apellido": "Pérez"
    }
  }
  ```
- Respuesta con error:
  ```json
  {
    "mensaje": "Error al actualizar perfil",
    "error": "..."
  }
  ```
- Archivo route: backend/src/routes/authRoutes.js
- Archivo controller: backend/src/controllers/authController.js
- Archivo service: backend/src/services/authService.js
- Archivo model: backend/src/models/usuarioModel.js

### Diferencia entre /profile y /perfil
- /api/auth/perfil devuelve el payload decodificado del JWT y no consulta la base de datos.
- /api/auth/profile consulta la base de datos mediante el id del usuario autenticado y devuelve el perfil completo con rol.
- Para el admin-panel, el endpoint recomendado para obtener el perfil del administrador es /api/auth/profile.

---

## 4. Endpoints disponibles por módulo

### MÓDULO: Auth

#### POST /api/auth/register
- Método: POST
- Ruta: /api/auth/register
- Protegido con JWT: No
- Middleware usado: Ninguno
- Rol requerido: No
- Body esperado:
  ```json
  {
    "nombre": "Juan",
    "apellido": "Pérez",
    "correo": "juan@dominio.com",
    "contrasena": "123456"
  }
  ```
- Query params disponibles: Ninguno
- Respuesta exitosa:
  ```json
  {
    "mensaje": "Usuario registrado correctamente",
    "usuario": {
      "id_usuario": 1,
      "nombre": "Juan",
      "apellido": "Pérez",
      "correo": "juan@dominio.com",
      "estado": "activo",
      "id_rol": 2
    }
  }
  ```
- Respuesta con error:
  ```json
  {
    "mensaje": "El correo ya está registrado"
  }
  ```
- Archivo route: backend/src/routes/authRoutes.js
- Archivo controller: backend/src/controllers/authController.js
- Archivo service: backend/src/services/authService.js
- Archivo model: backend/src/models/usuarioModel.js

#### POST /api/auth/recuperar-contrasena
- Método: POST
- Ruta: /api/auth/recuperar-contrasena
- Protegido con JWT: No
- Middleware usado: Ninguno
- Rol requerido: No
- Body esperado:
  ```json
  {
    "correo": "usuario@dominio.com"
  }
  ```
  o
  ```json
  {
    "email": "usuario@dominio.com"
  }
  ```
- Query params disponibles: Ninguno
- Respuesta exitosa:
  ```json
  {
    "mensaje": "Si el correo está registrado, recibirás un enlace para restablecer tu contraseña."
  }
  ```
- Respuesta con error:
  ```json
  {
    "mensaje": "Error al recuperar contraseña",
    "error": "..."
  }
  ```
- Archivo route: backend/src/routes/authRoutes.js
- Archivo controller: backend/src/controllers/authController.js
- Archivo service: backend/src/services/authService.js
- Archivo model: backend/src/models/usuarioModel.js

#### POST /api/auth/restablecer-contrasena
- Método: POST
- Ruta: /api/auth/restablecer-contrasena
- Protegido con JWT: No
- Middleware usado: Ninguno
- Rol requerido: No
- Body esperado:
  ```json
  {
    "token": "<token-hex>",
    "nueva_contrasena": "nueva123"
  }
  ```
- Query params disponibles: Ninguno
- Respuesta exitosa:
  ```json
  {
    "mensaje": "Contraseña restablecida correctamente"
  }
  ```
- Respuesta con error:
  ```json
  {
    "mensaje": "Token inválido o vencido"
  }
  ```
- Archivo route: backend/src/routes/authRoutes.js
- Archivo controller: backend/src/controllers/authController.js
- Archivo service: backend/src/services/authService.js
- Archivo model: backend/src/models/usuarioModel.js

### MÓDULO: Usuarios

#### GET /api/usuarios
- Método: GET
- Ruta: /api/usuarios
- Protegido con JWT: No
- Middleware usado: Ninguno
- Rol requerido: No
- Body esperado: Ninguno
- Query params disponibles: Ninguno
- Respuesta exitosa: array de usuarios con campos id_usuario, nombre, apellido, correo, estado, id_rol, rol
- Respuesta con error:
  ```json
  {
    "mensaje": "Error al obtener usuarios",
    "error": "..."
  }
  ```
- Archivo route: backend/src/routes/usuarioRoutes.js
- Archivo controller: backend/src/controllers/usuarioController.js
- Archivo service: backend/src/services/usuarioService.js
- Archivo model: backend/src/models/usuarioModel.js

#### GET /api/usuarios/:id
- Método: GET
- Ruta: /api/usuarios/:id
- Protegido con JWT: No
- Middleware usado: Ninguno
- Rol requerido: No
- Body esperado: Ninguno
- Query params disponibles: Ninguno
- Respuesta exitosa: objeto usuario
- Respuesta con error:
  ```json
  {
    "mensaje": "Usuario no encontrado"
  }
  ```
- Archivo route: backend/src/routes/usuarioRoutes.js
- Archivo controller: backend/src/controllers/usuarioController.js
- Archivo service: backend/src/services/usuarioService.js
- Archivo model: backend/src/models/usuarioModel.js

#### POST /api/usuarios
- Método: POST
- Ruta: /api/usuarios
- Protegido con JWT: No
- Middleware usado: Ninguno
- Rol requerido: No
- Body esperado:
  ```json
  {
    "nombre": "Juan",
    "apellido": "Pérez",
    "correo": "juan@dominio.com",
    "contrasena": "123456",
    "id_rol": 1
  }
  ```
- Query params disponibles: Ninguno
- Respuesta exitosa:
  ```json
  {
    "mensaje": "Usuario registrado correctamente",
    "usuario": {
      "id_usuario": 1,
      "nombre": "Juan",
      "apellido": "Pérez",
      "correo": "juan@dominio.com",
      "estado": "activo",
      "id_rol": 1
    }
  }
  ```
- Respuesta con error:
  ```json
  {
    "mensaje": "Error al registrar usuario",
    "error": "..."
  }
  ```
- Archivo route: backend/src/routes/usuarioRoutes.js
- Archivo controller: backend/src/controllers/usuarioController.js
- Archivo service: backend/src/services/usuarioService.js
- Archivo model: backend/src/models/usuarioModel.js

#### PUT /api/usuarios/:id
- Método: PUT
- Ruta: /api/usuarios/:id
- Protegido con JWT: No
- Middleware usado: Ninguno
- Rol requerido: No
- Body esperado:
  ```json
  {
    "nombre": "Juan",
    "apellido": "Pérez",
    "correo": "nuevo@dominio.com",
    "contrasena": "123456",
    "estado": "activo",
    "id_rol": 1
  }
  ```
- Query params disponibles: Ninguno
- Respuesta exitosa:
  ```json
  {
    "mensaje": "Usuario actualizado correctamente",
    "usuario": { }
  }
  ```
- Respuesta con error:
  ```json
  {
    "mensaje": "Usuario no encontrado"
  }
  ```
- Archivo route: backend/src/routes/usuarioRoutes.js
- Archivo controller: backend/src/controllers/usuarioController.js
- Archivo service: backend/src/services/usuarioService.js
- Archivo model: backend/src/models/usuarioModel.js

#### DELETE /api/usuarios/:id
- Método: DELETE
- Ruta: /api/usuarios/:id
- Protegido con JWT: No
- Middleware usado: Ninguno
- Rol requerido: No
- Body esperado: Ninguno
- Query params disponibles: Ninguno
- Respuesta exitosa:
  ```json
  {
    "mensaje": "Usuario eliminado correctamente",
    "usuario": { }
  }
  ```
- Respuesta con error:
  ```json
  {
    "mensaje": "Usuario no encontrado"
  }
  ```
- Archivo route: backend/src/routes/usuarioRoutes.js
- Archivo controller: backend/src/controllers/usuarioController.js
- Archivo service: backend/src/services/usuarioService.js
- Archivo model: backend/src/models/usuarioModel.js

### MÓDULO: Clientes

#### GET /api/clientes
- Método: GET
- Ruta: /api/clientes
- Protegido con JWT: No
- Middleware usado: Ninguno
- Rol requerido: No
- Body esperado: Ninguno
- Query params disponibles: Ninguno
- Respuesta exitosa: array de clientes con campos id_cliente, nombre, apellido, documento, telefono, correo, direccion
- Respuesta con error:
  ```json
  {
    "mensaje": "Error al obtener clientes",
    "error": "..."
  }
  ```
- Archivo route: backend/src/routes/clienteRoutes.js
- Archivo controller: backend/src/controllers/clienteController.js
- Archivo service: backend/src/services/clienteService.js
- Archivo model: backend/src/models/clienteModel.js

#### GET /api/clientes/:id
- Método: GET
- Ruta: /api/clientes/:id
- Protegido con JWT: No
- Middleware usado: Ninguno
- Rol requerido: No
- Body esperado: Ninguno
- Query params disponibles: Ninguno
- Respuesta exitosa: objeto cliente
- Respuesta con error:
  ```json
  {
    "mensaje": "Cliente no encontrado"
  }
  ```
- Archivo route: backend/src/routes/clienteRoutes.js
- Archivo controller: backend/src/controllers/clienteController.js
- Archivo service: backend/src/services/clienteService.js
- Archivo model: backend/src/models/clienteModel.js

#### POST /api/clientes
- Método: POST
- Ruta: /api/clientes
- Protegido con JWT: No
- Middleware usado: Ninguno
- Rol requerido: No
- Body esperado:
  ```json
  {
    "nombre": "Erick",
    "apellido": "Casanova",
    "documento": "V12345678",
    "telefono": "04141234567",
    "correo": "erick@gmail.com",
    "direccion": "San Cristobal"
  }
  ```
- Query params disponibles: Ninguno
- Respuesta exitosa: objeto cliente creado
- Respuesta con error:
  ```json
  {
    "mensaje": "Error al registrar cliente",
    "error": "..."
  }
  ```
- Archivo route: backend/src/routes/clienteRoutes.js
- Archivo controller: backend/src/controllers/clienteController.js
- Archivo service: backend/src/services/clienteService.js
- Archivo model: backend/src/models/clienteModel.js

#### PUT /api/clientes/:id
- Método: PUT
- Ruta: /api/clientes/:id
- Protegido con JWT: No
- Middleware usado: Ninguno
- Rol requerido: No
- Body esperado: mismo esquema de creación
- Query params disponibles: Ninguno
- Respuesta exitosa: objeto cliente actualizado
- Respuesta con error:
  ```json
  {
    "mensaje": "Cliente no encontrado"
  }
  ```
- Archivo route: backend/src/routes/clienteRoutes.js
- Archivo controller: backend/src/controllers/clienteController.js
- Archivo service: backend/src/services/clienteService.js
- Archivo model: backend/src/models/clienteModel.js

#### DELETE /api/clientes/:id
- Método: DELETE
- Ruta: /api/clientes/:id
- Protegido con JWT: No
- Middleware usado: Ninguno
- Rol requerido: No
- Body esperado: Ninguno
- Query params disponibles: Ninguno
- Respuesta exitosa:
  ```json
  {
    "mensaje": "Cliente eliminado correctamente",
    "cliente": { }
  }
  ```
- Respuesta con error:
  ```json
  {
    "mensaje": "Cliente no encontrado"
  }
  ```
- Archivo route: backend/src/routes/clienteRoutes.js
- Archivo controller: backend/src/controllers/clienteController.js
- Archivo service: backend/src/services/clienteService.js
- Archivo model: backend/src/models/clienteModel.js

### MÓDULO: Vehículos

#### GET /api/vehiculos
- Método: GET
- Ruta: /api/vehiculos
- Protegido con JWT: No
- Middleware usado: Ninguno
- Rol requerido: No
- Body esperado: Ninguno
- Query params disponibles: Ninguno
- Respuesta exitosa: array de vehículos con campos id_vehiculo, placa, color, ano, kilometraje, estado, precio_compra, precio_venta, id_marca, id_modelo, id_proveedor, nombre_marca, nombre_modelo, nombre_proveedor
- Respuesta con error:
  ```json
  {
    "mensaje": "Error al obtener vehículos",
    "error": "..."
  }
  ```
- Archivo route: backend/src/routes/vehiculoRoutes.js
- Archivo controller: backend/src/controllers/vehiculoController.js
- Archivo service: backend/src/services/vehiculoService.js
- Archivo model: backend/src/models/vehiculoModel.js

#### GET /api/vehiculos/:id
- Método: GET
- Ruta: /api/vehiculos/:id
- Protegido con JWT: No
- Middleware usado: Ninguno
- Rol requerido: No
- Body esperado: Ninguno
- Query params disponibles: Ninguno
- Respuesta exitosa: objeto vehículo
- Respuesta con error:
  ```json
  {
    "mensaje": "Vehículo no encontrado"
  }
  ```
- Archivo route: backend/src/routes/vehiculoRoutes.js
- Archivo controller: backend/src/controllers/vehiculoController.js
- Archivo service: backend/src/services/vehiculoService.js
- Archivo model: backend/src/models/vehiculoModel.js

#### POST /api/vehiculos
- Método: POST
- Ruta: /api/vehiculos
- Protegido con JWT: No
- Middleware usado: Ninguno
- Rol requerido: No
- Body esperado:
  ```json
  {
    "placa": "ABC123",
    "color": "Negro",
    "ano": 2024,
    "kilometraje": 1000,
    "estado": "disponible",
    "precio_compra": 10000,
    "precio_venta": 15000,
    "id_marca": 1,
    "id_modelo": 1,
    "id_proveedor": 1
  }
  ```
- Query params disponibles: Ninguno
- Respuesta exitosa:
  ```json
  {
    "mensaje": "Vehículo registrado correctamente",
    "vehiculo": { }
  }
  ```
- Respuesta con error:
  ```json
  {
    "mensaje": "Error al registrar vehículo",
    "error": "..."
  }
  ```
- Archivo route: backend/src/routes/vehiculoRoutes.js
- Archivo controller: backend/src/controllers/vehiculoController.js
- Archivo service: backend/src/services/vehiculoService.js
- Archivo model: backend/src/models/vehiculoModel.js

#### PUT /api/vehiculos/:id
- Método: PUT
- Ruta: /api/vehiculos/:id
- Protegido con JWT: No
- Middleware usado: Ninguno
- Rol requerido: No
- Body esperado: mismo esquema de creación
- Query params disponibles: Ninguno
- Respuesta exitosa:
  ```json
  {
    "mensaje": "Vehículo actualizado correctamente",
    "vehiculo": { }
  }
  ```
- Respuesta con error:
  ```json
  {
    "mensaje": "Vehículo no encontrado"
  }
  ```
- Archivo route: backend/src/routes/vehiculoRoutes.js
- Archivo controller: backend/src/controllers/vehiculoController.js
- Archivo service: backend/src/services/vehiculoService.js
- Archivo model: backend/src/models/vehiculoModel.js

#### DELETE /api/vehiculos/:id
- Método: DELETE
- Ruta: /api/vehiculos/:id
- Protegido con JWT: No
- Middleware usado: Ninguno
- Rol requerido: No
- Body esperado: Ninguno
- Query params disponibles: Ninguno
- Respuesta exitosa:
  ```json
  {
    "mensaje": "Vehículo eliminado correctamente",
    "vehiculo": { }
  }
  ```
- Respuesta con error:
  ```json
  {
    "mensaje": "Vehículo no encontrado"
  }
  ```
- Archivo route: backend/src/routes/vehiculoRoutes.js
- Archivo controller: backend/src/controllers/vehiculoController.js
- Archivo service: backend/src/services/vehiculoService.js
- Archivo model: backend/src/models/vehiculoModel.js

### MÓDULO: Marcas

#### GET /api/marcas
- Método: GET
- Ruta: /api/marcas
- Protegido con JWT: No
- Middleware usado: Ninguno
- Rol requerido: No
- Body esperado: Ninguno
- Query params disponibles: Ninguno
- Respuesta exitosa: array de marcas con campos id_marca, nombre, descripcion, pais_origen, sitio_web, estado
- Respuesta con error:
  ```json
  {
    "mensaje": "Error al obtener marcas",
    "error": "..."
  }
  ```
- Archivo route: backend/src/routes/marcaRoutes.js
- Archivo controller: backend/src/controllers/marcaController.js
- Archivo service: backend/src/services/marcaService.js
- Archivo model: backend/src/models/marcaModel.js

#### GET /api/marcas/:id
- Método: GET
- Ruta: /api/marcas/:id
- Protegido con JWT: No
- Middleware usado: Ninguno
- Rol requerido: No
- Body esperado: Ninguno
- Query params disponibles: Ninguno
- Respuesta exitosa: objeto marca
- Respuesta con error:
  ```json
  {
    "mensaje": "Marca no encontrada"
  }
  ```
- Archivo route: backend/src/routes/marcaRoutes.js
- Archivo controller: backend/src/controllers/marcaController.js
- Archivo service: backend/src/services/marcaService.js
- Archivo model: backend/src/models/marcaModel.js

#### POST /api/marcas
- Método: POST
- Ruta: /api/marcas
- Protegido con JWT: No
- Middleware usado: Ninguno
- Rol requerido: No
- Body esperado:
  ```json
  {
    "nombre": "Toyota",
    "descripcion": "Marca japonesa",
    "pais_origen": "Japón",
    "sitio_web": "https://toyota.com",
    "estado": "activo"
  }
  ```
- Query params disponibles: Ninguno
- Respuesta exitosa: objeto marca creado
- Respuesta con error:
  ```json
  {
    "mensaje": "Error al registrar marca",
    "error": "..."
  }
  ```
- Archivo route: backend/src/routes/marcaRoutes.js
- Archivo controller: backend/src/controllers/marcaController.js
- Archivo service: backend/src/services/marcaService.js
- Archivo model: backend/src/models/marcaModel.js

#### PUT /api/marcas/:id
- Método: PUT
- Ruta: /api/marcas/:id
- Protegido con JWT: No
- Middleware usado: Ninguno
- Rol requerido: No
- Body esperado: mismo esquema de creación
- Query params disponibles: Ninguno
- Respuesta exitosa: objeto marca actualizado
- Respuesta con error:
  ```json
  {
    "mensaje": "Marca no encontrada"
  }
  ```
- Archivo route: backend/src/routes/marcaRoutes.js
- Archivo controller: backend/src/controllers/marcaController.js
- Archivo service: backend/src/services/marcaService.js
- Archivo model: backend/src/models/marcaModel.js

#### DELETE /api/marcas/:id
- Método: DELETE
- Ruta: /api/marcas/:id
- Protegido con JWT: No
- Middleware usado: Ninguno
- Rol requerido: No
- Body esperado: Ninguno
- Query params disponibles: Ninguno
- Respuesta exitosa:
  ```json
  {
    "mensaje": "Marca eliminada correctamente",
    "marca": { }
  }
  ```
- Respuesta con error:
  ```json
  {
    "mensaje": "Marca no encontrada"
  }
  ```
- Archivo route: backend/src/routes/marcaRoutes.js
- Archivo controller: backend/src/controllers/marcaController.js
- Archivo service: backend/src/services/marcaService.js
- Archivo model: backend/src/models/marcaModel.js

### MÓDULO: Modelos

#### GET /api/modelos
- Método: GET
- Ruta: /api/modelos
- Protegido con JWT: No
- Middleware usado: Ninguno
- Rol requerido: No
- Body esperado: Ninguno
- Query params disponibles: Ninguno
- Respuesta exitosa: array de modelos con campos id_modelo, nombre, id_marca, marca, descripción y estado
- Respuesta con error:
  ```json
  {
    "mensaje": "Error al obtener modelos",
    "error": "..."
  }
  ```
- Archivo route: backend/src/routes/modeloRoutes.js
- Archivo controller: backend/src/controllers/modeloController.js
- Archivo service: backend/src/services/modeloService.js
- Archivo model: backend/src/models/modeloModel.js

#### GET /api/modelos/:id
- Método: GET
- Ruta: /api/modelos/:id
- Protegido con JWT: No
- Middleware usado: Ninguno
- Rol requerido: No
- Body esperado: Ninguno
- Query params disponibles: Ninguno
- Respuesta exitosa: objeto modelo
- Respuesta con error:
  ```json
  {
    "mensaje": "Modelo no encontrado"
  }
  ```
- Archivo route: backend/src/routes/modeloRoutes.js
- Archivo controller: backend/src/controllers/modeloController.js
- Archivo service: backend/src/services/modeloService.js
- Archivo model: backend/src/models/modeloModel.js

#### POST /api/modelos
- Método: POST
- Ruta: /api/modelos
- Protegido con JWT: No
- Middleware usado: Ninguno
- Rol requerido: No
- Body esperado:
  ```json
  {
    "nombre": "Corolla",
    "id_marca": 1,
    "descripcion": "Sedán",
    "ano_lanzamiento": 2024,
    "tipo_combustible": "gasolina",
    "transmision": "automatico",
    "estado": "activo"
  }
  ```
- Query params disponibles: Ninguno
- Respuesta exitosa: objeto modelo creado
- Respuesta con error:
  ```json
  {
    "mensaje": "Error al registrar modelo",
    "error": "..."
  }
  ```
- Archivo route: backend/src/routes/modeloRoutes.js
- Archivo controller: backend/src/controllers/modeloController.js
- Archivo service: backend/src/services/modeloService.js
- Archivo model: backend/src/models/modeloModel.js

#### PUT /api/modelos/:id
- Método: PUT
- Ruta: /api/modelos/:id
- Protegido con JWT: No
- Middleware usado: Ninguno
- Rol requerido: No
- Body esperado: mismo esquema de creación
- Query params disponibles: Ninguno
- Respuesta exitosa: objeto modelo actualizado
- Respuesta con error:
  ```json
  {
    "mensaje": "Modelo no encontrado"
  }
  ```
- Archivo route: backend/src/routes/modeloRoutes.js
- Archivo controller: backend/src/controllers/modeloController.js
- Archivo service: backend/src/services/modeloService.js
- Archivo model: backend/src/models/modeloModel.js

#### DELETE /api/modelos/:id
- Método: DELETE
- Ruta: /api/modelos/:id
- Protegido con JWT: No
- Middleware usado: Ninguno
- Rol requerido: No
- Body esperado: Ninguno
- Query params disponibles: Ninguno
- Respuesta exitosa:
  ```json
  {
    "mensaje": "Modelo eliminado correctamente",
    "modelo": { }
  }
  ```
- Respuesta con error:
  ```json
  {
    "mensaje": "Modelo no encontrado"
  }
  ```
- Archivo route: backend/src/routes/modeloRoutes.js
- Archivo controller: backend/src/controllers/modeloController.js
- Archivo service: backend/src/services/modeloService.js
- Archivo model: backend/src/models/modeloModel.js

### MÓDULO: Proveedores

#### GET /api/proveedores
- Método: GET
- Ruta: /api/proveedores
- Protegido con JWT: No
- Middleware usado: Ninguno
- Rol requerido: No
- Body esperado: Ninguno
- Query params disponibles: Ninguno
- Respuesta exitosa: array de proveedores con campos id_proveedor, nombre, identificacion_fiscal, telefono, correo, direccion, estado
- Respuesta con error:
  ```json
  {
    "mensaje": "Error al obtener proveedores",
    "error": "..."
  }
  ```
- Archivo route: backend/src/routes/proveedorRoutes.js
- Archivo controller: backend/src/controllers/proveedorController.js
- Archivo service: backend/src/services/proveedorService.js
- Archivo model: backend/src/models/proveedorModel.js

#### GET /api/proveedores/:id
- Método: GET
- Ruta: /api/proveedores/:id
- Protegido con JWT: No
- Middleware usado: Ninguno
- Rol requerido: No
- Body esperado: Ninguno
- Query params disponibles: Ninguno
- Respuesta exitosa: objeto proveedor
- Respuesta con error:
  ```json
  {
    "mensaje": "Proveedor no encontrado"
  }
  ```
- Archivo route: backend/src/routes/proveedorRoutes.js
- Archivo controller: backend/src/controllers/proveedorController.js
- Archivo service: backend/src/services/proveedorService.js
- Archivo model: backend/src/models/proveedorModel.js

#### POST /api/proveedores
- Método: POST
- Ruta: /api/proveedores
- Protegido con JWT: No
- Middleware usado: Ninguno
- Rol requerido: No
- Body esperado:
  ```json
  {
    "nombre": "Auto Import",
    "identificacion_fiscal": "J12345678",
    "telefono": "04141234567",
    "correo": "proveedor@dominio.com",
    "direccion": "Caracas",
    "estado": "activo"
  }
  ```
- Query params disponibles: Ninguno
- Respuesta exitosa: objeto proveedor creado
- Respuesta con error:
  ```json
  {
    "mensaje": "Error al registrar proveedor",
    "error": "..."
  }
  ```
- Archivo route: backend/src/routes/proveedorRoutes.js
- Archivo controller: backend/src/controllers/proveedorController.js
- Archivo service: backend/src/services/proveedorService.js
- Archivo model: backend/src/models/proveedorModel.js

#### PUT /api/proveedores/:id
- Método: PUT
- Ruta: /api/proveedores/:id
- Protegido con JWT: No
- Middleware usado: Ninguno
- Rol requerido: No
- Body esperado: mismo esquema de creación
- Query params disponibles: Ninguno
- Respuesta exitosa: objeto proveedor actualizado
- Respuesta con error:
  ```json
  {
    "mensaje": "Proveedor no encontrado"
  }
  ```
- Archivo route: backend/src/routes/proveedorRoutes.js
- Archivo controller: backend/src/controllers/proveedorController.js
- Archivo service: backend/src/services/proveedorService.js
- Archivo model: backend/src/models/proveedorModel.js

#### DELETE /api/proveedores/:id
- Método: DELETE
- Ruta: /api/proveedores/:id
- Protegido con JWT: No
- Middleware usado: Ninguno
- Rol requerido: No
- Body esperado: Ninguno
- Query params disponibles: Ninguno
- Respuesta exitosa:
  ```json
  {
    "mensaje": "Proveedor eliminado correctamente",
    "proveedor": { }
  }
  ```
- Respuesta con error:
  ```json
  {
    "mensaje": "Proveedor no encontrado"
  }
  ```
- Archivo route: backend/src/routes/proveedorRoutes.js
- Archivo controller: backend/src/controllers/proveedorController.js
- Archivo service: backend/src/services/proveedorService.js
- Archivo model: backend/src/models/proveedorModel.js

### MÓDULO: Cotizaciones

#### POST /api/cotizaciones/publica
- Método: POST
- Ruta: /api/cotizaciones/publica
- Protegido con JWT: No
- Middleware usado: Ninguno
- Rol requerido: No
- Body esperado:
  ```json
  {
    "nombre": "Juan",
    "apellido": "Pérez",
    "documento": "V12345678",
    "telefono": "04141234567",
    "correo": "juan@dominio.com",
    "direccion": "Caracas",
    "id_vehiculo": 1,
    "mensaje": "Quiero esta unidad"
  }
  ```
- Query params disponibles: Ninguno
- Respuesta exitosa:
  ```json
  {
    "mensaje": "Cotización pública registrada correctamente",
    "cliente": { },
    "cotizacion": { }
  }
  ```
- Respuesta con error:
  ```json
  {
    "mensaje": "Vehículo no encontrado"
  }
  ```
- Archivo route: backend/src/routes/cotizacionRoutes.js
- Archivo controller: backend/src/controllers/cotizacionController.js
- Archivo service: backend/src/services/cotizacionService.js
- Archivo model: backend/src/models/cotizacionModel.js

#### GET /api/cotizaciones/mis-cotizaciones
- Método: GET
- Ruta: /api/cotizaciones/mis-cotizaciones
- Protegido con JWT: Sí
- Middleware usado: verificarToken
- Rol requerido: No
- Body esperado: Ninguno
- Query params disponibles: Ninguno
- Respuesta exitosa:
  ```json
  {
    "mensaje": "Cotizaciones del cliente obtenidas correctamente",
    "cotizaciones": [
      {
        "id_cotizacion": 1,
        "fecha": "2026-01-01",
        "estado": "pendiente",
        "precio_estimado": 15000,
        "vigencia": "2026-01-08",
        "mensaje": "Mi Compra",
        "tipo_historial": "configuracion_compra",
        "vehiculo": { }
      }
    ]
  }
  ```
- Respuesta con error:
  ```json
  {
    "mensaje": "Error al obtener cotizaciones del cliente",
    "error": "..."
  }
  ```
- Archivo route: backend/src/routes/cotizacionRoutes.js
- Archivo controller: backend/src/controllers/cotizacionController.js
- Archivo service: backend/src/services/cotizacionService.js
- Archivo model: backend/src/models/cotizacionModel.js

#### GET /api/cotizaciones
- Método: GET
- Ruta: /api/cotizaciones
- Protegido con JWT: No
- Middleware usado: Ninguno
- Rol requerido: No
- Body esperado: Ninguno
- Query params disponibles: Ninguno
- Respuesta exitosa: array de cotizaciones con campos id_cotizacion, fecha, precio_estimado, vigencia, estado, cliente_nombre, cliente_apellido, placa, marca, modelo
- Respuesta con error:
  ```json
  {
    "mensaje": "Error al obtener cotizaciones",
    "error": "..."
  }
  ```
- Archivo route: backend/src/routes/cotizacionRoutes.js
- Archivo controller: backend/src/controllers/cotizacionController.js
- Archivo service: backend/src/services/cotizacionService.js
- Archivo model: backend/src/models/cotizacionModel.js

#### GET /api/cotizaciones/:id
- Método: GET
- Ruta: /api/cotizaciones/:id
- Protegido con JWT: No
- Middleware usado: Ninguno
- Rol requerido: No
- Body esperado: Ninguno
- Query params disponibles: Ninguno
- Respuesta exitosa: objeto cotización con datos del cliente y vehículo
- Respuesta con error:
  ```json
  {
    "mensaje": "Cotización no encontrada"
  }
  ```
- Archivo route: backend/src/routes/cotizacionRoutes.js
- Archivo controller: backend/src/controllers/cotizacionController.js
- Archivo service: backend/src/services/cotizacionService.js
- Archivo model: backend/src/models/cotizacionModel.js

#### POST /api/cotizaciones
- Método: POST
- Ruta: /api/cotizaciones
- Protegido con JWT: No
- Middleware usado: Ninguno
- Rol requerido: No
- Body esperado:
  ```json
  {
    "fecha": "2026-01-01",
    "precio_estimado": 15000,
    "vigencia": "2026-01-08",
    "id_vehiculo": 1,
    "id_cliente": 1
  }
  ```
- Query params disponibles: Ninguno
- Respuesta exitosa:
  ```json
  {
    "mensaje": "Cotización registrada correctamente",
    "cotizacion": { }
  }
  ```
- Respuesta con error:
  ```json
  {
    "mensaje": "Error al registrar cotización",
    "error": "..."
  }
  ```
- Archivo route: backend/src/routes/cotizacionRoutes.js
- Archivo controller: backend/src/controllers/cotizacionController.js
- Archivo service: backend/src/services/cotizacionService.js
- Archivo model: backend/src/models/cotizacionModel.js

#### PUT /api/cotizaciones/:id
- Método: PUT
- Ruta: /api/cotizaciones/:id
- Protegido con JWT: No
- Middleware usado: Ninguno
- Rol requerido: No
- Body esperado: mismo esquema de creación, más campo estado opcional
- Query params disponibles: Ninguno
- Respuesta exitosa: objeto cotización actualizada
- Respuesta con error:
  ```json
  {
    "mensaje": "Cotización no encontrada"
  }
  ```
- Archivo route: backend/src/routes/cotizacionRoutes.js
- Archivo controller: backend/src/controllers/cotizacionController.js
- Archivo service: backend/src/services/cotizacionService.js
- Archivo model: backend/src/models/cotizacionModel.js

#### DELETE /api/cotizaciones/:id
- Método: DELETE
- Ruta: /api/cotizaciones/:id
- Protegido con JWT: No
- Middleware usado: Ninguno
- Rol requerido: No
- Body esperado: Ninguno
- Query params disponibles: Ninguno
- Respuesta exitosa:
  ```json
  {
    "mensaje": "Cotización eliminada correctamente",
    "cotizacion": { }
  }
  ```
- Respuesta con error:
  ```json
  {
    "mensaje": "Cotización no encontrada"
  }
  ```
- Archivo route: backend/src/routes/cotizacionRoutes.js
- Archivo controller: backend/src/controllers/cotizacionController.js
- Archivo service: backend/src/services/cotizacionService.js
- Archivo model: backend/src/models/cotizacionModel.js

#### Confirmación de operaciones especiales para cotizaciones
- GET /api/cotizaciones: Sí existe
- GET /api/cotizaciones/:id: Sí existe
- POST /api/cotizaciones: Sí existe
- PUT /api/cotizaciones/:id: Sí existe
- DELETE /api/cotizaciones/:id: Sí existe
- POST /api/cotizaciones/publica: Sí existe
- GET /api/cotizaciones/mis-cotizaciones: Sí existe
- Aprobar cotización: No existe endpoint para esta acción actualmente.
- Rechazar cotización: No existe endpoint para esta acción actualmente.
- Cambiar estado: No existe endpoint para esta acción actualmente.
- Agregar observación: No existe endpoint para esta acción actualmente.
- Convertir cotización en venta: No existe endpoint para esta acción actualmente.
- Exportar cotización: No existe endpoint para esta acción actualmente.

#### Detalles especiales de cotizaciones
- Body esperado para crear cotización: fecha, precio_estimado, vigencia, id_vehiculo, id_cliente
- Body esperado para cotización pública: nombre, apellido, documento, telefono, correo, direccion, id_vehiculo, mensaje (opcional)
- Respuesta real de cotización pública: mensaje + cliente + cotizacion
- Respuesta real del historial del cliente: mensaje + cotizaciones (array)
- Campos disponibles en el historial del cliente: id_cotizacion, fecha, estado, precio_estimado, vigencia, mensaje, tipo_historial, vehiculo
- Campo mensaje: Sí existe, tanto en la creación pública como en el historial del cliente
- Campo tipo_historial: Sí existe en la respuesta de /api/cotizaciones/mis-cotizaciones
- Cómo diferencia el backend una cotización normal de una configuración de compra: en la consulta de historial, si el campo mensaje contiene la cadena "Mi Compra", se marca tipo_historial = "configuracion_compra"; de lo contrario, se marca como "cotizacion"
- Estados reales usados por el backend para cotizaciones:
  - En la ruta pública se inserta con estado 'pendiente'
  - En la ruta de creación normal no se asigna estado explícitamente en el código; el estado depende del valor que mande el cliente o del valor por defecto de la tabla
  - No existe validación explícita de enum para estado en la validación de cotizaciones

### MÓDULO: Ventas

#### GET /api/ventas
- Método: GET
- Ruta: /api/ventas
- Protegido con JWT: No
- Middleware usado: Ninguno
- Rol requerido: No
- Body esperado: Ninguno
- Query params disponibles: Ninguno
- Respuesta exitosa: array de ventas con campos id_venta, fecha, cliente, usuario, vehiculo, precio_final, tipo_venta, estado, id_cliente, id_usuario, id_vehiculo, nombre_marca, nombre_modelo
- Respuesta con error:
  ```json
  {
    "mensaje": "Error al obtener ventas",
    "error": "..."
  }
  ```
- Archivo route: backend/src/routes/ventaRoutes.js
- Archivo controller: backend/src/controllers/ventaController.js
- Archivo service: backend/src/services/ventaService.js
- Archivo model: backend/src/models/ventaModel.js

#### GET /api/ventas/:id
- Método: GET
- Ruta: /api/ventas/:id
- Protegido con JWT: No
- Middleware usado: Ninguno
- Rol requerido: No
- Body esperado: Ninguno
- Query params disponibles: Ninguno
- Respuesta exitosa: objeto venta
- Respuesta con error:
  ```json
  {
    "mensaje": "Venta no encontrada"
  }
  ```
- Archivo route: backend/src/routes/ventaRoutes.js
- Archivo controller: backend/src/controllers/ventaController.js
- Archivo service: backend/src/services/ventaService.js
- Archivo model: backend/src/models/ventaModel.js

#### POST /api/ventas
- Método: POST
- Ruta: /api/ventas
- Protegido con JWT: No
- Middleware usado: Ninguno
- Rol requerido: No
- Body esperado:
  ```json
  {
    "fecha": "2026-05-28",
    "precio_final": 15000,
    "tipo_venta": "contado",
    "id_usuario": 1,
    "id_cliente": 1,
    "id_vehiculo": 1,
    "id_plan_financiamiento": null
  }
  ```
- Query params disponibles: Ninguno
- Respuesta exitosa:
  ```json
  {
    "mensaje": "Venta registrada correctamente",
    "venta": { }
  }
  ```
- Respuesta con error:
  ```json
  {
    "mensaje": "Error al registrar venta",
    "error": "..."
  }
  ```
- Archivo route: backend/src/routes/ventaRoutes.js
- Archivo controller: backend/src/controllers/ventaController.js
- Archivo service: backend/src/services/ventaService.js
- Archivo model: backend/src/models/ventaModel.js

#### PUT /api/ventas/:id
- Método: PUT
- Ruta: /api/ventas/:id
- Protegido con JWT: No
- Middleware usado: Ninguno
- Rol requerido: No
- Body esperado: mismo esquema de creación, más estado opcional
- Query params disponibles: Ninguno
- Respuesta exitosa:
  ```json
  {
    "mensaje": "Venta actualizada correctamente",
    "venta": { }
  }
  ```
- Respuesta con error:
  ```json
  {
    "mensaje": "Venta no encontrada"
  }
  ```
- Archivo route: backend/src/routes/ventaRoutes.js
- Archivo controller: backend/src/controllers/ventaController.js
- Archivo service: backend/src/services/ventaService.js
- Archivo model: backend/src/models/ventaModel.js

#### DELETE /api/ventas/:id
- Método: DELETE
- Ruta: /api/ventas/:id
- Protegido con JWT: No
- Middleware usado: Ninguno
- Rol requerido: No
- Body esperado: Ninguno
- Query params disponibles: Ninguno
- Respuesta exitosa:
  ```json
  {
    "mensaje": "Venta eliminada correctamente",
    "venta": { }
  }
  ```
- Respuesta con error:
  ```json
  {
    "mensaje": "Venta no encontrada"
  }
  ```
- Archivo route: backend/src/routes/ventaRoutes.js
- Archivo controller: backend/src/controllers/ventaController.js
- Archivo service: backend/src/services/ventaService.js
- Archivo model: backend/src/models/ventaModel.js

### MÓDULO: Pagos

#### GET /api/pagos
- Método: GET
- Ruta: /api/pagos
- Protegido con JWT: No
- Middleware usado: Ninguno
- Rol requerido: No
- Body esperado: Ninguno
- Query params disponibles: Ninguno
- Respuesta exitosa: array de pagos con campos id_pago, fecha, monto, metodo_pago, estado, referencia, cliente, venta, precio_venta, tipo_venta, vehiculo, marca, modelo
- Respuesta con error:
  ```json
  {
    "mensaje": "Error al obtener pagos",
    "error": "..."
  }
  ```
- Archivo route: backend/src/routes/pagoRoutes.js
- Archivo controller: backend/src/controllers/pagoController.js
- Archivo service: backend/src/services/pagoService.js
- Archivo model: backend/src/models/pagoModel.js

#### GET /api/pagos/:id
- Método: GET
- Ruta: /api/pagos/:id
- Protegido con JWT: No
- Middleware usado: Ninguno
- Rol requerido: No
- Body esperado: Ninguno
- Query params disponibles: Ninguno
- Respuesta exitosa: objeto pago
- Respuesta con error:
  ```json
  {
    "mensaje": "Pago no encontrado"
  }
  ```
- Archivo route: backend/src/routes/pagoRoutes.js
- Archivo controller: backend/src/controllers/pagoController.js
- Archivo service: backend/src/services/pagoService.js
- Archivo model: backend/src/models/pagoModel.js

#### POST /api/pagos
- Método: POST
- Ruta: /api/pagos
- Protegido con JWT: No
- Middleware usado: Ninguno
- Rol requerido: No
- Body esperado:
  ```json
  {
    "fecha": "2026-05-28",
    "monto": 1500,
    "metodo_pago": "transferencia",
    "referencia": "ABC123",
    "id_usuario": 1,
    "id_venta_vehiculo": 1,
    "id_cuota": 1
  }
  ```
- Query params disponibles: Ninguno
- Respuesta exitosa:
  ```json
  {
    "mensaje": "Pago registrado correctamente",
    "pago": { }
  }
  ```
- Respuesta con error:
  ```json
  {
    "mensaje": "Error al registrar pago",
    "error": "..."
  }
  ```
- Archivo route: backend/src/routes/pagoRoutes.js
- Archivo controller: backend/src/controllers/pagoController.js
- Archivo service: backend/src/services/pagoService.js
- Archivo model: backend/src/models/pagoModel.js

#### PUT /api/pagos/:id
- Método: PUT
- Ruta: /api/pagos/:id
- Protegido con JWT: No
- Middleware usado: Ninguno
- Rol requerido: No
- Body esperado: mismo esquema de creación, más estado opcional
- Query params disponibles: Ninguno
- Respuesta exitosa:
  ```json
  {
    "mensaje": "Pago actualizado correctamente",
    "pago": { }
  }
  ```
- Respuesta con error:
  ```json
  {
    "mensaje": "Pago no encontrado"
  }
  ```
- Archivo route: backend/src/routes/pagoRoutes.js
- Archivo controller: backend/src/controllers/pagoController.js
- Archivo service: backend/src/services/pagoService.js
- Archivo model: backend/src/models/pagoModel.js

#### DELETE /api/pagos/:id
- Método: DELETE
- Ruta: /api/pagos/:id
- Protegido con JWT: No
- Middleware usado: Ninguno
- Rol requerido: No
- Body esperado: Ninguno
- Query params disponibles: Ninguno
- Respuesta exitosa:
  ```json
  {
    "mensaje": "Pago eliminado correctamente",
    "pago": { }
  }
  ```
- Respuesta con error:
  ```json
  {
    "mensaje": "Pago no encontrado"
  }
  ```
- Archivo route: backend/src/routes/pagoRoutes.js
- Archivo controller: backend/src/controllers/pagoController.js
- Archivo service: backend/src/services/pagoService.js
- Archivo model: backend/src/models/pagoModel.js

### MÓDULO: Planes de Financiamiento

#### GET /api/planes-financiamiento
- Método: GET
- Ruta: /api/planes-financiamiento
- Protegido con JWT: No
- Middleware usado: Ninguno
- Rol requerido: No
- Body esperado: Ninguno
- Query params disponibles: Ninguno
- Respuesta exitosa: array de planes con campos id_plan_financiamiento, nombre, tasa_interes, numero_cuotas
- Respuesta con error:
  ```json
  {
    "mensaje": "Error al obtener planes",
    "error": "..."
  }
  ```
- Archivo route: backend/src/routes/planFinanciamientoRoutes.js
- Archivo controller: backend/src/controllers/planFinanciamientoController.js
- Archivo service: backend/src/services/planFinanciamientoService.js
- Archivo model: backend/src/models/planFinanciamientoModel.js

#### GET /api/planes-financiamiento/:id
- Método: GET
- Ruta: /api/planes-financiamiento/:id
- Protegido con JWT: No
- Middleware usado: Ninguno
- Rol requerido: No
- Body esperado: Ninguno
- Query params disponibles: Ninguno
- Respuesta exitosa: objeto plan
- Respuesta con error:
  ```json
  {
    "mensaje": "Plan de financiamiento no encontrado"
  }
  ```
- Archivo route: backend/src/routes/planFinanciamientoRoutes.js
- Archivo controller: backend/src/controllers/planFinanciamientoController.js
- Archivo service: backend/src/services/planFinanciamientoService.js
- Archivo model: backend/src/models/planFinanciamientoModel.js

#### POST /api/planes-financiamiento
- Método: POST
- Ruta: /api/planes-financiamiento
- Protegido con JWT: No
- Middleware usado: Ninguno
- Rol requerido: No
- Body esperado:
  ```json
  {
    "nombre": "Plan 12 meses",
    "tasa_interes": 10,
    "numero_cuotas": 12
  }
  ```
- Query params disponibles: Ninguno
- Respuesta exitosa:
  ```json
  {
    "mensaje": "Plan de financiamiento creado correctamente",
    "plan": { }
  }
  ```
- Respuesta con error:
  ```json
  {
    "mensaje": "Error al crear plan",
    "error": "..."
  }
  ```
- Archivo route: backend/src/routes/planFinanciamientoRoutes.js
- Archivo controller: backend/src/controllers/planFinanciamientoController.js
- Archivo service: backend/src/services/planFinanciamientoService.js
- Archivo model: backend/src/models/planFinanciamientoModel.js

#### PUT /api/planes-financiamiento/:id
- Método: PUT
- Ruta: /api/planes-financiamiento/:id
- Protegido con JWT: No
- Middleware usado: Ninguno
- Rol requerido: No
- Body esperado: mismo esquema de creación
- Query params disponibles: Ninguno
- Respuesta exitosa:
  ```json
  {
    "mensaje": "Plan de financiamiento actualizado correctamente",
    "plan": { }
  }
  ```
- Respuesta con error:
  ```json
  {
    "mensaje": "Plan de financiamiento no encontrado"
  }
  ```
- Archivo route: backend/src/routes/planFinanciamientoRoutes.js
- Archivo controller: backend/src/controllers/planFinanciamientoController.js
- Archivo service: backend/src/services/planFinanciamientoService.js
- Archivo model: backend/src/models/planFinanciamientoModel.js

#### DELETE /api/planes-financiamiento/:id
- Método: DELETE
- Ruta: /api/planes-financiamiento/:id
- Protegido con JWT: No
- Middleware usado: Ninguno
- Rol requerido: No
- Body esperado: Ninguno
- Query params disponibles: Ninguno
- Respuesta exitosa:
  ```json
  {
    "mensaje": "Plan de financiamiento eliminado correctamente",
    "plan": { }
  }
  ```
- Respuesta con error:
  ```json
  {
    "mensaje": "Plan de financiamiento no encontrado"
  }
  ```
- Archivo route: backend/src/routes/planFinanciamientoRoutes.js
- Archivo controller: backend/src/controllers/planFinanciamientoController.js
- Archivo service: backend/src/services/planFinanciamientoService.js
- Archivo model: backend/src/models/planFinanciamientoModel.js

### MÓDULO: Cuotas

#### GET /api/cuotas
- Método: GET
- Ruta: /api/cuotas
- Protegido con JWT: No
- Middleware usado: Ninguno
- Rol requerido: No
- Body esperado: Ninguno
- Query params disponibles: Ninguno
- Respuesta exitosa: array de cuotas con campos id_cuota, numero_cuota, fecha_vencimiento, monto, estado, id_plan_financiamiento, id_venta_vehiculo, cliente
- Respuesta con error:
  ```json
  {
    "mensaje": "Error al obtener cuotas",
    "error": "..."
  }
  ```
- Archivo route: backend/src/routes/cuotaRoutes.js
- Archivo controller: backend/src/controllers/cuotaController.js
- Archivo service: backend/src/services/cuotaService.js
- Archivo model: backend/src/models/cuotaModel.js

#### GET /api/cuotas/:id
- Método: GET
- Ruta: /api/cuotas/:id
- Protegido con JWT: No
- Middleware usado: Ninguno
- Rol requerido: No
- Body esperado: Ninguno
- Query params disponibles: Ninguno
- Respuesta exitosa: objeto cuota
- Respuesta con error:
  ```json
  {
    "mensaje": "Cuota no encontrada"
  }
  ```
- Archivo route: backend/src/routes/cuotaRoutes.js
- Archivo controller: backend/src/controllers/cuotaController.js
- Archivo service: backend/src/services/cuotaService.js
- Archivo model: backend/src/models/cuotaModel.js

#### POST /api/cuotas
- Método: POST
- Ruta: /api/cuotas
- Protegido con JWT: No
- Middleware usado: Ninguno
- Rol requerido: No
- Body esperado:
  ```json
  {
    "numero": 1,
    "monto": 1500,
    "fecha_vencimiento": "2026-06-01",
    "estado": "pendiente",
    "id_venta_vehiculo": 1,
    "id_plan_financiamiento": 1
  }
  ```
- Query params disponibles: Ninguno
- Respuesta exitosa:
  ```json
  {
    "mensaje": "Cuota registrada correctamente",
    "cuota": { }
  }
  ```
- Respuesta con error:
  ```json
  {
    "mensaje": "Error al registrar cuota",
    "error": "..."
  }
  ```
- Archivo route: backend/src/routes/cuotaRoutes.js
- Archivo controller: backend/src/controllers/cuotaController.js
- Archivo service: backend/src/services/cuotaService.js
- Archivo model: backend/src/models/cuotaModel.js

#### PUT /api/cuotas/:id
- Método: PUT
- Ruta: /api/cuotas/:id
- Protegido con JWT: No
- Middleware usado: Ninguno
- Rol requerido: No
- Body esperado: mismo esquema de creación
- Query params disponibles: Ninguno
- Respuesta exitosa:
  ```json
  {
    "mensaje": "Cuota actualizada correctamente",
    "cuota": { }
  }
  ```
- Respuesta con error:
  ```json
  {
    "mensaje": "Cuota no encontrada"
  }
  ```
- Archivo route: backend/src/routes/cuotaRoutes.js
- Archivo controller: backend/src/controllers/cuotaController.js
- Archivo service: backend/src/services/cuotaService.js
- Archivo model: backend/src/models/cuotaModel.js

#### DELETE /api/cuotas/:id
- Método: DELETE
- Ruta: /api/cuotas/:id
- Protegido con JWT: No
- Middleware usado: Ninguno
- Rol requerido: No
- Body esperado: Ninguno
- Query params disponibles: Ninguno
- Respuesta exitosa:
  ```json
  {
    "mensaje": "Cuota eliminada correctamente",
    "cuota": { }
  }
  ```
- Respuesta con error:
  ```json
  {
    "mensaje": "Cuota no encontrada"
  }
  ```
- Archivo route: backend/src/routes/cuotaRoutes.js
- Archivo controller: backend/src/controllers/cuotaController.js
- Archivo service: backend/src/services/cuotaService.js
- Archivo model: backend/src/models/cuotaModel.js

### MÓDULO: Bitácora
- No existe módulo ni endpoints de bitácora en el backend actual.

### MÓDULO: Dashboard / estadísticas
- No existe endpoint de dashboard actualmente.
- No existe /api/dashboard ni /api/dashboard/stats.

---

## 5. Estados válidos usados por el backend

| Módulo | Estado(s) explícitamente validados en backend | Observación |
| --- | --- | --- |
| Cotizaciones | No hay validación explícita de estados en backend | Se recibe como string o se asigna por defecto en la inserción pública |
| Vehículos | disponible, vendido, mantenimiento | Definido en validation/vehiculoValidation.js |
| Ventas | No hay validación explícita de estados en backend | El estado se recibe como string y se usa en updates |
| Pagos | No hay validación explícita de estados en backend | El estado se recibe como string y se usa en updates |
| Cuotas | pendiente, pagado, cancelado | Definido en validation/cuotaValidation.js |
| Usuarios | activo, inactivo, bloqueado | Definido en validation/usuarioValidation.js |
| Marcas | activo, inactivo | Definido en validation/marcaValidation.js |
| Modelos | activo, inactivo | Definido en validation/modeloValidation.js |
| Proveedores | activo, inactivo | Definido en validation/proveedorValidation.js |

### Observaciones adicionales
- Al crear una venta, el vehículo pasa a estado 'vendido' en el backend.
- Al registrar un pago asociado a una cuota, la cuota pasa a estado 'pagado'.
- Si la última cuota de una venta se paga, la venta pasa a estado 'pagado'.

---

## 6. Ejemplos de respuesta JSON reales o esperadas según código

### GET /api/vehiculos
```json
[
  {
    "id_vehiculo": 1,
    "placa": "ABC123",
    "color": "Negro",
    "ano": 2024,
    "kilometraje": "1000.00",
    "estado": "disponible",
    "precio_compra": "10000.00",
    "precio_venta": "15000.00",
    "id_marca": 1,
    "id_modelo": 1,
    "id_proveedor": 1,
    "nombre_marca": "Toyota",
    "nombre_modelo": "Corolla",
    "nombre_proveedor": "Auto Import"
  }
]
```

### GET /api/clientes
```json
[
  {
    "id_cliente": 1,
    "nombre": "Erick",
    "apellido": "Casanova",
    "documento": "V12345678",
    "telefono": "04141234567",
    "correo": "erick@gmail.com",
    "direccion": "San Cristobal"
  }
]
```

### GET /api/usuarios
```json
[
  {
    "id_usuario": 1,
    "nombre": "Juan",
    "apellido": "Pérez",
    "correo": "juan@dominio.com",
    "estado": "activo",
    "id_rol": 1,
    "rol": "admin"
  }
]
```

### GET /api/cotizaciones
```json
[
  {
    "id_cotizacion": 1,
    "fecha": "2026-01-01",
    "precio_estimado": 15000,
    "vigencia": "2026-01-08",
    "estado": "pendiente",
    "cliente_nombre": "Juan",
    "cliente_apellido": "Pérez",
    "placa": "ABC123",
    "marca": "Toyota",
    "modelo": "Corolla"
  }
]
```

### GET /api/cotizaciones/mis-cotizaciones
```json
{
  "mensaje": "Cotizaciones del cliente obtenidas correctamente",
  "cotizaciones": [
    {
      "id_cotizacion": 1,
      "fecha": "2026-01-01",
      "estado": "pendiente",
      "precio_estimado": 15000,
      "vigencia": "2026-01-08",
      "mensaje": "Mi Compra",
      "tipo_historial": "configuracion_compra",
      "vehiculo": {
        "id_vehiculo": 1,
        "placa": "ABC123",
        "marca": "Toyota",
        "modelo": "Corolla",
        "ano": 2024,
        "color": "Negro",
        "kilometraje": "1000.00",
        "estado": "disponible",
        "precio_venta": "15000.00"
      }
    }
  ]
}
```

### GET /api/ventas
```json
[
  {
    "id_venta": 1,
    "fecha": "2026-05-28",
    "cliente": "Juan Pérez",
    "usuario": "Admin",
    "vehiculo": "ABC123",
    "precio_final": 15000,
    "tipo_venta": "contado",
    "estado": "pendiente",
    "id_cliente": 1,
    "id_usuario": 1,
    "id_vehiculo": 1,
    "nombre_marca": "Toyota",
    "nombre_modelo": "Corolla"
  }
]
```

### GET /api/pagos
```json
[
  {
    "id_pago": 1,
    "fecha": "2026-05-28",
    "monto": 1500,
    "metodo_pago": "transferencia",
    "estado": "pendiente",
    "referencia": "ABC123",
    "cliente": "Juan Pérez",
    "venta": 1,
    "precio_venta": 15000,
    "tipo_venta": "contado",
    "vehiculo": "ABC123",
    "marca": "Toyota",
    "modelo": "Corolla"
  }
]
```

### GET /api/cuotas
```json
[
  {
    "id_cuota": 1,
    "numero_cuota": 1,
    "fecha_vencimiento": "2026-06-01",
    "monto": 1500,
    "estado": "pendiente",
    "id_plan_financiamiento": 1,
    "id_venta_vehiculo": 1,
    "cliente": "Juan Pérez"
  }
]
```

### GET /api/planes-financiamiento
```json
[
  {
    "id_plan_financiamiento": 1,
    "nombre": "Plan 12 meses",
    "tasa_interes": 10,
    "numero_cuotas": 12
  }
]
```

---

## 7. Dashboard

### Endpoints existentes
- GET /api/dashboard: No existe endpoint de dashboard actualmente.
- GET /api/dashboard/stats: No existe endpoint de dashboard actualmente.

### Recomendación para el admin-panel
El dashboard del admin-panel deberá calcular estadísticas consumiendo los módulos ya existentes:
- GET /api/vehiculos
- GET /api/clientes
- GET /api/usuarios
- GET /api/cotizaciones
- GET /api/ventas
- GET /api/pagos
- GET /api/cuotas
- GET /api/planes-financiamiento

---

## 8. Endpoints faltantes recomendados para el admin-panel

> Esta sección solo es una recomendación para el desarrollo futuro. No modifica el backend actual.

### Cotizaciones
- PATCH /api/cotizaciones/:id/estado
- PATCH /api/cotizaciones/:id/observaciones
- POST /api/cotizaciones/:id/convertir-venta
- GET /api/cotizaciones/exportar

### Dashboard
- GET /api/dashboard/stats

---

## 9. Resumen operativo para el admin-panel

- La API actual ya expone CRUD básico para usuarios, clientes, vehículos, marcas, modelos, proveedores, ventas, pagos, planes y cuotas.
- Para cotizaciones, el backend ya permite crear, listar, consultar por id, editar, eliminar y consultar el historial del cliente autenticado.
- No existen endpoints administrativos para aprobar, rechazar, cambiar estado, asignar asesor o convertir cotizaciones en ventas.
- No existe dashboard ni bitácora en el backend actual.
- El admin-panel puede construir la mayoría de vistas con los endpoints actuales, aunque algunas acciones de negocio más complejas requerirán nuevas rutas en el backend.
