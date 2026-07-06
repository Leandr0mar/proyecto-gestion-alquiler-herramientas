import { useState } from "react";
import { LayoutDashboard, Package, ArrowRightLeft, Undo2, AlertTriangle, HardHat, User, LogOut, ChevronRight, Bell } from "lucide-react";

import DashboardView from "./DashboardView";
import InventarioView from "./InventarioView";
import PrestamosView from "./PrestamosView";
import DevolucionesView from "./DevolucionesView";
import IncidenciasView from "./IncidenciasView";

interface SessionUser {
  role: string;
  name: string;
  email: string;
}

const ALMC_NAV = [
  { icon: LayoutDashboard, label: "Dashboard",    id: "dashboard"    },
  { icon: Package,         label: "Inventario",   id: "inventario"   },
  { icon: ArrowRightLeft,  label: "Préstamos",    id: "prestamos"    },
  { icon: Undo2,           label: "Devoluciones", id: "devoluciones" },
  { icon: AlertTriangle,   label: "Incidencias",  id: "incidencias"  },
];

const ALMC_VIEW_META: Record<string, { title: string; subtitle: string }> = {
  dashboard:    { title: "Panel de Control",                   subtitle: "Resumen operativo del día" },
  inventario:   { title: "Inventario de Herramientas",         subtitle: "Stock físico actual del almacén" },
  prestamos:    { title: "Registrar Préstamo de Herramientas", subtitle: "Flujo de salida de activos a obra" },
  devoluciones: { title: "Registro de Devoluciones",           subtitle: "Recepción e inspección de herramientas" },
  incidencias:  { title: "Gestión de Incidencias",             subtitle: "Alertas activas y reportes de baja" },
};

export function AlmaceneroApp({ user, onLogout }: { user: SessionUser; onLogout: () => void }) {
  const [activeNav, setActiveNav] = useState("dashboard");
  
  // Estado para guardar el ID del préstamo que se enviará a Incidencias
  const [incidenciaPrefillId, setIncidenciaPrefillId] = useState<string>("");

  const meta = ALMC_VIEW_META[activeNav];
  const today = new Date().toLocaleDateString("es-PE", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  // Función puente: Cambia la vista y pasa el ID
  const handleGoToIncidencias = (idAsignacion: number) => {
    setIncidenciaPrefillId(idAsignacion.toString());
    setActiveNav("incidencias");
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-50 font-sans">
      
      {/* SIDEBAR */}
      <aside className="flex flex-col w-64 shrink-0 h-full text-white" style={{ background: "#0F172A", borderRight: "1px solid #1E293B" }}>
        <div className="px-6 py-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-red-600 shadow-md">
              <HardHat size={20} color="#fff" />
            </div>
            <div>
              <p className="text-white font-bold text-sm tracking-wide">JOBA PERÚ</p>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest font-mono">Control Activos</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 py-6 px-4 flex flex-col gap-1">
          <p className="px-2 mb-3 text-[10px] font-bold uppercase tracking-widest text-slate-500">Módulos Operativos</p>
          {ALMC_NAV.map(({ icon: Icon, label, id }) => {
            const isActive = activeNav === id;
            return (
              <button 
                key={id} 
                onClick={() => setActiveNav(id)} 
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium w-full text-left transition-all duration-200"
                style={{ 
                  background: isActive ? "#1E293B" : "transparent", 
                  color: isActive ? "#fff" : "#94A3B8", 
                  borderLeft: isActive ? "3px solid #DC2626" : "3px solid transparent" 
                }}
              >
                <Icon size={18} />
                <span>{label}</span>
                {isActive && <ChevronRight size={14} className="ml-auto opacity-50" />}
              </button>
            );
          })}
        </nav>

        <div className="mx-4 mb-3 p-3 rounded-lg flex items-center gap-3 bg-slate-800/50 border border-slate-700/50">
          <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 bg-slate-700"><User size={16} color="#fff" /></div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-white truncate">{user.name}</p>
            <p className="text-[10px] text-slate-400 font-mono">Almacenero</p>
          </div>
        </div>
        <button onClick={onLogout} className="mx-4 mb-6 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-xs font-bold transition text-red-400 bg-red-950/30 hover:bg-red-900/40 border border-red-900/50">
          <LogOut size={14} />Cerrar Sesión
        </button>
      </aside>

      {/* ÁREA PRINCIPAL */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        <header className="flex items-center justify-between px-8 py-4 border-b shrink-0 bg-white shadow-sm z-10" style={{ borderColor: "var(--border)" }}>
          <div>
            <h1 className="font-bold text-xl text-slate-800 tracking-tight">{meta.title}</h1>
            <p className="text-xs mt-1 text-slate-500 capitalize">{today} — {meta.subtitle}</p>
          </div>
          <div className="flex items-center gap-4">
            <button className="w-9 h-9 rounded-full flex items-center justify-center relative bg-slate-100 hover:bg-slate-200 transition">
              <Bell size={16} className="text-slate-600" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full border-2 border-white bg-red-500" />
            </button>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold bg-green-50 text-green-700 border border-green-200">
              <span className="w-2 h-2 rounded-full bg-green-500 inline-block animate-pulse" />
              Turno Activo
            </div>
          </div>
        </header>

        {activeNav === "dashboard"    && <DashboardView />}
        {activeNav === "inventario"   && <InventarioView />}
        {activeNav === "prestamos"    && <PrestamosView />}
        {activeNav === "devoluciones" && <DevolucionesView onNavigateToIncidencia={handleGoToIncidencias} />}
        {activeNav === "incidencias"  && <IncidenciasView prefillId={incidenciaPrefillId} />}
      </div>
    </div>
  );
}