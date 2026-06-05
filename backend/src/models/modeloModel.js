const pool = require('../config/db');

const crearModelo = async (modelo) => {
  const {
    nombre,
    id_marca,
    descripcion,
    ano_lanzamiento,
    ano_descontinuacion,
    tipo_combustible,
    cilindrada,
    transmision,
    numero_puertas,
    capacidad_pasajeros,
    tipo_carroceria,
    estado
  } = modelo;

  const result = await pool.query(
    `
    INSERT INTO modelo
    (nombre, id_marca, descripcion, ano_lanzamiento, ano_descontinuacion,
     tipo_combustible, cilindrada, transmision, numero_puertas,
     capacidad_pasajeros, tipo_carroceria, estado)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
    RETURNING *
    `,
    [
      nombre,
      id_marca,
      descripcion || null,
      ano_lanzamiento || null,
      ano_descontinuacion || null,
      tipo_combustible || null,
      cilindrada || null,
      transmision || null,
      numero_puertas || null,
      capacidad_pasajeros || 5,
      tipo_carroceria || null,
      estado || 'activo'
    ]
  );

  return result.rows[0];
};

const obtenerModelos = async () => {
  const result = await pool.query(`
    SELECT 
      mo.*,
      ma.nombre AS marca
    FROM modelo mo
    INNER JOIN marca ma ON mo.id_marca = ma.id_marca
    ORDER BY mo.id_modelo ASC
  `);

  return result.rows;
};

const obtenerModeloPorId = async (id) => {
  const result = await pool.query(
    `
    SELECT 
      mo.*,
      ma.nombre AS marca
    FROM modelo mo
    INNER JOIN marca ma ON mo.id_marca = ma.id_marca
    WHERE mo.id_modelo = $1
    `,
    [id]
  );

  return result.rows[0];
};

const actualizarModelo = async (id, modelo) => {
  const {
    nombre,
    id_marca,
    descripcion,
    ano_lanzamiento,
    ano_descontinuacion,
    tipo_combustible,
    cilindrada,
    transmision,
    numero_puertas,
    capacidad_pasajeros,
    tipo_carroceria,
    estado
  } = modelo;

  const result = await pool.query(
    `
    UPDATE modelo
    SET nombre = $1,
        id_marca = $2,
        descripcion = $3,
        ano_lanzamiento = $4,
        ano_descontinuacion = $5,
        tipo_combustible = $6,
        cilindrada = $7,
        transmision = $8,
        numero_puertas = $9,
        capacidad_pasajeros = $10,
        tipo_carroceria = $11,
        estado = $12
    WHERE id_modelo = $13
    RETURNING *
    `,
    [
      nombre,
      id_marca,
      descripcion || null,
      ano_lanzamiento || null,
      ano_descontinuacion || null,
      tipo_combustible || null,
      cilindrada || null,
      transmision || null,
      numero_puertas || null,
      capacidad_pasajeros || 5,
      tipo_carroceria || null,
      estado || 'activo',
      id
    ]
  );

  return result.rows[0];
};

const eliminarModelo = async (id) => {
  const result = await pool.query(
    `
    DELETE FROM modelo
    WHERE id_modelo = $1
    RETURNING *
    `,
    [id]
  );

  return result.rows[0];
};

module.exports = {
  crearModelo,
  obtenerModelos,
  obtenerModeloPorId,
  actualizarModelo,
  eliminarModelo
};