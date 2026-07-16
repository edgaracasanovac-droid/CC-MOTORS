import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import api from "../../lib/api";
import { esNumeroNoNegativo, esTextoValido, obtenerMensajeError } from "../../lib/validaciones";

export default function PlanesFinanciamientoList() {
  const [planes, setPlanes] = useState([]);

  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  const [planDetalle, setPlanDetalle] = useState(null);
  const [planEliminar, setPlanEliminar] = useState(null);

  const [busqueda, setBusqueda] = useState("");

  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [cargandoDetalle, setCargandoDetalle] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    nombre: "",
    numero_cuotas: "",
    tasa_interes: "",
  });

  const obtenerArray = (respuesta) => {
    if (Array.isArray(respuesta.data)) return respuesta.data;
    if (Array.isArray(respuesta.data?.planes)) return respuesta.data.planes;
    if (Array.isArray(respuesta.data?.planes_financiamiento)) {
      return respuesta.data.planes_financiamiento;
    }

    return [];
  };

  const cargarPlanes = async () => {
    setCargando(true);
    setError("");

    try {
      const respuesta = await api.get("/planes-financiamiento");
      setPlanes(obtenerArray(respuesta));
    } catch (error) {
      console.error(error.response?.data || error);
      setError("Error al cargar los planes de financiamiento.");
      toast.error("Error al cargar planes");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarPlanes();
  }, []);

  const limpiarFormulario = () => {
    setForm({
      nombre: "",
      numero_cuotas: "",
      tasa_interes: "",
    });

    setEditandoId(null);
    setMostrarFormulario(false);
    setError("");
  };

  const abrirNuevo = () => {
    limpiarFormulario();
    setMostrarFormulario(true);
  };

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return "Sin fecha";

    const fechaString = String(fecha).slice(0, 10);
    const partes = fechaString.split("-");

    if (partes.length === 3) {
      return `${partes[2]}/${partes[1]}/${partes[0]}`;
    }

    return fechaString;
  };

  const obtenerIdPlan = (plan) => {
    return plan.id_plan_financiamiento || plan.id;
  };

  const prepararDatos = () => {
    return {
      nombre: form.nombre.trim(),
      numero_cuotas: Number(form.numero_cuotas),
      tasa_interes: Number(form.tasa_interes),
    };
  };

  const guardarPlan = async (e) => {
    e.preventDefault();
    setGuardando(true);
    setError("");

    const datosPlan = prepararDatos();

    if (!esTextoValido(datosPlan.nombre)) {
      setError("El nombre del plan es obligatorio");
      toast.error("El nombre del plan es obligatorio");
      setGuardando(false);
      return;
    }

    if (!Number.isFinite(Number(datosPlan.numero_cuotas)) || Number(datosPlan.numero_cuotas) <= 0) {
      setError("El número de cuotas debe ser mayor que cero");
      toast.error("El número de cuotas debe ser mayor que cero");
      setGuardando(false);
      return;
    }

    if (!esNumeroNoNegativo(datosPlan.tasa_interes)) {
      setError("La tasa de interés no puede ser negativa");
      toast.error("La tasa de interés no puede ser negativa");
      setGuardando(false);
      return;
    }

    try {
      if (editandoId) {
        await api.put(`/planes-financiamiento/${editandoId}`, datosPlan);
        toast.success("Plan actualizado correctamente");
      } else {
        await api.post("/planes-financiamiento", datosPlan);
        toast.success("Plan registrado correctamente");
      }

      limpiarFormulario();
      await cargarPlanes();
    } catch (error) {
      const mensaje = obtenerMensajeError(error, "Error al guardar el plan");

      setError(mensaje);
      toast.error(mensaje);
    } finally {
      setGuardando(false);
    }
  };

  const editarPlan = (plan) => {
    const id = obtenerIdPlan(plan);

    setEditandoId(id);
    setMostrarFormulario(true);

    setForm({
      nombre: plan.nombre || "",
      numero_cuotas: plan.numero_cuotas || "",
      tasa_interes: plan.tasa_interes || "",
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const verDetalle = async (plan) => {
    const id = obtenerIdPlan(plan);
    setCargandoDetalle(true);

    try {
      const respuesta = await api.get(`/planes-financiamiento/${id}`);
      setPlanDetalle(respuesta.data?.plan || respuesta.data);
    } catch (error) {
      console.error(error.response?.data || error);
      toast.error("Error al cargar el detalle del plan");
    } finally {
      setCargandoDetalle(false);
    }
  };

  const confirmarEliminarPlan = async () => {
    if (!planEliminar) return;

    const id = obtenerIdPlan(planEliminar);

    try {
      await api.delete(`/planes-financiamiento/${id}`);
      toast.success("Plan eliminado correctamente");
      setPlanEliminar(null);
      await cargarPlanes();
    } catch (error) {
      console.error(error.response?.data || error);

      const mensaje =
        error.response?.data?.mensaje ||
        error.response?.data?.error ||
        error.response?.data?.message ||
        "Error al eliminar el plan";

      toast.error(mensaje);
    }
  };

  const planesFiltrados = useMemo(() => {
    const texto = busqueda.toLowerCase().trim();

    return planes.filter((plan) => {
      const id = String(obtenerIdPlan(plan) || "");
      const nombre = String(plan.nombre || "").toLowerCase();
      const cuotas = String(plan.numero_cuotas || "");
      const interes = String(plan.tasa_interes || "");

      return (
        !texto ||
        id.includes(texto) ||
        nombre.includes(texto) ||
        cuotas.includes(texto) ||
        interes.includes(texto)
      );
    });
  }, [planes, busqueda]);

  const resumen = useMemo(() => {
    const totalCuotas = planes.reduce((total, plan) => {
      return total + Number(plan.numero_cuotas || 0);
    }, 0);

    const sumaInteres = planes.reduce((total, plan) => {
      return total + Number(plan.tasa_interes || 0);
    }, 0);

    const promedioInteres =
      planes.length > 0 ? sumaInteres / planes.length : 0;

    const planMayorCuotas = planes.reduce((mayor, plan) => {
      if (!mayor) return plan;

      return Number(plan.numero_cuotas || 0) > Number(mayor.numero_cuotas || 0)
        ? plan
        : mayor;
    }, null);

    return {
      total: planes.length,
      totalCuotas,
      promedioInteres,
      planMayorCuotas,
    };
  }, [planes]);

  if (cargando) {
    return (
      <div className="space-y-6">
        <div className="h-36 animate-pulse rounded-3xl bg-slate-200"></div>

        <div className="grid gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="h-28 animate-pulse rounded-3xl bg-slate-200"
            ></div>
          ))}
        </div>

        <div className="h-96 animate-pulse rounded-3xl bg-slate-200"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-3xl bg-black p-8 text-white shadow-xl">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="mb-2 text-sm font-bold uppercase tracking-[0.3em] text-red-500">
              Financiamiento CC Motors
            </p>

            <h2 className="text-3xl font-black">
              Planes de Financiamiento
            </h2>

            <p className="mt-2 max-w-2xl text-slate-300">
              Administra los planes disponibles para ventas financiadas. Estos
              planes se conectan con ventas, cuotas y pagos.
            </p>
          </div>

          <button
            onClick={abrirNuevo}
            className="rounded-2xl bg-red-600 px-6 py-4 font-bold text-white transition hover:bg-red-700"
          >
            + Nuevo plan
          </button>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase text-slate-500">
            Total
          </p>
          <p className="mt-2 text-4xl font-black text-black">
            {resumen.total}
          </p>
          <p className="mt-2 text-sm text-slate-500">
            Planes registrados
          </p>
        </div>

        <div className="rounded-3xl border border-red-200 bg-red-50 p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase text-red-700">
            Cuotas configuradas
          </p>
          <p className="mt-2 text-4xl font-black text-red-700">
            {resumen.totalCuotas}
          </p>
          <p className="mt-2 text-sm text-red-700">
            Total entre todos los planes
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase text-slate-500">
            Interés promedio
          </p>
          <p className="mt-2 text-4xl font-black text-black">
            {resumen.promedioInteres.toFixed(2)}%
          </p>
          <p className="mt-2 text-sm text-slate-500">
            Promedio general
          </p>
        </div>

        <div className="rounded-3xl border border-yellow-200 bg-yellow-50 p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase text-yellow-700">
            Plan más largo
          </p>
          <p className="mt-2 text-3xl font-black text-yellow-700">
            {resumen.planMayorCuotas
              ? `${resumen.planMayorCuotas.numero_cuotas} cuotas`
              : "0 cuotas"}
          </p>
          <p className="mt-2 text-sm text-yellow-700">
            Mayor plazo registrado
          </p>
        </div>
      </section>

      {mostrarFormulario && (
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-widest text-red-600">
                {editandoId ? "Actualizar plan" : "Nuevo plan"}
              </p>

              <h2 className="text-2xl font-black text-black">
                {editandoId
                  ? "Editar plan de financiamiento"
                  : "Registrar plan de financiamiento"}
              </h2>
            </div>

            <button
              type="button"
              onClick={limpiarFormulario}
              className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
            >
              Cerrar formulario
            </button>
          </div>

          <form onSubmit={guardarPlan} className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Nombre del plan
              </label>

              <input
                name="nombre"
                placeholder="Plan 12 meses"
                value={form.nombre}
                onChange={handleChange}
                className="h-12 w-full rounded-xl border border-slate-300 px-4 outline-none transition focus:border-red-600"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Número de cuotas
              </label>

              <input
                type="number"
                name="numero_cuotas"
                placeholder="12"
                value={form.numero_cuotas}
                onChange={handleChange}
                className="h-12 w-full rounded-xl border border-slate-300 px-4 outline-none transition focus:border-red-600"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Tasa de interés
              </label>

              <input
                type="number"
                step="0.01"
                name="tasa_interes"
                placeholder="5"
                value={form.tasa_interes}
                onChange={handleChange}
                className="h-12 w-full rounded-xl border border-slate-300 px-4 outline-none transition focus:border-red-600"
                required
              />
            </div>

            {error && (
              <div className="md:col-span-2 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="flex flex-col gap-3 sm:flex-row md:col-span-2">
              <button
                type="submit"
                disabled={guardando}
                className="rounded-xl bg-black px-6 py-3 font-bold text-white transition hover:bg-red-600 disabled:opacity-60"
              >
                {guardando
                  ? "Guardando..."
                  : editandoId
                    ? "Actualizar plan"
                    : "Guardar plan"}
              </button>

              <button
                type="button"
                onClick={limpiarFormulario}
                className="rounded-xl bg-slate-200 px-6 py-3 font-bold text-slate-700 transition hover:bg-slate-300"
              >
                Cancelar
              </button>
            </div>
          </form>
        </section>
      )}

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6">
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Buscar plan
          </label>

          <input
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por nombre, número de cuotas, interés o ID..."
            className="h-12 w-full rounded-xl border border-slate-300 px-4 outline-none transition focus:border-red-600"
          />
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-200">
          <table className="min-w-[1000px] w-full border-collapse">
            <thead className="bg-black text-white">
              <tr className="text-left text-sm">
                <th className="p-4">ID</th>
                <th className="p-4">Nombre</th>
                <th className="p-4">Número de cuotas</th>
                <th className="p-4">Interés</th>
                <th className="p-4">Fecha creación</th>
                <th className="p-4">Acciones</th>
              </tr>
            </thead>

            <tbody>
              {planesFiltrados.length > 0 ? (
                planesFiltrados.map((plan) => {
                  const id = obtenerIdPlan(plan);

                  return (
                    <tr
                      key={id}
                      className="border-b text-sm transition hover:bg-slate-50"
                    >
                      <td className="p-4 font-bold text-slate-700">
                        #{id}
                      </td>

                      <td className="p-4">
                        <p className="font-black text-black">
                          {plan.nombre}
                        </p>
                        <p className="text-xs text-slate-500">
                          Plan de financiamiento
                        </p>
                      </td>

                      <td className="p-4 font-bold text-slate-700">
                        {plan.numero_cuotas} cuotas
                      </td>

                      <td className="p-4">
                        <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-700">
                          {Number(plan.tasa_interes || 0).toFixed(2)}%
                        </span>
                      </td>

                      <td className="p-4 text-slate-600">
                        {formatearFecha(plan.fecha_creacion)}
                      </td>

                      <td className="p-4">
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => verDetalle(plan)}
                            disabled={cargandoDetalle}
                            className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-200 disabled:opacity-60"
                          >
                            Ver
                          </button>

                          <button
                            onClick={() => editarPlan(plan)}
                            className="rounded-lg bg-black px-3 py-2 text-xs font-bold text-white transition hover:bg-red-600"
                          >
                            Editar
                          </button>

                          <button
                            onClick={() => setPlanEliminar(plan)}
                            className="rounded-lg bg-red-600 px-3 py-2 text-xs font-bold text-white transition hover:bg-red-700"
                          >
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" className="p-10 text-center">
                    <div className="mx-auto max-w-md">
                      <p className="text-4xl">📑</p>

                      <h3 className="mt-3 text-xl font-black text-black">
                        No hay planes para mostrar
                      </h3>

                      <p className="mt-2 text-sm text-slate-500">
                        No se encontraron planes con la búsqueda actual.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {planDetalle && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-bold uppercase tracking-widest text-red-600">
                  Detalle del plan
                </p>

                <h2 className="text-2xl font-black text-black">
                  {planDetalle.nombre || "Plan de financiamiento"}
                </h2>

                <p className="mt-1 text-slate-500">
                  ID #{obtenerIdPlan(planDetalle)}
                </p>
              </div>

              <button
                onClick={() => setPlanDetalle(null)}
                className="rounded-xl bg-slate-100 px-4 py-2 font-bold text-slate-700 hover:bg-slate-200"
              >
                ✕
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-bold uppercase text-slate-500">
                  Nombre
                </p>
                <p className="mt-1 font-bold text-black">
                  {planDetalle.nombre || "Sin nombre"}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-bold uppercase text-slate-500">
                  Número de cuotas
                </p>
                <p className="mt-1 font-bold text-black">
                  {planDetalle.numero_cuotas || 0} cuotas
                </p>
              </div>

              <div className="rounded-2xl bg-red-50 p-4">
                <p className="text-xs font-bold uppercase text-red-700">
                  Tasa de interés
                </p>
                <p className="mt-1 text-xl font-black text-red-700">
                  {Number(planDetalle.tasa_interes || 0).toFixed(2)}%
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-bold uppercase text-slate-500">
                  Fecha creación
                </p>
                <p className="mt-1 font-bold text-black">
                  {formatearFecha(planDetalle.fecha_creacion)}
                </p>
              </div>
            </div>

            <div className="mt-6 rounded-2xl bg-yellow-50 p-4 text-sm text-yellow-800">
              Este plan puede ser utilizado en ventas financiadas y sirve como
              base para generar cuotas asociadas.
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setPlanDetalle(null)}
                className="rounded-xl bg-black px-5 py-3 font-bold text-white transition hover:bg-red-600"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {planEliminar && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <div className="mb-4 text-5xl">⚠️</div>

            <h2 className="text-2xl font-black text-black">
              ¿Eliminar plan?
            </h2>

            <p className="mt-2 text-sm text-slate-600">
              Esta acción eliminará el plan{" "}
              <strong>{planEliminar.nombre}</strong>. No se puede deshacer.
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button
                onClick={confirmarEliminarPlan}
                className="flex-1 rounded-xl bg-red-600 px-5 py-3 font-bold text-white transition hover:bg-red-700"
              >
                Sí, eliminar
              </button>

              <button
                onClick={() => setPlanEliminar(null)}
                className="flex-1 rounded-xl bg-slate-200 px-5 py-3 font-bold text-slate-700 transition hover:bg-slate-300"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}