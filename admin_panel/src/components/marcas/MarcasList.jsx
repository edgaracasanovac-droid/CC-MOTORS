import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import api from "../../lib/api";
import { esTextoValido, obtenerMensajeError } from "../../lib/validaciones";

export default function MarcasList() {
  const [marcas, setMarcas] = useState([]);

  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  const [marcaDetalle, setMarcaDetalle] = useState(null);
  const [marcaEliminar, setMarcaEliminar] = useState(null);

  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("todos");

  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [cargandoDetalle, setCargandoDetalle] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    nombre: "",
    descripcion: "",
    pais_origen: "",
    sitio_web: "",
    estado: "activo",
  });

  const obtenerArray = (respuesta) => {
    if (Array.isArray(respuesta.data)) return respuesta.data;
    if (Array.isArray(respuesta.data?.marcas)) return respuesta.data.marcas;
    return [];
  };

  const cargarMarcas = async () => {
    setCargando(true);
    setError("");

    try {
      const respuesta = await api.get("/marcas");
      setMarcas(obtenerArray(respuesta));
    } catch (error) {
      console.error(error.response?.data || error);
      setError("Error al cargar las marcas.");
      toast.error("Error al cargar marcas");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarMarcas();
  }, []);

  const limpiarFormulario = () => {
    setForm({
      nombre: "",
      descripcion: "",
      pais_origen: "",
      sitio_web: "",
      estado: "activo",
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

  const obtenerIdMarca = (marca) => {
    return marca.id_marca || marca.id;
  };

  const prepararDatos = () => {
    return {
      nombre: form.nombre.trim(),
      descripcion: form.descripcion.trim(),
      pais_origen: form.pais_origen.trim(),
      sitio_web: form.sitio_web.trim(),
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

  const normalizarUrl = (url) => {
    if (!url) return "";

    if (url.startsWith("http://") || url.startsWith("https://")) {
      return url;
    }

    return `https://${url}`;
  };

  const guardarMarca = async (e) => {
    e.preventDefault();
    setGuardando(true);
    setError("");

    const datosMarca = prepararDatos();

    if (!esTextoValido(datosMarca.nombre)) {
      setError("El nombre de la marca es obligatorio");
      toast.error("El nombre de la marca es obligatorio");
      setGuardando(false);
      return;
    }

    if (!esTextoValido(datosMarca.pais_origen)) {
      setError("El país de origen es obligatorio");
      toast.error("El país de origen es obligatorio");
      setGuardando(false);
      return;
    }

    if (!esTextoValido(datosMarca.descripcion)) {
      setError("La descripción es obligatoria");
      toast.error("La descripción es obligatoria");
      setGuardando(false);
      return;
    }

    try {
      if (editandoId) {
        await api.put(`/marcas/${editandoId}`, datosMarca);
        toast.success("Marca actualizada correctamente");
      } else {
        await api.post("/marcas", datosMarca);
        toast.success("Marca registrada correctamente");
      }

      limpiarFormulario();
      await cargarMarcas();
    } catch (error) {
      const mensaje = obtenerMensajeError(error, "Error al guardar la marca");

      setError(mensaje);
      toast.error(mensaje);
    } finally {
      setGuardando(false);
    }
  };

  const editarMarca = (marca) => {
    const id = obtenerIdMarca(marca);

    setEditandoId(id);
    setMostrarFormulario(true);

    setForm({
      nombre: marca.nombre || "",
      descripcion: marca.descripcion || "",
      pais_origen: marca.pais_origen || "",
      sitio_web: marca.sitio_web || "",
      estado: marca.estado || "activo",
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const verDetalle = async (marca) => {
    const id = obtenerIdMarca(marca);
    setCargandoDetalle(true);

    try {
      const respuesta = await api.get(`/marcas/${id}`);
      setMarcaDetalle(respuesta.data?.marca || respuesta.data);
    } catch (error) {
      console.error(error.response?.data || error);
      toast.error("Error al cargar el detalle de la marca");
    } finally {
      setCargandoDetalle(false);
    }
  };

  const confirmarEliminarMarca = async () => {
    if (!marcaEliminar) return;

    const id = obtenerIdMarca(marcaEliminar);

    try {
      await api.delete(`/marcas/${id}`);
      toast.success("Marca eliminada correctamente");
      setMarcaEliminar(null);
      await cargarMarcas();
    } catch (error) {
      console.error(error.response?.data || error);

      const mensaje =
        error.response?.data?.mensaje ||
        error.response?.data?.error ||
        error.response?.data?.message ||
        "Error al eliminar la marca";

      toast.error(mensaje);
    }
  };

  const marcasFiltradas = useMemo(() => {
    const texto = busqueda.toLowerCase().trim();

    return marcas.filter((marca) => {
      const id = String(obtenerIdMarca(marca) || "");
      const nombre = String(marca.nombre || "").toLowerCase();
      const descripcion = String(marca.descripcion || "").toLowerCase();
      const pais = String(marca.pais_origen || "").toLowerCase();
      const sitio = String(marca.sitio_web || "").toLowerCase();
      const estado = String(marca.estado || "").toLowerCase();

      const coincideBusqueda =
        !texto ||
        id.includes(texto) ||
        nombre.includes(texto) ||
        descripcion.includes(texto) ||
        pais.includes(texto) ||
        sitio.includes(texto) ||
        estado.includes(texto);

      const coincideEstado = filtroEstado === "todos" || estado === filtroEstado;

      return coincideBusqueda && coincideEstado;
    });
  }, [marcas, busqueda, filtroEstado]);

  const resumen = useMemo(() => {
    const activas = marcas.filter(
      (marca) => marca.estado?.toLowerCase() === "activo"
    ).length;

    const inactivas = marcas.filter(
      (marca) => marca.estado?.toLowerCase() === "inactivo"
    ).length;

    const conSitioWeb = marcas.filter((marca) => marca.sitio_web).length;

    const paises = new Set(
      marcas.map((marca) => marca.pais_origen).filter(Boolean)
    ).size;

    return {
      total: marcas.length,
      activas,
      inactivas,
      conSitioWeb,
      paises,
    };
  }, [marcas]);

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
              Catálogo CC Motors
            </p>

            <h2 className="text-3xl font-black">Gestión de Marcas</h2>

            <p className="mt-2 max-w-2xl text-slate-300">
              Administra las marcas disponibles para modelos y vehículos dentro
              del inventario de la concesionaria.
            </p>
          </div>

          <button
            onClick={abrirNueva}
            className="rounded-2xl bg-red-600 px-6 py-4 font-bold text-white transition hover:bg-red-700"
          >
            + Nueva marca
          </button>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-5">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase text-slate-500">Total</p>
          <p className="mt-2 text-4xl font-black text-black">{resumen.total}</p>
          <p className="mt-2 text-sm text-slate-500">Marcas registradas</p>
        </div>

        <div className="rounded-3xl border border-green-200 bg-green-50 p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase text-green-700">Activas</p>
          <p className="mt-2 text-4xl font-black text-green-700">
            {resumen.activas}
          </p>
          <p className="mt-2 text-sm text-green-700">Disponibles para uso</p>
        </div>

        <div className="rounded-3xl border border-red-200 bg-red-50 p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase text-red-700">Inactivas</p>
          <p className="mt-2 text-4xl font-black text-red-700">
            {resumen.inactivas}
          </p>
          <p className="mt-2 text-sm text-red-700">Fuera de catálogo</p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase text-slate-500">
            Con sitio web
          </p>
          <p className="mt-2 text-4xl font-black text-black">
            {resumen.conSitioWeb}
          </p>
          <p className="mt-2 text-sm text-slate-500">Referencias oficiales</p>
        </div>

        <div className="rounded-3xl border border-yellow-200 bg-yellow-50 p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase text-yellow-700">
            Países
          </p>
          <p className="mt-2 text-4xl font-black text-yellow-700">
            {resumen.paises}
          </p>
          <p className="mt-2 text-sm text-yellow-700">Origen de marcas</p>
        </div>
      </section>

      {mostrarFormulario && (
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-widest text-red-600">
                {editandoId ? "Actualizar marca" : "Nueva marca"}
              </p>

              <h2 className="text-2xl font-black text-black">
                {editandoId ? "Editar marca" : "Registrar marca"}
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

          <form onSubmit={guardarMarca} className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Nombre
              </label>

              <input
                name="nombre"
                placeholder="Toyota"
                value={form.nombre}
                onChange={handleChange}
                className="h-12 w-full rounded-xl border border-slate-300 px-4 outline-none transition focus:border-red-600"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                País de origen
              </label>

              <input
                name="pais_origen"
                placeholder="Japón"
                value={form.pais_origen}
                onChange={handleChange}
                className="h-12 w-full rounded-xl border border-slate-300 px-4 outline-none transition focus:border-red-600"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Sitio web
              </label>

              <input
                name="sitio_web"
                placeholder="toyota.com"
                value={form.sitio_web}
                onChange={handleChange}
                className="h-12 w-full rounded-xl border border-slate-300 px-4 outline-none transition focus:border-red-600"
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

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Descripción
              </label>

              <textarea
                name="descripcion"
                placeholder="Descripción breve de la marca"
                value={form.descripcion}
                onChange={handleChange}
                rows="4"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-red-600"
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
                    ? "Actualizar marca"
                    : "Guardar marca"}
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
              Buscar marca
            </label>

            <input
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por nombre, país, descripción, sitio web, estado o ID..."
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
                <th className="p-4">Marca</th>
                <th className="p-4">Descripción</th>
                <th className="p-4">País</th>
                <th className="p-4">Sitio web</th>
                <th className="p-4">Estado</th>
                <th className="p-4">Acciones</th>
              </tr>
            </thead>

            <tbody>
              {marcasFiltradas.length > 0 ? (
                marcasFiltradas.map((marca) => {
                  const id = obtenerIdMarca(marca);

                  return (
                    <tr
                      key={id}
                      className="border-b text-sm transition hover:bg-slate-50"
                    >
                      <td className="p-4 font-bold text-slate-700">#{id}</td>

                      <td className="p-4">
                        <p className="font-black text-black">{marca.nombre}</p>
                        <p className="text-xs text-slate-500">
                          Marca registrada
                        </p>
                      </td>

                      <td className="max-w-xs truncate p-4 text-slate-600">
                        {marca.descripcion || "Sin descripción"}
                      </td>

                      <td className="p-4 font-semibold text-slate-700">
                        {marca.pais_origen || "Sin país"}
                      </td>

                      <td className="p-4 text-slate-600">
                        {marca.sitio_web ? (
                          <a
                            href={normalizarUrl(marca.sitio_web)}
                            target="_blank"
                            rel="noreferrer"
                            className="font-semibold text-red-600 hover:underline"
                          >
                            {marca.sitio_web}
                          </a>
                        ) : (
                          "Sin sitio web"
                        )}
                      </td>

                      <td className="p-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold ${obtenerBadgeEstado(
                            marca.estado
                          )}`}
                        >
                          {marca.estado || "Sin estado"}
                        </span>
                      </td>

                      <td className="p-4">
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => verDetalle(marca)}
                            disabled={cargandoDetalle}
                            className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-200 disabled:opacity-60"
                          >
                            Ver
                          </button>

                          <button
                            onClick={() => editarMarca(marca)}
                            className="rounded-lg bg-black px-3 py-2 text-xs font-bold text-white transition hover:bg-red-600"
                          >
                            Editar
                          </button>

                          <button
                            onClick={() => setMarcaEliminar(marca)}
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
                      <p className="text-4xl">🏷️</p>

                      <h3 className="mt-3 text-xl font-black text-black">
                        No hay marcas para mostrar
                      </h3>

                      <p className="mt-2 text-sm text-slate-500">
                        No se encontraron marcas con la búsqueda o filtro actual.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {marcaDetalle && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-bold uppercase tracking-widest text-red-600">
                  Detalle de marca
                </p>

                <h2 className="text-2xl font-black text-black">
                  {marcaDetalle.nombre || "Marca"}
                </h2>

                <p className="mt-1 text-slate-500">
                  ID #{obtenerIdMarca(marcaDetalle)}
                </p>
              </div>

              <button
                onClick={() => setMarcaDetalle(null)}
                className="rounded-xl bg-slate-100 px-4 py-2 font-bold text-slate-700 hover:bg-slate-200"
              >
                ✕
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-bold uppercase text-slate-500">Nombre</p>
                <p className="mt-1 font-bold text-black">
                  {marcaDetalle.nombre || "Sin nombre"}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-bold uppercase text-slate-500">
                  País de origen
                </p>
                <p className="mt-1 font-bold text-black">
                  {marcaDetalle.pais_origen || "Sin país"}
                </p>
              </div>

              <div className="rounded-2xl bg-red-50 p-4">
                <p className="text-xs font-bold uppercase text-red-700">
                  Sitio web
                </p>

                {marcaDetalle.sitio_web ? (
                  <a
                    href={normalizarUrl(marcaDetalle.sitio_web)}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-1 block font-bold text-red-700 hover:underline"
                  >
                    {marcaDetalle.sitio_web}
                  </a>
                ) : (
                  <p className="mt-1 font-bold text-red-700">Sin sitio web</p>
                )}
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-bold uppercase text-slate-500">Estado</p>
                <p className="mt-1 font-bold text-black">
                  {marcaDetalle.estado || "Sin estado"}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4 md:col-span-2">
                <p className="text-xs font-bold uppercase text-slate-500">
                  Descripción
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-700">
                  {marcaDetalle.descripcion || "Sin descripción"}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4 md:col-span-2">
                <p className="text-xs font-bold uppercase text-slate-500">
                  Fecha creación
                </p>
                <p className="mt-1 font-bold text-black">
                  {formatearFecha(marcaDetalle.fecha_creacion)}
                </p>
              </div>
            </div>

            <div className="mt-6 rounded-2xl bg-yellow-50 p-4 text-sm text-yellow-800">
              Esta marca puede ser utilizada para registrar modelos y vehículos
              dentro del inventario de CC Motors.
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setMarcaDetalle(null)}
                className="rounded-xl bg-black px-5 py-3 font-bold text-white transition hover:bg-red-600"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {marcaEliminar && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <div className="mb-4 text-5xl">⚠️</div>

            <h2 className="text-2xl font-black text-black">
              ¿Eliminar marca?
            </h2>

            <p className="mt-2 text-sm text-slate-600">
              Esta acción eliminará la marca{" "}
              <strong>{marcaEliminar.nombre}</strong>. No se puede deshacer.
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button
                onClick={confirmarEliminarMarca}
                className="flex-1 rounded-xl bg-red-600 px-5 py-3 font-bold text-white transition hover:bg-red-700"
              >
                Sí, eliminar
              </button>

              <button
                onClick={() => setMarcaEliminar(null)}
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