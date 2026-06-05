const pool = require('../config/db');

const crearMarca = async (marca) => {

  const {
    nombre,
    descripcion,
    pais_origen,
    sitio_web,
    estado
  } = marca;

  const result = await pool.query(
    `
    INSERT INTO marca
    (nombre, descripcion, pais_origen, sitio_web, estado)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
    `,
    [
      nombre,
      descripcion || null,
      pais_origen || null,
      sitio_web || null,
      estado || 'activo'
    ]
  );

  return result.rows[0];

};

const obtenerMarcas = async () => {

  const result = await pool.query(`
    SELECT *
    FROM marca
    ORDER BY id_marca ASC
  `);

  return result.rows;

};

const obtenerMarcaPorId = async (id) => {

  const result = await pool.query(
    `
    SELECT *
    FROM marca
    WHERE id_marca = $1
    `,
    [id]
  );

  return result.rows[0];

};

const actualizarMarca = async (id, marca) => {

  const {
    nombre,
    descripcion,
    pais_origen,
    sitio_web,
    estado
  } = marca;

  const result = await pool.query(
    `
    UPDATE marca
    SET nombre = $1,
        descripcion = $2,
        pais_origen = $3,
        sitio_web = $4,
        estado = $5
    WHERE id_marca = $6
    RETURNING *
    `,
    [
      nombre,
      descripcion || null,
      pais_origen || null,
      sitio_web || null,
      estado || 'activo',
      id
    ]
  );

  return result.rows[0];

};

const eliminarMarca = async (id) => {

  const result = await pool.query(
    `
    DELETE FROM marca
    WHERE id_marca = $1
    RETURNING *
    `,
    [id]
  );

  return result.rows[0];

};

module.exports = {
  crearMarca,
  obtenerMarcas,
  obtenerMarcaPorId,
  actualizarMarca,
  eliminarMarca
};