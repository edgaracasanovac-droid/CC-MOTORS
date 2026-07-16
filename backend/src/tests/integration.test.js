const request = require('supertest');
const { z } = require('zod');
const app = require('../app');
const pool = require('../config/db');



const vehicleSchema = z.object({
  id_vehiculo: z.number(),
  placa: z.string().nullable(),
  color: z.string().nullable().optional(),
  ano: z.number().nullable().optional(),
  kilometraje: z.string().optional(),
  estado: z.string(),
  precio_compra: z.string(),
  precio_venta: z.string(),
  modelo: z.string(),
  marca: z.string(),
  proveedor: z.string().nullable().optional()
});

const clientSchema = z.object({
  id_cliente: z.number(),
  nombre: z.string(),
  apellido: z.string(),
  documento: z.string().nullable(),
  telefono: z.string().nullable(),
  correo: z.string().nullable(),
  direccion: z.string().nullable()
});

const userSchema = z.object({
  id_usuario: z.number(),
  nombre: z.string(),
  correo: z.string().nullable(),
  estado: z.string(),
  id_rol: z.number(),
  rol: z.string()
});

const brandSchema = z.object({
  id_marca: z.number(),
  nombre: z.string(),
  descripcion: z.string().nullable(),
  pais_origen: z.string().nullable(),
  sitio_web: z.string().nullable(),
  estado: z.string()
});

const quoteSchema = z.object({
  id_cotizacion: z.number(),
  fecha: z.string(),
  precio_estimado: z.string(),
  vigencia: z.string(),
  estado: z.string(),
  cliente_nombre: z.string(),
  cliente_apellido: z.string(),
  placa: z.string().nullable(),
  marca: z.string(),
  modelo: z.string()
});

const saleSchema = z.object({
  id_venta_vehiculo: z.number(),
  fecha: z.string(),
  precio_final: z.string(),
  tipo_venta: z.string(),
  estado: z.string(),
  cliente_nombre: z.string(),
  cliente_apellido: z.string(),
  vendedor: z.string(),
  placa: z.string().nullable(),
  marca: z.string(),
  modelo: z.string()
});



describe('Integration tests - API Concesionaria', () => {

  test('GET /api/vehiculos debe devolver una lista de vehículos válida', async () => {
    const response = await request(app).get('/api/vehiculos');

    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);

    if (response.body.length > 0) {
      vehicleSchema.parse(response.body[0]);
    }
  });

  test('GET /api/clientes debe devolver una lista de clientes válida', async () => {
    const response = await request(app).get('/api/clientes');

    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);

    if (response.body.length > 0) {
      clientSchema.parse(response.body[0]);
    }
  });

  test('GET /api/usuarios debe devolver una lista de usuarios válida', async () => {
    const response = await request(app).get('/api/usuarios');

    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);

    if (response.body.length > 0) {
      userSchema.parse(response.body[0]);
    }
  });

  test('GET /api/marcas debe devolver una lista de marcas válida', async () => {
    const response = await request(app).get('/api/marcas');

    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);

    if (response.body.length > 0) {
      brandSchema.parse(response.body[0]);
    }
  });

  test('GET /api/cotizaciones debe devolver una lista de cotizaciones válida', async () => {
    const response = await request(app).get('/api/cotizaciones');

    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);

    if (response.body.length > 0) {
      quoteSchema.parse(response.body[0]);
    }
  });

  test('GET /api/ventas debe devolver una lista de ventas válida', async () => {
    const response = await request(app).get('/api/ventas');

    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);

    if (response.body.length > 0) {
      saleSchema.parse(response.body[0]);
    }
  });

  test('GET /api/test-drive debe exigir autenticación para panel administrativo', async () => {
    const response = await request(app).get('/api/test-drive');

    expect(response.statusCode).toBe(401);
    expect(response.body).toEqual(expect.objectContaining({ mensaje: expect.any(String) }));
  });

});

afterAll(async () => {
  await pool.end();
});