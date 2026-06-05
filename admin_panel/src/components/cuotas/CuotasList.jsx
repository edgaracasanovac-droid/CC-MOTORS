import { useEffect, useState } from "react";
import api from "../../lib/api";

export default function CuotasList() {
  const [cuotas, setCuotas] = useState([]);
  const [planes, setPlanes] = useState([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  const [form, setForm] = useState({
    numero_cuota: "",
    fecha_vencimiento: "",
    monto: "",
    estado: "pendiente",
    id_plan_financiamiento: "",
  });

  const [editandoId, setEditandoId] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const obtenerCuotas = async () => {
    try {
      const respuesta = await api.get("/cuotas");
      setCuotas(respuesta.data);
    } catch (error) {
      console.error(error.response?.data || error);
      setError("Error al cargar las cuotas");
    } finally {
      setCargando(false);
    }
  };

  const obtenerPlanes = async () => {
    try {
      const respuesta = await api.get("/planes-financiamiento");
      setPlanes(respuesta.data);
    } catch (error) {
      console.error(error.response?.data || error);
    }
  };

  useEffect(() => {
    obtenerCuotas();
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
      numero_cuota: "",
      fecha_vencimiento: "",
      monto: "",
      estado: "pendiente",
      id_plan_financiamiento: "",
    });

    setEditandoId(null);
    setMostrarFormulario(false);
  };

  const abrirNueva = () => {
    limpiarFormulario();
    setMostrarFormulario(true);
  };

  const guardarCuota = async (e) => {
    e.preventDefault();
    setError("");

    const datosCuota = {
      ...form,
      numero_cuota: Number(form.numero_cuota),
      monto: Number(form.monto),
      id_plan_financiamiento: Number(form.id_plan_financiamiento),
    };

    try {
      if (editandoId) {
        await api.put(`/cuotas/${editandoId}`, datosCuota);
      } else {
        await api.post("/cuotas", datosCuota);
      }

      limpiarFormulario();
      obtenerCuotas();
    } catch (error) {
      console.error(error.response?.data || error);
      setError(
        error.response?.data?.mensaje ||
          error.response?.data?.error ||
          error.response?.data?.message ||
          "Error al guardar la cuota"
      );
    }
  };

  const editarCuota = (cuota) => {
    setEditandoId(cuota.id_cuota);
    setMostrarFormulario(true);

    setForm({
      numero_cuota: cuota.numero_cuota || "",
      fecha_vencimiento: cuota.fecha_vencimiento
        ? String(cuota.fecha_vencimiento).slice(0, 10)
        : "",
      monto: cuota.monto || "",
      estado: cuota.estado || "pendiente",
      id_plan_financiamiento: cuota.id_plan_financiamiento || "",
    });
  };

  const eliminarCuota = async (cuota) => {
    const confirmar = confirm("¿Seguro que deseas eliminar esta cuota?");
    if (!confirmar) return;

    try {
      await api.delete(`/cuotas/${cuota.id_cuota}`);
      obtenerCuotas();
    } catch (error) {
      console.error(error.response?.data || error);
      setError(
        error.response?.data?.mensaje ||
          error.response?.data?.error ||
          error.response?.data?.message ||
          "Error al eliminar la cuota"
      );
    }
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return "";
    return new Date(fecha).toLocaleDateString("es-VE");
  };

  if (cargando) return <p>Cargando cuotas...</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between rounded-2xl bg-white p-6 shadow">
        <div>
          <h2 className="text-2xl font-bold">Cuotas registradas</h2>
          <p className="text-sm text-slate-500">
            Gestiona las cuotas de los planes de financiamiento.
          </p>
        </div>

        <button
          onClick={abrirNueva}
          className="rounded-xl bg-red-600 px-5 py-3 font-semibold text-white hover:bg-red-700"
        >
          + Nueva cuota
        </button>
      </div>

      {mostrarFormulario && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow">
          <h2 className="mb-4 text-2xl font-bold">
            {editandoId ? "Editar cuota" : "Registrar cuota"}
          </h2>

          <form onSubmit={guardarCuota} className="grid gap-4 md:grid-cols-2">
            <input
              name="numero_cuota"
              placeholder="Número de cuota"
              value={form.numero_cuota}
              onChange={handleChange}
              className="rounded-xl border p-3"
              required
            />

            <input
              type="date"
              name="fecha_vencimiento"
              value={form.fecha_vencimiento}
              onChange={handleChange}
              className="rounded-xl border p-3"
              required
            />

            <input
              name="monto"
              placeholder="Monto"
              value={form.monto}
              onChange={handleChange}
              className="rounded-xl border p-3"
              required
            />

            <select
              name="estado"
              value={form.estado}
              onChange={handleChange}
              className="rounded-xl border p-3"
            >
              <option value="pendiente">Pendiente</option>
              <option value="pagada">Pagada</option>
              <option value="vencida">Vencida</option>
            </select>

            <select
              name="id_plan_financiamiento"
              value={form.id_plan_financiamiento}
              onChange={handleChange}
              className="rounded-xl border p-3"
              required
            >
              <option value="">Selecciona un plan</option>

              {planes.map((plan) => (
                <option
                  key={plan.id_plan_financiamiento}
                  value={plan.id_plan_financiamiento}
                >
                  {plan.nombre || `Plan ${plan.id_plan_financiamiento}`} -{" "}
                  {plan.numero_cuotas || plan.cantidad_cuotas} cuotas -{" "}
                  {plan.tasa_interes}% interés
                </option>
              ))}
            </select>

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
              <th className="p-3">N° cuota</th>
              <th className="p-3">Vencimiento</th>
              <th className="p-3">Monto</th>
              <th className="p-3">Estado</th>
              <th className="p-3">Plan</th>
              <th className="p-3">Cliente</th>
              <th className="p-3">Acciones</th>
            </tr>
          </thead>

          <tbody>
            {cuotas.map((cuota) => (
              <tr key={cuota.id_cuota} className="border-b hover:bg-slate-50">
                <td className="p-3">{cuota.numero_cuota}</td>
                <td className="p-3">
                  {formatearFecha(cuota.fecha_vencimiento)}
                </td>
                <td className="p-3">
                  ${Number(cuota.monto || 0).toLocaleString("es-VE")}
                </td>
                <td className="p-3">{cuota.estado}</td>
                <td className="p-3">{cuota.id_plan_financiamiento}</td>
                <td className="p-3">{cuota.cliente}</td>

                <td className="flex gap-2 p-3">
                  <button
                    onClick={() => editarCuota(cuota)}
                    className="rounded-lg bg-black px-3 py-2 text-sm text-white"
                  >
                    Editar
                  </button>

                  <button
                    onClick={() => eliminarCuota(cuota)}
                    className="rounded-lg bg-red-600 px-3 py-2 text-sm text-white hover:bg-red-700"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}

            {cuotas.length === 0 && (
              <tr>
                <td colSpan="7" className="p-4 text-center text-slate-500">
                  No hay cuotas registradas.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}