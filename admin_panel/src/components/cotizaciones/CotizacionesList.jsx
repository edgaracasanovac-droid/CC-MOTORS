import { useEffect, useState } from "react";
import api from "../../lib/api";

export default function CotizacionesList() {
  const [cotizaciones, setCotizaciones] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [vehiculos, setVehiculos] = useState([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  const [form, setForm] = useState({
    id_cliente: "",
    id_vehiculo: "",
    precio_estimado: "",
    vigencia: "",
    estado: "pendiente",
  });

  const [editandoId, setEditandoId] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const obtenerCotizaciones = async () => {
    try {
      const respuesta = await api.get("/cotizaciones");
      setCotizaciones(respuesta.data);
    } catch (error) {
      console.error(error.response?.data || error);
      setError("Error al cargar las cotizaciones");
    } finally {
      setCargando(false);
    }
  };

  const obtenerClientes = async () => {
    try {
      const respuesta = await api.get("/clientes");
      setClientes(respuesta.data);
    } catch (error) {
      console.error(error.response?.data || error);
    }
  };

  const obtenerVehiculos = async () => {
    try {
      const respuesta = await api.get("/vehiculos");
      setVehiculos(respuesta.data);
    } catch (error) {
      console.error(error.response?.data || error);
    }
  };

  useEffect(() => {
    obtenerCotizaciones();
    obtenerClientes();
    obtenerVehiculos();
  }, []);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const limpiarFormulario = () => {
    setForm({
      id_cliente: "",
      id_vehiculo: "",
      precio_estimado: "",
      vigencia: "",
      estado: "pendiente",
    });

    setEditandoId(null);
    setMostrarFormulario(false);
  };

  const abrirNueva = () => {
    limpiarFormulario();
    setMostrarFormulario(true);
  };

  const guardarCotizacion = async (e) => {
    e.preventDefault();
    setError("");

    const datosCotizacion = {
      ...form,
      id_cliente: Number(form.id_cliente),
      id_vehiculo: Number(form.id_vehiculo),
      precio_estimado: Number(form.precio_estimado),
    };

    try {
      if (editandoId) {
        await api.put(`/cotizaciones/${editandoId}`, datosCotizacion);
      } else {
        await api.post("/cotizaciones", datosCotizacion);
      }

      limpiarFormulario();
      obtenerCotizaciones();
    } catch (error) {
      console.error(error.response?.data || error);
      setError(
        error.response?.data?.mensaje ||
          error.response?.data?.error ||
          error.response?.data?.message ||
          "Error al guardar la cotización"
      );
    }
  };

  const editarCotizacion = (cotizacion) => {
    setEditandoId(cotizacion.id_cotizacion);
    setMostrarFormulario(true);

    setForm({
      id_cliente: cotizacion.id_cliente || "",
      id_vehiculo: cotizacion.id_vehiculo || "",
      precio_estimado: cotizacion.precio_estimado || "",
      vigencia: cotizacion.vigencia
        ? String(cotizacion.vigencia).slice(0, 10)
        : "",
      estado: cotizacion.estado || "pendiente",
    });
  };

  const eliminarCotizacion = async (id) => {
    const confirmar = confirm("¿Seguro que deseas eliminar esta cotización?");
    if (!confirmar) return;

    try {
      await api.delete(`/cotizaciones/${id}`);
      obtenerCotizaciones();
    } catch (error) {
      console.error(error.response?.data || error);
      setError(
        error.response?.data?.mensaje ||
          error.response?.data?.error ||
          "Error al eliminar la cotización"
      );
    }
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return "";
    return new Date(fecha).toLocaleDateString("es-VE");
  };

  if (cargando) return <p>Cargando cotizaciones...</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between rounded-2xl bg-white p-6 shadow">
        <div>
          <h2 className="text-2xl font-bold">Cotizaciones registradas</h2>
          <p className="text-sm text-slate-500">
            Gestiona las cotizaciones realizadas a clientes.
          </p>
        </div>

        <button
          onClick={abrirNueva}
          className="rounded-xl bg-red-600 px-5 py-3 font-semibold text-white hover:bg-red-700"
        >
          + Nueva cotización
        </button>
      </div>

      {mostrarFormulario && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow">
          <h2 className="mb-4 text-2xl font-bold">
            {editandoId ? "Editar cotización" : "Registrar cotización"}
          </h2>

          <form onSubmit={guardarCotizacion} className="grid gap-4 md:grid-cols-2">
            <select
              name="id_cliente"
              value={form.id_cliente}
              onChange={handleChange}
              className="rounded-xl border p-3"
              required
            >
              <option value="">Selecciona un cliente</option>

              {clientes.map((cliente) => (
                <option
                  key={cliente.id_cliente || cliente.id}
                  value={cliente.id_cliente || cliente.id}
                >
                  {cliente.nombre} {cliente.apellido}
                </option>
              ))}
            </select>

            <select
              name="id_vehiculo"
              value={form.id_vehiculo}
              onChange={handleChange}
              className="rounded-xl border p-3"
              required
            >
              <option value="">Selecciona un vehículo</option>

              {vehiculos.map((vehiculo) => (
                <option
                  key={vehiculo.id_vehiculo || vehiculo.id}
                  value={vehiculo.id_vehiculo || vehiculo.id}
                >
                  {vehiculo.marca || vehiculo.nombre_marca || "Vehículo"}{" "}
                  {vehiculo.modelo || vehiculo.nombre_modelo || ""} -{" "}
                  {vehiculo.placa}
                </option>
              ))}
            </select>

            <input
              name="precio_estimado"
              placeholder="Precio estimado"
              value={form.precio_estimado}
              onChange={handleChange}
              className="rounded-xl border p-3"
              required
            />

            <input
              type="date"
              name="vigencia"
              value={form.vigencia}
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
              <option value="aprobada">Aprobada</option>
              <option value="rechazada">Rechazada</option>
              <option value="vencida">Vencida</option>
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
              <th className="p-3">Fecha</th>
              <th className="p-3">Cliente</th>
              <th className="p-3">Vehículo</th>
              <th className="p-3">Precio estimado</th>
              <th className="p-3">Vigencia</th>
              <th className="p-3">Estado</th>
              <th className="p-3">Acciones</th>
            </tr>
          </thead>

          <tbody>
            {cotizaciones.map((cotizacion) => (
              <tr key={cotizacion.id_cotizacion} className="border-b hover:bg-slate-50">
                <td className="p-3">{formatearFecha(cotizacion.fecha)}</td>
                <td className="p-3">
                  {cotizacion.cliente_nombre} {cotizacion.cliente_apellido}
                </td>
                <td className="p-3">
                  {cotizacion.marca} {cotizacion.modelo} - {cotizacion.placa}
                </td>
                <td className="p-3">
                  ${Number(cotizacion.precio_estimado || 0).toLocaleString("es-VE")}
                </td>
                <td className="p-3">{formatearFecha(cotizacion.vigencia)}</td>
                <td className="p-3">{cotizacion.estado}</td>

                <td className="flex gap-2 p-3">
                  <button
                    onClick={() => editarCotizacion(cotizacion)}
                    className="rounded-lg bg-black px-3 py-2 text-sm text-white"
                  >
                    Editar
                  </button>

                  <button
                    onClick={() => eliminarCotizacion(cotizacion.id_cotizacion)}
                    className="rounded-lg bg-red-600 px-3 py-2 text-sm text-white hover:bg-red-700"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}

            {cotizaciones.length === 0 && (
              <tr>
                <td colSpan="7" className="p-4 text-center text-slate-500">
                  No hay cotizaciones registradas.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}