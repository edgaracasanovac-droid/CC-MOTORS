const pool = require('../config/db');

const crearCuota = async (cuota) => {
  const {
    numero,
    monto,
    fecha_vencimiento,
    estado,
    id_venta_vehiculo,
    id_plan_financiamiento
  } = cuota;

  const result = await pool.query(
    `
    INSERT INTO cuota
    (numero, monto, fecha_vencimiento, estado, id_venta_vehiculo, id_plan_financiamiento)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *
    `,
    [numero, monto, fecha_vencimiento, estado, id_venta_vehiculo, id_plan_financiamiento]
  );

  return result.rows[0];
};

const obtenerCuotas = async () => {
  const result = await pool.query(`
    SELECT 
      cu.id_cuota,
      cu.numero AS numero_cuota,
      cu.fecha_vencimiento,
      cu.monto,
      cu.estado,
      cu.id_plan_financiamiento,
      cu.id_venta_vehiculo,
      CONCAT(c.nombre, ' ', c.apellido) AS cliente
    FROM cuota cu
    LEFT JOIN venta_vehiculo vv
      ON cu.id_venta_vehiculo = vv.id_venta_vehiculo
    LEFT JOIN cliente c
      ON vv.id_cliente = c.id_cliente
    ORDER BY cu.id_cuota ASC
  `);

  return result.rows;
};

const obtenerCuotaPorId = async (id) => {
  const result = await pool.query(
    `
    SELECT 
      cu.id_cuota,
      cu.numero AS numero_cuota,
      cu.fecha_vencimiento,
      cu.monto,
      cu.estado,
      cu.id_venta_vehiculo,
      cu.id_plan_financiamiento,
      CONCAT(c.nombre, ' ', c.apellido) AS cliente
    FROM cuota cu
    LEFT JOIN venta_vehiculo vv ON cu.id_venta_vehiculo = vv.id_venta_vehiculo
    LEFT JOIN cliente c ON vv.id_cliente = c.id_cliente
    WHERE cu.id_cuota = $1
    `,
    [id]
  );

  return result.rows[0];
};

const actualizarCuota = async (id, cuota) => {
  const {
    numero,
    monto,
    fecha_vencimiento,
    estado,
    id_venta_vehiculo,
    id_plan_financiamiento
  } = cuota;

  const result = await pool.query(
    `
    UPDATE cuota
    SET numero = $1,
        monto = $2,
        fecha_vencimiento = $3,
        estado = $4,
        id_venta_vehiculo = $5,
        id_plan_financiamiento = $6
    WHERE id_cuota = $7
    RETURNING *
    `,
    [
      numero,
      monto,
      fecha_vencimiento,
      estado,
      id_venta_vehiculo,
      id_plan_financiamiento,
      id
    ]
  );

  return result.rows[0];
};

const eliminarCuota = async (id) => {
  const result = await pool.query(
    `
    DELETE FROM cuota
    WHERE id_cuota = $1
    RETURNING *
    `,
    [id]
  );

  return result.rows[0];
};

module.exports = {
  crearCuota,
  obtenerCuotas,
  obtenerCuotaPorId,
  actualizarCuota,
  eliminarCuota
};