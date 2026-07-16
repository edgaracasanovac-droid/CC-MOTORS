import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import api from "../../lib/api";
import { esFechaValida, esNumeroMayorQueCero, esTextoValido, obtenerIdValido, obtenerMensajeError } from "../../lib/validaciones";

export default function PagosList() {
  const [pagos, setPagos] = useState([]);
  const [ventas, setVentas] = useState([]);
  const [cuotas, setCuotas] = useState([]);
  const [usuarios, setUsuarios] = useState([]);

  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  const [pagoDetalle, setPagoDetalle] = useState(null);
  const [pagoEliminar, setPagoEliminar] = useState(null);

  const [busqueda, setBusqueda] = useState("");
  const [filtroMetodo, setFiltroMetodo] = useState("todos");
  const [filtroEstado, setFiltroEstado] = useState("todos");

  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [cargandoDetalle, setCargandoDetalle] = useState(false);
  const [error, setError] = useState("");

  const fechaHoy = new Date().toISOString().slice(0, 10);

  const [form, setForm] = useState({
    fecha: fechaHoy,
    id_usuario: "",
    id_venta_vehiculo: "",
    id_cuota: "",
    monto: "",
    metodo_pago: "transferencia",
    referencia: "",
    estado: "pendiente",
  });

  const obtenerArray = (respuesta) => {
    if (Array.isArray(respuesta.data)) return respuesta.data;
    if (Array.isArray(respuesta.data?.pagos)) return respuesta.data.pagos;
    if (Array.isArray(respuesta.data?.ventas)) return respuesta.data.ventas;
    if (Array.isArray(respuesta.data?.cuotas)) return respuesta.data.cuotas;
    if (Array.isArray(respuesta.data?.usuarios)) return respuesta.data.usuarios;
    return [];
  };

  const cargarDatos = async () => {
    setCargando(true);
    setError("");

    try {
      const [pagosRes, ventasRes, cuotasRes, usuariosRes] = await Promise.all([
        api.get("/pagos"),
        api.get("/ventas"),
        api.get("/cuotas"),
        api.get("/usuarios"),
      ]);

      setPagos(obtenerArray(pagosRes));
      setVentas(obtenerArray(ventasRes));
      setCuotas(obtenerArray(cuotasRes));
      setUsuarios(obtenerArray(usuariosRes));
    } catch (error) {
      console.error(error.response?.data || error);
      setError("Error al cargar los pagos.");
      toast.error("Error al cargar pagos");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const limpiarFormulario = () => {
    setForm({
      fecha: fechaHoy,
      id_usuario: "",
      id_venta_vehiculo: "",
      id_cuota: "",
      monto: "",
      metodo_pago: "transferencia",
      referencia: "",
      estado: "pendiente",
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
    if (!fecha) return fechaHoy;
    return String(fecha).slice(0, 10);
  };

  const obtenerNombreCliente = (pago) => {
    return pago.cliente || pago.nombre_cliente || "Sin cliente";
  };

  const obtenerNombreVenta = (pago) => {
    if (pago.marca || pago.modelo || pago.vehiculo) {
      return `${pago.marca || ""} ${pago.modelo || ""} ${
        pago.vehiculo ? `- ${pago.vehiculo}` : ""
      }`.trim();
    }

    return pago.venta || pago.id_venta || pago.id_venta_vehiculo || "Sin venta";
  };

  const obtenerVentaTexto = (venta) => {
    const cliente = venta.cliente || "Sin cliente";
    const vehiculo =
      venta.nombre_marca || venta.nombre_modelo
        ? `${venta.nombre_marca || ""} ${venta.nombre_modelo || ""}`.trim()
        : venta.vehiculo || "Vehículo";

    return `${cliente} · ${vehiculo} · ${formatoMoneda(venta.precio_final)}`;
  };

  const obtenerCuotaTexto = (cuota) => {
    const numero = cuota.numero_cuota || cuota.numero || cuota.id_cuota;
    const cliente = cuota.cliente || "Sin cliente";
    const monto = formatoMoneda(cuota.monto);

    return `Cuota #${numero} · ${cliente} · ${monto} · ${cuota.estado}`;
  };

  const obtenerBadgeEstado = (estado) => {
    const estadoNormalizado = String(estado || "").toLowerCase();

    if (
      estadoNormalizado === "confirmado" ||
      estadoNormalizado === "pagado" ||
      estadoNormalizado === "aprobado"
    ) {
      return "bg-green-100 text-green-800";
    }

    if (estadoNormalizado === "pendiente") {
      return "bg-yellow-100 text-yellow-800";
    }

    if (
      estadoNormalizado === "rechazado" ||
      estadoNormalizado === "cancelado" ||
      estadoNormalizado === "fallido"
    ) {
      return "bg-red-100 text-red-800";
    }

    return "bg-slate-100 text-slate-700";
  };

  const obtenerBadgeMetodo = (metodo) => {
    const metodoNormalizado = String(metodo || "").toLowerCase();

    if (metodoNormalizado === "transferencia") {
      return "bg-black text-white";
    }

    if (metodoNormalizado === "efectivo") {
      return "bg-green-100 text-green-800";
    }

    if (metodoNormalizado === "pago_movil") {
      return "bg-red-100 text-red-700";
    }

    if (metodoNormalizado === "tarjeta") {
      return "bg-blue-100 text-blue-700";
    }

    return "bg-slate-100 text-slate-700";
  };

  const prepararDatos = () => {
    const datos = {
      fecha: form.fecha,
      monto: Number(form.monto),
      metodo_pago: form.metodo_pago,
      referencia: form.referencia.trim(),
      id_usuario: Number(form.id_usuario),
      id_venta_vehiculo: Number(form.id_venta_vehiculo),
      id_cuota: form.id_cuota ? Number(form.id_cuota) : null,
    };

    if (editandoId) {
      datos.estado = form.estado || "pendiente";
    }

    return datos;
  };

  const guardarPago = async (e) => {
    e.preventDefault();
    setGuardando(true);
    setError("");

    const datosPago = prepararDatos();

    if (!obtenerIdValido(datosPago.id_usuario)) {
      setError("Debe seleccionar un usuario válido");
      toast.error("Debe seleccionar un usuario válido");
      setGuardando(false);
      return;
    }

    if (!obtenerIdValido(datosPago.id_venta_vehiculo)) {
      setError("Debe seleccionar una venta válida");
      toast.error("Debe seleccionar una venta válida");
      setGuardando(false);
      return;
    }

    if (!esNumeroMayorQueCero(datosPago.monto)) {
      setError("El monto debe ser mayor que cero");
      toast.error("El monto debe ser mayor que cero");
      setGuardando(false);
      return;
    }

    if (!esTextoValido(datosPago.metodo_pago)) {
      setError("El método de pago es obligatorio");
      toast.error("El método de pago es obligatorio");
      setGuardando(false);
      return;
    }

    if (!esTextoValido(datosPago.fecha) || !esFechaValida(datosPago.fecha)) {
      setError("La fecha es obligatoria y debe ser válida");
      toast.error("La fecha es obligatoria y debe ser válida");
      setGuardando(false);
      return;
    }

    if (!esTextoValido(datosPago.referencia) && form.metodo_pago !== "efectivo") {
      setError("La referencia es obligatoria para este método de pago");
      toast.error("La referencia es obligatoria para este método de pago");
      setGuardando(false);
      return;
    }

    try {
      if (editandoId) {
        await api.put(`/pagos/${editandoId}`, datosPago);
        toast.success("Pago actualizado correctamente");
      } else {
        await api.post("/pagos", datosPago);
        toast.success("Pago registrado correctamente");
      }

      limpiarFormulario();
      await cargarDatos();
    } catch (error) {
      const mensaje = obtenerMensajeError(error, "Error al guardar el pago");

      setError(mensaje);
      toast.error(mensaje);
    } finally {
      setGuardando(false);
    }
  };

  const editarPago = async (pago) => {
    const id = pago.id_pago || pago.id;
    setCargandoDetalle(true);

    try {
      const respuesta = await api.get(`/pagos/${id}`);
      const detalle = respuesta.data?.pago || respuesta.data;

      setEditandoId(id);
      setMostrarFormulario(true);

      setForm({
        fecha: formatearInputFecha(detalle.fecha_pago || detalle.fecha || pago.fecha_pago || pago.fecha),
        id_usuario: detalle.id_usuario || pago.id_usuario || "",
        id_venta_vehiculo:
          detalle.id_venta_vehiculo ||
          detalle.id_venta ||
          detalle.venta ||
          pago.id_venta_vehiculo ||
          pago.id_venta ||
          pago.venta ||
          "",
        id_cuota: detalle.id_cuota || pago.id_cuota || "",
        monto: detalle.monto || pago.monto || "",
        metodo_pago: detalle.metodo_pago || pago.metodo_pago || "transferencia",
        referencia: detalle.referencia || pago.referencia || "",
        estado: detalle.estado || pago.estado || "pendiente",
      });

      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      console.error(error.response?.data || error);
      toast.error("Error al cargar el pago");
    } finally {
      setCargandoDetalle(false);
    }
  };

  const verDetalle = async (pago) => {
    const id = pago.id_pago || pago.id;
    setCargandoDetalle(true);

    try {
      const respuesta = await api.get(`/pagos/${id}`);
      setPagoDetalle(respuesta.data?.pago || respuesta.data);
    } catch (error) {
      console.error(error.response?.data || error);
      toast.error("Error al cargar el detalle del pago");
    } finally {
      setCargandoDetalle(false);
    }
  };

  const confirmarEliminarPago = async () => {
    if (!pagoEliminar) return;

    const id = pagoEliminar.id_pago || pagoEliminar.id;

    try {
      await api.delete(`/pagos/${id}`);
      toast.success("Pago eliminado correctamente");
      setPagoEliminar(null);
      await cargarDatos();
    } catch (error) {
      console.error(error.response?.data || error);

      const mensaje =
        error.response?.data?.mensaje ||
        error.response?.data?.error ||
        error.response?.data?.message ||
        "Error al eliminar el pago";

      toast.error(mensaje);
    }
  };

  const pagosFiltrados = useMemo(() => {
    const texto = busqueda.toLowerCase().trim();

    return pagos.filter((pago) => {
      const cliente = obtenerNombreCliente(pago).toLowerCase();
      const venta = String(obtenerNombreVenta(pago)).toLowerCase();
      const monto = String(pago.monto || "");
      const metodo = String(pago.metodo_pago || "").toLowerCase();
      const referencia = String(pago.referencia || "").toLowerCase();
      const estado = String(pago.estado || "").toLowerCase();
      const id = String(pago.id_pago || pago.id || "");

      const coincideBusqueda =
        !texto ||
        cliente.includes(texto) ||
        venta.includes(texto) ||
        monto.includes(texto) ||
        metodo.includes(texto) ||
        referencia.includes(texto) ||
        estado.includes(texto) ||
        id.includes(texto);

      const coincideMetodo = filtroMetodo === "todos" || metodo === filtroMetodo;
      const coincideEstado = filtroEstado === "todos" || estado === filtroEstado;

      return coincideBusqueda && coincideMetodo && coincideEstado;
    });
  }, [pagos, busqueda, filtroMetodo, filtroEstado]);

  const resumen = useMemo(() => {
    const totalPagado = pagos.reduce((total, pago) => {
      return total + Number(pago.monto || 0);
    }, 0);

    const pendientes = pagos.filter(
      (pago) => pago.estado?.toLowerCase() === "pendiente"
    ).length;

    const confirmados = pagos.filter((pago) => {
      const estado = pago.estado?.toLowerCase();
      return estado === "confirmado" || estado === "pagado" || estado === "aprobado";
    }).length;

    const conCuota = pagos.filter((pago) => pago.id_cuota).length;

    return {
      total: pagos.length,
      totalPagado,
      pendientes,
      confirmados,
      conCuota,
    };
  }, [pagos]);

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
              Finanzas CC Motors
            </p>

            <h2 className="text-3xl font-black">Gestión de Pagos</h2>

            <p className="mt-2 max-w-2xl text-slate-300">
              Registra y administra pagos asociados a ventas o cuotas. Cuando un
              pago se asocia a una cuota, el backend puede actualizar su estado automáticamente.
            </p>
          </div>

          <button
            onClick={abrirNuevo}
            className="rounded-2xl bg-red-600 px-6 py-4 font-bold text-white transition hover:bg-red-700"
          >
            + Nuevo pago
          </button>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-5">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase text-slate-500">Total</p>
          <p className="mt-2 text-4xl font-black text-black">{resumen.total}</p>
          <p className="mt-2 text-sm text-slate-500">Pagos registrados</p>
        </div>

        <div className="rounded-3xl border border-red-200 bg-red-50 p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase text-red-700">Monto total</p>
          <p className="mt-2 text-3xl font-black text-red-700">
            {formatoMoneda(resumen.totalPagado)}
          </p>
          <p className="mt-2 text-sm text-red-700">Pagos recibidos</p>
        </div>

        <div className="rounded-3xl border border-green-200 bg-green-50 p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase text-green-700">
            Confirmados
          </p>
          <p className="mt-2 text-4xl font-black text-green-700">
            {resumen.confirmados}
          </p>
          <p className="mt-2 text-sm text-green-700">Pagos válidos</p>
        </div>

        <div className="rounded-3xl border border-yellow-200 bg-yellow-50 p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase text-yellow-700">
            Pendientes
          </p>
          <p className="mt-2 text-4xl font-black text-yellow-700">
            {resumen.pendientes}
          </p>
          <p className="mt-2 text-sm text-yellow-700">Por confirmar</p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase text-slate-500">
            Con cuota
          </p>
          <p className="mt-2 text-4xl font-black text-black">{resumen.conCuota}</p>
          <p className="mt-2 text-sm text-slate-500">Asociados a financiamiento</p>
        </div>
      </section>

      {mostrarFormulario && (
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-widest text-red-600">
                {editandoId ? "Actualizar pago" : "Nuevo pago"}
              </p>

              <h2 className="text-2xl font-black text-black">
                {editandoId ? "Editar pago" : "Registrar pago"}
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

          <form onSubmit={guardarPago} className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Fecha
              </label>
              <input
                type="date"
                name="fecha"
                value={form.fecha}
                onChange={handleChange}
                className="h-12 w-full rounded-xl border border-slate-300 px-4 outline-none transition focus:border-red-600"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Usuario responsable
              </label>
              <select
                name="id_usuario"
                value={form.id_usuario}
                onChange={handleChange}
                className="h-12 w-full rounded-xl border border-slate-300 px-4 outline-none transition focus:border-red-600"
                required
              >
                <option value="">Selecciona un usuario</option>

                {usuarios.map((usuario) => (
                  <option
                    key={usuario.id_usuario || usuario.id}
                    value={usuario.id_usuario || usuario.id}
                  >
                    {usuario.nombre} {usuario.apellido} · {usuario.rol || "usuario"}
                  </option>
                ))}
              </select>
            </div>

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
                  <option
                    key={venta.id_venta || venta.id}
                    value={venta.id_venta || venta.id}
                  >
                    #{venta.id_venta || venta.id} · {obtenerVentaTexto(venta)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Cuota
              </label>
              <select
                name="id_cuota"
                value={form.id_cuota}
                onChange={handleChange}
                className="h-12 w-full rounded-xl border border-slate-300 px-4 outline-none transition focus:border-red-600"
              >
                <option value="">Sin cuota asociada</option>

                {cuotas.map((cuota) => (
                  <option key={cuota.id_cuota || cuota.id} value={cuota.id_cuota || cuota.id}>
                    {obtenerCuotaTexto(cuota)}
                  </option>
                ))}
              </select>

              <p className="mt-2 text-xs text-slate-500">
                Si asocias una cuota, el backend puede marcarla como pagada.
              </p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Monto
              </label>
              <input
                type="number"
                name="monto"
                placeholder="1500"
                value={form.monto}
                onChange={handleChange}
                className="h-12 w-full rounded-xl border border-slate-300 px-4 outline-none transition focus:border-red-600"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Método de pago
              </label>
              <select
                name="metodo_pago"
                value={form.metodo_pago}
                onChange={handleChange}
                className="h-12 w-full rounded-xl border border-slate-300 px-4 outline-none transition focus:border-red-600"
                required
              >
                <option value="transferencia">Transferencia</option>
                <option value="efectivo">Efectivo</option>
                <option value="pago_movil">Pago móvil</option>
                <option value="tarjeta">Tarjeta</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Referencia
              </label>
              <input
                name="referencia"
                placeholder="ABC123"
                value={form.referencia}
                onChange={handleChange}
                className="h-12 w-full rounded-xl border border-slate-300 px-4 outline-none transition focus:border-red-600"
                required
              />
            </div>

            {editandoId && (
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Estado
                </label>
                <input
                  name="estado"
                  placeholder="pendiente"
                  value={form.estado}
                  onChange={handleChange}
                  className="h-12 w-full rounded-xl border border-slate-300 px-4 outline-none transition focus:border-red-600"
                />

                <p className="mt-2 text-xs text-slate-500">
                  El backend no valida estados fijos para pagos.
                </p>
              </div>
            )}

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
                    ? "Actualizar pago"
                    : "Guardar pago"}
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
        <div className="mb-6 grid gap-4 lg:grid-cols-[1fr_220px_220px]">
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Buscar pago
            </label>

            <input
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por cliente, venta, método, referencia, monto, estado o ID..."
              className="h-12 w-full rounded-xl border border-slate-300 px-4 outline-none transition focus:border-red-600"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Método
            </label>

            <select
              value={filtroMetodo}
              onChange={(e) => setFiltroMetodo(e.target.value)}
              className="h-12 w-full rounded-xl border border-slate-300 px-4 outline-none transition focus:border-red-600"
            >
              <option value="todos">Todos</option>
              <option value="transferencia">Transferencia</option>
              <option value="efectivo">Efectivo</option>
              <option value="pago_movil">Pago móvil</option>
              <option value="tarjeta">Tarjeta</option>
            </select>
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
              <option value="confirmado">Confirmado</option>
              <option value="pagado">Pagado</option>
              <option value="rechazado">Rechazado</option>
              <option value="cancelado">Cancelado</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-200">
          <table className="min-w-[1200px] w-full border-collapse">
            <thead className="bg-black text-white">
              <tr className="text-left text-sm">
                <th className="p-4">ID</th>
                <th className="p-4">Fecha</th>
                <th className="p-4">Cliente</th>
                <th className="p-4">Venta</th>
                <th className="p-4">Monto</th>
                <th className="p-4">Método</th>
                <th className="p-4">Referencia</th>
                <th className="p-4">Estado</th>
                <th className="p-4">Acciones</th>
              </tr>
            </thead>

            <tbody>
              {pagosFiltrados.length > 0 ? (
                pagosFiltrados.map((pago) => {
                  const id = pago.id_pago || pago.id;

                  return (
                    <tr
                      key={id}
                      className="border-b text-sm transition hover:bg-slate-50"
                    >
                      <td className="p-4 font-bold text-slate-700">#{id}</td>

                      <td className="p-4 text-slate-600">
                        {formatearFecha(pago.fecha_pago || pago.fecha)}
                      </td>

                      <td className="p-4 font-bold text-black">
                        {obtenerNombreCliente(pago)}
                      </td>

                      <td className="p-4 text-slate-600">
                        {obtenerNombreVenta(pago)}
                      </td>

                      <td className="p-4 font-black text-red-600">
                        {formatoMoneda(pago.monto)}
                      </td>

                      <td className="p-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold ${obtenerBadgeMetodo(
                            pago.metodo_pago
                          )}`}
                        >
                          {pago.metodo_pago || "Sin método"}
                        </span>
                      </td>

                      <td className="p-4 text-slate-600">
                        {pago.referencia || "Sin referencia"}
                      </td>

                      <td className="p-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold ${obtenerBadgeEstado(
                            pago.estado
                          )}`}
                        >
                          {pago.estado || "Sin estado"}
                        </span>
                      </td>

                      <td className="p-4">
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => verDetalle(pago)}
                            disabled={cargandoDetalle}
                            className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-200 disabled:opacity-60"
                          >
                            Ver
                          </button>

                          <button
                            onClick={() => editarPago(pago)}
                            disabled={cargandoDetalle}
                            className="rounded-lg bg-black px-3 py-2 text-xs font-bold text-white transition hover:bg-red-600 disabled:opacity-60"
                          >
                            Editar
                          </button>

                          <button
                            onClick={() => setPagoEliminar(pago)}
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
                      <p className="text-4xl">💳</p>
                      <h3 className="mt-3 text-xl font-black text-black">
                        No hay pagos para mostrar
                      </h3>
                      <p className="mt-2 text-sm text-slate-500">
                        No se encontraron registros con la búsqueda o filtros actuales.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {pagoDetalle && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-3xl rounded-3xl bg-white p-6 shadow-2xl">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-bold uppercase tracking-widest text-red-600">
                  Detalle de pago
                </p>

                <h2 className="text-2xl font-black text-black">
                  Pago #{pagoDetalle.id_pago || pagoDetalle.id}
                </h2>

                <p className="mt-1 text-slate-500">
                  {obtenerNombreCliente(pagoDetalle)}
                </p>
              </div>

              <button
                onClick={() => setPagoDetalle(null)}
                className="rounded-xl bg-slate-100 px-4 py-2 font-bold text-slate-700 hover:bg-slate-200"
              >
                ✕
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-bold uppercase text-slate-500">Fecha</p>
                <p className="mt-1 font-bold text-black">
                  {formatearFecha(pagoDetalle.fecha_pago || pagoDetalle.fecha)}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-bold uppercase text-slate-500">Cliente</p>
                <p className="mt-1 font-bold text-black">
                  {obtenerNombreCliente(pagoDetalle)}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-bold uppercase text-slate-500">Venta</p>
                <p className="mt-1 font-bold text-black">
                  {obtenerNombreVenta(pagoDetalle)}
                </p>
              </div>

              <div className="rounded-2xl bg-red-50 p-4">
                <p className="text-xs font-bold uppercase text-red-700">Monto</p>
                <p className="mt-1 text-xl font-black text-red-700">
                  {formatoMoneda(pagoDetalle.monto)}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-bold uppercase text-slate-500">Método</p>
                <p className="mt-1 font-bold text-black">
                  {pagoDetalle.metodo_pago || "Sin método"}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-bold uppercase text-slate-500">
                  Referencia
                </p>
                <p className="mt-1 font-bold text-black">
                  {pagoDetalle.referencia || "Sin referencia"}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4 md:col-span-2">
                <p className="text-xs font-bold uppercase text-slate-500">Estado</p>
                <p className="mt-1 font-bold text-black">
                  {pagoDetalle.estado || "Sin estado"}
                </p>
              </div>
            </div>

            <div className="mt-6 rounded-2xl bg-yellow-50 p-4 text-sm text-yellow-800">
              Nota: al registrar un pago asociado a una cuota, el backend puede
              marcar esa cuota como pagada y actualizar la venta si corresponde.
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setPagoDetalle(null)}
                className="rounded-xl bg-black px-5 py-3 font-bold text-white transition hover:bg-red-600"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {pagoEliminar && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <div className="mb-4 text-5xl">⚠️</div>

            <h2 className="text-2xl font-black text-black">
              ¿Eliminar pago?
            </h2>

            <p className="mt-2 text-sm text-slate-600">
              Esta acción eliminará el pago #{pagoEliminar.id_pago || pagoEliminar.id}.
              No se puede deshacer.
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button
                onClick={confirmarEliminarPago}
                className="flex-1 rounded-xl bg-red-600 px-5 py-3 font-bold text-white transition hover:bg-red-700"
              >
                Sí, eliminar
              </button>

              <button
                onClick={() => setPagoEliminar(null)}
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