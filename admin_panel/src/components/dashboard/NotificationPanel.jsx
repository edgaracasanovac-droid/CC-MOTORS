import { useEffect, useRef, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import toast from "react-hot-toast";
import api from "../../lib/api";

const POLL_INTERVAL = 30000;
const STORAGE_KEY = "cc_motors_notifications";
const COUNTS_KEY = "cc_motors_last_counts";

const ENDPOINTS = [
  { key: "cotizaciones", label: "Cotización", icon: "📄", api: "/cotizaciones" },
  { key: "pagos", label: "Pago", icon: "💳", api: "/pagos" },
  { key: "ventas", label: "Venta", icon: "💰", api: "/ventas" },
  { key: "clientes", label: "Cliente", icon: "👥", api: "/clientes" },
  { key: "cuotas", label: "Cuota", icon: "📆", api: "/cuotas" },
];

function getArray(data) {
  if (Array.isArray(data)) return data;
  for (const key of Object.keys(data || {})) {
    if (Array.isArray(data[key])) return data[key];
  }
  return [];
}

function getStoredCounts() {
  try {
    const raw = localStorage.getItem(COUNTS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function storeCounts(counts) {
  try {
    localStorage.setItem(COUNTS_KEY, JSON.stringify(counts));
  } catch {}
}

function getStoredNotifications() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function storeNotifications(notifs) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notifs.slice(0, 50)));
  } catch {}
}

const LAST_ITEMS_KEY = "cc_motors_last_items";

function getStoredLastItems() {
  try {
    const raw = localStorage.getItem(LAST_ITEMS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function storeLastItems(items) {
  try {
    localStorage.setItem(LAST_ITEMS_KEY, JSON.stringify(items));
  } catch {}
}

function extraerNombre(item, tipo) {
  if (!item) return null;
  if (tipo === "ventas") {
    return item.cliente || item.cliente_nombre || item.nombre_cliente || null;
  }
  if (tipo === "pagos") {
    return item.cliente || item.cliente_nombre || item.nombre_cliente || null;
  }
  if (tipo === "cotizaciones") {
    return [item.cliente_nombre, item.cliente_apellido].filter(Boolean).join(" ") || item.cliente || item.nombre || null;
  }
  if (tipo === "clientes") {
    return [item.nombre, item.apellido].filter(Boolean).join(" ") || null;
  }
  if (tipo === "cuotas") {
    return item.cliente || item.cliente_nombre || item.nombre_cliente || null;
  }
  return item.cliente || item.nombre || null;
}

function extraerVehiculo(item) {
  if (!item) return null;
  if (item.nombre_marca && item.nombre_modelo) return `${item.nombre_marca} ${item.nombre_modelo}`;
  if (item.marca && item.modelo) return `${item.marca} ${item.modelo}`;
  if (item.vehiculo) {
    const v = item.vehiculo;
    if (v.marca && v.modelo) return `${v.marca} ${v.modelo}`;
  }
  if (item.placa) return `Placa: ${item.placa}`;
  return null;
}

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Ahora mismo";
  if (mins < 60) return `Hace ${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `Hace ${hrs}h`;
  const days = Math.floor(hrs / 24);
  return `Hace ${days}d`;
}

export default function NotificationPanel() {
  const [notificaciones, setNotificaciones] = useState([]);
  const [unread, setUnread] = useState(0);
  const [abierto, setAbierto] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const panelRef = useRef(null);
  const bellRef = useRef(null);
  const initialized = useRef(false);

  const detectarNuevos = useCallback(async () => {
    try {
      const lastCounts = getStoredCounts();
      const lastItems = getStoredLastItems();
      const newCounts = {};
      const newLastItems = {};

      const responses = await Promise.allSettled(
        ENDPOINTS.map((ep) => api.get(ep.api))
      );

      responses.forEach((res, i) => {
        if (res.status === "fulfilled") {
          const items = getArray(res.value.data);
          newCounts[ENDPOINTS[i].key] = items.length;
          if (items.length > 0) {
            newLastItems[ENDPOINTS[i].key] = items[items.length - 1];
          }
        }
      });

      const nuevas = [];

      ENDPOINTS.forEach((ep) => {
        const prev = lastCounts[ep.key] || 0;
        const curr = newCounts[ep.key] || 0;
        if (curr > prev && prev > 0) {
          const diff = curr - prev;
          const latest = newLastItems[ep.key];
          const nombre = extraerNombre(latest, ep.key);
          const vehiculo = extraerVehiculo(latest);
          let mensaje = "";
          if (nombre) {
            mensaje = diff === 1
              ? `${nombre} realizó una ${ep.label.toLowerCase()} desde la web`
              : `${nombre} y ${diff - 1} más realizaron ${ep.label.toLowerCase()}s desde la web`;
          } else {
            mensaje = diff === 1
              ? `Nueva ${ep.label.toLowerCase()} desde la web`
              : `${diff} nuevas ${ep.label.toLowerCase()}s desde la web`;
          }
          if (vehiculo) mensaje += ` — ${vehiculo}`;

          nuevas.push({
            id: `${ep.key}-${Date.now()}-${Math.random()}`,
            tipo: ep.key,
            label: ep.label,
            icon: ep.icon,
            cantidad: diff,
            nombre: nombre || null,
            vehiculo: vehiculo || null,
            mensaje,
            fecha: new Date().toISOString(),
            leida: false,
          });
        }
      });

      if (nuevas.length > 0) {
        setNotificaciones((prev) => {
          const updated = [...nuevas, ...prev];
          storeNotifications(updated);
          return updated;
        });

        nuevas.forEach((n) => {
          toast((t) => (
            <div className="flex items-center gap-3">
              <span className="text-xl">{n.icon}</span>
              <div>
                <p className="text-sm font-bold">{n.nombre || n.label}</p>
                <p className="text-xs text-slate-400">{n.mensaje}</p>
              </div>
            </div>
          ), { duration: 5000 });
        });
      }

      storeCounts(newCounts);
      storeLastItems(newLastItems);
    } catch (err) {
      console.warn("[Notificaciones] Error polling:", err);
    }
  }, []);

  useEffect(() => {
    const stored = getStoredNotifications();
    setNotificaciones(stored);
    setUnread(stored.filter((n) => !n.leida).length);

    if (!initialized.current) {
      initialized.current = true;
      detectarNuevos();
    }

    const interval = setInterval(detectarNuevos, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [detectarNuevos]);

  useEffect(() => {
    setUnread(notificaciones.filter((n) => !n.leida).length);
  }, [notificaciones]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        panelRef.current && !panelRef.current.contains(e.target) &&
        bellRef.current && !bellRef.current.contains(e.target)
      ) {
        setAbierto(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const marcarLeidas = () => {
    setNotificaciones((prev) => {
      const updated = prev.map((n) => ({ ...n, leida: true }));
      storeNotifications(updated);
      return updated;
    });
  };

  const limpiarTodo = () => {
    setNotificaciones([]);
    storeNotifications([]);
    setAbierto(false);
  };

  const toggle = () => {
    if (!abierto && bellRef.current) {
      const rect = bellRef.current.getBoundingClientRect();
      const panelW = 320;
      const vw = window.innerWidth;
      let left = rect.left;
      if (left + panelW > vw - 8) left = vw - panelW - 8;
      if (left < 8) left = 8;
      setPos({ top: rect.bottom + 8, left });
    }
    setAbierto((prev) => !prev);
    if (!abierto) marcarLeidas();
  };

  const panel = abierto ? createPortal(
    <>
      <div className="fixed inset-0 z-[99]" onClick={() => setAbierto(false)} />
      <div
        ref={panelRef}
        style={{ position: "fixed", top: pos.top, left: pos.left, zIndex: 100 }}
        className="w-80 rounded-2xl border border-slate-200 bg-white shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
          <div>
            <h3 className="text-sm font-black text-slate-900">Notificaciones</h3>
            <p className="text-[11px] text-slate-400">Actividad reciente desde la web</p>
          </div>
          {notificaciones.length > 0 && (
            <button onClick={limpiarTodo} className="text-[11px] font-bold text-red-500 hover:text-red-700">
              Limpiar
            </button>
          )}
        </div>

        <div className="max-h-80 overflow-y-auto">
          {notificaciones.length === 0 ? (
            <div className="px-5 py-10 text-center">
              <p className="text-3xl">🔔</p>
              <p className="mt-2 text-sm font-semibold text-slate-400">Sin notificaciones</p>
              <p className="mt-1 text-xs text-slate-300">Se detectarán cambios cada 30s</p>
            </div>
          ) : (
            notificaciones.slice(0, 15).map((n) => (
              <div
                key={n.id}
                className={`flex items-start gap-3 border-b border-slate-50 px-5 py-3 transition hover:bg-slate-50 ${
                  !n.leida ? "bg-red-50/50" : ""
                }`}
              >
                <span className="mt-0.5 text-lg">{n.icon}</span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-slate-800">{n.nombre || n.label}</p>
                    {!n.leida && <span className="h-2 w-2 shrink-0 rounded-full bg-red-500"></span>}
                  </div>
                  {n.vehiculo && (
                    <p className="mt-0.5 text-xs font-semibold text-slate-600">🚗 {n.vehiculo}</p>
                  )}
                  <p className="mt-0.5 text-xs text-slate-500">{n.mensaje}</p>
                  <p className="mt-1 text-[11px] text-slate-300">{timeAgo(n.fecha)}</p>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="border-t border-slate-100 bg-slate-50 px-5 py-2.5 text-center">
          <p className="text-[11px] font-semibold text-slate-400">
            Polling cada 30s · {notificaciones.filter((n) => !n.leida).length} sin leer
          </p>
        </div>
      </div>
    </>,
    document.body
  ) : null;

  return (
    <div className="relative">
      <button
        ref={bellRef}
        onClick={toggle}
        className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 text-white transition hover:bg-white/10"
        title="Notificaciones"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unread > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-black text-white">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>
      {panel}
    </div>
  );
}
