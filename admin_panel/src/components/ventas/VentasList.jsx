import { useEffect, useState } from "react";
import api from "../../lib/api";

export default function VentasList() {
  const [ventas, setVentas] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [vehiculos, setVehiculos] = useState([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  const [form, setForm] = useState({
    id_cliente: "",
    id_usuario: "",
    id_vehiculo: "",
    precio_final: "",
    tipo_venta: "contado",
    estado: "completada",
    fecha: "",
  });

  const [editandoId, setEditandoId] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const obtenerVentas = async () => {
    try {
      const respuesta = await api.get("/ventas");
      setVentas(respuesta.data);
    } catch (error) {
      console.error(error.response?.data || error);
      setError("Error al cargar las ventas");
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

  const obtenerUsuarios = async () => {
    try {
      const respuesta = await api.get("/usuarios");
      setUsuarios(respuesta.data);
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
    obtenerVentas();
    obtenerClientes();
    obtenerUsuarios();
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
      id_usuario: "",
      id_vehiculo: "",
      precio_final: "",
      tipo_venta: "contado",
      estado: "completada",
      fecha: "",
    });

    setEditandoId(null);
    setMostrarFormulario(false);
  };

  const abrirNueva = () => {
    limpiarFormulario();
    setMostrarFormulario(true);
  };

  const guardarVenta = async (e) => {
    e.preventDefault();
    setError("");

    const datosVenta = {
      ...form,
      id_cliente: Number(form.id_cliente),
      id_usuario: Number(form.id_usuario),
      id_vehiculo: Number(form.id_vehiculo),
      precio_final: Number(form.precio_final),
    };

    try {
      if (editandoId) {
        await api.put(`/ventas/${editandoId}`, datosVenta);
      } else {
        await api.post("/ventas", datosVenta);
      }

      limpiarFormulario();
      obtenerVentas();
      obtenerVehiculos();
    } catch (error) {
      console.error(error.response?.data || error);

      setError(
        error.response?.data?.mensaje ||
          error.response?.data?.error ||
          error.response?.data?.message ||
          "Error al guardar la venta"
      );
    }
  };

  const editarVenta = (venta) => {
    const id = venta.id_venta || venta.id;

    setEditandoId(id);
    setMostrarFormulario(true);

    setForm({
      id_cliente: venta.id_cliente || "",
      id_usuario: venta.id_usuario || "",
      id_vehiculo: venta.id_vehiculo || "",
      precio_final: venta.precio_final || "",
      tipo_venta: venta.tipo_venta || "contado",
      estado: venta.estado || "completada",
      fecha: venta.fecha ? String(venta.fecha).slice(0, 10) : "",
    });
  };

  const eliminarVenta = async (venta) => {
    const id = venta.id_venta || venta.id;

    const confirmar = confirm("¿Seguro que deseas eliminar esta venta?");
    if (!confirmar) return;

    try {
      await api.delete(`/ventas/${id}`);
      obtenerVentas();
      obtenerVehiculos();
    } catch (error) {
      console.error(error.response?.data || error);

      setError(
        error.response?.data?.mensaje ||
          error.response?.data?.error ||
          error.response?.data?.message ||
          "Error al eliminar la venta"
      );
    }
  };

  if (cargando) return <p>Cargando ventas...</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between rounded-2xl bg-white p-6 shadow">
        <div>
          <h2 className="text-2xl font-bold">Ventas registradas</h2>
          <p className="text-sm text-slate-500">
            Gestiona las ventas realizadas en la concesionaria.
          </p>
        </div>

        <button
          onClick={abrirNueva}
          className="rounded-xl bg-red-600 px-5 py-3 font-semibold text-white hover:bg-red-700"
        >
          + Nueva venta
        </button>
      </div>

      {mostrarFormulario && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow">
          <h2 className="mb-4 text-2xl font-bold">
            {editandoId ? "Editar venta" : "Registrar venta"}
          </h2>

          <form onSubmit={guardarVenta} className="grid gap-4 md:grid-cols-2">
            <select name="id_cliente" value={form.id_cliente} onChange={handleChange} className="rounded-xl border p-3" required>
              <option value="">Selecciona un cliente</option>
              {clientes.map((cliente) => (
                <option key={cliente.id_cliente || cliente.id} value={cliente.id_cliente || cliente.id}>
                  {cliente.nombre} {cliente.apellido}
                </option>
              ))}
            </select>

            <select name="id_usuario" value={form.id_usuario} onChange={handleChange} className="rounded-xl border p-3" required>
              <option value="">Selecciona un usuario</option>
              {usuarios.map((usuario) => (
                <option key={usuario.id_usuario || usuario.id} value={usuario.id_usuario || usuario.id}>
                  {usuario.nombre} {usuario.apellido}
                </option>
              ))}
            </select>

            <select name="id_vehiculo" value={form.id_vehiculo} onChange={handleChange} className="rounded-xl border p-3" required>
              <option value="">Selecciona un vehículo</option>
              {vehiculos.map((vehiculo) => (
                <option key={vehiculo.id_vehiculo || vehiculo.id} value={vehiculo.id_vehiculo || vehiculo.id}>
                  {vehiculo.marca || vehiculo.nombre_marca || "Vehículo"}{" "}
                  {vehiculo.modelo || vehiculo.nombre_modelo || ""} -{" "}
                  {vehiculo.placa}
                </option>
              ))}
            </select>

            <input name="precio_final" placeholder="Precio final" value={form.precio_final} onChange={handleChange} className="rounded-xl border p-3" required />

            <input type="date" name="fecha" value={form.fecha} onChange={handleChange} className="rounded-xl border p-3" required />

            <select name="tipo_venta" value={form.tipo_venta} onChange={handleChange} className="rounded-xl border p-3">
              <option value="contado">Contado</option>
              <option value="financiado">Financiado</option>
            </select>

            <select name="estado" value={form.estado} onChange={handleChange} className="rounded-xl border p-3">
              <option value="completada">Completada</option>
              <option value="pendiente">Pendiente</option>
              <option value="cancelada">Cancelada</option>
            </select>

            <div className="flex gap-3 md:col-span-2">
              <button type="submit" className="rounded-xl bg-black px-5 py-3 text-white">
                {editandoId ? "Actualizar" : "Guardar"}
              </button>

              <button type="button" onClick={limpiarFormulario} className="rounded-xl bg-slate-200 px-5 py-3">
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
              <th className="p-3">Cliente</th>
              <th className="p-3">Usuario</th>
              <th className="p-3">Vehículo</th>
              <th className="p-3">Fecha</th>
              <th className="p-3">Precio final</th>
              <th className="p-3">Tipo</th>
              <th className="p-3">Estado</th>
              <th className="p-3">Acciones</th>
            </tr>
          </thead>

          <tbody>
            {ventas.map((venta) => (
              <tr key={venta.id_venta || venta.id} className="border-b hover:bg-slate-50">
                <td className="p-3">{venta.cliente}</td>
                <td className="p-3">{venta.usuario}</td>
                <td className="p-3">{venta.vehiculo}</td>
                <td className="p-3">
                  {venta.fecha ? new Date(venta.fecha).toLocaleDateString("es-VE") : ""}
                </td>
                <td className="p-3">
                  ${Number(venta.precio_final || 0).toLocaleString("es-VE")}
                </td>
                <td className="p-3">{venta.tipo_venta}</td>
                <td className="p-3">{venta.estado}</td>

                <td className="flex gap-2 p-3">
                  <button
                    onClick={() => editarVenta(venta)}
                    className="rounded-lg bg-black px-3 py-2 text-sm text-white"
                  >
                    Editar
                  </button>

                  <button
                    onClick={() => eliminarVenta(venta)}
                    className="rounded-lg bg-red-600 px-3 py-2 text-sm text-white hover:bg-red-700"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}

            {ventas.length === 0 && (
              <tr>
                <td colSpan="8" className="p-4 text-center text-slate-500">
                  No hay ventas registradas.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}