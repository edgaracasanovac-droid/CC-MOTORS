const pool = require('../config/db');

const crearPlan = async (plan) => {
  const { nombre, tasa_interes, numero_cuotas } = plan;

  const result = await pool.query(
    `
    INSERT INTO plan_financiamiento
    (nombre, tasa_interes, numero_cuotas)
    VALUES ($1, $2, $3)
    RETURNING *
    `,
    [nombre, tasa_interes, numero_cuotas]
  );

  return result.rows[0];
};

const obtenerPlanes = async () => {
  const result = await pool.query(`
    SELECT *
    FROM plan_financiamiento
    ORDER BY id_plan_financiamiento ASC
  `);

  return result.rows;
};

const obtenerPlanPorId = async (id) => {
  const result = await pool.query(
    `
    SELECT *
    FROM plan_financiamiento
    WHERE id_plan_financiamiento = $1
    `,
    [id]
  );

  return result.rows[0];
};

const actualizarPlan = async (id, plan) => {
  const {
    nombre,
    tasa_interes,
    numero_cuotas
  } = plan;

  const result = await pool.query(
    `
    UPDATE plan_financiamiento
    SET nombre = $1,
        tasa_interes = $2,
        numero_cuotas = $3
    WHERE id_plan_financiamiento = $4
    RETURNING *
    `,
    [
      nombre,
      tasa_interes,
      numero_cuotas,
      id
    ]
  );

  return result.rows[0];
};

const eliminarPlan = async (id) => {
  const result = await pool.query(
    `
    DELETE FROM plan_financiamiento
    WHERE id_plan_financiamiento = $1
    RETURNING *
    `,
    [id]
  );

  return result.rows[0];
};

module.exports = {
  crearPlan,
  obtenerPlanes,
  obtenerPlanPorId,
  actualizarPlan,
  eliminarPlan
};