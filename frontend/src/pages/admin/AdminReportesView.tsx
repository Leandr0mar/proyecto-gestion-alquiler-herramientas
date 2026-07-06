import { useState, useEffect } from "react";
import { AlertCircle, DollarSign, TrendingUp } from "lucide-react";
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { SectionCard } from "../../components/shared/SectionCard";

// Datos simulados para la gráfica de tendencia histórica (Idealmente vendrían del backend)
const LOSS_TREND = [
  { month: "Feb", perdidas: 2, robos: 1 },
  { month: "Mar", perdidas: 4, robos: 2 },
  { month: "Abr", perdidas: 3, robos: 1 },
  { month: "May", perdidas: 6, robos: 3 },
  { month: "Jun", perdidas: 5, robos: 4 },
  { month: "Jul", perdidas: 8, robos: 3 },
];

const CAPITAL_RIESGO = 14750;
const COSTO_REPOSICION = 3590;

export default function AdminReportesView() {
  const [conteos, setConteos] = useState({ perdidas: 0, robos: 0, roturas: 0 });

  // Llamada a tu Spring Boot para obtener conteos reales de incidencias
  useEffect(() => {
    const fetchEstadisticas = async () => {
      try {
        // Hacemos peticiones concurrentes para los 3 tipos de incidencias
        const [resPerdidas, resRobos, resRoturas] = await Promise.all([
          fetch("http://localhost:8080/api/admin/estadisticas/incidencias/conteo?tipo=Pérdida"),
          fetch("http://localhost:8080/api/admin/estadisticas/incidencias/conteo?tipo=Robo"),
          fetch("http://localhost:8080/api/admin/estadisticas/incidencias/conteo?tipo=Rotura Total")
        ]);

        if (resPerdidas.ok && resRobos.ok && resRoturas.ok) {
          setConteos({
            perdidas: await resPerdidas.json(),
            robos: await resRobos.json(),
            roturas: await resRoturas.json()
          });
        }
      } catch (error) {
        console.error("Error al cargar estadísticas:", error);
      }
    };
    
    fetchEstadisticas();
  }, []);

  const totalIncidencias = conteos.perdidas + conteos.robos + conteos.roturas;
  const pctPerdidas = totalIncidencias ? Math.round((conteos.perdidas / totalIncidencias) * 100) : 0;
  const pctRobos = totalIncidencias ? Math.round((conteos.robos / totalIncidencias) * 100) : 0;
  const pctRoturas = totalIncidencias ? Math.round((conteos.roturas / totalIncidencias) * 100) : 0;

  return (
    <div className="flex-1 overflow-y-auto px-7 py-6 bg-slate-50" style={{ scrollbarWidth: "none" }}>
      
      {/* Tarjetas de Resumen Ejecutivo */}
      <div className="grid grid-cols-3 gap-5 mb-6">
        {[
          { label: "Total Capital en Riesgo",    value: `S/. ${CAPITAL_RIESGO.toLocaleString("es-PE")}`,   sub: "Por devoluciones vencidas",       color: "#B91C1C", bg: "#FEF2F2", icon: AlertCircle },
          { label: "Costo por Reposiciones",     value: `S/. ${COSTO_REPOSICION.toLocaleString("es-PE")}`, sub: "Bajas en el mes actual",          color: "#92400E", bg: "#FFFBEB", icon: DollarSign  },
          { label: "Tendencia vs. Mes Anterior", value: "+23%",                                            sub: "Incremento en pérdidas totales",  color: "#7C3AED", bg: "#F5F3FF", icon: TrendingUp  },
        ].map(({ label, value, sub, color, bg, icon: Icon }) => (
          <div key={label} className="bg-white rounded-xl border p-5 flex items-start gap-4 shadow-sm" style={{ borderColor: "var(--border)" }}>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: bg }}>
              <Icon size={22} style={{ color }} />
            </div>
            <div>
              <p className="text-2xl font-bold leading-none font-mono" style={{ color }}>{value}</p>
              <p className="text-xs font-semibold mt-2 leading-tight text-slate-700">{label}</p>
              <p className="text-[10px] mt-0.5 text-slate-400 uppercase tracking-wider">{sub}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-5 gap-5">
        
        {/* Gráfico Lineal: Tendencia (Ocupa 3 columnas) */}
        <SectionCard className="col-span-3">
          <div className="flex items-center gap-2 px-6 py-4 border-b" style={{ borderColor: "var(--border)" }}>
            <TrendingUp size={15} style={{ color: "#B91C1C" }} />
            <span className="font-bold text-sm text-slate-800">Tendencia de Pérdidas — Últimos 6 Meses</span>
          </div>
          <div className="px-5 py-5">
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={LOSS_TREND} margin={{ left: -20, right: 10, top: 5, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#5A7190" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#5A7190" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid var(--border)", boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }} />
                <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
                <Line type="monotone" dataKey="perdidas" stroke="#B91C1C" strokeWidth={2.5} dot={{ r: 4, fill: "#B91C1C" }} name="Pérdidas Confirmadas" />
                <Line type="monotone" dataKey="robos"    stroke="#D97706" strokeWidth={2.5} dot={{ r: 4, fill: "#D97706" }} name="Robos en Obra" strokeDasharray="5 3" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        {/* Resumen Financiero y Distribución Real (Ocupa 2 columnas) */}
        <div className="col-span-2 flex flex-col gap-5">
          
          <SectionCard>
            <div className="flex items-center gap-2 px-5 py-4 border-b" style={{ borderColor: "var(--border)" }}>
              <DollarSign size={15} style={{ color: "#B91C1C" }} />
              <span className="font-bold text-sm text-slate-800">Impacto Económico Global</span>
            </div>
            <div className="p-5 flex flex-col gap-4">
              <div className="rounded-xl p-4 flex flex-col gap-1 bg-red-50 border border-red-100">
                <p className="text-[10px] font-bold uppercase tracking-widest text-red-700">Total Capital en Riesgo</p>
                <p className="text-3xl font-bold leading-none mt-1 text-red-900 font-mono">
                  S/. {CAPITAL_RIESGO.toLocaleString("es-PE")}
                </p>
                <p className="text-xs mt-1 text-red-700">Por herramientas vencidas en poder de operarios</p>
              </div>
              
              <div className="rounded-xl p-4 flex flex-col gap-1 bg-amber-50 border border-amber-100">
                <p className="text-[10px] font-bold uppercase tracking-widest text-amber-700">Costo Reposición (Bajas)</p>
                <p className="text-3xl font-bold leading-none mt-1 text-amber-900 font-mono">
                  S/. {COSTO_REPOSICION.toLocaleString("es-PE")}
                </p>
                <p className="text-xs mt-1 text-amber-700">Herramientas aprobadas para baja definitiva</p>
              </div>
              
              <div className="flex items-center justify-between px-4 py-3 rounded-lg bg-slate-100 border border-slate-200">
                <span className="text-xs font-bold text-slate-600 uppercase">Exposición Total</span>
                <span className="text-lg font-bold text-slate-800 font-mono">
                  S/. {(CAPITAL_RIESGO + COSTO_REPOSICION).toLocaleString("es-PE")}
                </span>
              </div>
            </div>
          </SectionCard>

          {/* Distribución basada en BD Real */}
          <SectionCard>
            <div className="px-5 py-5">
              <p className="text-[10px] font-bold mb-4 text-slate-400 uppercase tracking-widest">Distribución de Incidencias (Tiempo Real)</p>
              {[
                { label: "Pérdidas", pct: pctPerdidas, color: "#B91C1C", count: conteos.perdidas },
                { label: "Robos",    pct: pctRobos,    color: "#D97706", count: conteos.robos },
                { label: "Daños Irreparables", pct: pctRoturas, color: "#7C3AED", count: conteos.roturas }
              ].map(({ label, pct, color, count }) => (
                <div key={label} className="mb-4 last:mb-0">
                  <div className="flex justify-between text-xs mb-1.5 font-medium">
                    <span className="text-slate-700">{label} ({count})</span>
                    <span style={{ color }} className="font-mono">{pct}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100">
                    <div className="h-2 rounded-full transition-all duration-1000" style={{ width: `${pct}%`, background: color }} />
                  </div>
                </div>
              ))}
              {totalIncidencias === 0 && (
                <p className="text-xs text-center text-slate-400 mt-2">No hay incidencias registradas aún.</p>
              )}
            </div>
          </SectionCard>

        </div>
      </div>
    </div>
  );
}