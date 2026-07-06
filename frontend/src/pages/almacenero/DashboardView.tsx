import { useState, useEffect } from "react";
import { Package, ArrowRightLeft, AlertCircle, Clock, BarChart2 } from "lucide-react";
import { SectionCard } from "../../components/shared/SectionCard";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

const DAMAGE_CHART = [
  { name: "Rotomartillos", value: 14 },
  { name: "Amoladoras",    value: 11 },
  { name: "Taladros",      value: 8  },
  { name: "Palas",         value: 6  },
  { name: "Sierras",       value: 5  },
];
const CHART_COLORS = ["#1B4F8A","#2563EB","#3B82F6","#60A5FA","#93C5FD"];

export default function DashboardView() {
  const [metricas, setMetricas] = useState({
    total: 0,
    prestadas: 0,
    disponibles: 0
  });

  // Llamada a la API para obtener el resumen del inventario real
  useEffect(() => {
    const fetchInventario = async () => {
      try {
        const response = await fetch("http://localhost:8080/api/herramientas");
        if (response.ok) {
          const data = await response.json();
          const total = data.length;
          const disponibles = data.filter((h: any) => h.disponibilidad === "DISPONIBLE").length;
          const prestadas = total - disponibles;
          
          setMetricas({ total, prestadas, disponibles });
        }
      } catch (error) {
        console.error("Error cargando métricas del dashboard:", error);
      }
    };
    fetchInventario();
  }, []);

  return (
    <div className="flex-1 overflow-y-auto px-7 py-6 bg-slate-50" style={{ scrollbarWidth: "none" }}>
      <div className="grid grid-cols-3 gap-5 mb-6">
        {[
          { label: "Total Herramientas en Stock",       value: metricas.total,    icon: Package,       accent: "#1B4F8A", bg: "#EFF6FF", sub: `${metricas.disponibles} disponibles` },
          { label: "Herramientas en Obra / Prestadas",  value: metricas.prestadas,icon: ArrowRightLeft,accent: "#A16207", bg: "#FEFCE8", sub: "actualmente en campo" },
          { label: "Alertas Críticas por Extravío",     value: 0,                 icon: AlertCircle,   accent: "#B91C1C", bg: "#FEF2F2", sub: "requieren atención urgente" },
        ].map(({ label, value, icon: Icon, accent, bg, sub }) => (
          <div key={label} className="bg-white rounded-xl border p-5 flex items-start gap-4 transition-all hover:shadow-sm" style={{ borderColor: "var(--border)" }}>
            <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: bg }}><Icon size={20} style={{ color: accent }} /></div>
            <div>
              <p className="text-3xl font-bold leading-none font-mono" style={{ color: accent }}>{value}</p>
              <p className="text-xs font-semibold mt-1.5 leading-tight text-slate-700">{label}</p>
              <p className="text-[10px] mt-0.5 text-slate-400 uppercase tracking-wider">{sub}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-5">
        <SectionCard>
          <div className="flex items-center gap-2 px-5 py-4 border-b" style={{ borderColor: "var(--border)" }}>
            <Clock size={15} style={{ color: "var(--primary)" }} />
            <span className="font-bold text-sm text-slate-800">Accesos Directos Operativos</span>
          </div>
          <div className="p-6 flex flex-col gap-4 text-center">
             <p className="text-sm text-slate-500">Bienvenido al sistema de control. Utilice el menú lateral para iniciar operaciones diarias.</p>
             <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg">
                <p className="text-xs font-semibold text-blue-800">💡 Recordatorio</p>
                <p className="text-xs text-blue-600 mt-1">Recuerde inspeccionar cuidadosamente los equipos que ingresan en el módulo de Devoluciones.</p>
             </div>
          </div>
        </SectionCard>

        <SectionCard>
          <div className="flex items-center gap-2 px-5 py-4 border-b" style={{ borderColor: "var(--border)" }}>
            <BarChart2 size={15} style={{ color: "var(--primary)" }} />
            <span className="font-bold text-sm text-slate-800">Categorías con Mayor Incidencia</span>
          </div>
          <div className="px-4 py-4">
            <p className="text-[11px] mb-3 text-slate-400 font-medium">Herramientas propensas a daño (Simulación últimos 90 días)</p>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={DAMAGE_CHART} layout="vertical" margin={{ left: 0, right: 16, top: 0, bottom: 0 }}>
                <XAxis type="number" tick={{ fontSize: 10, fill: "#5A7190" }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" width={90} tick={{ fontSize: 11, fill: "#0F2137", fontWeight: 500 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid var(--border)" }} cursor={{ fill: "#EFF6FF" }} formatter={(v: any) => [`${v} reportes`, "Incidencias"]} />
                <Bar dataKey="value" radius={[0,4,4,0]} barSize={16}>
                  {DAMAGE_CHART.map((_,i) => <Cell key={i} fill={CHART_COLORS[i%CHART_COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}