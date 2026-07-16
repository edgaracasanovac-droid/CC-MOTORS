import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import api from "../../lib/api";
import { esCorreoValido, esTextoValido, obtenerMensajeError } from "../../lib/validaciones";

export default function ProveedoresList() {
  const [proveedores, setProveedores] = useState([]);

  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  const [proveedorDetalle, setProveedorDetalle] = useState(null);
  const [proveedorEliminar, setProveedorEliminar] = useState(null);

  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("todos");

  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [cargandoDetalle, setCargandoDetalle] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    nombre: "",
    identificacion_fiscal: "",
    telefono: "",
    correo: "",
    direccion: "",
    estado: "activo",
  });

  const obtenerArray = (respuesta) => {
    if (Array.isArray(respuesta.data)) return respuesta.data;
    if (Array.isArray(respuesta.data?.proveedores)) {
      return respuesta.data.proveedores;
    }

    return [];
  };

  const cargarProveedores = async () => {
    setCargando(true);
    setError("");

    try {
      const respuesta = await api.get("/proveedores");
      setProveedores(obtenerArray(respuesta));
    } catch (error) {
      console.error(error.response?.data || error);
      setError("Error al cargar los proveedores.");
      toast.error("Error al cargar proveedores");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarProveedores();
  }, []);

  const limpiarFormulario = () => {
    setForm({
      nombre: "",
      identificacion_fiscal: "",
      telefono: "",
      correo: "",
      direccion: "",
      estado: "activo",
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

  const obtenerIdProveedor = (proveedor) => {
    return proveedor.id_proveedor || proveedor.id;
  };

  const prepararDatos = () => {
    return {
      nombre: form.nombre.trim(),
      identificacion_fiscal: form.identificacion_fiscal.trim(),
      telefono: form.telefono.trim(),
      correo: form.correo.trim(),
      direccion: form.direccion.trim(),
      estado: form.estado || "activo",
    };
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

  const obtenerBadgeEstado = (estado) => {
    const estadoNormalizado = String(estado || "").toLowerCase();

    if (estadoNormalizado === "activo") {
      return "bg-green-100 text-green-800";
    }

    if (estadoNormalizado === "inactivo") {
      return "bg-red-100 text-red-800";
    }

    return "bg-slate-100 text-slate-700";
  };

  const guardarProveedor = async (e) => {
    e.preventDefault();
    setGuardando(true);
    setError("");

    const datosProveedor = prepararDatos();

    if (!esTextoValido(datosProveedor.nombre)) {
      setError("El nombre del proveedor es obligatorio");
      toast.error("El nombre del proveedor es obligatorio");
      setGuardando(false);
      return;
    }

    if (!esTextoValido(datosProveedor.identificacion_fiscal)) {
      setError("La identificación fiscal es obligatoria");
      toast.error("La identificación fiscal es obligatoria");
      setGuardando(false);
      return;
    }

    if (!esTextoValido(datosProveedor.telefono)) {
      setError("El teléfono es obligatorio");
      toast.error("El teléfono es obligatorio");
      setGuardando(false);
      return;
    }

    if (!esCorreoValido(datosProveedor.correo)) {
      setError("El correo debe tener formato válido");
      toast.error("El correo debe tener formato válido");
      setGuardando(false);
      return;
    }

    if (!esTextoValido(datosProveedor.direccion)) {
      setError("La dirección es obligatoria");
      toast.error("La dirección es obligatoria");
      setGuardando(false);
      return;
    }

    try {
      if (editandoId) {
        await api.put(`/proveedores/${editandoId}`, datosProveedor);
        toast.success("Proveedor actualizado correctamente");
      } else {
        await api.post("/proveedores", datosProveedor);
        toast.success("Proveedor registrado correctamente");
      }

      limpiarFormulario();
      await cargarProveedores();
    } catch (error) {
      const mensaje = obtenerMensajeError(error, "Error al guardar el proveedor");

      setError(mensaje);
      toast.error(mensaje);
    } finally {
      setGuardando(false);
    }
  };

  const editarProveedor = (proveedor) => {
    const id = obtenerIdProveedor(proveedor);

    setEditandoId(id);
    setMostrarFormulario(true);

    setForm({
      nombre: proveedor.nombre || "",
      identificacion_fiscal: proveedor.identificacion_fiscal || "",
      telefono: proveedor.telefono || "",
      correo: proveedor.correo || "",
      direccion: proveedor.direccion || "",
      estado: proveedor.estado || "activo",
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const verDetalle = async (proveedor) => {
    const id = obtenerIdProveedor(proveedor);
    setCargandoDetalle(true);

    try {
      const respuesta = await api.get(`/proveedores/${id}`);
      setProveedorDetalle(respuesta.data?.proveedor || respuesta.data);
    } catch (error) {
      console.error(error.response?.data || error);
      toast.error("Error al cargar el detalle del proveedor");
    } finally {
      setCargandoDetalle(false);
    }
  };

  const confirmarEliminarProveedor = async () => {
    if (!proveedorEliminar) return;

    const id = obtenerIdProveedor(proveedorEliminar);

    try {
      await api.delete(`/proveedores/${id}`);
      toast.success("Proveedor eliminado correctamente");
      setProveedorEliminar(null);
      await cargarProveedores();
    } catch (error) {
      console.error(error.response?.data || error);

      const mensaje =
        error.response?.data?.mensaje ||
        error.response?.data?.error ||
        error.response?.data?.message ||
        "Error al eliminar el proveedor";

      toast.error(mensaje);
    }
  };

  const proveedoresFiltrados = useMemo(() => {
    const texto = busqueda.toLowerCase().trim();

    return proveedores.filter((proveedor) => {
      const id = String(obtenerIdProveedor(proveedor) || "");
      const nombre = String(proveedor.nombre || "").toLowerCase();
      const identificacion = String(
        proveedor.identificacion_fiscal || ""
      ).toLowerCase();
      const telefono = String(proveedor.telefono || "").toLowerCase();
      const correo = String(proveedor.correo || "").toLowerCase();
      const direccion = String(proveedor.direccion || "").toLowerCase();
      const estado = String(proveedor.estado || "").toLowerCase();

      const coincideBusqueda =
        !texto ||
        id.includes(texto) ||
        nombre.includes(texto) ||
        identificacion.includes(texto) ||
        telefono.includes(texto) ||
        correo.includes(texto) ||
        direccion.includes(texto) ||
        estado.includes(texto);

      const coincideEstado = filtroEstado === "todos" || estado === filtroEstado;

      return coincideBusqueda && coincideEstado;
    });
  }, [proveedores, busqueda, filtroEstado]);

  const resumen = useMemo(() => {
    const activos = proveedores.filter(
      (proveedor) => proveedor.estado?.toLowerCase() === "activo"
    ).length;

    const inactivos = proveedores.filter(
      (proveedor) => proveedor.estado?.toLowerCase() === "inactivo"
    ).length;

    const conCorreo = proveedores.filter((proveedor) => proveedor.correo).length;
    const conTelefono = proveedores.filter((proveedor) => proveedor.telefono).length;

    return {
      total: proveedores.length,
      activos,
      inactivos,
      conCorreo,
      conTelefono,
    };
  }, [proveedores]);

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
              Inventario CC Motors
            </p>

            <h2 className="text-3xl font-black">Gestión de Proveedores</h2>

            <p className="mt-2 max-w-2xl text-slate-300">
              Administra los proveedores de vehículos que abastecen el inventario
              de la concesionaria.
            </p>
          </div>

          <button
            onClick={abrirNuevo}
            className="rounded-2xl bg-red-600 px-6 py-4 font-bold text-white transition hover:bg-red-700"
          >
            + Nuevo proveedor
          </button>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-5">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase text-slate-500">Total</p>
          <p className="mt-2 text-4xl font-black text-black">{resumen.total}</p>
          <p className="mt-2 text-sm text-slate-500">Proveedores registrados</p>
        </div>

        <div className="rounded-3xl border border-green-200 bg-green-50 p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase text-green-700">Activos</p>
          <p className="mt-2 text-4xl font-black text-green-700">
            {resumen.activos}
          </p>
          <p className="mt-2 text-sm text-green-700">Disponibles</p>
        </div>

        <div className="rounded-3xl border border-red-200 bg-red-50 p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase text-red-700">Inactivos</p>
          <p className="mt-2 text-4xl font-black text-red-700">
            {resumen.inactivos}
          </p>
          <p className="mt-2 text-sm text-red-700">Fuera de uso</p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase text-slate-500">
            Con correo
          </p>
          <p className="mt-2 text-4xl font-black text-black">
            {resumen.conCorreo}
          </p>
          <p className="mt-2 text-sm text-slate-500">Contacto por email</p>
        </div>

        <div className="rounded-3xl border border-yellow-200 bg-yellow-50 p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase text-yellow-700">
            Con teléfono
          </p>
          <p className="mt-2 text-4xl font-black text-yellow-700">
            {resumen.conTelefono}
          </p>
          <p className="mt-2 text-sm text-yellow-700">Contacto directo</p>
        </div>
      </section>

      {mostrarFormulario && (
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-widest text-red-600">
                {editandoId ? "Actualizar proveedor" : "Nuevo proveedor"}
              </p>

              <h2 className="text-2xl font-black text-black">
                {editandoId ? "Editar proveedor" : "Registrar proveedor"}
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

          <form onSubmit={guardarProveedor} className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Nombre
              </label>

              <input
                name="nombre"
                placeholder="Nombre del proveedor"
                value={form.nombre}
                onChange={handleChange}
                className="h-12 w-full rounded-xl border border-slate-300 px-4 outline-none transition focus:border-red-600"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Identificación fiscal
              </label>

              <input
                name="identificacion_fiscal"
                placeholder="RIF, NIT o documento fiscal"
                value={form.identificacion_fiscal}
                onChange={handleChange}
                className="h-12 w-full rounded-xl border border-slate-300 px-4 outline-none transition focus:border-red-600"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Teléfono
              </label>

              <input
                name="telefono"
                placeholder="+58 000-0000000"
                value={form.telefono}
                onChange={handleChange}
                className="h-12 w-full rounded-xl border border-slate-300 px-4 outline-none transition focus:border-red-600"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Correo
              </label>

              <input
                type="email"
                name="correo"
                placeholder="proveedor@correo.com"
                value={form.correo}
                onChange={handleChange}
                className="h-12 w-full rounded-xl border border-slate-300 px-4 outline-none transition focus:border-red-600"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Dirección
              </label>

              <input
                name="direccion"
                placeholder="Dirección del proveedor"
                value={form.direccion}
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
                <option value="activo">Activo</option>
                <option value="inactivo">Inactivo</option>
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
                    ? "Actualizar proveedor"
                    : "Guardar proveedor"}
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
              Buscar proveedor
            </label>

            <input
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por nombre, identificación, teléfono, correo, dirección, estado o ID..."
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
              <option value="activo">Activo</option>
              <option value="inactivo">Inactivo</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-200">
          <table className="min-w-[1200px] w-full border-collapse">
            <thead className="bg-black text-white">
              <tr className="text-left text-sm">
                <th className="p-4">ID</th>
                <th className="p-4">Proveedor</th>
                <th className="p-4">Identificación fiscal</th>
                <th className="p-4">Teléfono</th>
                <th className="p-4">Correo</th>
                <th className="p-4">Estado</th>
                <th className="p-4">Acciones</th>
              </tr>
            </thead>

            <tbody>
              {proveedoresFiltrados.length > 0 ? (
                proveedoresFiltrados.map((proveedor) => {
                  const id = obtenerIdProveedor(proveedor);

                  return (
                    <tr
                      key={id}
                      className="border-b text-sm transition hover:bg-slate-50"
                    >
                      <td className="p-4 font-bold text-slate-700">#{id}</td>

                      <td className="p-4">
                        <p className="font-black text-black">
                          {proveedor.nombre || "Sin nombre"}
                        </p>
                        <p className="max-w-xs truncate text-xs text-slate-500">
                          {proveedor.direccion || "Sin dirección"}
                        </p>
                      </td>

                      <td className="p-4 font-bold text-slate-700">
                        {proveedor.identificacion_fiscal || "Sin identificación"}
                      </td>

                      <td className="p-4 text-slate-600">
                        {proveedor.telefono || "Sin teléfono"}
                      </td>

                      <td className="p-4 text-slate-600">
                        {proveedor.correo || "Sin correo"}
                      </td>

                      <td className="p-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold ${obtenerBadgeEstado(
                            proveedor.estado
                          )}`}
                        >
                          {proveedor.estado || "Sin estado"}
                        </span>
                      </td>

                      <td className="p-4">
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => verDetalle(proveedor)}
                            disabled={cargandoDetalle}
                            className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-200 disabled:opacity-60"
                          >
                            Ver
                          </button>

                          <button
                            onClick={() => editarProveedor(proveedor)}
                            className="rounded-lg bg-black px-3 py-2 text-xs font-bold text-white transition hover:bg-red-600"
                          >
                            Editar
                          </button>

                          <button
                            onClick={() => setProveedorEliminar(proveedor)}
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
                  <td colSpan="7" className="p-10 text-center">
                    <div className="mx-auto max-w-md">
                      <p className="text-4xl">🚚</p>

                      <h3 className="mt-3 text-xl font-black text-black">
                        No hay proveedores para mostrar
                      </h3>

                      <p className="mt-2 text-sm text-slate-500">
                        No se encontraron proveedores con la búsqueda o filtro actual.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {proveedorDetalle && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-3xl rounded-3xl bg-white p-6 shadow-2xl">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-bold uppercase tracking-widest text-red-600">
                  Detalle de proveedor
                </p>

                <h2 className="text-2xl font-black text-black">
                  {proveedorDetalle.nombre || "Proveedor"}
                </h2>

                <p className="mt-1 text-slate-500">
                  {proveedorDetalle.identificacion_fiscal ||
                    "Sin identificación fiscal"}
                </p>
              </div>

              <button
                onClick={() => setProveedorDetalle(null)}
                className="rounded-xl bg-slate-100 px-4 py-2 font-bold text-slate-700 hover:bg-slate-200"
              >
                ✕
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-bold uppercase text-slate-500">ID</p>
                <p className="mt-1 font-bold text-black">
                  #{obtenerIdProveedor(proveedorDetalle)}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-bold uppercase text-slate-500">
                  Identificación fiscal
                </p>
                <p className="mt-1 font-bold text-black">
                  {proveedorDetalle.identificacion_fiscal ||
                    "Sin identificación fiscal"}
                </p>
              </div>

              <div className="rounded-2xl bg-red-50 p-4">
                <p className="text-xs font-bold uppercase text-red-700">Nombre</p>
                <p className="mt-1 text-xl font-black text-red-700">
                  {proveedorDetalle.nombre || "Sin nombre"}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-bold uppercase text-slate-500">Estado</p>
                <p className="mt-1 font-bold text-black">
                  {proveedorDetalle.estado || "Sin estado"}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-bold uppercase text-slate-500">Teléfono</p>
                <p className="mt-1 font-bold text-black">
                  {proveedorDetalle.telefono || "Sin teléfono"}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-bold uppercase text-slate-500">Correo</p>
                <p className="mt-1 font-bold text-black">
                  {proveedorDetalle.correo || "Sin correo"}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4 md:col-span-2">
                <p className="text-xs font-bold uppercase text-slate-500">
                  Dirección
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-700">
                  {proveedorDetalle.direccion || "Sin dirección"}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4 md:col-span-2">
                <p className="text-xs font-bold uppercase text-slate-500">
                  Fecha creación
                </p>
                <p className="mt-1 font-bold text-black">
                  {formatearFecha(proveedorDetalle.fecha_creacion)}
                </p>
              </div>
            </div>

            <div className="mt-6 rounded-2xl bg-yellow-50 p-4 text-sm text-yellow-800">
              Este proveedor puede ser usado al registrar vehículos dentro del
              inventario de CC Motors.
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setProveedorDetalle(null)}
                className="rounded-xl bg-black px-5 py-3 font-bold text-white transition hover:bg-red-600"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {proveedorEliminar && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <div className="mb-4 text-5xl">⚠️</div>

            <h2 className="text-2xl font-black text-black">
              ¿Eliminar proveedor?
            </h2>

            <p className="mt-2 text-sm text-slate-600">
              Esta acción eliminará al proveedor{" "}
              <strong>{proveedorEliminar.nombre}</strong>. No se puede deshacer.
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button
                onClick={confirmarEliminarProveedor}
                className="flex-1 rounded-xl bg-red-600 px-5 py-3 font-bold text-white transition hover:bg-red-700"
              >
                Sí, eliminar
              </button>

              <button
                onClick={() => setProveedorEliminar(null)}
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