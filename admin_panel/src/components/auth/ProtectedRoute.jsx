import { useEffect, useState } from "react";

const ROLES_ADMIN = [1, 3, 4];

const getPageRequiredRoles = () => {
  const path = window.location.pathname;

  const adminOnly = ["/dashboard/usuarios", "/dashboard/marcas", "/dashboard/modelos", "/dashboard/proveedores"];

  if (adminOnly.some((p) => path.startsWith(p))) {
    return [1, 3];
  }

  const gerenteAdmin = ["/dashboard/planes-financiamiento", "/dashboard/cuotas", "/dashboard/pagos"];

  if (gerenteAdmin.some((p) => path.startsWith(p))) {
    return [1, 3];
  }

  return ROLES_ADMIN;
};

export default function ProtectedRoute() {
  const [verificando, setVerificando] = useState(true);
  const [sinPermiso, setSinPermiso] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const token = window.localStorage.getItem("token");

    if (!token) {
      window.location.replace("/login");
      return;
    }

    const usuario = (() => {
      try {
        return JSON.parse(window.localStorage.getItem("usuario"));
      } catch {
        return null;
      }
    })();

    const idRol = usuario?.id_rol;

    if (idRol === undefined || idRol === null) {
      window.location.replace("/login");
      return;
    }

    const rolesRequeridos = getPageRequiredRoles();

    if (!rolesRequeridos.includes(idRol)) {
      setSinPermiso(true);
      setVerificando(false);
      return;
    }

    setVerificando(false);
  }, []);

  if (verificando) {
    return null;
  }

  if (sinPermiso) {
    return (
      <div class="flex min-h-[60vh] items-center justify-center">
        <div class="max-w-md rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-lg">
          <p class="text-sm font-bold uppercase tracking-widest text-red-600">
            Acceso restringido
          </p>
          <h1 class="mt-4 text-3xl font-black text-black">
            No tienes permisos
          </h1>
          <p class="mt-4 text-slate-600">
            Esta sección está reservada para administradores y gerentes.
          </p>
          <a
            href="/dashboard"
            class="mt-8 inline-block rounded-xl bg-red-600 px-6 py-3 font-bold text-white transition hover:bg-red-700"
          >
            Volver al Dashboard
          </a>
        </div>
      </div>
    );
  }

  return null;
}