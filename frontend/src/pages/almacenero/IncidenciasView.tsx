import { useState, useEffect } from "react";
import { Zap, FileText, ChevronDown, X, AlertTriangle, Search, CheckCircle2 } from "lucide-react";
import { SectionCard } from "../../components/shared/SectionCard";

export default function IncidenciasView({ prefillId = "" }: { prefillId?: string }) {
  const today = new Date().toLocaleDateString("es-PE", { day: "2-digit", month: "2-digit", year: "numeric" });
  
  const [dniInput, setDniInput] = useState("");
  const [buscandoDni, setBuscandoDni] = useState(false);
  const [operarioInfo, setOperarioInfo] = useState<string | null>(null);

  const [form, setForm] = useState({ assignmentId: prefillId, type: "", description: "" });
  const [procesando, setProcesando] = useState(false);

  // Escuchar si viene un ID desde otra pantalla para autocompletar
  useEffect(() => {
    if (prefillId) {
      setForm(f => ({ ...f, assignmentId: prefillId }));
    }
  }, [prefillId]);
  
  const set = (k: string, v: string) => setForm(f => ({ ... f, [k]: v }));
  const canSubmit = form.assignmentId && form.type && form.description.length > 20;

  const handleBuscarPorDni = async () => {
    const dni = dniInput.trim();
    if (!dni) return;

    setBuscandoDni(true);
    setOperarioInfo(null);
    set("assignmentId", "");

    try {
      const response = await fetch(`http://localhost:8080/api/prestamos/activos/${dni}`);
      if (response.ok) {
        const prestamo = await response.json();
        set("assignmentId", prestamo.id.toString());
        setOperarioInfo(`${prestamo.operario.nombre} ${prestamo.operario.apellido}`);
      } else {
        alert("No se encontró ningún préstamo activo para este DNI.");
      }
    } catch (error) {
      console.error(error);
      alert("Error al conectar con el servidor.");
    } finally {
      setBuscandoDni(false);
    }
  };

  const handleEmitirReporte = async () => {
    if (!canSubmit) return;
    setProcesando(true);

    const payload = {
      idAsignacion: parseInt(form.assignmentId, 10),
      tipoIncidencia: form.type,
      detalleIncidencia: form.description
    };

    try {
      const response = await fetch("http://localhost:8080/api/incidencias", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        alert("Reporte de incidencia emitido. La auditoría ha sido notificada.");
        setForm({ assignmentId: "", type: "", description: "" });
        setDniInput("");
        setOperarioInfo(null);
      } else {
        const error = await response.text();
        alert(`Fallo al emitir reporte: ${error}`);
      }
    } catch (error) {
      console.error(error);
      alert("Error al conectar con el servidor.");
    } finally {
      setProcesando(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto px-7 py-5" style={{ scrollbarWidth: "none" }}>
      <div className="flex flex-col gap-6 max-w-3xl">
        
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Zap size={15} style={{ color: "#B91C1C" }} />
            <h2 className="text-sm font-bold text-slate-800">Alertas de Activos con Retraso</h2>
          </div>
          <div className="rounded-xl border overflow-hidden p-6 bg-red-50/50 border-red-200 text-center">
            <p className="text-sm text-slate-500">Aquí se cargarán las notificaciones de retraso desde el servicio automatizado (Cron).</p>
          </div>
        </div>

        <SectionCard>
          <div className="flex items-center gap-2 px-5 py-4 border-b" style={{ borderColor: "var(--border)" }}>
            <FileText size={15} style={{ color: "var(--primary)" }} />
            <span className="font-bold text-sm text-slate-800">Reportar Nueva Incidencia</span>
          </div>
          <div className="p-5 flex flex-col gap-5">
            
            <div className="p-4 rounded-lg border bg-slate-50" style={{ borderColor: "var(--border)" }}>
              <label className="text-xs font-bold mb-2 block text-slate-700">1. Buscar Préstamo por Operario</label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="Ingrese el DNI del operario..." 
                  value={dniInput} 
                  onChange={e => setDniInput(e.target.value)} 
                  onKeyDown={e => e.key === "Enter" && handleBuscarPorDni()}
                  className="flex-1 px-3 py-2.5 text-sm rounded-md border outline-none font-mono" 
                />
                <button 
                  onClick={handleBuscarPorDni} 
                  disabled={buscandoDni} 
                  className="px-4 rounded-md text-sm font-semibold text-white flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 transition"
                >
                  <Search size={14} />{buscandoDni ? "Buscando..." : "Buscar"}
                </button>
              </div>
              {operarioInfo && (
                <p className="text-xs mt-2 font-medium text-green-700 flex items-center gap-1">
                  <CheckCircle2 size={14} /> Préstamo encontrado para: {operarioInfo}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold mb-1.5 block text-slate-500">ID de Asignación Original *</label>
                <input 
                  type="number" 
                  placeholder="Ej. 12" 
                  value={form.assignmentId} 
                  onChange={e => set("assignmentId", e.target.value)} 
                  className="w-full px-3 py-2.5 text-sm rounded-md border outline-none font-mono bg-white" 
                  style={{ borderColor: "var(--border)" }} 
                />
                <p className="text-[10px] mt-1 text-slate-400">Se autocompleta al buscar el DNI o desde devoluciones.</p>
              </div>
              <div>
                <label className="text-xs font-semibold mb-1.5 block text-slate-500">Fecha de Reporte</label>
                <input type="text" readOnly value={today} 
                  className="w-full px-3 py-2.5 text-sm rounded-md border outline-none font-mono bg-slate-100 text-slate-400" />
              </div>
            </div>
            
            <div>
              <label className="text-xs font-semibold mb-1.5 block text-slate-500">Tipo de Incidencia *</label>
              <div className="relative">
                <select value={form.type} onChange={e => set("type", e.target.value)} 
                  className="w-full appearance-none px-3 py-2.5 text-sm rounded-md border outline-none pr-8 bg-white" style={{ borderColor: "var(--border)", color: form.type ? "var(--foreground)" : "var(--muted-foreground)" }}>
                  <option value="" disabled>Seleccione el motivo de la baja…</option>
                  <option value="Pérdida">Pérdida (Extravío en campo)</option>
                  <option value="Robo">Robo (Sustracción reportada)</option>
                  <option value="Rotura Total">Rotura Total (Daño irreparable)</option>
                </select>
                <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" />
              </div>
            </div>
            
            <div>
              <label className="text-xs font-semibold mb-1.5 block text-slate-500">Descripción Detallada *</label>
              <textarea rows={5} placeholder="Describa detalladamente el suceso, las herramientas afectadas y el motivo de la baja del activo para la auditoría..." 
                value={form.description} onChange={e => set("description", e.target.value)} 
                className="w-full px-3 py-3 text-sm rounded-md border outline-none resize-none bg-white" style={{ borderColor: "var(--border)", lineHeight: 1.6 }} />
              <p className="text-[10px] mt-1 text-right text-slate-400 font-mono">{form.description.length} caracteres (mínimo 20)</p>
            </div>
            
            <div className="flex justify-end gap-3 pt-2 border-t mt-2 border-slate-100">
              <button onClick={() => { setForm({ assignmentId: "", type: "", description: "" }); setDniInput(""); setOperarioInfo(null); }} className="px-4 py-2.5 rounded-md text-sm font-semibold border flex items-center gap-1.5 text-slate-500 bg-white hover:bg-slate-50 transition">
                <X size={14} />Limpiar
              </button>
              <button disabled={!canSubmit || procesando} onClick={handleEmitirReporte} className="px-6 py-2.5 rounded-md text-sm font-bold text-white flex items-center gap-2 transition" 
                style={{ background: canSubmit ? "#DC2626" : "var(--muted)", color: canSubmit ? "#fff" : "var(--muted-foreground)", cursor: canSubmit ? "pointer" : "not-allowed" }}>
                <AlertTriangle size={15} />{procesando ? "Emitiendo..." : "Emitir Reporte de Incidencia"}
              </button>
            </div>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}