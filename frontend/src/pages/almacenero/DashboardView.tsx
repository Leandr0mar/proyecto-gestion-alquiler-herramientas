import { useState, useEffect } from "react";
import { Package, ArrowRightLeft, AlertCircle, Clock, BarChart2, PieChart as PieChartIcon } from "lucide-react";
import { SectionCard } from "../../components/shared/SectionCard";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Cell as PieCell, Legend } from "recharts";

// Interfaz para mapear los datos del backend
interface Herramienta {
  id: number;
  categoria: string;
  disponibilidad: string;
  estado: string;
}

const CHART_COLORS = ["#1B4F8A", "#2563EB", "#3B82F6", "#60A5FA", "#93C5FD"];
const PIE_COLORS = { 
  nuevo: "#10B981", // Verde
  usado: "#F59E0B", // Ambar
  bueno: "#3B82F6", // Azul
  dañado: "#EF4444", // Rojo
  default: "#94A3B8" // Gris
};

export default function DashboardView() {
  const [metricas, setMetricas] = useState({ total: 0, prestadas: 0, disponibles: 0, dañadas: 0 });
  const [datosGraficoCategoria, setDatosGraficoCategoria] = useState<{ name: string; value: number }[]>([]);
  const [datosGraficoEstado, setDatosGraficoEstado] = useState<{ name: string; value: number; color: string }[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const fetchInventarioDashboard = async () => {
      try {
        const response = await fetch("http://localhost:8080/api/herramientas");
        if (response.ok) {
          const data: Herramienta[] = await response.json();
          
          // 1. Calcular Métricas Principales
          const total = data.length;
          const disponibles = data.filter((h) => h.disponibilidad === "DISPONIBLE").length;
          const prestadas = data.filter((h) => h.disponibilidad === "PRESTADO").length;
          // Contamos como alerta crítica cualquier estado que indique daño o pérdida
          const dañadas = data.filter((h) => h.estado.toLowerCase().includes("dañado") || h.estado.toLowerCase().includes("perdida")).length;
          
          setMetricas({ total, prestadas, disponibles, dañadas });

          // 2. Procesar datos para el Gráfico de Barras: Categorías con mayor volumen en inventario
          const categoriasCount: Record<string, number> = {};
          data.forEach(h => {
             categoriasCount[h.categoria] = (categoriasCount[h.categoria] || 0) + 1;
          });
          
          // Convertir a array, ordenar de mayor a menor y tomar el Top 5
          const chartCategorias = Object.entries(categoriasCount)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 5);
          
          setDatosGraficoCategoria(chartCategorias);

          // 3. Procesar datos para el Gráfico de Pastel: Distribución de Estados
          const estadosCount: Record<string, number> = {};
          data.forEach(h => {
             // Normalizamos el estado para agrupar (ej. "NUEVO" y "Nuevo" son lo mismo)
             const estadoNormalizado = h.estado.trim().toUpperCase(); 
             estadosCount[estadoNormalizado] = (estadosCount[estadoNormalizado] || 0) + 1;
          });

          const chartEstados = Object.entries(estadosCount).map(([name, value]) => {
              // Asignar color dinámico basado en la palabra clave
              let color = PIE_COLORS.default;
              const n = name.toLowerCase();
              if (n.includes("nuevo")) color = PIE_COLORS.nuevo;
              else if (n.includes("usado")) color = PIE_COLORS.usado;
              else if (n.includes("bueno")) color = PIE_COLORS.bueno;
              else if (n.includes("dañado") || n.includes("perdida")) color = PIE_COLORS.dañado;

              return { name, value, color };
          });

          setDatosGraficoEstado(chartEstados);

        }
      } catch (error) {
        console.error("Error cargando métricas del dashboard:", error);
      } finally {
        setCargando(false);
      }
    };
    fetchInventarioDashboard();
  }, []);

  if (cargando) {
      return <div className="p-8 text-center text-slate-500">Calculando métricas del dashboard...</div>;
  }

  return (
    <div className="flex-1 overflow-y-auto px-7 py-6 bg-slate-50" style={{ scrollbarWidth: "none" }}>
      
      {/* Tarjetas Superiores */}
      <div className="grid grid-cols-3 gap-5 mb-6">
        {[
          { label: "Total Herramientas en Stock",       value: metricas.total,     icon: Package,       accent: "#1B4F8A", bg: "#EFF6FF", sub: `${metricas.disponibles} disponibles` },
          { label: "Herramientas en Obra / Prestadas",  value: metricas.prestadas, icon: ArrowRightLeft,accent: "#A16207", bg: "#FEFCE8", sub: "actualmente en campo" },
          { label: "Alertas Críticas (Daños/Pérdidas)", value: metricas.dañadas,   icon: AlertCircle,   accent: "#B91C1C", bg: "#FEF2F2", sub: "requieren revisión técnica" },
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

      {/* Gráficos Inferiores */}
      <div className="grid grid-cols-2 gap-5">
        
        {/* Gráfico 1: Top 5 Categorías */}
        <SectionCard>
          <div className="flex items-center gap-2 px-5 py-4 border-b" style={{ borderColor: "var(--border)" }}>
            <BarChart2 size={15} style={{ color: "var(--primary)" }} />
            <span className="font-bold text-sm text-slate-800">Top 5: Stock por Categorías</span>
          </div>
          <div className="px-4 py-4">
            <p className="text-[11px] mb-3 text-slate-400 font-medium text-center">Volumen de herramientas físicas registradas por tipo</p>
            {datosGraficoCategoria.length > 0 ? (
               <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={datosGraficoCategoria} layout="vertical" margin={{ left: 0, right: 16, top: 0, bottom: 0 }}>
                    <XAxis type="number" tick={{ fontSize: 10, fill: "#5A7190" }} axisLine={false} tickLine={false} />
                    <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 10, fill: "#0F2137", fontWeight: 500 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid var(--border)" }} cursor={{ fill: "#EFF6FF" }} formatter={(v: any) => [`${v} unidades`, "Cantidad"]} />
                    <Bar dataKey="value" radius={[0,4,4,0]} barSize={20}>
                      {datosGraficoCategoria.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
            ) : (
                <div className="h-[220px] flex items-center justify-center text-xs text-slate-400">No hay datos de categorías.</div>
            )}
          </div>
        </SectionCard>

        {/* Gráfico 2: Distribución de Estados (Pie Chart) */}
        <SectionCard>
           <div className="flex items-center gap-2 px-5 py-4 border-b" style={{ borderColor: "var(--border)" }}>
            <PieChartIcon size={15} style={{ color: "var(--primary)" }} />
            <span className="font-bold text-sm text-slate-800">Distribución por Estado Físico</span>
          </div>
          <div className="px-4 py-4">
             <p className="text-[11px] mb-3 text-slate-400 font-medium text-center">Porcentaje de condiciones actuales de conservación</p>
             {datosGraficoEstado.length > 0 ? (
               <ResponsiveContainer width="100%" height={220}>
                 <PieChart>
                    <Pie 
                      data={datosGraficoEstado} 
                      cx="50%" 
                      cy="45%" 
                      innerRadius={50} 
                      outerRadius={80} 
                      paddingAngle={2}
                      dataKey="value"
                    >
                       {datosGraficoEstado.map((entry, index) => (
                          <PieCell key={`cell-${index}`} fill={entry.color} />
                       ))}
                    </Pie>
                    <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid var(--border)" }} formatter={(value: number) => [`${value} unidades`, "Stock"]} />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px', fontWeight: 500 }} />
                 </PieChart>
               </ResponsiveContainer>
             ) : (
                <div className="h-[220px] flex items-center justify-center text-xs text-slate-400">No hay datos de estados.</div>
             )}
          </div>
        </SectionCard>

      </div>
    </div>
  );
}