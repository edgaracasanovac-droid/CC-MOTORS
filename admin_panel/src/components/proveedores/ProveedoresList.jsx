import { useEffect, useState } from "react";
import api from "../../lib/api";

export default function ProveedoresList() {
  const [proveedores, setProveedores] = useState([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  const [form, setForm] = useState({
    nombre: "",
    telefono: "",
    correo: "",
    direccion: "",
    estado: "activo",
  });

  const [editandoId, setEditandoId] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const obtenerProveedores = async () => {
    try {
      const respuesta = await api.get("/proveedores");
      setProveedores(respuesta.data);
    } catch {
      setError("Error al cargar los proveedores");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
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
      nombre: "",
      telefono: "",
      correo: "",
      direccion: "",
      estado: "activo",
    });

    setEditandoId(null);
    setMostrarFormulario(false);
  };

  const abrirNuevo = () => {
    limpiarFormulario();
    setMostrarFormulario(true);
  };

  const guardarProveedor = async (e) => {
    e.preventDefault();
    setError("");

    try {
      if (editandoId) {
        await api.put(`/proveedores/${editandoId}`, form);
      } else {
        await api.post("/proveedores", form);
      }

      limpiarFormulario();
      obtenerProveedores();
    } catch (error) {
      console.error(error.response?.data || error);
      setError(
        error.response?.data?.mensaje ||
          error.response?.data?.error ||
          "Error al guardar el proveedor"
      );
    }
  };

  const editarProveedor = (proveedor) => {
    setEditandoId(proveedor.id_proveedor);
    setMostrarFormulario(true);

    setForm({
      nombre: proveedor.nombre || "",
      telefono: proveedor.telefono || "",
      correo: proveedor.correo || "",
      direccion: proveedor.direccion || "",
      estado: proveedor.estado || "activo",
    });
  };

  const eliminarProveedor = async (id) => {
    const confirmar = confirm("¿Seguro que deseas eliminar este proveedor?");
    if (!confirmar) return;

    try {
      await api.delete(`/proveedores/${id}`);
      obtenerProveedores();
    } catch (error) {
      console.error(error.response?.data || error);
      setError(
        error.response?.data?.mensaje ||
          error.response?.data?.error ||
          "Error al eliminar el proveedor"
      );
    }
  };

  if (cargando) return <p>Cargando proveedores...</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between rounded-2xl bg-white p-6 shadow">
        <div>
          <h2 className="text-2xl font-bold">Proveedores registrados</h2>
          <p className="text-sm text-slate-500">
            Gestiona los proveedores de la concesionaria.
          </p>
        </div>

        <button
          onClick={abrirNuevo}
          className="rounded-xl bg-red-600 px-5 py-3 font-semibold text-white hover:bg-red-700"
        >
          + Nuevo proveedor
        </button>
      </div>

      {mostrarFormulario && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow">
          <h2 className="mb-4 text-2xl font-bold">
            {editandoId ? "Editar proveedor" : "Registrar proveedor"}
          </h2>

          <form onSubmit={guardarProveedor} className="grid gap-4 md:grid-cols-2">
            <input name="nombre" placeholder="Nombre" value={form.nombre} onChange={handleChange} className="rounded-xl border p-3" required />
            <input name="telefono" placeholder="Teléfono" value={form.telefono} onChange={handleChange} className="rounded-xl border p-3" required />
            <input name="correo" placeholder="Correo" value={form.correo} onChange={handleChange} className="rounded-xl border p-3" required />
            <input name="direccion" placeholder="Dirección" value={form.direccion} onChange={handleChange} className="rounded-xl border p-3" required />
            <input name="estado" placeholder="Estado" value={form.estado} onChange={handleChange} className="rounded-xl border p-3" required />

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
              <th className="p-3">Nombre</th>
              <th className="p-3">Teléfono</th>
              <th className="p-3">Correo</th>
              <th className="p-3">Dirección</th>
              <th className="p-3">Estado</th>
              <th className="p-3">Acciones</th>
            </tr>
          </thead>

          <tbody>
            {proveedores.map((proveedor) => (
              <tr key={proveedor.id_proveedor} className="border-b hover:bg-slate-50">
                <td className="p-3">{proveedor.nombre}</td>
                <td className="p-3">{proveedor.telefono}</td>
                <td className="p-3">{proveedor.correo}</td>
                <td className="p-3">{proveedor.direccion}</td>
                <td className="p-3">{proveedor.estado}</td>

                <td className="flex gap-2 p-3">
                  <button
                    onClick={() => editarProveedor(proveedor)}
                    className="rounded-lg bg-black px-3 py-2 text-sm text-white"
                  >
                    Editar
                  </button>

                  <button
                    onClick={() => eliminarProveedor(proveedor.id_proveedor)}
                    className="rounded-lg bg-red-600 px-3 py-2 text-sm text-white hover:bg-red-700"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}

            {proveedores.length === 0 && (
              <tr>
                <td colSpan="6" className="p-4 text-center text-slate-500">
                  No hay proveedores registrados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}