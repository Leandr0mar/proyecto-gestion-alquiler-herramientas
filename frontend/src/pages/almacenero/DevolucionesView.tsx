import { useState } from "react";
import { ScanLine, Search, ChevronDown, Undo2, X, AlertCircle, Wrench, AlertTriangle, ArrowRight } from "lucide-react";
import { SectionCard } from "../../components/shared/SectionCard";

function StepHeader({ step, title, subtitle }: { step: number; title: string; subtitle: string }) {
  return (
    <div className="flex items-start gap-3 px-5 py-4 border-b" style={{ borderColor: "var(--border)" }}>
      <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5" style={{ background: "var(--primary)", color: "#fff" }}>{step}</div>
      <div>
        <h2 className="text-sm font-bold" style={{ color: "var(--foreground)" }}>{title}</h2>
        <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>{subtitle}</p>
      </div>
    </div>
  );
}

interface Herramienta { id: number; codigoHerramienta: string; nombreHerramienta: string; }
interface DetalleAsignacion { herramienta: Herramienta; estadoRetorno: string; }
interface PrestamoActivo { id: number; operario: { nombre: string; apellido: string; codUsuario: string; especialidad: string }; fechaSalida: string; detalles: DetalleAsignacion[]; }

interface Props {
  onNavigateToIncidencia?: (id: number) => void;
}

export default function DevolucionesView({ onNavigateToIncidencia }: Props) {
  const [dniInput, setDniInput] = useState("");
  const [prestamo, setPrestamo] = useState<PrestamoActivo | null>(null);
  const [returnStates, setReturnStates] = useState<Record<number, string>>({});
  
  const [buscando, setBuscando] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [procesando, setProcesando] = useState(false);

  // Estado para mostrar la pantalla de redirección
  const [incidenciaPendienteId, setIncidenciaPendienteId] = useState<number | null>(null);

  const handleSearch = async () => {
    const dni = dniInput.trim();
    if (!dni) return;

    setBuscando(true);
    setNotFound(false);
    setPrestamo(null);
    setReturnStates({});

    try {
      const response = await fetch(`http://localhost:8080/api/prestamos/activos/${dni}`);
      if (response.ok) {
        const data = await response.json();
        setPrestamo(data);
      } else {
        setNotFound(true);
      }
    } catch (error) {
      console.error("Error al buscar préstamo", error);
      alert("Error de red al conectar con el servidor.");
    } finally {
      setBuscando(false);
    }
  };

  const setReturn = (idHerramienta: number, val: string) => {
    setReturnStates(s => ({ ...s, [idHerramienta]: val }));
  };

  const allSet = prestamo && prestamo.detalles.every(d => returnStates[d.herramienta.id]);
  const hasIssue = Object.values(returnStates).some(v => v === "Dañada" || v === "Perdida");

  const handleRegistrarDevolucion = async () => {
    if (!allSet || !prestamo) return;
    setProcesando(true);

    const payload = {
      idAsignacion: prestamo.id,
      estadosDeRetorno: returnStates
    };

    try {
      const response = await fetch("http://localhost:8080/api/devoluciones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        if (hasIssue) {
          // Si hay incidencias, mostramos el botón de redirección
          setIncidenciaPendienteId(prestamo.id);
        } else {
          alert("Devolución e inspección registradas correctamente.");
          setPrestamo(null);
          setDniInput("");
          setReturnStates({});
        }
      } else {
        const err = await response.text();
        alert(`Error: ${err}`);
      }
    } catch (error) {
      console.error(error);
      alert("Error al intentar registrar la devolución.");
    } finally {
      setProcesando(false);
    }
  };

  // PANTALLA DE ALERTA INTERRUPTORA
  if (incidenciaPendienteId) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-10 bg-slate-50">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl border shadow-sm text-center" style={{ borderColor: "#FDE68A" }}>
          <div className="w-16 h-16 rounded-full bg-amber-100 mx-auto flex items-center justify-center mb-4">
            <AlertTriangle size={32} className="text-amber-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Devolución Procesada</h2>
          <p className="text-sm text-slate-500 mb-6">
            La devolución ha sido registrada en el sistema, pero se detectaron herramientas en estado <strong>Dañada</strong> o <strong>Perdida</strong>. Es obligatorio emitir un reporte de incidencia para la auditoría.
          </p>
          <div className="flex flex-col gap-3">
            <button 
              onClick={() => onNavigateToIncidencia?.(incidenciaPendienteId)}
              className="w-full py-3 rounded-lg text-sm font-bold text-white bg-amber-600 hover:bg-amber-700 flex items-center justify-center gap-2 transition"
            >
              Ir a Reportar Incidencia <ArrowRight size={16} />
            </button>
            <button 
              onClick={() => { setIncidenciaPendienteId(null); setPrestamo(null); setDniInput(""); setReturnStates({}); }}
              className="w-full py-3 rounded-lg text-sm font-bold text-slate-500 hover:bg-slate-100 transition"
            >
              Reportar más tarde
            </button>
          </div>
        </div>
      </div>
    );
  }

  // PANTALLA NORMAL DE DEVOLUCIONES
  return (
    <div className="flex-1 overflow-y-auto px-7 py-5" style={{ scrollbarWidth: "none" }}>
      <div className="flex flex-col gap-5 max-w-4xl">
        <SectionCard>
          <StepHeader step={1} title="Buscar Préstamo Activo" subtitle="Escanee el fotocheck o ingrese el DNI del operario" />
          <div className="p-5">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <ScanLine size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--muted-foreground)" }} />
                <input type="text" placeholder="DNI corporativo…" value={dniInput} onChange={e => { setDniInput(e.target.value); setNotFound(false); }} onKeyDown={e => e.key === "Enter" && handleSearch()}
                  className="w-full pl-8 pr-3 py-2.5 text-sm rounded-md border outline-none font-mono" style={{ background: "var(--input-background)", borderColor: notFound ? "var(--destructive)" : "var(--border)", color: "var(--foreground)" }} />
              </div>
              <button onClick={handleSearch} disabled={buscando} className="px-4 rounded-md text-sm font-semibold text-white flex items-center gap-1.5" style={{ background: "var(--primary)" }}>
                <Search size={14} />{buscando ? "Buscando..." : "Buscar"}
              </button>
            </div>
            {notFound && <p className="text-xs mt-2 font-medium text-red-600">No se encontró ningún préstamo pendiente para este operario.</p>}
            
            {prestamo && (
              <div className="mt-4 flex items-center gap-4 p-4 rounded-xl border" style={{ background: "#F0F9FF", borderColor: "#BAE6FD" }}>
                <div className="w-11 h-11 rounded-full flex items-center justify-center text-lg font-bold text-white shrink-0" style={{ background: "var(--primary)" }}>{prestamo.operario.nombre.charAt(0)}</div>
                <div className="flex-1">
                  <p className="font-bold text-sm text-slate-800">{prestamo.operario.nombre} {prestamo.operario.apellido}</p>
                  <p className="text-xs text-slate-500 font-mono">DNI: {prestamo.operario.codUsuario} · {prestamo.operario.especialidad}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-semibold text-slate-500">Préstamo N°</p>
                  <p className="text-sm font-bold text-sky-700 font-mono">ID-{prestamo.id}</p>
                </div>
              </div>
            )}
          </div>
        </SectionCard>

        {prestamo && (
          <SectionCard>
            <StepHeader step={2} title="Inspección de Herramientas" subtitle={`Herramientas bajo custodia de ${prestamo.operario.nombre}`} />
            <div className="p-4">
              {hasIssue && <div className="flex items-center gap-2 mb-3 px-4 py-2.5 rounded-lg" style={{ background: "#FEF3C7", border: "1px solid #FDE68A" }}><AlertCircle size={14} style={{ color: "#D97706" }} /><p className="text-xs font-semibold" style={{ color: "#92400E" }}>Se detectaron herramientas con incidencias. Deberá emitir un reporte luego.</p></div>}
              <table className="w-full text-sm border-collapse rounded-lg overflow-hidden border" style={{ borderColor: "var(--border)" }}>
                <thead>
                  <tr style={{ background: "var(--muted)" }}>
                    {["Código QR", "Nombre de Herramienta", "Estado de Retorno *"].map(h => <th key={h} className="text-left px-4 py-3 border-b font-semibold text-slate-500 text-[10px] uppercase tracking-wider font-mono">{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {prestamo.detalles.map((detalle, idx) => {
                    const qr = detalle.herramienta.codigoHerramienta;
                    const val = returnStates[detalle.herramienta.id] ?? "";
                    const sc = val === "Buen Estado" ? "#15803D" : val === "Dañada" ? "#D97706" : val === "Perdida" ? "#B91C1C" : "var(--muted-foreground)";
                    
                    return (
                      <tr key={qr} className="border-b" style={{ background: idx % 2 === 1 ? "#FAFBFD" : "#fff" }}>
                        <td className="px-4 py-3 text-xs font-mono text-blue-600 font-semibold">{qr}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-md flex items-center justify-center shrink-0" style={{ background: "#EFF6FF" }}><Wrench size={13} style={{ color: "var(--accent)" }} /></div>
                            <span className="font-medium text-sm text-slate-800">{detalle.herramienta.nombreHerramienta}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="relative">
                            <select value={val} onChange={e => setReturn(detalle.herramienta.id, e.target.value)} className="w-full appearance-none pl-3 pr-8 py-2 text-sm rounded-md border outline-none font-semibold" style={{ background: val ? "#fff" : "var(--input-background)", borderColor: !val ? "var(--destructive)" : "var(--border)", color: sc }}>
                              <option value="" disabled>Inspeccionar…</option>
                              <option value="Buen Estado">✓ Buen Estado (Apta)</option>
                              <option value="Dañada">⚠ Dañada (Averiada)</option>
                              <option value="Perdida">✕ Perdida (No retornó)</option>
                            </select>
                            <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "var(--muted-foreground)" }} />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </SectionCard>
        )}

        {prestamo && (
          <div className="flex justify-end gap-3 pb-2 mt-2">
            <button onClick={() => { setPrestamo(null); setDniInput(""); setReturnStates({}); }} className="px-4 py-2.5 rounded-md text-sm font-semibold border flex items-center gap-1.5 transition" style={{ borderColor: "var(--border)", color: "var(--muted-foreground)", background: "#fff" }}>
              <X size={14} />Cancelar
            </button>
            <button disabled={!allSet || procesando} onClick={handleRegistrarDevolucion} className="px-6 py-2.5 rounded-md text-sm font-bold text-white flex items-center gap-2 transition" style={{ background: allSet ? (hasIssue ? "#D97706" : "var(--accent)") : "var(--muted)", color: allSet ? "#fff" : "var(--muted-foreground)", cursor: allSet ? "pointer" : "not-allowed" }}>
              <Undo2 size={15} />{procesando ? "Registrando..." : "Registrar Devolución e Inspección"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}