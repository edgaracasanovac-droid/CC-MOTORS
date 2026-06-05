import { useEffect, useState } from "react";
import api from "../../lib/api";

export default function PagosList() {
  const [pagos, setPagos] = useState([]);
  const [ventas, setVentas] = useState([]);
  const [cuotas, setCuotas] = useState([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  const [form, setForm] = useState({
    id_venta_vehiculo: "",
    id_cuota: "",
    monto: "",
    metodo_pago: "transferencia",
    referencia: "",
    estado: "confirmado",
  });

  const [editandoId, setEditandoId] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const obtenerPagos = async () => {
    try {
      const respuesta = await api.get("/pagos");
      setPagos(respuesta.data);
    } catch (error) {
      console.error(error.response?.data || error);
      setError("Error al cargar los pagos");
    } finally {
      setCargando(false);
    }
  };

  const obtenerVentas = async () => {
    try {
      const respuesta = await api.get("/ventas");
      setVentas(respuesta.data);
    } catch (error) {
      console.error(error.response?.data || error);
    }
  };

  const obtenerCuotas = async () => {
    try {
      const respuesta = await api.get("/cuotas");
      setCuotas(respuesta.data);
    } catch (error) {
      console.error(error.response?.data || error);
    }
  };

  useEffect(() => {
    obtenerPagos();
    obtenerVentas();
    obtenerCuotas();
  }, []);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const limpiarFormulario = () => {
    setForm({
      id_venta_vehiculo: "",
      id_cuota: "",
      monto: "",
      metodo_pago: "transferencia",
      referencia: "",
      estado: "confirmado",
    });

    setEditandoId(null);
    setMostrarFormulario(false);
  };

  const abrirNuevo = () => {
    limpiarFormulario();
    setMostrarFormulario(true);
  };

  const guardarPago = async (e) => {
    e.preventDefault();
    setError("");

    const datosPago = {
      ...form,
      id_venta_vehiculo: Number(form.id_venta_vehiculo),
      id_cuota: form.id_cuota ? Number(form.id_cuota) : null,
      monto: Number(form.monto),
    };

    try {
      if (editandoId) {
        await api.put(`/pagos/${editandoId}`, datosPago);
      } else {
        await api.post("/pagos", datosPago);
      }

      limpiarFormulario();
      obtenerPagos();
    } catch (error) {
      console.error(error.response?.data || error);
      setError(
        error.response?.data?.mensaje ||
          error.response?.data?.error ||
          error.response?.data?.message ||
          "Error al guardar el pago"
      );
    }
  };

  const editarPago = (pago) => {
    const id = pago.id_pago || pago.id;

    setEditandoId(id);
    setMostrarFormulario(true);

    setForm({
      id_venta_vehiculo:
        pago.id_venta_vehiculo || pago.id_venta || pago.venta || "",
      id_cuota: pago.id_cuota || "",
      monto: pago.monto || "",
      metodo_pago: pago.metodo_pago || "transferencia",
      referencia: pago.referencia || "",
      estado: pago.estado || "confirmado",
    });
  };

  const eliminarPago = async (pago) => {
    const id = pago.id_pago || pago.id;

    const confirmar = confirm("¿Seguro que deseas eliminar este pago?");
    if (!confirmar) return;

    try {
      await api.delete(`/pagos/${id}`);
      obtenerPagos();
    } catch (error) {
      console.error(error.response?.data || error);
      setError(
        error.response?.data?.mensaje ||
          error.response?.data?.error ||
          error.response?.data?.message ||
          "Error al eliminar el pago"
      );
    }
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return "";
    return new Date(fecha).toLocaleDateString("es-VE");
  };

  if (cargando) return <p>Cargando pagos...</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between rounded-2xl bg-white p-6 shadow">
        <div>
          <h2 className="text-2xl font-bold">Pagos registrados</h2>
          <p className="text-sm text-slate-500">
            Gestiona los pagos asociados a ventas y cuotas.
          </p>
        </div>

        <button
          onClick={abrirNuevo}
          className="rounded-xl bg-red-600 px-5 py-3 font-semibold text-white hover:bg-red-700"
        >
          + Nuevo pago
        </button>
      </div>

      {mostrarFormulario && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow">
          <h2 className="mb-4 text-2xl font-bold">
            {editandoId ? "Editar pago" : "Registrar pago"}
          </h2>

          <form onSubmit={guardarPago} className="grid gap-4 md:grid-cols-2">
            <select
              name="id_venta_vehiculo"
              value={form.id_venta_vehiculo}
              onChange={handleChange}
              className="rounded-xl border p-3"
              required
            >
              <option value="">Selecciona una venta</option>

              {ventas.map((venta) => (
                <option
                  key={venta.id_venta || venta.id}
                  value={venta.id_venta || venta.id}
                >
                  {venta.cliente} - {venta.vehiculo}
                </option>
              ))}
            </select>

            <select
              name="id_cuota"
              value={form.id_cuota}
              onChange={handleChange}
              className="rounded-xl border p-3"
            >
              <option value="">Sin cuota</option>

              {cuotas.map((cuota) => (
                <option key={cuota.id_cuota} value={cuota.id_cuota}>
                  Cuota #{cuota.numero_cuota} - {cuota.cliente}
                </option>
              ))}
            </select>

            <input
              name="monto"
              placeholder="Monto"
              value={form.monto}
              onChange={handleChange}
              className="rounded-xl border p-3"
              required
            />

            <select
              name="metodo_pago"
              value={form.metodo_pago}
              onChange={handleChange}
              className="rounded-xl border p-3"
            >
              <option value="transferencia">Transferencia</option>
              <option value="efectivo">Efectivo</option>
              <option value="pago_movil">Pago móvil</option>
              <option value="tarjeta">Tarjeta</option>
            </select>

            <input
              name="referencia"
              placeholder="Referencia"
              value={form.referencia}
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
              <option value="confirmado">Confirmado</option>
              <option value="pendiente">Pendiente</option>
              <option value="rechazado">Rechazado</option>
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
              <th className="p-3">Venta</th>
              <th className="p-3">Monto</th>
              <th className="p-3">Método</th>
              <th className="p-3">Referencia</th>
              <th className="p-3">Estado</th>
              <th className="p-3">Acciones</th>
            </tr>
          </thead>

          <tbody>
            {pagos.map((pago) => (
              <tr key={pago.id_pago || pago.id} className="border-b hover:bg-slate-50">
                <td className="p-3">
                  {formatearFecha(pago.fecha_pago || pago.fecha)}
                </td>

                <td className="p-3">
                  {pago.cliente || pago.nombre_cliente || "Sin cliente"}
                </td>

                <td className="p-3">
                  {pago.venta || pago.id_venta || pago.id_venta_vehiculo}
                </td>

                <td className="p-3">
                  ${Number(pago.monto || 0).toLocaleString("es-VE")}
                </td>

                <td className="p-3">{pago.metodo_pago}</td>

                <td className="p-3">
                  {pago.referencia || "Sin referencia"}
                </td>

                <td className="p-3">{pago.estado}</td>

                <td className="flex gap-2 p-3">
                  <button
                    onClick={() => editarPago(pago)}
                    className="rounded-lg bg-black px-3 py-2 text-sm text-white"
                  >
                    Editar
                  </button>

                  <button
                    onClick={() => eliminarPago(pago)}
                    className="rounded-lg bg-red-600 px-3 py-2 text-sm text-white hover:bg-red-700"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}

            {pagos.length === 0 && (
              <tr>
                <td colSpan="8" className="p-4 text-center text-slate-500">
                  No hay pagos registrados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}