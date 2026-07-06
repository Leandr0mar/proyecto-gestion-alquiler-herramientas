import { useState, useMemo } from "react";
import {
  ScanLine, QrCode, Search, ChevronRight, Calendar, CheckCircle2,
  Wrench, Drill, Hammer, X,
  ChevronLeft
} from "lucide-react";
import { Badge } from "../../components/shared/Badge";
import { SectionCard } from "../../components/shared/SectionCard";

// Base de datos estática local para renderizar los iconos y categorías de los QRs escaneados
const TOOL_UI_DB: Record<string, { name: string; category: string; icon: any }> = {
  "QR-WR-0043": { name: 'Llave Francesa 12"',     category: "Herramienta Manual",    icon: Wrench },
  "QR-DR-0091": { name: "Taladro Percutor Bosch", category: "Herramienta Eléctrica", icon: Drill  },
  "QR-HM-0017": { name: "Martillo de Demolición", category: "Herramienta Eléctrica", icon: Hammer },
  "QR-WR-0055": { name: 'Llave Stilson 18"',      category: "Herramienta Manual",    icon: Wrench },
};

const MONTH_NAMES = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
const DAYS = ["Do","Lu","Ma","Mi","Ju","Vi","Sa"];

function getMiniCalendar(y: number, m: number) {
  return { firstDay: new Date(y, m, 1).getDay(), daysInMonth: new Date(y, m + 1, 0).getDate() };
}

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

// Interface para el operario que viene del backend
interface OperarioData {
  id: number;
  nombre: string;
  apellido: string;
  codUsuario: string;
  especialidad: string;
  estado: boolean;
}

export default function PrestamosView() {
  const [dniInput, setDniInput] = useState("");
  const [operatorData, setOperatorData] = useState<OperarioData | null>(null);
  const [searchingOperator, setSearchingOperator] = useState(false);
  const [operatorError, setOperatorError] = useState("");

  const [qrInput, setQrInput] = useState("");
  const [tools, setTools] = useState<any[]>([]);
  const [qrError, setQrError] = useState("");

  const [procesandoPrestamo, setProcesandoPrestamo] = useState(false);

  const today = new Date();
  const [calYear, setCalYear] = useState(today.getFullYear());
  const [calMonth, setCalMonth] = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const { firstDay, daysInMonth } = getMiniCalendar(calYear, calMonth);
  const minDay = calYear === today.getFullYear() && calMonth === today.getMonth() ? today.getDate() + 1 : 1;
  const selectedDateStr = selectedDay ? `${String(selectedDay).padStart(2, "0")} de ${MONTH_NAMES[calMonth]} de ${calYear}` : null;

  const operatorFound = !!operatorData;
  const canConfirm = operatorFound && tools.length > 0 && selectedDay !== null;

  // 1. CUS-03: Paso de Identificación - Buscar Operario por DNI en el Backend
  const handleDniSearch = async () => {
    const dni = dniInput.trim();
    if (dni.length < 4) return;

    setSearchingOperator(true);
    setOperatorError("");
    setOperatorData(null);

    try {
      // Reutilizamos el endpoint de autenticación o agregamos uno específico. 
      // Por practicidad de la demo, asumimos que se busca en el controlador mapeado.
      const response = await fetch(`http://localhost:8080/api/auth/buscar/${dni}`);
      if (response.ok) {
        const data = await response.json();
        setOperatorData(data);
      } else {
        setOperatorError("El operario no se encuentra registrado o tiene retenciones.");
      }
    } catch (error) {
      console.error(error);
      setOperatorError("Error al conectar con el servidor.");
    } finally {
      setSearchingOperator(false);
    }
  };

  // 2. CUS-03: Paso de Escaneo - Buscar Herramienta QR en el Backend
  const handleQrScan = async () => {
    const c = qrInput.trim().toUpperCase();
    if (!c) return;

    if (tools.find(t => t.codigoHerramienta === c)) {
      setQrError("Esta herramienta ya fue añadida a la lista actual.");
      setQrInput("");
      return;
    }

    setQrError("");

    try {
      const response = await fetch(`http://localhost:8080/api/herramientas/buscar/${c}`);
      if (response.ok) {
        const herramientaDB = await response.json();

        if (herramientaDB.disponibilidad !== "DISPONIBLE") {
          setQrError(`La herramienta "${herramientaDB.nombreHerramienta}" está actualmente como ${herramientaDB.disponibilidad}.`);
          return;
        }

        // Mapeamos los iconos visuales de UI usando el código QR como clave
        const uiMeta = TOOL_UI_DB[c] || { name: herramientaDB.nombreHerramienta, category: herramientaDB.categoria, icon: Wrench };
        
        setTools([...tools, {
          id: herramientaDB.id,
          qr: herramientaDB.codigoHerramienta,
          name: herramientaDB.nombreHerramienta,
          category: herramientaDB.categoria,
          icon: uiMeta.icon
        }]);
      } else {
        setQrError(`El código QR "${c}" no corresponde a ningún activo registrado.`);
      }
    } catch (error) {
      console.error(error);
      setQrError("Error al validar la herramienta.");
    } finally {
      setQrInput("");
    }
  };

  // 3. CUS-03: Cierre Transaccional - Enviar el préstamo completo al Backend
  const handleConfirmarPrestamo = async () => {
    if (!canConfirm || !operatorData || selectedDay === null) return;
    setProcesandoPrestamo(true);

    const payload = {
      dniOperario: operatorData.codUsuario,
      idAlmacenero: 1, // ID del almacenero logueado (simulado para la demo)
      codigosQR: tools.map(t => t.qr),
      fechaDevolucion: new Date(calYear, calMonth, selectedDay, 23, 59, 59).toISOString()
    };

    try {
      const response = await fetch("http://localhost:8080/api/prestamos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        alert("¡Préstamo registrado con éxito en la base de datos de Joba Perú!");
        // Limpiamos los estados
        setDniInput("");
        setOperatorData(null);
        setTools([]);
        setSelectedDay(null);
      } else {
        const txtError = await response.text();
        alert(`No se pudo procesar: ${txtError}`);
      }
    } catch (error) {
      console.error(error);
      alert("Error de red al intentar registrar la transacción.");
    } finally {
      setProcesandoPrestamo(false);
    }
  };

  const prevMonth = () => { if (calMonth === 0) { setCalMonth(11); setCalYear(y => y - 1); } else setCalMonth(m => m - 1); };
  const nextMonth = () => { if (calMonth === 11) { setCalMonth(0); setCalYear(y => y + 1); } else setCalMonth(m => m + 1); };

  return (
    <div className="flex-1 overflow-y-auto px-7 py-5" style={{ scrollbarWidth: "none" }}>
      <div className="flex items-center gap-2 mb-5">
        {[{ n: 1, label: "Identificación", done: operatorFound }, { n: 2, label: "Herramientas", done: tools.length > 0 }, { n: 3, label: "Detalles", done: selectedDay !== null }].map((step, i) => (
          <div key={step.n} className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: step.done ? "#16A34A" : "var(--accent)", color: "#fff" }}>{step.done ? <CheckCircle2 size={13} /> : step.n}</div>
              <span className="text-xs font-medium" style={{ color: step.done ? "#16A34A" : "var(--muted-foreground)" }}>{step.label}</span>
            </div>
            {i < 2 && <ChevronRight size={14} style={{ color: "var(--border)" }} />}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-12 gap-5">
        {/* Panel Izquierdo */}
        <div className="col-span-4 flex flex-col gap-4">
          <SectionCard>
            <StepHeader step={1} title="Identificación del Operario" subtitle="Escanee el DNI o código de barras" />
            <div className="p-4 flex flex-col gap-3">
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <ScanLine size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--muted-foreground)" }} />
                  <input type="text" placeholder="DNI corporativo…" value={dniInput} onChange={e => setDniInput(e.target.value)} onKeyDown={e => e.key === "Enter" && handleDniSearch()}
                    className="w-full pl-8 pr-3 py-2.5 text-sm rounded-md border outline-none font-mono" style={{ background: "var(--input-background)", borderColor: "var(--border)", color: "var(--foreground)" }} />
                </div>
                <button onClick={handleDniSearch} disabled={searchingOperator} className="px-3 rounded-md text-sm font-semibold text-white flex items-center gap-1.5 shrink-0" style={{ background: "var(--primary)" }}>
                  <Search size={14} />{searchingOperator ? "Buscando..." : "Buscar"}
                </button>
              </div>

              {operatorError && <p className="text-xs font-medium text-red-600">{operatorError}</p>}

              {operatorFound && operatorData ? (
                <div className="rounded-lg p-4 border flex gap-3 items-start" style={{ background: "#F0F9FF", borderColor: "#BAE6FD" }}>
                  <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg text-white shrink-0" style={{ background: "var(--primary)" }}>{operatorData.nombre.charAt(0)}</div>
                  <div>
                    <p className="font-bold text-sm text-slate-800">{operatorData.nombre} {operatorData.apellido}</p>
                    <p className="text-xs text-slate-500 font-mono">DNI: {operatorData.codUsuario} · {operatorData.especialidad}</p>
                    <div className="mt-1"><Badge color="green"><CheckCircle2 size={10} />Habilitado / Sin Deudas</Badge></div>
                  </div>
                </div>
              ) : (
                <div className="rounded-lg border-2 border-dashed flex flex-col items-center py-8 gap-2" style={{ borderColor: "var(--border)" }}>
                  <UserIconPlaceholder />
                  <p className="text-xs text-center text-slate-400">Ingrese el DNI para validar la identidad</p>
                </div>
              )}
            </div>
          </SectionCard>

          <SectionCard>
            <StepHeader step={3} title="Detalles de la Transacción" subtitle="Fecha límite de devolución" />
            <div className="p-4">
              <div className="rounded-lg border p-3" style={{ background: "var(--input-background)", borderColor: "var(--border)" }}>
                <div className="flex items-center justify-between mb-3">
                  <button onClick={prevMonth} className="w-6 h-6 rounded flex items-center justify-center text-slate-500"><ChevronLeft size={14} /></button>
                  <p className="text-xs font-semibold text-slate-700">{MONTH_NAMES[calMonth]} {calYear}</p>
                  <button onClick={nextMonth} className="w-6 h-6 rounded flex items-center justify-center text-slate-500"><ChevronRight size={14} /></button>
                </div>
                <div className="grid grid-cols-7 gap-0.5 mb-1">{DAYS.map(d => <div key={d} className="text-center text-[10px] font-semibold text-slate-400 uppercase font-mono">{d}</div>)}</div>
                <div className="grid grid-cols-7 gap-0.5">
                  {Array.from({ length: firstDay }).map((_, i) => <div key={`e-${i}`} />)}
                  {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
                    const isPast = calYear === today.getFullYear() && calMonth === today.getMonth() && day < minDay;
                    const isSel = selectedDay === day;
                    return <button key={day} disabled={isPast} onClick={() => setSelectedDay(day)} className="h-7 w-full rounded text-xs font-medium transition"
                      style={{ background: isSel ? "var(--accent)" : "transparent", color: isSel ? "#fff" : isPast ? "#CBD5E1" : "var(--foreground)", cursor: isPast ? "not-allowed" : "pointer" }}>{day}</button>;
                  })}
                </div>
              </div>
              {selectedDateStr && <div className="mt-2 flex items-center gap-2 px-3 py-2 rounded-md text-xs font-medium" style={{ background: "#DCFCE7", color: "#15803D" }}><Calendar size={12} />Fecha límite: <strong>{selectedDateStr}</strong></div>}
            </div>
          </SectionCard>
        </div>

        {/* Panel Derecho */}
        <div className="col-span-8 flex flex-col gap-4">
          <SectionCard>
            <StepHeader step={2} title="Escaneo de Herramientas" subtitle="Escanee el código QR de cada herramienta" />
            <div className="p-4 flex flex-col gap-3">
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <QrCode size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--muted-foreground)" }} />
                  <input type="text" placeholder="Código QR del activo…" value={qrInput} onChange={e => { setQrInput(e.target.value); setQrError(""); }} onKeyDown={e => e.key === "Enter" && handleQrScan()}
                    className="w-full pl-8 pr-3 py-2.5 text-sm rounded-md border outline-none font-mono" style={{ background: "var(--input-background)", borderColor: qrError ? "var(--destructive)" : "var(--border)", color: "var(--foreground)" }} />
                </div>
                <button onClick={handleQrScan} className="px-3 rounded-md text-sm font-semibold text-white flex items-center gap-1.5" style={{ background: "var(--primary)" }}>
                  <ScanLine size={14} />Añadir
                </button>
              </div>
              
              {qrError && <p className="text-xs font-medium text-red-600">{qrError}</p>}
              <p className="text-[11px] text-slate-400 font-medium">Códigos válidos de prueba para la demo: QR-WR-0043 · QR-DR-0091 · QR-HM-0017 · QR-WR-0055</p>
              
              <div className="rounded-lg border overflow-hidden" style={{ borderColor: "var(--border)" }}>
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr style={{ background: "var(--muted)" }}>
                      {["Código QR", "Nombre de la Herramienta", "Categoría", "Estado Actual", ""].map(h => (
                        <th key={h} className="text-left px-4 py-2.5 text-[10px] font-semibold border-b uppercase font-mono tracking-wider text-slate-500">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {tools.length === 0 ? (
                      <tr><td colSpan={5} className="text-center py-10 text-xs text-slate-400 font-medium">Ninguna herramienta añadida al lote de salida</td></tr>
                    ) : (
                      tools.map((tool, idx) => {
                        const Icon = tool.icon;
                        return (
                          <tr key={tool.qr} className="border-b transition hover:bg-blue-50/30" style={{ background: idx % 2 === 1 ? "#FAFBFD" : "#fff" }}>
                            <td className="px-4 py-3 text-xs font-mono text-blue-600 font-semibold">{tool.qr}</td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-md flex items-center justify-center shrink-0" style={{ background: "#EFF6FF" }}><Icon size={13} style={{ color: "var(--accent)" }} /></div>
                                <span className="font-medium text-sm text-slate-800">{tool.name}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3"><Badge color="blue">{tool.category}</Badge></td>
                            <td className="px-4 py-3"><Badge color="green"><CheckCircle2 size={10} />Disponible</Badge></td>
                            <td className="px-4 py-3">
                              <button onClick={() => setTools(tools.filter(t => t.qr !== tool.qr))} className="w-6 h-6 rounded flex items-center justify-center text-slate-400 hover:text-red-500 transition">
                                <X size={13} />
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </SectionCard>

          {canConfirm && (
            <div className="rounded-lg border p-4 flex items-center gap-3" style={{ background: "#F0F9FF", borderColor: "#BAE6FD" }}>
              <CheckCircle2 size={18} style={{ color: "#0284C7" }} />
              <p className="text-xs text-sky-800">
                <strong>Todo conforme para guardar.</strong> El lote contiene {tools.length} herramienta{tools.length !== 1 ? "s" : ""} asignada{tools.length !== 1 ? "s" : ""} a <strong>{operatorData?.nombre} {operatorData?.apellido}</strong> con retorno pactado para el <strong>{selectedDateStr}</strong>.
              </p>
            </div>
          )}

          <div className="flex justify-end gap-3 pb-2">
            <button onClick={() => { setDniInput(""); setOperatorData(null); setTools([]); setSelectedDay(null); setOperatorError(""); setQrError(""); }}
              className="px-4 py-2.5 rounded-md text-sm font-semibold border flex items-center gap-1.5 transition" style={{ borderColor: "var(--border)", color: "var(--muted-foreground)", background: "#fff" }}>
              <X size={14} />Cancelar
            </button>
            <button disabled={!canConfirm || procesandoPrestamo} onClick={handleConfirmarPrestamo}
              className="px-6 py-2.5 rounded-md text-sm font-bold text-white flex items-center gap-2 transition"
              style={{ background: canConfirm ? "var(--accent)" : "var(--muted)", color: canConfirm ? "#fff" : "var(--muted-foreground)", cursor: canConfirm ? "pointer" : "not-allowed" }}>
              <CheckCircle2 size={15} />{procesandoPrestamo ? "Procesando Transacción..." : "Confirmar Préstamo"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Icono auxiliar SVG para rellenar el estado vacío
function UserIconPlaceholder() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-300">
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
      <circle cx="12" cy="7" r="4"></circle>
    </svg>
  );
}