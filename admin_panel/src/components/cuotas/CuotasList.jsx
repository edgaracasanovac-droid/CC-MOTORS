import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import api from "../../lib/api";
import { esFechaValida, esNumeroMayorQueCero, esTextoValido, obtenerIdValido, obtenerMensajeError } from "../../lib/validaciones";

export default function CuotasList() {
  const [cuotas, setCuotas] = useState([]);
  const [ventas, setVentas] = useState([]);
  const [planes, setPlanes] = useState([]);

  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  const [cuotaDetalle, setCuotaDetalle] = useState(null);
  const [cuotaEliminar, setCuotaEliminar] = useState(null);

  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("todos");

  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [cargandoDetalle, setCargandoDetalle] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    numero_cuota: "",
    fecha_vencimiento: "",
    monto: "",
    estado: "pendiente",
    id_venta_vehiculo: "",
    id_plan_financiamiento: "",
  });

  const obtenerArray = (respuesta) => {
    if (Array.isArray(respuesta.data)) return respuesta.data;
    if (Array.isArray(respuesta.data?.cuotas)) return respuesta.data.cuotas;
    if (Array.isArray(respuesta.data?.ventas)) return respuesta.data.ventas;
    if (Array.isArray(respuesta.data?.planes)) return respuesta.data.planes;
    return [];
  };

  const cargarDatos = async () => {
    setCargando(true);
    setError("");

    try {
      const [cuotasRes, ventasRes, planesRes] = await Promise.all([
        api.get("/cuotas"),
        api.get("/ventas"),
        api.get("/planes-financiamiento"),
      ]);

      setCuotas(obtenerArray(cuotasRes));
      setVentas(obtenerArray(ventasRes));
      setPlanes(obtenerArray(planesRes));
    } catch (error) {
      console.error(error.response?.data || error);
      setError("Error al cargar las cuotas.");
      toast.error("Error al cargar cuotas");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const limpiarFormulario = () => {
    setForm({
      numero_cuota: "",
      fecha_vencimiento: "",
      monto: "",
      estado: "pendiente",
      id_venta_vehiculo: "",
      id_plan_financiamiento: "",
    });

    setEditandoId(null);
    setMostrarFormulario(false);
    setError("");
  };

  const abrirNueva = () => {
    limpiarFormulario();
    setMostrarFormulario(true);
  };

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const formatoMoneda = (valor) => {
    return `$${Number(valor || 0).toLocaleString("es-VE", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
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

  const formatearInputFecha = (fecha) => {
    if (!fecha) return "";
    return String(fecha).slice(0, 10);
  };

  const obtenerIdVenta = (venta) => {
    return venta.id_venta_vehiculo || venta.id_venta || venta.id;
  };

  const obtenerVentaTexto = (venta) => {
    const id = obtenerIdVenta(venta);
    const cliente = venta.cliente || "Sin cliente";
    const vehiculo =
      venta.nombre_marca || venta.nombre_modelo
        ? `${venta.nombre_marca || ""} ${venta.nombre_modelo || ""}`.trim()
        : venta.vehiculo || "Vehículo";

    return `#${id} · ${cliente} · ${vehiculo} · ${formatoMoneda(venta.precio_final)}`;
  };

  const obtenerNombrePlan = (idPlan) => {
    const plan = planes.find(
      (item) =>
        String(item.id_plan_financiamiento || item.id) === String(idPlan)
    );

    if (!plan) return idPlan ? `Plan #${idPlan}` : "Sin plan";

    return `${plan.nombre || `Plan #${plan.id_plan_financiamiento || plan.id}`} · ${
      plan.numero_cuotas || plan.cantidad_cuotas || 0
    } cuotas · ${plan.tasa_interes}% interés`;
  };

  const obtenerBadgeEstado = (estado) => {
    const estadoNormalizado = String(estado || "").toLowerCase();

    if (estadoNormalizado === "pagado") {
      return "bg-green-100 text-green-800";
    }

    if (estadoNormalizado === "pendiente") {
      return "bg-yellow-100 text-yellow-800";
    }

    if (estadoNormalizado === "cancelado") {
      return "bg-red-100 text-red-800";
    }

    return "bg-slate-100 text-slate-700";
  };

  const prepararDatos = () => {
    return {
      numero: Number(form.numero_cuota),
      monto: Number(form.monto),
      fecha_vencimiento: form.fecha_vencimiento,
      estado: form.estado,
      id_venta_vehiculo: Number(form.id_venta_vehiculo),
      id_plan_financiamiento: Number(form.id_plan_financiamiento),
    };
  };

  const guardarCuota = async (e) => {
    e.preventDefault();
    setGuardando(true);
    setError("");

    const datosCuota = prepararDatos();

    if (!esNumeroMayorQueCero(datosCuota.numero)) {
      setError("El número de cuota debe ser mayor que cero");
      toast.error("El número de cuota debe ser mayor que cero");
      setGuardando(false);
      return;
    }

    if (!esNumeroMayorQueCero(datosCuota.monto)) {
      setError("El monto debe ser mayor que cero");
      toast.error("El monto debe ser mayor que cero");
      setGuardando(false);
      return;
    }

    if (!esTextoValido(datosCuota.fecha_vencimiento) || !esFechaValida(datosCuota.fecha_vencimiento)) {
      setError("La fecha de vencimiento es obligatoria y debe ser válida");
      toast.error("La fecha de vencimiento es obligatoria y debe ser válida");
      setGuardando(false);
      return;
    }

    if (!obtenerIdValido(datosCuota.id_venta_vehiculo)) {
      setError("Debe seleccionar una venta válida");
      toast.error("Debe seleccionar una venta válida");
      setGuardando(false);
      return;
    }

    if (!obtenerIdValido(datosCuota.id_plan_financiamiento)) {
      setError("Debe seleccionar un plan de financiamiento válido");
      toast.error("Debe seleccionar un plan de financiamiento válido");
      setGuardando(false);
      return;
    }

    const estadosValidos = ["pendiente", "pagado", "cancelado"];
    if (!estadosValidos.includes(String(datosCuota.estado).toLowerCase())) {
      setError("El estado de la cuota no es válido");
      toast.error("El estado de la cuota no es válido");
      setGuardando(false);
      return;
    }

    try {
      if (editandoId) {
        await api.put(`/cuotas/${editandoId}`, datosCuota);
        toast.success("Cuota actualizada correctamente");
      } else {
        await api.post("/cuotas", datosCuota);
        toast.success("Cuota registrada correctamente");
      }

      limpiarFormulario();
      await cargarDatos();
    } catch (error) {
      const mensaje = obtenerMensajeError(error, "Error al guardar la cuota");

      setError(mensaje);
      toast.error(mensaje);
    } finally {
      setGuardando(false);
    }
  };

  const editarCuota = async (cuota) => {
    const id = cuota.id_cuota || cuota.id;
    setCargandoDetalle(true);

    try {
      const respuesta = await api.get(`/cuotas/${id}`);
      const detalle = respuesta.data?.cuota || respuesta.data;

      setEditandoId(id);
      setMostrarFormulario(true);

      setForm({
        numero_cuota:
          detalle.numero_cuota || detalle.numero || cuota.numero_cuota || "",
        fecha_vencimiento: formatearInputFecha(
          detalle.fecha_vencimiento || cuota.fecha_vencimiento
        ),
        monto: detalle.monto || cuota.monto || "",
        estado: detalle.estado || cuota.estado || "pendiente",
        id_venta_vehiculo:
          detalle.id_venta_vehiculo || cuota.id_venta_vehiculo || "",
        id_plan_financiamiento:
          detalle.id_plan_financiamiento || cuota.id_plan_financiamiento || "",
      });

      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      console.error(error.response?.data || error);
      toast.error("Error al cargar la cuota");
    } finally {
      setCargandoDetalle(false);
    }
  };

  const verDetalle = async (cuota) => {
    const id = cuota.id_cuota || cuota.id;
    setCargandoDetalle(true);

    try {
      const respuesta = await api.get(`/cuotas/${id}`);
      setCuotaDetalle(respuesta.data?.cuota || respuesta.data);
    } catch (error) {
      console.error(error.response?.data || error);
      toast.error("Error al cargar el detalle de la cuota");
    } finally {
      setCargandoDetalle(false);
    }
  };

  const confirmarEliminarCuota = async () => {
    if (!cuotaEliminar) return;

    const id = cuotaEliminar.id_cuota || cuotaEliminar.id;

    try {
      await api.delete(`/cuotas/${id}`);
      toast.success("Cuota eliminada correctamente");
      setCuotaEliminar(null);
      await cargarDatos();
    } catch (error) {
      console.error(error.response?.data || error);

      const mensaje =
        error.response?.data?.mensaje ||
        error.response?.data?.error ||
        error.response?.data?.message ||
        "Error al eliminar la cuota";

      toast.error(mensaje);
    }
  };

  const cuotasFiltradas = useMemo(() => {
    const texto = busqueda.toLowerCase().trim();

    return cuotas.filter((cuota) => {
      const id = String(cuota.id_cuota || cuota.id || "");
      const numero = String(cuota.numero_cuota || cuota.numero || "");
      const cliente = String(cuota.cliente || "").toLowerCase();
      const estado = String(cuota.estado || "").toLowerCase();
      const monto = String(cuota.monto || "");
      const plan = String(cuota.id_plan_financiamiento || "").toLowerCase();
      const venta = String(cuota.id_venta_vehiculo || "").toLowerCase();

      const coincideBusqueda =
        !texto ||
        id.includes(texto) ||
        numero.includes(texto) ||
        cliente.includes(texto) ||
        estado.includes(texto) ||
        monto.includes(texto) ||
        plan.includes(texto) ||
        venta.includes(texto);

      const coincideEstado = filtroEstado === "todos" || estado === filtroEstado;

      return coincideBusqueda && coincideEstado;
    });
  }, [cuotas, busqueda, filtroEstado]);

  const resumen = useMemo(() => {
    const pendientes = cuotas.filter(
      (cuota) => cuota.estado?.toLowerCase() === "pendiente"
    );

    const pagadas = cuotas.filter(
      (cuota) => cuota.estado?.toLowerCase() === "pagado"
    );

    const canceladas = cuotas.filter(
      (cuota) => cuota.estado?.toLowerCase() === "cancelado"
    );

    const montoPendiente = pendientes.reduce((total, cuota) => {
      return total + Number(cuota.monto || 0);
    }, 0);

    return {
      total: cuotas.length,
      pendientes: pendientes.length,
      pagadas: pagadas.length,
      canceladas: canceladas.length,
      montoPendiente,
    };
  }, [cuotas]);

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

            <h2 className="text-3xl font-black">Gestión de Cuotas</h2>

            <p className="mt-2 max-w-2xl text-slate-300">
              Administra las cuotas asociadas a ventas financiadas y planes de
              financiamiento. Los pagos pueden actualizar estas cuotas automáticamente.
            </p>
          </div>

          <button
            onClick={abrirNueva}
            className="rounded-2xl bg-red-600 px-6 py-4 font-bold text-white transition hover:bg-red-700"
          >
            + Nueva cuota
          </button>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-5">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase text-slate-500">Total</p>
          <p className="mt-2 text-4xl font-black text-black">{resumen.total}</p>
          <p className="mt-2 text-sm text-slate-500">Cuotas registradas</p>
        </div>

        <div className="rounded-3xl border border-yellow-200 bg-yellow-50 p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase text-yellow-700">
            Pendientes
          </p>
          <p className="mt-2 text-4xl font-black text-yellow-700">
            {resumen.pendientes}
          </p>
          <p className="mt-2 text-sm text-yellow-700">Por pagar</p>
        </div>

        <div className="rounded-3xl border border-green-200 bg-green-50 p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase text-green-700">Pagadas</p>
          <p className="mt-2 text-4xl font-black text-green-700">
            {resumen.pagadas}
          </p>
          <p className="mt-2 text-sm text-green-700">Cuotas saldadas</p>
        </div>

        <div className="rounded-3xl border border-red-200 bg-red-50 p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase text-red-700">
            Canceladas
          </p>
          <p className="mt-2 text-4xl font-black text-red-700">
            {resumen.canceladas}
          </p>
          <p className="mt-2 text-sm text-red-700">Cuotas anuladas</p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase text-slate-500">
            Pendiente por cobrar
          </p>
          <p className="mt-2 text-3xl font-black text-black">
            {formatoMoneda(resumen.montoPendiente)}
          </p>
          <p className="mt-2 text-sm text-slate-500">Monto pendiente</p>
        </div>
      </section>

      {mostrarFormulario && (
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-widest text-red-600">
                {editandoId ? "Actualizar cuota" : "Nueva cuota"}
              </p>

              <h2 className="text-2xl font-black text-black">
                {editandoId ? "Editar cuota" : "Registrar cuota"}
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

          <form onSubmit={guardarCuota} className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Venta
              </label>

              <select
                name="id_venta_vehiculo"
                value={form.id_venta_vehiculo}
                onChange={handleChange}
                className="h-12 w-full rounded-xl border border-slate-300 px-4 outline-none transition focus:border-red-600"
                required
              >
                <option value="">Selecciona una venta</option>

                {ventas.map((venta) => (
                  <option key={obtenerIdVenta(venta)} value={obtenerIdVenta(venta)}>
                    {obtenerVentaTexto(venta)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Plan de financiamiento
              </label>

              <select
                name="id_plan_financiamiento"
                value={form.id_plan_financiamiento}
                onChange={handleChange}
                className="h-12 w-full rounded-xl border border-slate-300 px-4 outline-none transition focus:border-red-600"
                required
              >
                <option value="">Selecciona un plan</option>

                {planes.map((plan) => (
                  <option
                    key={plan.id_plan_financiamiento || plan.id}
                    value={plan.id_plan_financiamiento || plan.id}
                  >
                    {plan.nombre || `Plan ${plan.id_plan_financiamiento || plan.id}`} ·{" "}
                    {plan.numero_cuotas || plan.cantidad_cuotas || 0} cuotas ·{" "}
                    {plan.tasa_interes}% interés
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Número de cuota
              </label>

              <input
                type="number"
                name="numero_cuota"
                placeholder="1"
                value={form.numero_cuota}
                onChange={handleChange}
                className="h-12 w-full rounded-xl border border-slate-300 px-4 outline-none transition focus:border-red-600"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Fecha de vencimiento
              </label>

              <input
                type="date"
                name="fecha_vencimiento"
                value={form.fecha_vencimiento}
                onChange={handleChange}
                className="h-12 w-full rounded-xl border border-slate-300 px-4 outline-none transition focus:border-red-600"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Monto
              </label>

              <input
                type="number"
                name="monto"
                placeholder="500"
                value={form.monto}
                onChange={handleChange}
                className="h-12 w-full rounded-xl border border-slate-300 px-4 outline-none transition focus:border-red-600"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Estado
              </label>

              <select
                name="estado"
                value={form.estado}
                onChange={handleChange}
                className="h-12 w-full rounded-xl border border-slate-300 px-4 outline-none transition focus:border-red-600"
                required
              >
                <option value="pendiente">Pendiente</option>
                <option value="pagado">Pagado</option>
                <option value="cancelado">Cancelado</option>
              </select>
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
                    ? "Actualizar cuota"
                    : "Guardar cuota"}
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
        <div className="mb-6 grid gap-4 lg:grid-cols-[1fr_220px]">
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Buscar cuota
            </label>

            <input
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por cliente, número, estado, monto, venta o plan..."
              className="h-12 w-full rounded-xl border border-slate-300 px-4 outline-none transition focus:border-red-600"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Estado
            </label>

            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="h-12 w-full rounded-xl border border-slate-300 px-4 outline-none transition focus:border-red-600"
            >
              <option value="todos">Todos</option>
              <option value="pendiente">Pendiente</option>
              <option value="pagado">Pagado</option>
              <option value="cancelado">Cancelado</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-200">
          <table className="min-w-[1200px] w-full border-collapse">
            <thead className="bg-black text-white">
              <tr className="text-left text-sm">
                <th className="p-4">ID</th>
                <th className="p-4">N° cuota</th>
                <th className="p-4">Cliente</th>
                <th className="p-4">Venta</th>
                <th className="p-4">Vencimiento</th>
                <th className="p-4">Monto</th>
                <th className="p-4">Estado</th>
                <th className="p-4">Plan</th>
                <th className="p-4">Acciones</th>
              </tr>
            </thead>

            <tbody>
              {cuotasFiltradas.length > 0 ? (
                cuotasFiltradas.map((cuota) => {
                  const id = cuota.id_cuota || cuota.id;

                  return (
                    <tr
                      key={id}
                      className="border-b text-sm transition hover:bg-slate-50"
                    >
                      <td className="p-4 font-bold text-slate-700">#{id}</td>

                      <td className="p-4 font-black text-black">
                        {cuota.numero_cuota || cuota.numero}
                      </td>

                      <td className="p-4 font-bold text-black">
                        {cuota.cliente || "Sin cliente"}
                      </td>

                      <td className="p-4 text-slate-600">
                        #{cuota.id_venta_vehiculo || "Sin venta"}
                      </td>

                      <td className="p-4 text-slate-600">
                        {formatearFecha(cuota.fecha_vencimiento)}
                      </td>

                      <td className="p-4 font-black text-red-600">
                        {formatoMoneda(cuota.monto)}
                      </td>

                      <td className="p-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold ${obtenerBadgeEstado(
                            cuota.estado
                          )}`}
                        >
                          {cuota.estado || "Sin estado"}
                        </span>
                      </td>

                      <td className="p-4 text-slate-600">
                        {obtenerNombrePlan(cuota.id_plan_financiamiento)}
                      </td>

                      <td className="p-4">
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => verDetalle(cuota)}
                            disabled={cargandoDetalle}
                            className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-200 disabled:opacity-60"
                          >
                            Ver
                          </button>

                          <button
                            onClick={() => editarCuota(cuota)}
                            disabled={cargandoDetalle}
                            className="rounded-lg bg-black px-3 py-2 text-xs font-bold text-white transition hover:bg-red-600 disabled:opacity-60"
                          >
                            Editar
                          </button>

                          <button
                            onClick={() => setCuotaEliminar(cuota)}
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
                  <td colSpan="9" className="p-10 text-center">
                    <div className="mx-auto max-w-md">
                      <p className="text-4xl">📆</p>

                      <h3 className="mt-3 text-xl font-black text-black">
                        No hay cuotas para mostrar
                      </h3>

                      <p className="mt-2 text-sm text-slate-500">
                        No se encontraron cuotas con la búsqueda o filtro actual.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {cuotaDetalle && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-3xl rounded-3xl bg-white p-6 shadow-2xl">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-bold uppercase tracking-widest text-red-600">
                  Detalle de cuota
                </p>

                <h2 className="text-2xl font-black text-black">
                  Cuota #{cuotaDetalle.numero_cuota || cuotaDetalle.numero}
                </h2>

                <p className="mt-1 text-slate-500">
                  {cuotaDetalle.cliente || "Sin cliente"}
                </p>
              </div>

              <button
                onClick={() => setCuotaDetalle(null)}
                className="rounded-xl bg-slate-100 px-4 py-2 font-bold text-slate-700 hover:bg-slate-200"
              >
                ✕
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-bold uppercase text-slate-500">ID</p>
                <p className="mt-1 font-bold text-black">
                  #{cuotaDetalle.id_cuota || cuotaDetalle.id}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-bold uppercase text-slate-500">Cliente</p>
                <p className="mt-1 font-bold text-black">
                  {cuotaDetalle.cliente || "Sin cliente"}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-bold uppercase text-slate-500">Venta</p>
                <p className="mt-1 font-bold text-black">
                  #{cuotaDetalle.id_venta_vehiculo || "Sin venta"}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-bold uppercase text-slate-500">Plan</p>
                <p className="mt-1 font-bold text-black">
                  {obtenerNombrePlan(cuotaDetalle.id_plan_financiamiento)}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-bold uppercase text-slate-500">
                  Vencimiento
                </p>
                <p className="mt-1 font-bold text-black">
                  {formatearFecha(cuotaDetalle.fecha_vencimiento)}
                </p>
              </div>

              <div className="rounded-2xl bg-red-50 p-4">
                <p className="text-xs font-bold uppercase text-red-700">Monto</p>
                <p className="mt-1 text-xl font-black text-red-700">
                  {formatoMoneda(cuotaDetalle.monto)}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4 md:col-span-2">
                <p className="text-xs font-bold uppercase text-slate-500">Estado</p>
                <p className="mt-1 font-bold text-black">
                  {cuotaDetalle.estado || "Sin estado"}
                </p>
              </div>
            </div>

            <div className="mt-6 rounded-2xl bg-yellow-50 p-4 text-sm text-yellow-800">
              Nota: cuando se registra un pago asociado a esta cuota, el backend
              puede marcarla automáticamente como pagada.
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setCuotaDetalle(null)}
                className="rounded-xl bg-black px-5 py-3 font-bold text-white transition hover:bg-red-600"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {cuotaEliminar && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <div className="mb-4 text-5xl">⚠️</div>

            <h2 className="text-2xl font-black text-black">
              ¿Eliminar cuota?
            </h2>

            <p className="mt-2 text-sm text-slate-600">
              Esta acción eliminará la cuota #
              {cuotaEliminar.numero_cuota || cuotaEliminar.numero}. No se puede
              deshacer.
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button
                onClick={confirmarEliminarCuota}
                className="flex-1 rounded-xl bg-red-600 px-5 py-3 font-bold text-white transition hover:bg-red-700"
              >
                Sí, eliminar
              </button>

              <button
                onClick={() => setCuotaEliminar(null)}
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