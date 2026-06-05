import { useEffect, useState } from "react";
import api from "../../lib/api";

export default function PlanesFinanciamientoList() {
  const [planes, setPlanes] = useState([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  const [form, setForm] = useState({
    nombre: "",
    numero_cuotas: "",
    tasa_interes: "",
  });

  const [editandoId, setEditandoId] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const obtenerPlanes = async () => {
    try {
      const respuesta = await api.get("/planes-financiamiento");
      setPlanes(respuesta.data);
    } catch (error) {
      console.error(error.response?.data || error);
      setError("Error al cargar los planes");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    obtenerPlanes();
  }, []);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const limpiarFormulario = () => {
    setForm({
      nombre: "",
      numero_cuotas: "",
      tasa_interes: "",
    });

    setEditandoId(null);
    setMostrarFormulario(false);
  };

  const abrirNuevo = () => {
    limpiarFormulario();
    setMostrarFormulario(true);
  };

  const guardarPlan = async (e) => {
    e.preventDefault();
    setError("");

    const datosPlan = {
      nombre: form.nombre,
      numero_cuotas: Number(form.numero_cuotas),
      tasa_interes: Number(form.tasa_interes),
    };

    try {
      if (editandoId) {
        await api.put(`/planes-financiamiento/${editandoId}`, datosPlan);
      } else {
        await api.post("/planes-financiamiento", datosPlan);
      }

      limpiarFormulario();
      obtenerPlanes();
    } catch (error) {
      console.error(error.response?.data || error);
      setError(
        error.response?.data?.mensaje ||
          error.response?.data?.error ||
          error.response?.data?.message ||
          "Error al guardar el plan"
      );
    }
  };

  const editarPlan = (plan) => {
    setEditandoId(plan.id_plan_financiamiento);
    setMostrarFormulario(true);

    setForm({
      nombre: plan.nombre || "",
      numero_cuotas: plan.numero_cuotas || "",
      tasa_interes: plan.tasa_interes || "",
    });
  };

  const eliminarPlan = async (plan) => {
    const confirmar = confirm("¿Seguro que deseas eliminar este plan?");
    if (!confirmar) return;

    try {
      await api.delete(`/planes-financiamiento/${plan.id_plan_financiamiento}`);
      obtenerPlanes();
    } catch (error) {
      console.error(error.response?.data || error);
      setError(
        error.response?.data?.mensaje ||
          error.response?.data?.error ||
          error.response?.data?.message ||
          "Error al eliminar el plan"
      );
    }
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return "";
    return new Date(fecha).toLocaleDateString("es-VE");
  };

  if (cargando) return <p>Cargando planes...</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between rounded-2xl bg-white p-6 shadow">
        <div>
          <h2 className="text-2xl font-bold">
            Planes de financiamiento registrados
          </h2>
          <p className="text-sm text-slate-500">
            Gestiona los planes disponibles para ventas financiadas.
          </p>
        </div>

        <button
          onClick={abrirNuevo}
          className="rounded-xl bg-red-600 px-5 py-3 font-semibold text-white hover:bg-red-700"
        >
          + Nuevo plan
        </button>
      </div>

      {mostrarFormulario && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow">
          <h2 className="mb-4 text-2xl font-bold">
            {editandoId
              ? "Editar plan de financiamiento"
              : "Registrar plan de financiamiento"}
          </h2>

          <form onSubmit={guardarPlan} className="grid gap-4 md:grid-cols-2">
            <input
              name="nombre"
              placeholder="Nombre del plan"
              value={form.nombre}
              onChange={handleChange}
              className="rounded-xl border p-3"
              required
            />

            <input
              name="numero_cuotas"
              placeholder="Número de cuotas"
              value={form.numero_cuotas}
              onChange={handleChange}
              className="rounded-xl border p-3"
              required
            />

            <input
              name="tasa_interes"
              placeholder="Tasa de interés"
              value={form.tasa_interes}
              onChange={handleChange}
              className="rounded-xl border p-3"
              required
            />

            <div className="flex gap-3 md:col-span-2">
              <button
                type="submit"
                className="rounded-xl bg-black px-5 py-3 text-white"
              >
                {editandoId ? "Actualizar" : "Guardar"}
              </button>

              <button
                type="button"
                onClick={limpiarFormulario}
                className="rounded-xl bg-slate-200 px-5 py-3"
              >
                Cancelar
              </button>
            </div>
          </form>

          {error && <p className="mt-4 text-red-500">{error}</p>}
        </div>
      )}

      <div className="overflow-x-auto rounded-2xl bg-white shadow">
  <table className="min-w-[900px] w-full border-collapse">
          <thead className="bg-black text-white">
            <tr className="text-left">
              <th className="p-3">Nombre</th>
              <th className="p-3">Número de cuotas</th>
              <th className="p-3">Interés</th>
              <th className="p-3">Fecha creación</th>
              <th className="p-3">Acciones</th>
            </tr>
          </thead>

          <tbody>
            {planes.map((plan) => (
              <tr
                key={plan.id_plan_financiamiento}
                className="border-b hover:bg-slate-50"
              >
                <td className="p-3">{plan.nombre}</td>
                <td className="p-3">{plan.numero_cuotas}</td>
                <td className="p-3">{plan.tasa_interes}%</td>
                <td className="p-3">{formatearFecha(plan.fecha_creacion)}</td>

                <td className="flex gap-2 p-3">
                  <button
                    onClick={() => editarPlan(plan)}
                    className="rounded-lg bg-black px-3 py-2 text-sm text-white"
                  >
                    Editar
                  </button>

                  <button
                    onClick={() => eliminarPlan(plan)}
                    className="rounded-lg bg-red-600 px-3 py-2 text-sm text-white hover:bg-red-700"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}

            {planes.length === 0 && (
              <tr>
                <td colSpan="5" className="p-4 text-center text-slate-500">
                  No hay planes registrados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}