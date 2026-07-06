import { useState, useEffect } from "react";
import { AlertCircle, CheckCircle2, ShieldCheck, Eye, Zap } from "lucide-react";
import { SectionCard } from "../../components/shared/SectionCard";
import { Badge } from "../../components/shared/Badge";

// Interfaz que refleja tu entidad ReportesIncidencia de Java
interface Incidencia {
  id: number;
  fechaReporte: string;
  detalleIncidencia: string;
  tipoIncidencia: string;
  reporteAsignacion: {
    operario: { nombre: string; apellido: string };
    detalles: any[];
  };
}

// Simulamos el costo en React para la demo, pero en la vida real vendría de la BD
const COSTO_ESTIMADO = 450; 

export default function AdminAuditoriaView() {
  const [incidencias, setIncidencias] = useState<Incidencia[]>([]);
  const [bajasAprobadas, setBajasAprobadas] = useState<Set<number>>(new Set());
  const [cargando, setCargando] = useState(true);

  // Traer la lista de incidencias reportadas por el Almacenero
  useEffect(() => {
    const fetchIncidencias = async () => {
      try {
        const response = await fetch("http://localhost:8080/api/admin/incidencias");
        if (response.ok) {
          const data = await response.json();
          setIncidencias(data);
        }
      } catch (error) {
        console.error("Error al cargar auditoría:", error);
      } finally {
        setCargando(false);
      }
    };
    fetchIncidencias();
  }, []);

  // Función para aprobar la baja definitiva conectada a Spring Boot
  const handleApproveBaja = async (idIncidencia: number, idHerramienta: number) => {
    if (!confirm("¿Está seguro de dar de baja definitivamente este activo de la empresa?")) return;

    try {
      const response = await fetch(`http://localhost:8080/api/admin/herramientas/${idHerramienta}/baja`, {
        method: "PUT"
      });

      if (response.ok) {
        alert("Baja aprobada correctamente. El estado del activo es BAJA DEFINITIVA.");
        // Actualizamos la UI localmente para no tener que recargar toda la tabla
        setBajasAprobadas(prev => new Set(prev).add(idIncidencia));
      } else {
        alert("Ocurrió un error al intentar procesar la baja.");
      }
    } catch (error) {
      console.error(error);
      alert("Error de red al conectar con el servidor.");
    }
  };

  if (cargando) return <div className="p-8 text-center text-slate-500">Cargando reportes de auditoría...</div>;

  const pendientes = incidencias.length - bajasAprobadas.size;

  return (
    <div className="flex-1 overflow-y-auto px-7 py-6 bg-slate-50" style={{ scrollbarWidth:"none" }}>
      
      {/* Resumen Superior */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Reportes Pendientes de Aprobación", value: pendientes, color: "#B91C1C", bg: "#FEF2F2" },
          { label: "Bajas Aprobadas este Mes",          value: bajasAprobadas.size, color: "#1B4F8A", bg: "#EFF6FF" },
          { label: "Capital Comprometido (S/.)",        value: `${(incidencias.length * COSTO_ESTIMADO).toLocaleString("es-PE")}`, color: "#92400E", bg: "#FFFBEB" },
        ].map(({ label, value, color, bg }) => (
          <div key={label} className="bg-white rounded-xl border p-4 flex items-center gap-4 transition shadow-sm" style={{ borderColor:"var(--border)" }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: bg }}>
              <AlertCircle size={18} style={{ color }} />
            </div>
            <div>
              <p className="text-2xl font-bold leading-none font-mono" style={{ color }}>{value}</p>
              <p className="text-xs font-medium mt-1 text-slate-500">{label}</p>
            </div>
          </div>
        ))}
      </div>

      <SectionCard>
        <div className="flex items-center gap-2 px-6 py-4 border-b bg-white rounded-t-xl" style={{ borderColor:"var(--border)" }}>
          <ShieldCheck size={16} style={{ color:"#B91C1C" }} />
          <span className="font-bold text-sm text-slate-800">Auditoría y Bajas de Activos</span>
          <span className="ml-auto px-2 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700">
            {pendientes} pendiente{pendientes !== 1 ? "s" : ""}
          </span>
        </div>
        
        <table className="w-full text-sm border-collapse bg-white">
          <thead>
            <tr className="bg-slate-50">
              {["ID Reporte", "Motivo", "Operario Responsable", "Tipo de Incidencia", "Costo Aprox (S/.)", "Acciones"].map(h => (
                <th key={h} className="text-left px-5 py-3 border-b font-semibold text-slate-500 text-[10px] uppercase tracking-wider font-mono">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {incidencias.length === 0 && (
              <tr><td colSpan={6} className="text-center py-8 text-slate-400">No hay incidencias reportadas en el sistema.</td></tr>
            )}
            {incidencias.map((incidencia) => {
              const isApproved = bajasAprobadas.has(incidencia.id);
              // Para la demo, extraemos la primera herramienta del reporte original
              const idHerramienta = incidencia.reporteAsignacion.detalles[0]?.herramienta?.id || 1; 

              return (
                <tr key={incidencia.id} className="border-b transition" style={{ background: isApproved ? "#F0FDF4" : "#fff", opacity: isApproved ? 0.75 : 1 }}>
                  <td className="px-5 py-4 text-xs font-semibold text-blue-600 font-mono">INC-{incidencia.id}</td>
                  <td className="px-5 py-4 font-medium text-sm text-slate-800 w-1/3 truncate max-w-xs" title={incidencia.detalleIncidencia}>
                    {incidencia.detalleIncidencia}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 bg-slate-700">
                        {incidencia.reporteAsignacion.operario.nombre.charAt(0)}
                      </div>
                      <span className="text-sm font-medium text-slate-700">
                        {incidencia.reporteAsignacion.operario.nombre} {incidencia.reporteAsignacion.operario.apellido}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <Badge color={incidencia.tipoIncidencia === "Robo" ? "red" : incidencia.tipoIncidencia === "Pérdida" ? "yellow" : "gray"}>
                      {incidencia.tipoIncidencia === "Robo" ? <AlertCircle size={10}/> : <Zap size={10}/>}
                      {incidencia.tipoIncidencia}
                    </Badge>
                  </td>
                  <td className="px-5 py-4">
                    <span className="font-bold text-sm text-red-700 font-mono">S/. {COSTO_ESTIMADO}</span>
                  </td>
                  <td className="px-5 py-4">
                    {isApproved ? (
                      <span className="flex items-center gap-1 text-xs font-bold text-green-700"><CheckCircle2 size={13}/>Baja Aprobada</span>
                    ) : (
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleApproveBaja(incidencia.id, idHerramienta)}
                          className="px-3 py-1.5 rounded-md text-xs font-bold text-white transition bg-red-600 hover:bg-red-700 shadow-sm">
                          Aprobar Baja
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </SectionCard>
    </div>
  );
}