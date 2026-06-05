import { useEffect, useState } from "react";
import api from "../../lib/api";

export default function VehiculosList() {
  const [vehiculos, setVehiculos] = useState([]);
  const [marcas, setMarcas] = useState([]);
  const [modelos, setModelos] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  const [form, setForm] = useState({
    placa: "",
    color: "",
    ano: "",
    kilometraje: "",
    estado: "disponible",
    precio_compra: "",
    precio_venta: "",
    id_marca: "",
    id_modelo: "",
    id_proveedor: "",
  });

  const [editandoId, setEditandoId] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const obtenerVehiculos = async () => {
    try {
      const respuesta = await api.get("/vehiculos");
      setVehiculos(respuesta.data);
    } catch {
      setError("Error al cargar los vehículos");
    } finally {
      setCargando(false);
    }
  };

  const obtenerMarcas = async () => {
    try {
      const respuesta = await api.get("/marcas");
      setMarcas(respuesta.data);
    } catch (error) {
      console.error(error.response?.data || error);
    }
  };

  const obtenerModelos = async () => {
    try {
      const respuesta = await api.get("/modelos");
      setModelos(respuesta.data);
    } catch (error) {
      console.error(error.response?.data || error);
    }
  };

  const obtenerProveedores = async () => {
    try {
      const respuesta = await api.get("/proveedores");
      setProveedores(respuesta.data);
    } catch (error) {
      console.error(error.response?.data || error);
    }
  };

  useEffect(() => {
    obtenerVehiculos();
    obtenerMarcas();
    obtenerModelos();
    obtenerProveedores();
  }, []);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const limpiarFormulario = () => {
    setForm({
      placa: "",
      color: "",
      ano: "",
      kilometraje: "",
      estado: "disponible",
      precio_compra: "",
      precio_venta: "",
      id_marca: "",
      id_modelo: "",
      id_proveedor: "",
    });

    setEditandoId(null);
    setMostrarFormulario(false);
  };

  const abrirNuevo = () => {
    limpiarFormulario();
    setMostrarFormulario(true);
  };

  const prepararDatos = () => {
    return {
      ...form,
      ano: Number(form.ano),
      kilometraje: Number(form.kilometraje),
      precio_compra: Number(form.precio_compra),
      precio_venta: Number(form.precio_venta),
      id_marca: Number(form.id_marca),
      id_modelo: Number(form.id_modelo),
      id_proveedor: Number(form.id_proveedor),
    };
  };

  const guardarVehiculo = async (e) => {
    e.preventDefault();
    setError("");

    const datosVehiculo = prepararDatos();

    try {
      if (editandoId) {
        await api.put(`/vehiculos/${editandoId}`, datosVehiculo);
      } else {
        await api.post("/vehiculos", datosVehiculo);
      }

      limpiarFormulario();
      obtenerVehiculos();
    } catch (error) {
      console.error(error.response?.data || error);
      setError("Error al guardar el vehículo");
    }
  };

  const editarVehiculo = (vehiculo) => {
    setMostrarFormulario(true);
    setEditandoId(vehiculo.id_vehiculo || vehiculo.id);

    setForm({
      placa: vehiculo.placa || "",
      color: vehiculo.color || "",
      ano: vehiculo.ano || "",
      kilometraje: vehiculo.kilometraje || "",
      estado: vehiculo.estado || "disponible",
      precio_compra: vehiculo.precio_compra || "",
      precio_venta: vehiculo.precio_venta || "",
      id_marca: vehiculo.id_marca || "",
      id_modelo: vehiculo.id_modelo || "",
      id_proveedor: vehiculo.id_proveedor || "",
    });
  };

  const eliminarVehiculo = async (id) => {
    const confirmar = confirm("¿Seguro que deseas eliminar este vehículo?");
    if (!confirmar) return;

    try {
      await api.delete(`/vehiculos/${id}`);
      obtenerVehiculos();
    } catch {
      setError("Error al eliminar el vehículo");
    }
  };

  if (cargando) return <p>Cargando vehículos...</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between rounded-2xl bg-white p-6 shadow">
        <div>
          <h2 className="text-2xl font-bold">Vehículos registrados</h2>
          <p className="text-sm text-slate-500">
            Gestiona el inventario de vehículos de la concesionaria.
          </p>
        </div>

        <button
          onClick={abrirNuevo}
          className="rounded-xl bg-red-600 px-5 py-3 font-semibold text-white hover:bg-red-700"
        >
          + Nuevo vehículo
        </button>
      </div>

      {mostrarFormulario && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow">
          <h2 className="mb-4 text-2xl font-bold">
            {editandoId ? "Editar vehículo" : "Registrar vehículo"}
          </h2>

          <form onSubmit={guardarVehiculo} className="grid gap-4 md:grid-cols-2">
            <input name="placa" placeholder="Placa" value={form.placa} onChange={handleChange} className="rounded-xl border p-3" required />
            <input name="color" placeholder="Color" value={form.color} onChange={handleChange} className="rounded-xl border p-3" required />
            <input name="ano" placeholder="Año" value={form.ano} onChange={handleChange} className="rounded-xl border p-3" required />
            <input name="kilometraje" placeholder="Kilometraje" value={form.kilometraje} onChange={handleChange} className="rounded-xl border p-3" required />
            <input name="estado" placeholder="Estado" value={form.estado} onChange={handleChange} className="rounded-xl border p-3" required />
            <input name="precio_compra" placeholder="Precio compra" value={form.precio_compra} onChange={handleChange} className="rounded-xl border p-3" required />
            <input name="precio_venta" placeholder="Precio venta" value={form.precio_venta} onChange={handleChange} className="rounded-xl border p-3" required />

            <select name="id_marca" value={form.id_marca} onChange={handleChange} className="rounded-xl border p-3" required>
              <option value="">Selecciona una marca</option>
              {marcas.map((marca) => (
                <option key={marca.id_marca} value={marca.id_marca}>
                  {marca.nombre}
                </option>
              ))}
            </select>

            <select name="id_modelo" value={form.id_modelo} onChange={handleChange} className="rounded-xl border p-3" required>
              <option value="">Selecciona un modelo</option>
              {modelos.map((modelo) => (
                <option key={modelo.id_modelo} value={modelo.id_modelo}>
                  {modelo.nombre}
                </option>
              ))}
            </select>

            <select name="id_proveedor" value={form.id_proveedor} onChange={handleChange} className="rounded-xl border p-3" required>
              <option value="">Selecciona un proveedor</option>
              {proveedores.map((proveedor) => (
                <option key={proveedor.id_proveedor} value={proveedor.id_proveedor}>
                  {proveedor.nombre}
                </option>
              ))}
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
              <th className="p-3">Placa</th>
              <th className="p-3">Color</th>
              <th className="p-3">Año</th>
              <th className="p-3">Kilometraje</th>
              <th className="p-3">Precio venta</th>
              <th className="p-3">Estado</th>
              <th className="p-3">Acciones</th>
            </tr>
          </thead>

          <tbody>
            {vehiculos.map((vehiculo) => (
              <tr key={vehiculo.id_vehiculo || vehiculo.id} className="border-b hover:bg-slate-50">
                <td className="p-3">{vehiculo.placa}</td>
                <td className="p-3">{vehiculo.color}</td>
                <td className="p-3">{vehiculo.ano || vehiculo.anio}</td>
                <td className="p-3">{vehiculo.kilometraje}</td>
                <td className="p-3">{vehiculo.precio_venta}</td>
                <td className="p-3">{vehiculo.estado}</td>
                <td className="flex gap-2 p-3">
                  <button
                    onClick={() => editarVehiculo(vehiculo)}
                    className="rounded-lg bg-black px-3 py-2 text-sm text-white"
                  >
                    Editar
                  </button>

                  <button
                    onClick={() => eliminarVehiculo(vehiculo.id_vehiculo || vehiculo.id)}
                    className="rounded-lg bg-red-600 px-3 py-2 text-sm text-white hover:bg-red-700"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}

            {vehiculos.length === 0 && (
              <tr>
                <td colSpan="7" className="p-4 text-center text-slate-500">
                  No hay vehículos registrados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}