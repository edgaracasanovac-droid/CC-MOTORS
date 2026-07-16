import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import api from "../../lib/api";
import { esCorreoValido, obtenerMensajeError, esTextoValido } from "../../lib/validaciones";

export default function ClientesList() {
  const [clientes, setClientes] = useState([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  const [clienteDetalle, setClienteDetalle] = useState(null);
  const [clienteEliminar, setClienteEliminar] = useState(null);

  const [busqueda, setBusqueda] = useState("");
  const [editandoId, setEditandoId] = useState(null);

  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [cargandoDetalle, setCargandoDetalle] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    nombre: "",
    apellido: "",
    documento: "",
    telefono: "",
    correo: "",
    direccion: "",
  });

  const obtenerArray = (respuesta) => {
    if (Array.isArray(respuesta.data)) return respuesta.data;
    if (Array.isArray(respuesta.data?.clientes)) return respuesta.data.clientes;
    return [];
  };

  const obtenerClientes = async () => {
    setCargando(true);
    setError("");

    try {
      const respuesta = await api.get("/clientes");
      setClientes(obtenerArray(respuesta));
    } catch (error) {
      console.error(error.response?.data || error);
      setError("Error al cargar los clientes.");
      toast.error("Error al cargar clientes");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    obtenerClientes();
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
      apellido: "",
      documento: "",
      telefono: "",
      correo: "",
      direccion: "",
    });

    setEditandoId(null);
    setMostrarFormulario(false);
    setError("");
  };

  const abrirNuevo = () => {
    limpiarFormulario();
    setMostrarFormulario(true);
  };

  const prepararDatos = () => {
    return {
      nombre: form.nombre.trim(),
      apellido: form.apellido.trim(),
      documento: form.documento.trim(),
      telefono: form.telefono.trim(),
      correo: form.correo.trim(),
      direccion: form.direccion.trim(),
    };
  };

  const obtenerNombreCompleto = (cliente) => {
    return `${cliente.nombre || ""} ${cliente.apellido || ""}`.trim() || "Sin nombre";
  };

  const guardarCliente = async (e) => {
    e.preventDefault();
    setGuardando(true);
    setError("");

    const datosCliente = prepararDatos();

    if (!esTextoValido(datosCliente.nombre)) {
      setError("El nombre es obligatorio");
      toast.error("El nombre es obligatorio");
      setGuardando(false);
      return;
    }

    if (!esTextoValido(datosCliente.apellido)) {
      setError("El apellido es obligatorio");
      toast.error("El apellido es obligatorio");
      setGuardando(false);
      return;
    }

    if (!esTextoValido(datosCliente.documento)) {
      setError("El documento es obligatorio");
      toast.error("El documento es obligatorio");
      setGuardando(false);
      return;
    }

    if (!esTextoValido(datosCliente.telefono)) {
      setError("El teléfono es obligatorio");
      toast.error("El teléfono es obligatorio");
      setGuardando(false);
      return;
    }

    if (!esTextoValido(datosCliente.direccion)) {
      setError("La dirección es obligatoria");
      toast.error("La dirección es obligatoria");
      setGuardando(false);
      return;
    }

    if (!esCorreoValido(datosCliente.correo)) {
      setError("El correo debe tener un formato válido");
      toast.error("El correo debe tener un formato válido");
      setGuardando(false);
      return;
    }

    try {
      if (editandoId) {
        await api.put(`/clientes/${editandoId}`, datosCliente);
        toast.success("Cliente actualizado correctamente");
      } else {
        await api.post("/clientes", datosCliente);
        toast.success("Cliente registrado correctamente");
      }

      limpiarFormulario();
      await obtenerClientes();
    } catch (error) {
      const mensaje = obtenerMensajeError(error, "Error al guardar el cliente");

      setError(mensaje);
      toast.error(mensaje);
    } finally {
      setGuardando(false);
    }
  };

  const editarCliente = (cliente) => {
    const id = cliente.id_cliente || cliente.id;

    setEditandoId(id);
    setMostrarFormulario(true);

    setForm({
      nombre: cliente.nombre || "",
      apellido: cliente.apellido || "",
      documento: cliente.documento || "",
      telefono: cliente.telefono || "",
      correo: cliente.correo || "",
      direccion: cliente.direccion || "",
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const verDetalle = async (cliente) => {
    const id = cliente.id_cliente || cliente.id;
    setCargandoDetalle(true);

    try {
      const respuesta = await api.get(`/clientes/${id}`);
      setClienteDetalle(respuesta.data?.cliente || respuesta.data);
    } catch (error) {
      console.error(error.response?.data || error);
      toast.error("Error al cargar el detalle del cliente");
    } finally {
      setCargandoDetalle(false);
    }
  };

  const confirmarEliminarCliente = async () => {
    if (!clienteEliminar) return;

    const id = clienteEliminar.id_cliente || clienteEliminar.id;

    try {
      await api.delete(`/clientes/${id}`);
      toast.success("Cliente eliminado correctamente");
      setClienteEliminar(null);
      await obtenerClientes();
    } catch (error) {
      console.error(error.response?.data || error);

      const mensaje =
        error.response?.data?.mensaje ||
        error.response?.data?.error ||
        "Error al eliminar el cliente";

      toast.error(mensaje);
    }
  };

  const clientesFiltrados = useMemo(() => {
    const texto = busqueda.toLowerCase().trim();

    return clientes.filter((cliente) => {
      const nombre = obtenerNombreCompleto(cliente).toLowerCase();
      const documento = String(cliente.documento || "").toLowerCase();
      const telefono = String(cliente.telefono || "").toLowerCase();
      const correo = String(cliente.correo || "").toLowerCase();
      const direccion = String(cliente.direccion || "").toLowerCase();

      return (
        !texto ||
        nombre.includes(texto) ||
        documento.includes(texto) ||
        telefono.includes(texto) ||
        correo.includes(texto) ||
        direccion.includes(texto)
      );
    });
  }, [clientes, busqueda]);

  const resumen = useMemo(() => {
    const conCorreo = clientes.filter((cliente) => cliente.correo).length;
    const conTelefono = clientes.filter((cliente) => cliente.telefono).length;
    const conDireccion = clientes.filter((cliente) => cliente.direccion).length;

    return {
      total: clientes.length,
      conCorreo,
      conTelefono,
      conDireccion,
    };
  }, [clientes]);

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
              Base comercial
            </p>

            <h2 className="text-3xl font-black">Gestión de Clientes</h2>

            <p className="mt-2 max-w-2xl text-slate-300">
              Administra los datos de clientes registrados en CC Motors para
              cotizaciones, ventas, pagos y operaciones comerciales.
            </p>
          </div>

          <button
            onClick={abrirNuevo}
            className="rounded-2xl bg-red-600 px-6 py-4 font-bold text-white transition hover:bg-red-700"
          >
            + Nuevo cliente
          </button>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase text-slate-500">Total</p>
          <p className="mt-2 text-4xl font-black text-black">{resumen.total}</p>
          <p className="mt-2 text-sm text-slate-500">Clientes registrados</p>
        </div>

        <div className="rounded-3xl border border-red-200 bg-red-50 p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase text-red-700">
            Con correo
          </p>
          <p className="mt-2 text-4xl font-black text-red-700">
            {resumen.conCorreo}
          </p>
          <p className="mt-2 text-sm text-red-700">Clientes contactables</p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase text-slate-500">
            Con teléfono
          </p>
          <p className="mt-2 text-4xl font-black text-black">
            {resumen.conTelefono}
          </p>
          <p className="mt-2 text-sm text-slate-500">Contacto directo</p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase text-slate-500">
            Con dirección
          </p>
          <p className="mt-2 text-4xl font-black text-black">
            {resumen.conDireccion}
          </p>
          <p className="mt-2 text-sm text-slate-500">Datos completos</p>
        </div>
      </section>

      {mostrarFormulario && (
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-widest text-red-600">
                {editandoId ? "Actualizar cliente" : "Nuevo cliente"}
              </p>

              <h2 className="text-2xl font-black text-black">
                {editandoId ? "Editar cliente" : "Registrar cliente"}
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

          <form onSubmit={guardarCliente} className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Nombre
              </label>
              <input
                name="nombre"
                placeholder="Nombre"
                value={form.nombre}
                onChange={handleChange}
                className="h-12 w-full rounded-xl border border-slate-300 px-4 outline-none transition focus:border-red-600"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Apellido
              </label>
              <input
                name="apellido"
                placeholder="Apellido"
                value={form.apellido}
                onChange={handleChange}
                className="h-12 w-full rounded-xl border border-slate-300 px-4 outline-none transition focus:border-red-600"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Documento
              </label>
              <input
                name="documento"
                placeholder="V12345678"
                value={form.documento}
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
                placeholder="04141234567"
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
                placeholder="cliente@correo.com"
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
                placeholder="San Cristóbal"
                value={form.direccion}
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
                    ? "Actualizar cliente"
                    : "Guardar cliente"}
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
            Buscar cliente
          </label>

          <input
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por nombre, documento, teléfono, correo o dirección..."
            className="h-12 w-full rounded-xl border border-slate-300 px-4 outline-none transition focus:border-red-600"
          />
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-200">
          <table className="min-w-[1100px] w-full border-collapse">
            <thead className="bg-black text-white">
              <tr className="text-left text-sm">
                <th className="p-4">Cliente</th>
                <th className="p-4">Documento</th>
                <th className="p-4">Teléfono</th>
                <th className="p-4">Correo</th>
                <th className="p-4">Dirección</th>
                <th className="p-4">Acciones</th>
              </tr>
            </thead>

            <tbody>
              {clientesFiltrados.length > 0 ? (
                clientesFiltrados.map((cliente) => {
                  const id = cliente.id_cliente || cliente.id;

                  return (
                    <tr
                      key={id}
                      className="border-b text-sm transition hover:bg-slate-50"
                    >
                      <td className="p-4">
                        <p className="font-black text-black">
                          {obtenerNombreCompleto(cliente)}
                        </p>
                        <p className="text-xs text-slate-500">
                          ID #{id}
                        </p>
                      </td>

                      <td className="p-4 font-semibold text-slate-700">
                        {cliente.documento || "Sin documento"}
                      </td>

                      <td className="p-4 text-slate-600">
                        {cliente.telefono || "Sin teléfono"}
                      </td>

                      <td className="p-4 text-slate-600">
                        {cliente.correo || "Sin correo"}
                      </td>

                      <td className="p-4 text-slate-600">
                        {cliente.direccion || "Sin dirección"}
                      </td>

                      <td className="p-4">
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => verDetalle(cliente)}
                            disabled={cargandoDetalle}
                            className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-200 disabled:opacity-60"
                          >
                            Ver
                          </button>

                          <button
                            onClick={() => editarCliente(cliente)}
                            className="rounded-lg bg-black px-3 py-2 text-xs font-bold text-white transition hover:bg-red-600"
                          >
                            Editar
                          </button>

                          <button
                            onClick={() => setClienteEliminar(cliente)}
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
                      <p className="text-4xl">👥</p>
                      <h3 className="mt-3 text-xl font-black text-black">
                        No hay clientes para mostrar
                      </h3>
                      <p className="mt-2 text-sm text-slate-500">
                        No se encontraron clientes con la búsqueda actual.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {clienteDetalle && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-bold uppercase tracking-widest text-red-600">
                  Detalle de cliente
                </p>

                <h2 className="text-2xl font-black text-black">
                  {obtenerNombreCompleto(clienteDetalle)}
                </h2>

                <p className="mt-1 text-slate-500">
                  Documento: {clienteDetalle.documento || "Sin documento"}
                </p>
              </div>

              <button
                onClick={() => setClienteDetalle(null)}
                className="rounded-xl bg-slate-100 px-4 py-2 font-bold text-slate-700 hover:bg-slate-200"
              >
                ✕
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-bold uppercase text-slate-500">Nombre</p>
                <p className="mt-1 font-bold text-black">
                  {clienteDetalle.nombre || "Sin nombre"}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-bold uppercase text-slate-500">Apellido</p>
                <p className="mt-1 font-bold text-black">
                  {clienteDetalle.apellido || "Sin apellido"}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-bold uppercase text-slate-500">Documento</p>
                <p className="mt-1 font-bold text-black">
                  {clienteDetalle.documento || "Sin documento"}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-bold uppercase text-slate-500">Teléfono</p>
                <p className="mt-1 font-bold text-black">
                  {clienteDetalle.telefono || "Sin teléfono"}
                </p>
              </div>

              <div className="rounded-2xl bg-red-50 p-4">
                <p className="text-xs font-bold uppercase text-red-700">Correo</p>
                <p className="mt-1 font-bold text-red-700">
                  {clienteDetalle.correo || "Sin correo"}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-bold uppercase text-slate-500">Dirección</p>
                <p className="mt-1 font-bold text-black">
                  {clienteDetalle.direccion || "Sin dirección"}
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
              {clienteDetalle.telefono && (
                <a
                  href={`tel:${clienteDetalle.telefono}`}
                  className="rounded-xl bg-slate-100 px-5 py-3 text-center font-bold text-slate-700 transition hover:bg-slate-200"
                >
                  Llamar
                </a>
              )}

              {clienteDetalle.correo && (
                <a
                  href={`mailto:${clienteDetalle.correo}`}
                  className="rounded-xl bg-red-600 px-5 py-3 text-center font-bold text-white transition hover:bg-red-700"
                >
                  Enviar correo
                </a>
              )}

              <button
                onClick={() => setClienteDetalle(null)}
                className="rounded-xl bg-black px-5 py-3 font-bold text-white transition hover:bg-red-600"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {clienteEliminar && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <div className="mb-4 text-5xl">⚠️</div>

            <h2 className="text-2xl font-black text-black">
              ¿Eliminar cliente?
            </h2>

            <p className="mt-2 text-sm text-slate-600">
              Esta acción eliminará a{" "}
              <strong>{obtenerNombreCompleto(clienteEliminar)}</strong>. No se
              puede deshacer.
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button
                onClick={confirmarEliminarCliente}
                className="flex-1 rounded-xl bg-red-600 px-5 py-3 font-bold text-white transition hover:bg-red-700"
              >
                Sí, eliminar
              </button>

              <button
                onClick={() => setClienteEliminar(null)}
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