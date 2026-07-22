import { useState } from "react";
import { LayoutDashboard, ShieldCheck, TrendingUp, Users, Settings, User, LogOut, ChevronRight, Shield, Bell } from "lucide-react";

// Importamos las vistas del admin (Asegúrate de crear el archivo AdminReportesView.tsx vacío por ahora si aún no lo haces)
import AdminAuditoriaView from "./AdminAuditoriaView";
import AdminUsuariosView from "./AdminUsuarioView";
// import AdminReportesView from "./AdminReportesView"; 

interface SessionUser {
  role: string;
  name: string;
  email: string;
}

const ADMIN_NAV = [
  { icon: ShieldCheck,     label: "Auditoría / Bajas", id: "auditoria"},
  { icon: Users,           label: "Usuarios",          id: "usuarios" },
];

// Componente placeholder para las pantallas que no hemos desarrollado (Configuración, Usuarios, etc)
function AdminPlaceholderView({ label }: { label: string }) {
  return (
    <div className="flex-1 flex items-center justify-center flex-col gap-3 bg-slate-50 text-slate-400">
      <Settings size={32} className="opacity-30" />
      <p className="text-sm font-medium">{label} — En construcción para futura versión</p>
    </div>
  );
}

export function AdminApp({ user, onLogout }: { user: SessionUser; onLogout: () => void }) {
  const [activeNav, setActiveNav] = useState("auditoria");
  const today = new Date().toLocaleDateString("es-PE", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  const titles: Record<string, { title: string; subtitle: string }> = {
    panel:     { title: "Panel Ejecutivo",              subtitle: "Vista de alto nivel · Joba Perú" },
    auditoria: { title: "Auditoría y Bajas de Activos", subtitle: "Gestión de herramientas con incidencias graves" },
    reportes:  { title: "Reportes Estadísticos",        subtitle: "Impacto económico y tendencias" },
    usuarios:  { title: "Gestión de Usuarios",          subtitle: "Roles y permisos del sistema" },
    config:    { title: "Configuración",                subtitle: "Parámetros del sistema" },
  };
  
  const meta = titles[activeNav];

  return (
    <div className="flex h-screen w-full overflow-hidden font-sans bg-slate-50">
      
      {/* SIDEBAR ADMINISTRADOR (Tema oscuro c/ Morado) */}
      <aside className="flex flex-col w-64 shrink-0 h-full text-white" style={{ background: "#1A0A2E", borderRight: "1px solid rgba(124,58,237,0.15)" }}>
        
        <div className="px-6 py-6 border-b" style={{ borderColor: "rgba(124,58,237,0.15)" }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-violet-600 shadow-md">
              <Shield size={20} color="#fff" />
            </div>
            <div>
              <p className="text-white font-bold text-sm tracking-wide">JOBA PERÚ</p>
              <p className="text-[10px] text-violet-300 font-mono tracking-widest uppercase">Directorio</p>
            </div>
          </div>
        </div>

        <div className="mx-4 mt-5 mb-2 px-3 py-2 rounded-lg bg-violet-900/30 border border-violet-500/30 text-center">
          <p className="text-[10px] font-bold text-violet-300 uppercase tracking-widest">Administrador General</p>
        </div>

        <nav className="flex-1 py-4 px-4 flex flex-col gap-1">
          {ADMIN_NAV.map(({ icon: Icon, label, id }) => {
            const isActive = activeNav === id;
            return (
              <button 
                key={id} 
                onClick={() => setActiveNav(id)} 
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium w-full text-left transition-all duration-200"
                style={{ 
                  background: isActive ? "rgba(124,58,237,0.18)" : "transparent", 
                  color: isActive ? "#C4B5FD" : "#94A3B8", 
                  borderLeft: isActive ? "3px solid #7C3AED" : "3px solid transparent" 
                }}
              >
                <Icon size={18} />
                <span>{label}</span>
                {isActive && <ChevronRight size={14} className="ml-auto opacity-50" />}
              </button>
            );
          })}
        </nav>

        <div className="mx-4 mb-3 p-3 rounded-lg flex items-center gap-3 bg-violet-900/20 border border-violet-800/30">
          <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 bg-violet-600"><User size={16} color="#fff" /></div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-white truncate">{user.name}</p>
            <p className="text-[10px] text-violet-300 font-mono">Rol Ejecutivo</p>
          </div>
        </div>
        
        <button onClick={onLogout} className="mx-4 mb-6 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-xs font-bold transition text-red-400 bg-red-950/30 hover:bg-red-900/50 border border-red-900/50">
          <LogOut size={14} />Cerrar Sesión
        </button>
      </aside>

      {/* ÁREA PRINCIPAL */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        <header className="flex items-center justify-between px-8 py-4 border-b shrink-0 bg-white shadow-sm" style={{ borderColor: "var(--border)" }}>
          <div>
            <h1 className="font-bold text-xl text-slate-800 tracking-tight">{meta.title}</h1>
            <p className="text-xs mt-1 text-slate-500 capitalize">{today} — {meta.subtitle}</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-violet-50 text-violet-700 border border-violet-100 flex items-center gap-1">
              <Shield size={12} />Admin General
            </span>
            <button className="w-9 h-9 rounded-full flex items-center justify-center relative bg-slate-100 hover:bg-slate-200 transition">
              <Bell size={16} className="text-slate-600" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full border-2 border-white bg-red-500" />
            </button>
          </div>
        </header>
        
        {/* Renderizado de vistas del Admin */}
        {activeNav === "auditoria" && <AdminAuditoriaView />}
        
        {/* Aquí renderizaremos el AdminReportesView cuando lo creemos en el siguiente paso */}
        {/* {activeNav === "reportes"  && <AdminReportesView />} */}
        {activeNav === "reportes"  && <AdminPlaceholderView label="Reportes Estadísticos (Módulo Próximo)" />}

        {/* Placeholders */}
        {activeNav === "panel"     && <AdminPlaceholderView label="Panel Ejecutivo" />}
        {activeNav === "usuarios"  && <AdminUsuariosView />}
        {activeNav === "config"    && <AdminPlaceholderView label="Configuración del Sistema" />}
      </div>
      
    </div>
  );
}