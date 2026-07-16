import { useState } from "react";
import toast from "react-hot-toast";

export default function TestDriveList() {
  const [promptVisible, setPromptVisible] = useState(false);

  const endpointsDisponibles = [
    {
      metodo: "POST",
      ruta: "/api/test-drive",
      descripcion: "Permite que un cliente solicite una prueba de manejo desde la website.",
      estado: "Disponible",
    },
    {
      metodo: "GET",
      ruta: "/api/test-drive/mis-solicitudes",
      descripcion: "Permite que un cliente vea sus propias solicitudes de test drive.",
      estado: "Disponible",
    },
  ];

  const endpointsNecesarios = [
    {
      metodo: "GET",
      ruta: "/api/test-drive",
      descripcion: "Listar todas las solicitudes recibidas desde la website.",
    },
    {
      metodo: "GET",
      ruta: "/api/test-drive/:id",
      descripcion: "Consultar el detalle de una solicitud específica.",
    },
    {
      metodo: "PUT",
      ruta: "/api/test-drive/:id",
      descripcion: "Actualizar estado, fecha, observaciones o asignación interna.",
    },
    {
      metodo: "DELETE",
      ruta: "/api/test-drive/:id",
      descripcion: "Eliminar o anular una solicitud desde el panel administrativo.",
    },
  ];

  const camposSugeridos = [
    "id_test_drive",
    "nombre",
    "apellido",
    "documento",
    "telefono",
    "correo",
    "direccion",
    "id_vehiculo",
    "marca",
    "modelo",
    "fecha_solicitada",
    "hora_solicitada",
    "mensaje",
    "estado",
    "observaciones",
    "fecha_creacion",
  ];

  const promptBackend = `Necesito agregar endpoints administrativos para el módulo de Test Drive del panel de CC Motors.

Actualmente la website genera solicitudes de prueba de manejo, pero el panel administrativo necesita recibirlas, revisarlas y gestionarlas.

Endpoints requeridos:

GET /api/test-drive
- Debe listar todas las solicitudes de test drive.
- Debe mostrar datos del cliente, vehículo solicitado, fecha, hora, mensaje y estado.
- Debe estar protegido con JWT.

GET /api/test-drive/:id
- Debe mostrar el detalle completo de una solicitud.
- Debe estar protegido con JWT.

PUT /api/test-drive/:id
- Debe permitir actualizar:
  estado
  fecha_solicitada
  hora_solicitada
  observaciones
- Debe estar protegido con JWT.

DELETE /api/test-drive/:id
- Debe permitir eliminar o anular una solicitud.
- Debe estar protegido con JWT.

Estados sugeridos:
pendiente
confirmado
realizado
cancelado

Campos sugeridos:
id_test_drive
nombre
apellido
documento
telefono
correo
direccion
id_vehiculo
fecha_solicitada
hora_solicitada
mensaje
estado
observaciones
fecha_creacion

El panel administrativo necesita consumir estos endpoints para mostrar una tabla de solicitudes, ver detalles, cambiar estado y eliminar solicitudes.`;

  const copiarPrompt = async () => {
    try {
      await navigator.clipboard.writeText(promptBackend);
      toast.success("Prompt copiado para el backend");
    } catch (error) {
      console.error(error);
      toast.error("No se pudo copiar el prompt");
    }
  };

  return (
    <div className="space-y-6">
      <section className="rounded-3xl bg-black p-8 text-white shadow-xl">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="mb-2 text-sm font-bold uppercase tracking-[0.3em] text-red-500">
              Website CC Motors
            </p>

            <h2 className="text-3xl font-black">
              Solicitudes de Test Drive
            </h2>

            <p className="mt-2 max-w-2xl text-slate-300">
              Este módulo representa las pruebas de manejo generadas desde la
              website. Actualmente el backend solo tiene endpoints para el cliente,
              por eso el panel queda preparado hasta que se agreguen las rutas
              administrativas.
            </p>
          </div>

          <button
            onClick={() => setPromptVisible(!promptVisible)}
            className="rounded-2xl bg-red-600 px-6 py-4 font-bold text-white transition hover:bg-red-700"
          >
            {promptVisible ? "Ocultar prompt" : "Ver prompt backend"}
          </button>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase text-slate-500">
            Estado del módulo
          </p>
          <p className="mt-2 text-3xl font-black text-yellow-600">
            Pendiente
          </p>
          <p className="mt-2 text-sm text-slate-500">
            Falta endpoint administrativo
          </p>
        </div>

        <div className="rounded-3xl border border-green-200 bg-green-50 p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase text-green-700">
            Website
          </p>
          <p className="mt-2 text-4xl font-black text-green-700">Activa</p>
          <p className="mt-2 text-sm text-green-700">
            Puede generar solicitudes
          </p>
        </div>

        <div className="rounded-3xl border border-red-200 bg-red-50 p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase text-red-700">
            Panel admin
          </p>
          <p className="mt-2 text-4xl font-black text-red-700">0</p>
          <p className="mt-2 text-sm text-red-700">
            Sin endpoint para listar todo
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase text-slate-500">
            Endpoints faltantes
          </p>
          <p className="mt-2 text-4xl font-black text-black">4</p>
          <p className="mt-2 text-sm text-slate-500">
            Para gestión completa
          </p>
        </div>
      </section>

      <section className="rounded-3xl border border-yellow-200 bg-yellow-50 p-6 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-start">
          <div className="text-4xl">⚠️</div>

          <div>
            <h3 className="text-xl font-black text-yellow-900">
              Este módulo todavía no debe consumir datos reales en el panel
            </h3>

            <p className="mt-2 text-sm leading-6 text-yellow-800">
              El backend actual solo permite crear solicitudes desde la website y
              consultar las solicitudes propias del cliente. Para el panel
              administrativo hace falta un endpoint que permita listar todas las
              solicitudes recibidas por la empresa.
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6">
            <p className="text-sm font-bold uppercase tracking-widest text-green-600">
              Backend actual
            </p>

            <h3 className="text-2xl font-black text-black">
              Endpoints disponibles
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              Estas rutas existen, pero no son suficientes para administrar todas
              las solicitudes desde el panel.
            </p>
          </div>

          <div className="space-y-4">
            {endpointsDisponibles.map((endpoint) => (
              <div
                key={endpoint.ruta}
                className="rounded-2xl border border-green-200 bg-green-50 p-4"
              >
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-green-700 px-3 py-1 text-xs font-bold text-white">
                    {endpoint.metodo}
                  </span>

                  <span className="font-mono text-sm font-bold text-green-900">
                    {endpoint.ruta}
                  </span>
                </div>

                <p className="text-sm text-green-800">
                  {endpoint.descripcion}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6">
            <p className="text-sm font-bold uppercase tracking-widest text-red-600">
              Pendiente para admin
            </p>

            <h3 className="text-2xl font-black text-black">
              Endpoints necesarios
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              Con estas rutas ya se podría construir el CRUD real del módulo.
            </p>
          </div>

          <div className="space-y-4">
            {endpointsNecesarios.map((endpoint) => (
              <div
                key={endpoint.ruta}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
              >
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-black px-3 py-1 text-xs font-bold text-white">
                    {endpoint.metodo}
                  </span>

                  <span className="font-mono text-sm font-bold text-slate-900">
                    {endpoint.ruta}
                  </span>
                </div>

                <p className="text-sm text-slate-600">
                  {endpoint.descripcion}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6">
          <p className="text-sm font-bold uppercase tracking-widest text-red-600">
            Estructura recomendada
          </p>

          <h3 className="text-2xl font-black text-black">
            Campos que debería devolver el backend
          </h3>

          <p className="mt-2 text-sm text-slate-500">
            Estos campos permiten mostrar una tabla completa de solicitudes de
            prueba de manejo en el panel administrativo.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {camposSugeridos.map((campo) => (
            <div
              key={campo}
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 font-mono text-sm font-bold text-slate-700"
            >
              {campo}
            </div>
          ))}
        </div>
      </section>

      {promptVisible && (
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-widest text-red-600">
                Prompt para el backend
              </p>

              <h3 className="text-2xl font-black text-black">
                Solicitud de endpoints administrativos
              </h3>
            </div>

            <button
              onClick={copiarPrompt}
              className="rounded-xl bg-black px-5 py-3 font-bold text-white transition hover:bg-red-600"
            >
              Copiar prompt
            </button>
          </div>

          <pre className="max-h-[500px] overflow-auto rounded-2xl bg-black p-5 text-sm leading-6 text-white">
            {promptBackend}
          </pre>
        </section>
      )}

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="overflow-x-auto rounded-2xl border border-slate-200">
          <table className="min-w-[1000px] w-full border-collapse">
            <thead className="bg-black text-white">
              <tr className="text-left text-sm">
                <th className="p-4">Cliente</th>
                <th className="p-4">Vehículo</th>
                <th className="p-4">Fecha solicitada</th>
                <th className="p-4">Estado</th>
                <th className="p-4">Acciones</th>
              </tr>
            </thead>

            <tbody>
              <tr>
                <td colSpan="5" className="p-10 text-center">
                  <div className="mx-auto max-w-md">
                    <p className="text-4xl">🚗</p>

                    <h3 className="mt-3 text-xl font-black text-black">
                      Módulo preparado
                    </h3>

                    <p className="mt-2 text-sm text-slate-500">
                      Cuando el backend agregue los endpoints administrativos,
                      aquí se mostrará la tabla real de solicitudes de test drive.
                    </p>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}