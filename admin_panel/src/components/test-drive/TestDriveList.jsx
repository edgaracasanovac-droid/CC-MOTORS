import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import api from "../../lib/api";

const ESTADOS = ["pendiente", "confirmado", "realizado", "cancelado"];

export default function TestDriveList() {
  const [solicitudes, setSolicitudes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [detalle, setDetalle] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [form, setForm] = useState({
    estado: "pendiente",
    fecha: "",
    hora: "",
    observaciones: "",
  });
  const [eliminandoId, setEliminandoId] = useState(null);

  const obtenerSolicitudes = async () => {
    setCargando(true);
    setError("");

    try {
      const respuesta = await api.get("/test-drive");
      const datos = Array.isArray(respuesta.data?.testDrives)
        ? respuesta.data.testDrives
        : [];
      setSolicitudes(datos);
    } catch (err) {
      console.error(err);
      setError("No se pudieron cargar las solicitudes de test drive.");
      toast.error("Error al cargar solicitudes");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    obtenerSolicitudes();
  }, []);

  const solicitudesFiltradas = useMemo(() => {
    const texto = busqueda.toLowerCase().trim();

    if (!texto) return solicitudes;

    return solicitudes.filter((solicitud) => {
      const cliente = `${solicitud?.cliente?.nombre || ""} ${solicitud?.cliente?.apellido || ""}`.trim().toLowerCase();
      const vehiculo = `${solicitud?.vehiculo?.marca || ""} ${solicitud?.vehiculo?.modelo || ""} ${solicitud?.vehiculo?.placa || ""}`.trim().toLowerCase();
      const estado = String(solicitud?.estado || "").toLowerCase();
      return cliente.includes(texto) || vehiculo.includes(texto) || estado.includes(texto);
    });
  }, [solicitudes, busqueda]);

  const abrirDetalle = async (solicitud) => {
    const id = solicitud.id_test_drive || solicitud.id;

    try {
      const respuesta = await api.get(`/test-drive/${id}`);
      const dato = respuesta.data?.testDrive || respuesta.data;
      setDetalle(dato);
      setForm({
        estado: dato?.estado || "pendiente",
        fecha: dato?.fecha || "",
        hora: dato?.hora || "",
        observaciones: dato?.observaciones || "",
      });
    } catch (err) {
      console.error(err);
      toast.error("No se pudo cargar el detalle de la solicitud");
    }
  };

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const guardarCambios = async (e) => {
    e.preventDefault();
    if (!detalle) return;

    setGuardando(true);

    try {
      await api.put(`/test-drive/${detalle.id_test_drive}`, {
        estado: form.estado,
        fecha: form.fecha,
        hora: form.hora,
        observaciones: form.observaciones,
      });

      toast.success("Solicitud actualizada correctamente");
      await obtenerSolicitudes();
      await abrirDetalle({ id_test_drive: detalle.id_test_drive });
    } catch (err) {
      console.error(err);
      toast.error("No se pudo actualizar la solicitud");
    } finally {
      setGuardando(false);
    }
  };

  const eliminarSolicitud = async (solicitud) => {
    const id = solicitud.id_test_drive || solicitud.id;

    if (!window.confirm("¿Deseas eliminar esta solicitud de test drive?")) {
      return;
    }

    setEliminandoId(id);

    try {
      await api.delete(`/test-drive/${id}`);
      toast.success("Solicitud eliminada correctamente");
      await obtenerSolicitudes();
      if (detalle?.id_test_drive === id) {
        setDetalle(null);
      }
    } catch (err) {
      console.error(err);
      toast.error("No se pudo eliminar la solicitud");
    } finally {
      setEliminandoId(null);
    }
  };

  const resumen = useMemo(() => {
    const total = solicitudes.length;
    const pendientes = solicitudes.filter((item) => item.estado === "pendiente").length;
    const confirmadas = solicitudes.filter((item) => item.estado === "confirmado").length;
    const canceladas = solicitudes.filter((item) => item.estado === "cancelado").length;

    return { total, pendientes, confirmadas, canceladas };
  }, [solicitudes]);

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-4">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase text-slate-500">Total</p>
          <p className="mt-2 text-3xl font-black text-black">{resumen.total}</p>
          <p className="mt-2 text-sm text-slate-500">solicitudes registradas</p>
        </div>

        <div className="rounded-3xl border border-yellow-200 bg-yellow-50 p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase text-yellow-700">Pendientes</p>
          <p className="mt-2 text-3xl font-black text-yellow-700">{resumen.pendientes}</p>
          <p className="mt-2 text-sm text-yellow-700">por confirmar</p>
        </div>

        <div className="rounded-3xl border border-green-200 bg-green-50 p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase text-green-700">Confirmadas</p>
          <p className="mt-2 text-3xl font-black text-green-700">{resumen.confirmadas}</p>
          <p className="mt-2 text-sm text-green-700">programadas</p>
        </div>

        <div className="rounded-3xl border border-red-200 bg-red-50 p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase text-red-700">Canceladas</p>
          <p className="mt-2 text-3xl font-black text-red-700">{resumen.canceladas}</p>
          <p className="mt-2 text-sm text-red-700">anuladas</p>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-red-600">Panel administrativo</p>
            <h3 className="text-2xl font-black text-black">Gestión de solicitudes</h3>
          </div>

          <input
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por cliente, vehículo o estado"
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 md:w-80"
          />
        </div>

        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
        ) : null}

        <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-200">
          <table className="min-w-[1000px] w-full border-collapse">
            <thead className="bg-black text-white">
              <tr className="text-left text-sm">
                <th className="p-4">Cliente</th>
                <th className="p-4">Vehículo</th>
                <th className="p-4">Fecha</th>
                <th className="p-4">Estado</th>
                <th className="p-4">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {cargando ? (
                <tr>
                  <td colSpan="5" className="p-10 text-center text-slate-500">
                    Cargando solicitudes...
                  </td>
                </tr>
              ) : solicitudesFiltradas.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-10 text-center text-slate-500">
                    No hay solicitudes registradas.
                  </td>
                </tr>
              ) : (
                solicitudesFiltradas.map((solicitud) => (
                  <tr key={solicitud.id_test_drive} className="border-t border-slate-200 bg-white">
                    <td className="p-4">
                      <div className="font-semibold text-black">
                        {`${solicitud?.cliente?.nombre || ""} ${solicitud?.cliente?.apellido || ""}`.trim() || "Sin nombre"}
                      </div>
                      <div className="text-sm text-slate-500">{solicitud?.cliente?.correo || "Sin correo"}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-semibold text-black">
                        {solicitud?.vehiculo?.marca || ""} {solicitud?.vehiculo?.modelo || ""}
                      </div>
                      <div className="text-sm text-slate-500">{solicitud?.vehiculo?.placa || "Sin placa"}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-semibold text-black">{solicitud?.fecha || "Sin fecha"}</div>
                      <div className="text-sm text-slate-500">{solicitud?.hora || "Sin hora"}</div>
                    </td>
                    <td className="p-4">
                      <span className={`rounded-full px-3 py-1 text-xs font-bold ${solicitud?.estado === "confirmado" ? "bg-green-100 text-green-700" : solicitud?.estado === "cancelado" ? "bg-red-100 text-red-700" : solicitud?.estado === "realizado" ? "bg-blue-100 text-blue-700" : "bg-yellow-100 text-yellow-700"}`}>
                        {solicitud?.estado || "pendiente"}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => abrirDetalle(solicitud)}
                          className="rounded-xl bg-black px-3 py-2 text-sm font-semibold text-white"
                        >
                          Ver
                        </button>
                        <button
                          onClick={() => eliminarSolicitud(solicitud)}
                          disabled={eliminandoId === (solicitud.id_test_drive || solicitud.id)}
                          className="rounded-xl bg-red-600 px-3 py-2 text-sm font-semibold text-white disabled:opacity-60"
                        >
                          {eliminandoId === (solicitud.id_test_drive || solicitud.id) ? "Eliminando..." : "Eliminar"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {detalle ? (
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-widest text-red-600">Detalle</p>
              <h3 className="text-2xl font-black text-black">Solicitud #{detalle.id_test_drive}</h3>
            </div>
            <button onClick={() => setDetalle(null)} className="rounded-2xl border border-slate-200 px-4 py-2 font-semibold text-slate-700">
              Cerrar
            </button>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <div>
                <p className="text-sm font-semibold uppercase text-slate-500">Cliente</p>
                <p className="mt-1 font-semibold text-black">
                  {`${detalle?.cliente?.nombre || ""} ${detalle?.cliente?.apellido || ""}`.trim() || "Sin nombre"}
                </p>
                <p className="text-sm text-slate-600">{detalle?.cliente?.correo || "Sin correo"}</p>
              </div>
              <div>
                <p className="text-sm font-semibold uppercase text-slate-500">Vehículo</p>
                <p className="mt-1 font-semibold text-black">
                  {detalle?.vehiculo?.marca || ""} {detalle?.vehiculo?.modelo || ""}
                </p>
                <p className="text-sm text-slate-600">Placa: {detalle?.vehiculo?.placa || "Sin placa"}</p>
              </div>
              <div>
                <p className="text-sm font-semibold uppercase text-slate-500">Mensaje</p>
                <p className="mt-1 text-sm leading-6 text-slate-700">{detalle?.mensaje || "Sin mensaje"}</p>
              </div>
              <div>
                <p className="text-sm font-semibold uppercase text-slate-500">Observaciones</p>
                <p className="mt-1 text-sm leading-6 text-slate-700">{detalle?.observaciones || "Sin observaciones"}</p>
              </div>
            </div>

            <form onSubmit={guardarCambios} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Estado</label>
                <select name="estado" value={form.estado} onChange={handleChange} className="w-full rounded-2xl border border-slate-200 px-4 py-3">
                  {ESTADOS.map((estado) => (
                    <option key={estado} value={estado}>
                      {estado}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Fecha</label>
                <input type="date" name="fecha" value={form.fecha} onChange={handleChange} className="w-full rounded-2xl border border-slate-200 px-4 py-3" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Hora</label>
                <input type="time" name="hora" value={form.hora} onChange={handleChange} className="w-full rounded-2xl border border-slate-200 px-4 py-3" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Observaciones</label>
                <textarea name="observaciones" value={form.observaciones} onChange={handleChange} rows="4" className="w-full rounded-2xl border border-slate-200 px-4 py-3" />
              </div>
              <button type="submit" disabled={guardando} className="w-full rounded-2xl bg-red-600 px-4 py-3 font-semibold text-white disabled:opacity-60">
                {guardando ? "Guardando..." : "Guardar cambios"}
              </button>
            </form>
          </div>
        </section>
      ) : null}
    </div>
  );
}