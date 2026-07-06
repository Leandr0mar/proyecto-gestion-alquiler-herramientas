import { useState, useMemo } from "react";
import {
  LayoutDashboard, Package, ArrowRightLeft, Undo2, AlertTriangle,
  ScanLine, QrCode, Search, ChevronRight, Calendar, CheckCircle2,
  HardHat, Wrench, Drill, Hammer, X, Bell, User, ChevronLeft,
  Trash2, Plus, Filter, ChevronDown, Clock, FileText, BarChart2,
  Zap, AlertCircle, ShieldCheck, TrendingUp, DollarSign, Eye,
  LogOut, Lock, Mail, Shield, Users, Settings,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  Cell, LineChart, Line, CartesianGrid, Legend,
} from "recharts";

// ─── TYPES ───────────────────────────────────────────────────────────────────

type Role = "almacenero" | "admin";
interface SessionUser { role: Role; name: string; email: string }

// ─── AUTH DATA ───────────────────────────────────────────────────────────────

const USERS: Record<string, { password: string; role: Role; name: string }> = {
  "almacen@jobaperu.pe":  { password: "Joba2025$",   role: "almacenero", name: "Roberto Vargas"    },
  "admin@jobaperu.pe":    { password: "Admin2025#",  role: "admin",      name: "Ing. Patricia Soto" },
};

// ─── SHARED DATA ─────────────────────────────────────────────────────────────

const MONTH_NAMES = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
const DAYS = ["Do","Lu","Ma","Mi","Ju","Vi","Sa"];

function getMiniCalendar(y: number, m: number) {
  return { firstDay: new Date(y, m, 1).getDay(), daysInMonth: new Date(y, m + 1, 0).getDate() };
}

const TOOL_DB: Record<string, { qr: string; name: string; category: string; icon: any }> = {
  "QR-WR-0043": { qr: "QR-WR-0043", name: 'Llave Francesa 12"',     category: "Herramienta Manual",    icon: Wrench },
  "QR-DR-0091": { qr: "QR-DR-0091", name: "Taladro Percutor Bosch", category: "Herramienta Eléctrica", icon: Drill  },
  "QR-HM-0017": { qr: "QR-HM-0017", name: "Martillo de Demolición", category: "Herramienta Eléctrica", icon: Hammer },
  "QR-WR-0055": { qr: "QR-WR-0055", name: 'Llave Stilson 18"',      category: "Herramienta Manual",    icon: Wrench },
};

const INVENTORY_DATA = [
  { id: "H-001", qr: "QR-WR-0043", name: 'Llave Francesa 12"',       category: "Herramienta Manual",    condition: "Nuevo", available: true  },
  { id: "H-002", qr: "QR-DR-0091", name: "Taladro Percutor Bosch",   category: "Herramienta Eléctrica", condition: "Usado", available: false },
  { id: "H-003", qr: "QR-HM-0017", name: "Martillo de Demolición",   category: "Herramienta Eléctrica", condition: "Nuevo", available: true  },
  { id: "H-004", qr: "QR-WR-0055", name: 'Llave Stilson 18"',        category: "Herramienta Manual",    condition: "Usado", available: true  },
  { id: "H-005", qr: "QR-RM-0022", name: "Rotomartillo Dewalt",      category: "Herramienta Eléctrica", condition: "Usado", available: false },
  { id: "H-006", qr: "QR-AM-0008", name: 'Amoladora Angular 7"',     category: "Herramienta Eléctrica", condition: "Nuevo", available: true  },
  { id: "H-007", qr: "QR-SL-0031", name: "Sierra Circular Makita",   category: "Herramienta Eléctrica", condition: "Usado", available: false },
  { id: "H-008", qr: "QR-PA-0014", name: "Pala Cuchara #3",          category: "Herramienta Manual",    condition: "Usado", available: true  },
  { id: "H-009", qr: "QR-NV-0047", name: "Nivel Torpedo 30cm",       category: "Instrumento",           condition: "Nuevo", available: true  },
  { id: "H-010", qr: "QR-CA-0063", name: "Caja de Herramientas Completa", category: "Set Especial",    condition: "Nuevo", available: false },
];

const OPERATORS_DB: Record<string, { name: string; dni: string; specialty: string; code: string; loanDate: string; tools: string[] }> = {
  "47823091": { name: "Carlos Mendoza Ríos",  dni: "47823091", specialty: "Electricista Industrial", code: "OP-2241", loanDate: "04 Jul 2025", tools: ["QR-DR-0091","QR-AM-0008"] },
  "36541890": { name: "Lucía Torres Vega",    dni: "36541890", specialty: "Soldadora Estructural",   code: "OP-1987", loanDate: "03 Jul 2025", tools: ["QR-RM-0022","QR-WR-0055"] },
  "52198734": { name: "Marco Huanca Quispe",  dni: "52198734", specialty: "Albañil de Obras",        code: "OP-3012", loanDate: "02 Jul 2025", tools: ["QR-PA-0014","QR-WR-0043"] },
};

const OVERDUE_ALERTS = [
  { id: "AL-001", operator: "Lucía Torres Vega",   tool: "Rotomartillo Dewalt",    days: 3, loanDate: "01 Jul 2025" },
  { id: "AL-002", operator: "Marco Huanca Quispe", tool: "Sierra Circular Makita", days: 5, loanDate: "29 Jun 2025" },
  { id: "AL-003", operator: "Pedro Salinas Cuba",  tool: 'Amoladora Angular 9"',   days: 1, loanDate: "03 Jul 2025" },
];

const RECENT_LOANS = [
  { time: "08:14", operator: "Carlos Mendoza Ríos",   tools: 3 },
  { time: "09:02", operator: "Ana Flores Paredes",    tools: 2 },
  { time: "10:31", operator: "Jesús Cáceres López",   tools: 1 },
  { time: "11:47", operator: "Rosa Ticona Mamani",    tools: 4 },
  { time: "13:05", operator: "Iván Salas Quiñones",   tools: 2 },
];

const DAMAGE_CHART = [
  { name: "Rotomartillos", value: 14 },
  { name: "Amoladoras",    value: 11 },
  { name: "Taladros",      value: 8  },
  { name: "Palas",         value: 6  },
  { name: "Sierras",       value: 5  },
];
const CHART_COLORS = ["#1B4F8A","#2563EB","#3B82F6","#60A5FA","#93C5FD"];

// ─── ADMIN DATA ──────────────────────────────────────────────────────────────

const AUDIT_ROWS = [
  { code: "QR-RM-0019", name: "Rotomartillo Bosch GBH",  operator: "Diego Cárdenas Ríos",   type: "Pérdida", cost: 890 },
  { code: "QR-AM-0005", name: 'Amoladora Makita 9"',     operator: "Lucía Torres Vega",     type: "Robo",    cost: 650 },
  { code: "QR-SL-0012", name: "Sierra Circular Dewalt",  operator: "Marco Huanca Quispe",   type: "Pérdida", cost: 1100 },
  { code: "QR-DR-0034", name: "Taladro Inalámbrico Ryobi",operator: "Pedro Salinas Cuba",   type: "Robo",    cost: 520 },
  { code: "QR-HM-0009", name: "Martillo Demoledor SDS",  operator: "Ana Flores Paredes",    type: "Pérdida", cost: 430 },
];

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

// ─── SHARED COMPONENTS ───────────────────────────────────────────────────────

function Badge({ children, color }: { children: React.ReactNode; color: "green"|"yellow"|"red"|"blue"|"gray"|"purple" }) {
  const s = { green: ["#DCFCE7","#15803D"], yellow: ["#FEF9C3","#A16207"], red: ["#FEE2E2","#B91C1C"], blue: ["#EFF6FF","#1D4ED8"], gray: ["#F1F5F9","#475569"], purple: ["#F5F3FF","#6D28D9"] }[color];
  return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold" style={{ background: s[0], color: s[1] }}>{children}</span>;
}

function SectionCard({ children, className="" }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-xl border bg-white ${className}`} style={{ borderColor: "var(--border)" }}>{children}</div>;
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

// ─── LOGIN SCREEN ─────────────────────────────────────────────────────────────

function LoginScreen({ onLogin }: { onLogin: (u: SessionUser) => void }) {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    setTimeout(() => {
      const found = USERS[email.toLowerCase().trim()];
      if (found && found.password === password) {
        onLogin({ role: found.role, name: found.name, email: email.toLowerCase().trim() });
      } else {
        setError("Correo o contraseña incorrectos. Verifique sus credenciales.");
      }
      setLoading(false);
    }, 600);
  };

  const fillDemo = (em: string, pw: string) => { setEmail(em); setPassword(pw); setError(""); };

  return (
    <div className="min-h-screen flex" style={{ fontFamily: "'Inter', system-ui, sans-serif", background: "var(--background)" }}>
      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-between w-2/5 p-12" style={{ background: "var(--sidebar)" }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "var(--accent)" }}>
            <HardHat size={20} color="#fff" />
          </div>
          <div>
            <p className="font-bold text-white text-base tracking-wide">JOBA PERÚ</p>
            <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>Sistema de Gestión de Herramientas</p>
          </div>
        </div>

        <div>
          <h2 className="text-3xl font-bold text-white leading-tight mb-4">
            Control total<br />de tus activos<br />en obra.
          </h2>
          <p className="text-sm leading-relaxed" style={{ color: "#7A9AB5" }}>
            Registra préstamos, supervisa devoluciones, gestiona incidencias y mantén el inventario siempre actualizado en tiempo real.
          </p>
          <div className="mt-8 flex flex-col gap-3">
            {[
              { icon: Shield,     label: "Acceso por roles diferenciados"  },
              { icon: BarChart2,  label: "Reportes ejecutivos en tiempo real" },
              { icon: CheckCircle2, label: "Trazabilidad completa de activos" },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "rgba(37,99,235,0.2)" }}>
                  <Icon size={13} style={{ color: "var(--accent)" }} />
                </div>
                <span className="text-xs" style={{ color: "#94A3B8" }}>{label}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs" style={{ color: "#3D5A73" }}>© 2025 Joba Perú S.A.C. · Todos los derechos reservados.</p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "var(--accent)" }}>
              <HardHat size={16} color="#fff" />
            </div>
            <span className="font-bold text-sm" style={{ color: "var(--foreground)" }}>JOBA PERÚ</span>
          </div>

          <h1 className="text-2xl font-bold mb-1" style={{ color: "var(--foreground)", letterSpacing: "-0.02em" }}>Iniciar Sesión</h1>
          <p className="text-sm mb-8" style={{ color: "var(--muted-foreground)" }}>Ingrese sus credenciales corporativas para continuar.</p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="text-xs font-semibold mb-1.5 block" style={{ color: "var(--muted-foreground)" }}>Correo Corporativo</label>
              <div className="relative">
                <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--muted-foreground)" }} />
                <input type="email" placeholder="usuario@jobaperu.pe" value={email} onChange={e => setEmail(e.target.value)} required
                  className="w-full pl-9 pr-4 py-3 text-sm rounded-lg border outline-none transition"
                  style={{ background: "#fff", borderColor: error ? "var(--destructive)" : "var(--border)", color: "var(--foreground)" }} />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold mb-1.5 block" style={{ color: "var(--muted-foreground)" }}>Contraseña</label>
              <div className="relative">
                <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--muted-foreground)" }} />
                <input type={showPass ? "text" : "password"} placeholder="••••••••••" value={password} onChange={e => setPassword(e.target.value)} required
                  className="w-full pl-9 pr-10 py-3 text-sm rounded-lg border outline-none transition"
                  style={{ background: "#fff", borderColor: error ? "var(--destructive)" : "var(--border)", color: "var(--foreground)" }} />
                <button type="button" onClick={() => setShowPass(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium"
                  style={{ color: "var(--muted-foreground)" }}>
                  {showPass ? "Ocultar" : "Ver"}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs" style={{ background: "#FEE2E2", color: "#B91C1C" }}>
                <AlertCircle size={13} />{error}
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full py-3 rounded-lg text-sm font-bold text-white transition mt-1"
              style={{ background: loading ? "var(--muted)" : "var(--primary)", cursor: loading ? "not-allowed" : "pointer" }}>
              {loading ? "Verificando…" : "Ingresar al Sistema"}
            </button>
          </form>

          {/* Demo credentials */}
          <div className="mt-6 rounded-xl border p-4" style={{ borderColor: "var(--border)", background: "var(--muted)" }}>
            <p className="text-xs font-bold mb-3 flex items-center gap-1.5" style={{ color: "var(--muted-foreground)" }}>
              <ShieldCheck size={12} />CUENTAS DE DEMOSTRACIÓN
            </p>
            <div className="flex flex-col gap-2">
              {[
                { label: "Almacenero", email: "almacen@jobaperu.pe", pass: "Joba2025$",  icon: Package,   color: "#1B4F8A" },
                { label: "Administrador", email: "admin@jobaperu.pe", pass: "Admin2025#", icon: Shield,    color: "#7C3AED" },
              ].map(({ label, email: em, pass, icon: Icon, color }) => (
                <button key={em} type="button" onClick={() => fillDemo(em, pass)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg border text-left transition hover:opacity-90"
                  style={{ background: "#fff", borderColor: "var(--border)" }}>
                  <div className="w-7 h-7 rounded-md flex items-center justify-center shrink-0" style={{ background: color + "18" }}>
                    <Icon size={13} style={{ color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold" style={{ color: "var(--foreground)" }}>{label}</p>
                    <p className="text-xs truncate" style={{ color: "var(--muted-foreground)", fontFamily: "'DM Mono', monospace" }}>{em}</p>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded font-mono" style={{ background: color + "12", color }}>
                    Usar
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── ALMACENERO VIEWS ─────────────────────────────────────────────────────────

const ALMC_NAV = [
  { icon: LayoutDashboard, label: "Dashboard",    id: "dashboard"    },
  { icon: Package,          label: "Inventario",   id: "inventario"   },
  { icon: ArrowRightLeft,   label: "Préstamos",    id: "prestamos"    },
  { icon: Undo2,            label: "Devoluciones", id: "devoluciones" },
  { icon: AlertTriangle,    label: "Incidencias",  id: "incidencias"  },
];

function RegisterToolModal({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState({ code: "", name: "", category: "", condition: "Nuevo", available: "true" });
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(15,33,55,0.45)" }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4" style={{ border: "1px solid var(--border)" }}>
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "var(--border)", background: "var(--muted)" }}>
          <div className="flex items-center gap-2">
            <Plus size={16} style={{ color: "var(--primary)" }} />
            <span className="font-bold text-sm" style={{ color: "var(--foreground)" }}>Registrar Nueva Herramienta</span>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: "var(--border)" }}><X size={13} /></button>
        </div>
        <div className="p-6 flex flex-col gap-4">
          {[{ label: "Código de Herramienta", key: "code", placeholder: "ej. QR-DR-0092", mono: true }, { label: "Nombre de Herramienta", key: "name", placeholder: "ej. Taladro Inalámbrico Dewalt" }, { label: "Categoría", key: "category", placeholder: "ej. Herramienta Eléctrica" }].map(({ label, key, placeholder, mono }) => (
            <div key={key}>
              <label className="text-xs font-semibold mb-1 block" style={{ color: "var(--muted-foreground)" }}>{label}</label>
              <input type="text" placeholder={placeholder} value={(form as any)[key]} onChange={e => set(key, e.target.value)}
                className="w-full px-3 py-2.5 text-sm rounded-md border outline-none"
                style={{ background: "var(--input-background)", borderColor: "var(--border)", color: "var(--foreground)", fontFamily: mono ? "'DM Mono', monospace" : "inherit" }} />
            </div>
          ))}
          <div className="grid grid-cols-2 gap-4">
            {[{ label: "Estado", key: "condition", opts: ["Nuevo","Usado","Deteriorado"] }, { label: "Disponibilidad", key: "available", opts: [{ v: "true", l: "Disponible" }, { v: "false", l: "No Disponible" }] }].map(({ label, key, opts }) => (
              <div key={key}>
                <label className="text-xs font-semibold mb-1 block" style={{ color: "var(--muted-foreground)" }}>{label}</label>
                <select value={(form as any)[key]} onChange={e => set(key, e.target.value)} className="w-full px-3 py-2.5 text-sm rounded-md border outline-none" style={{ background: "var(--input-background)", borderColor: "var(--border)", color: "var(--foreground)" }}>
                  {opts.map((o: any) => <option key={typeof o === "string" ? o : o.v} value={typeof o === "string" ? o : o.v}>{typeof o === "string" ? o : o.l}</option>)}
                </select>
              </div>
            ))}
          </div>
        </div>
        <div className="flex justify-end gap-3 px-6 pb-5">
          <button onClick={onClose} className="px-4 py-2 rounded-md text-sm font-semibold border" style={{ borderColor: "var(--border)", color: "var(--muted-foreground)" }}>Cancelar</button>
          <button onClick={onClose} className="px-5 py-2 rounded-md text-sm font-bold text-white" style={{ background: "var(--primary)" }}>Guardar Herramienta</button>
        </div>
      </div>
    </div>
  );
}

function DashboardView() {
  const total = INVENTORY_DATA.length;
  const prestadas = INVENTORY_DATA.filter(t => !t.available).length;
  const alertas = OVERDUE_ALERTS.length;
  return (
    <div className="flex-1 overflow-y-auto px-7 py-6" style={{ scrollbarWidth: "none" }}>
      <div className="grid grid-cols-3 gap-5 mb-6">
        {[
          { label: "Total Herramientas en Stock",       value: total,    icon: Package,       accent: "#1B4F8A", bg: "#EFF6FF", sub: `${INVENTORY_DATA.filter(t=>t.available).length} disponibles` },
          { label: "Herramientas en Obra / Prestadas",  value: prestadas,icon: ArrowRightLeft,accent: "#A16207", bg: "#FEFCE8", sub: "actualmente en campo" },
          { label: "Alertas Críticas por Extravío",     value: alertas,  icon: AlertCircle,  accent: "#B91C1C", bg: "#FEF2F2", sub: "requieren atención urgente" },
        ].map(({ label, value, icon: Icon, accent, bg, sub }) => (
          <div key={label} className="bg-white rounded-xl border p-5 flex items-start gap-4" style={{ borderColor: "var(--border)" }}>
            <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: bg }}><Icon size={20} style={{ color: accent }} /></div>
            <div>
              <p className="text-3xl font-bold leading-none" style={{ color: accent }}>{value}</p>
              <p className="text-xs font-semibold mt-1.5 leading-tight" style={{ color: "var(--foreground)" }}>{label}</p>
              <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>{sub}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-5">
        <SectionCard>
          <div className="flex items-center gap-2 px-5 py-4 border-b" style={{ borderColor: "var(--border)" }}>
            <Clock size={15} style={{ color: "var(--primary)" }} />
            <span className="font-bold text-sm" style={{ color: "var(--foreground)" }}>Últimos Préstamos de Hoy</span>
          </div>
          <div className="divide-y" style={{ borderColor: "var(--border)" }}>
            {RECENT_LOANS.map((loan, i) => (
              <div key={i} className="flex items-center gap-3 px-5 py-3.5">
                <span className="text-xs font-semibold w-10 shrink-0" style={{ color: "var(--muted-foreground)", fontFamily: "'DM Mono', monospace" }}>{loan.time}</span>
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0" style={{ background: "var(--primary)" }}>{loan.operator.charAt(0)}</div>
                <span className="text-sm flex-1 font-medium" style={{ color: "var(--foreground)" }}>{loan.operator}</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: "#EFF6FF", color: "var(--primary)" }}>{loan.tools} herramienta{loan.tools!==1?"s":""}</span>
              </div>
            ))}
          </div>
        </SectionCard>
        <SectionCard>
          <div className="flex items-center gap-2 px-5 py-4 border-b" style={{ borderColor: "var(--border)" }}>
            <BarChart2 size={15} style={{ color: "var(--primary)" }} />
            <span className="font-bold text-sm" style={{ color: "var(--foreground)" }}>Categorías con Mayor Incidencia</span>
          </div>
          <div className="px-4 py-4">
            <p className="text-xs mb-3" style={{ color: "var(--muted-foreground)" }}>Herramientas más propensas a pérdida o daño (últimos 90 días)</p>
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

function InventarioView() {
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const filtered = useMemo(() => INVENTORY_DATA.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.category.toLowerCase().includes(search.toLowerCase()) ||
    t.qr.toLowerCase().includes(search.toLowerCase())
  ), [search]);
  return (
    <>
      {showModal && <RegisterToolModal onClose={() => setShowModal(false)} />}
      <div className="flex-1 overflow-y-auto px-7 py-6" style={{ scrollbarWidth: "none" }}>
        <div className="flex items-center gap-3 mb-5">
          <div className="flex-1 relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--muted-foreground)" }} />
            <input type="text" placeholder="Buscar por nombre, categoría o código QR…" value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-sm rounded-lg border outline-none" style={{ background: "#fff", borderColor: "var(--border)", color: "var(--foreground)" }} />
          </div>
          <button className="flex items-center gap-2 px-3 py-2.5 rounded-lg border text-sm font-medium" style={{ background: "#fff", borderColor: "var(--border)", color: "var(--muted-foreground)" }}><Filter size={14} />Filtrar</button>
          <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold text-white" style={{ background: "var(--primary)" }}><Plus size={14} />Registrar Herramienta</button>
        </div>
        <div className="grid grid-cols-4 gap-3 mb-5">
          {[{ label: "Total", value: INVENTORY_DATA.length, color: "var(--primary)" },{ label: "Disponibles", value: INVENTORY_DATA.filter(t=>t.available).length, color: "#15803D" },{ label: "Prestadas", value: INVENTORY_DATA.filter(t=>!t.available).length, color: "#A16207" },{ label: "Nuevas", value: INVENTORY_DATA.filter(t=>t.condition==="Nuevo").length, color: "#2563EB" }].map(({label,value,color})=>(
            <div key={label} className="bg-white rounded-lg border px-4 py-3 flex items-center justify-between" style={{ borderColor:"var(--border)" }}>
              <span className="text-xs font-medium" style={{ color:"var(--muted-foreground)" }}>{label}</span>
              <span className="text-lg font-bold" style={{ color }}>{value}</span>
            </div>
          ))}
        </div>
        <div className="bg-white rounded-xl border overflow-hidden" style={{ borderColor:"var(--border)" }}>
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr style={{ background:"var(--muted)" }}>
                {["ID","Código QR / Barras","Nombre de Herramienta","Categoría","Estado de Conservación","Disponibilidad"].map(h=>(
                  <th key={h} className="text-left px-4 py-3 border-b font-semibold" style={{ borderColor:"var(--border)", color:"var(--muted-foreground)", fontSize:10, textTransform:"uppercase", letterSpacing:"0.06em", fontFamily:"'DM Mono', monospace" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((tool,idx)=>(
                <tr key={tool.id} className="border-b transition hover:bg-blue-50/30" style={{ borderColor:"var(--border)", background:idx%2===1?"#FAFBFD":"#fff" }}>
                  <td className="px-4 py-3 text-xs font-semibold" style={{ color:"var(--muted-foreground)", fontFamily:"'DM Mono', monospace" }}>{tool.id}</td>
                  <td className="px-4 py-3 text-xs" style={{ color:"var(--secondary)", fontFamily:"'DM Mono', monospace" }}>{tool.qr}</td>
                  <td className="px-4 py-3 font-medium text-sm" style={{ color:"var(--foreground)" }}>{tool.name}</td>
                  <td className="px-4 py-3"><Badge color="blue">{tool.category}</Badge></td>
                  <td className="px-4 py-3"><Badge color={tool.condition==="Nuevo"?"green":"gray"}>{tool.condition}</Badge></td>
                  <td className="px-4 py-3">{tool.available?<Badge color="green"><CheckCircle2 size={10}/>DISPONIBLE</Badge>:<Badge color="yellow"><Clock size={10}/>PRESTADO</Badge>}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="px-4 py-3 flex items-center justify-between border-t" style={{ borderColor:"var(--border)" }}>
            <p className="text-xs" style={{ color:"var(--muted-foreground)" }}>Mostrando {filtered.length} de {INVENTORY_DATA.length} registros</p>
            <div className="flex gap-1">
              {["Ant.","1","Sig."].map((t,i)=><button key={t} className="px-3 py-1 rounded text-xs font-medium border" style={{ borderColor:"var(--border)", background:i===1?"var(--primary)":"#fff", color:i===1?"#fff":"var(--muted-foreground)" }}>{t}</button>)}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function PrestamosView() {
  const [dniInput, setDniInput] = useState("");
  const [operatorFound, setOperatorFound] = useState(false);
  const [qrInput, setQrInput] = useState("");
  const [tools, setTools] = useState<typeof TOOL_DB[string][]>(["QR-WR-0043","QR-DR-0091"].map(k=>TOOL_DB[k]));
  const [qrError, setQrError] = useState("");
  const today = new Date();
  const [calYear,setCalYear] = useState(today.getFullYear());
  const [calMonth,setCalMonth] = useState(today.getMonth());
  const [selectedDay,setSelectedDay] = useState<number|null>(null);
  const {firstDay,daysInMonth} = getMiniCalendar(calYear,calMonth);
  const minDay = calYear===today.getFullYear()&&calMonth===today.getMonth()?today.getDate()+1:1;
  const selectedDate = selectedDay?`${String(selectedDay).padStart(2,"0")} de ${MONTH_NAMES[calMonth]} de ${calYear}`:null;
  const canConfirm = operatorFound&&tools.length>0&&selectedDay!==null;
  const handleDniSearch=()=>{if(dniInput.trim().length>=4)setOperatorFound(true);};
  const handleQrScan=()=>{const c=qrInput.trim().toUpperCase();if(!c)return;if(TOOL_DB[c]){if(tools.find(t=>t.qr===c)){setQrError("Ya añadida.");}else{setTools([...tools,TOOL_DB[c]]);setQrError("");}}else{setQrError(`"${c}" no encontrado.`);}setQrInput("");};
  const prevMonth=()=>{if(calMonth===0){setCalMonth(11);setCalYear(y=>y-1);}else setCalMonth(m=>m-1);};
  const nextMonth=()=>{if(calMonth===11){setCalMonth(0);setCalYear(y=>y+1);}else setCalMonth(m=>m+1);};
  return (
    <div className="flex-1 overflow-y-auto px-7 py-5" style={{ scrollbarWidth:"none" }}>
      <div className="flex items-center gap-2 mb-5">
        {[{n:1,label:"Identificación",done:operatorFound},{n:2,label:"Herramientas",done:tools.length>0},{n:3,label:"Detalles",done:selectedDay!==null}].map((step,i)=>(
          <div key={step.n} className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold" style={{ background:step.done?"#16A34A":"var(--accent)", color:"#fff" }}>{step.done?<CheckCircle2 size={13}/>:step.n}</div>
              <span className="text-xs font-medium" style={{ color:step.done?"#16A34A":"var(--muted-foreground)" }}>{step.label}</span>
            </div>
            {i<2&&<ChevronRight size={14} style={{ color:"var(--border)" }}/>}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-12 gap-5">
        <div className="col-span-4 flex flex-col gap-4">
          <SectionCard>
            <StepHeader step={1} title="Identificación del Operario" subtitle="Escanee el DNI o código de barras"/>
            <div className="p-4 flex flex-col gap-3">
              <div className="flex gap-2">
                <div className="flex-1 relative"><ScanLine size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color:"var(--muted-foreground)" }}/>
                  <input type="text" placeholder="DNI…" value={dniInput} onChange={e=>setDniInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleDniSearch()}
                    className="w-full pl-8 pr-3 py-2.5 text-sm rounded-md border outline-none" style={{ background:"var(--input-background)", borderColor:"var(--border)", color:"var(--foreground)", fontFamily:"'DM Mono', monospace" }}/>
                </div>
                <button onClick={handleDniSearch} className="px-3 rounded-md text-sm font-semibold text-white flex items-center gap-1.5" style={{ background:"var(--primary)" }}><Search size={14}/>Buscar</button>
              </div>
              {operatorFound?(
                <div className="rounded-lg p-4 border flex gap-3 items-start" style={{ background:"#F0F9FF", borderColor:"#BAE6FD" }}>
                  <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg text-white shrink-0" style={{ background:"var(--primary)" }}>C</div>
                  <div><p className="font-bold text-sm" style={{ color:"var(--foreground)" }}>Carlos Mendoza Ríos</p><p className="text-xs" style={{ color:"var(--muted-foreground)", fontFamily:"'DM Mono', monospace" }}>OP-2241 · DNI 47823091</p><Badge color="green"><CheckCircle2 size={10}/>Habilitado / Sin Deudas</Badge></div>
                </div>
              ):(
                <div className="rounded-lg border-2 border-dashed flex flex-col items-center py-8 gap-2" style={{ borderColor:"var(--border)" }}>
                  <User size={26} style={{ color:"var(--border)" }}/><p className="text-xs text-center" style={{ color:"var(--muted-foreground)" }}>Ingrese el DNI</p>
                </div>
              )}
            </div>
          </SectionCard>
          <SectionCard>
            <StepHeader step={3} title="Detalles de la Transacción" subtitle="Fecha límite de devolución"/>
            <div className="p-4">
              <div className="rounded-lg border p-3" style={{ background:"var(--input-background)", borderColor:"var(--border)" }}>
                <div className="flex items-center justify-between mb-3">
                  <button onClick={prevMonth} className="w-6 h-6 rounded flex items-center justify-center" style={{ color:"var(--muted-foreground)" }}><ChevronLeft size={14}/></button>
                  <p className="text-xs font-semibold" style={{ color:"var(--foreground)" }}>{MONTH_NAMES[calMonth]} {calYear}</p>
                  <button onClick={nextMonth} className="w-6 h-6 rounded flex items-center justify-center" style={{ color:"var(--muted-foreground)" }}><ChevronRight size={14}/></button>
                </div>
                <div className="grid grid-cols-7 gap-0.5 mb-1">{DAYS.map(d=><div key={d} className="text-center text-xs font-semibold" style={{ color:"var(--muted-foreground)", fontSize:10 }}>{d}</div>)}</div>
                <div className="grid grid-cols-7 gap-0.5">
                  {Array.from({length:firstDay}).map((_,i)=><div key={`e-${i}`}/>)}
                  {Array.from({length:daysInMonth},(_,i)=>i+1).map(day=>{
                    const isPast=calYear===today.getFullYear()&&calMonth===today.getMonth()&&day<minDay;
                    const isSel=selectedDay===day;
                    return <button key={day} disabled={isPast} onClick={()=>setSelectedDay(day)} className="h-7 w-full rounded text-xs font-medium transition"
                      style={{ background:isSel?"var(--accent)":"transparent", color:isSel?"#fff":isPast?"#CBD5E1":"var(--foreground)", cursor:isPast?"not-allowed":"pointer" }}>{day}</button>;
                  })}
                </div>
              </div>
              {selectedDate&&<div className="mt-2 flex items-center gap-2 px-3 py-2 rounded-md text-xs font-medium" style={{ background:"#DCFCE7", color:"#15803D" }}><Calendar size={12}/>Fecha límite: <strong>{selectedDate}</strong></div>}
            </div>
          </SectionCard>
        </div>
        <div className="col-span-8 flex flex-col gap-4">
          <SectionCard>
            <StepHeader step={2} title="Escaneo de Herramientas" subtitle="Escanee el código QR de cada herramienta"/>
            <div className="p-4 flex flex-col gap-3">
              <div className="flex gap-2">
                <div className="flex-1 relative"><QrCode size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color:"var(--muted-foreground)" }}/>
                  <input type="text" placeholder="Código QR…" value={qrInput} onChange={e=>{setQrInput(e.target.value);setQrError("");}} onKeyDown={e=>e.key==="Enter"&&handleQrScan()}
                    className="w-full pl-8 pr-3 py-2.5 text-sm rounded-md border outline-none" style={{ background:"var(--input-background)", borderColor:qrError?"var(--destructive)":"var(--border)", color:"var(--foreground)", fontFamily:"'DM Mono', monospace" }}/>
                </div>
                <button onClick={handleQrScan} className="px-3 rounded-md text-sm font-semibold text-white flex items-center gap-1.5" style={{ background:"var(--primary)" }}><ScanLine size={14}/>Añadir</button>
              </div>
              {qrError&&<p className="text-xs" style={{ color:"var(--destructive)" }}>{qrError}</p>}
              <p className="text-xs" style={{ color:"var(--muted-foreground)" }}>Prueba: QR-WR-0043 · QR-DR-0091 · QR-HM-0017 · QR-WR-0055</p>
              <div className="rounded-lg border overflow-hidden" style={{ borderColor:"var(--border)" }}>
                <table className="w-full text-sm border-collapse">
                  <thead><tr style={{ background:"var(--muted)" }}>{["Código QR","Nombre de la Herramienta","Categoría","Estado Actual",""].map(h=><th key={h} className="text-left px-4 py-2.5 text-xs font-semibold border-b" style={{ borderColor:"var(--border)", color:"var(--muted-foreground)", textTransform:"uppercase", letterSpacing:"0.06em", fontSize:10, fontFamily:"'DM Mono', monospace" }}>{h}</th>)}</tr></thead>
                  <tbody>
                    {tools.length===0?<tr><td colSpan={5} className="text-center py-10 text-xs" style={{ color:"var(--muted-foreground)" }}>No hay herramientas añadidas</td></tr>
                    :tools.map((tool,idx)=>{const Icon=tool.icon;return(
                      <tr key={tool.qr} className="border-b transition hover:bg-blue-50/30" style={{ borderColor:"var(--border)", background:idx%2===1?"#FAFBFD":"#fff" }}>
                        <td className="px-4 py-3 text-xs" style={{ color:"var(--secondary)", fontFamily:"'DM Mono', monospace" }}>{tool.qr}</td>
                        <td className="px-4 py-3"><div className="flex items-center gap-2"><div className="w-7 h-7 rounded-md flex items-center justify-center shrink-0" style={{ background:"#EFF6FF" }}><Icon size={13} style={{ color:"var(--accent)" }}/></div><span className="font-medium text-sm" style={{ color:"var(--foreground)" }}>{tool.name}</span></div></td>
                        <td className="px-4 py-3"><Badge color="blue">{tool.category}</Badge></td>
                        <td className="px-4 py-3"><Badge color="green"><CheckCircle2 size={10}/>Disponible</Badge></td>
                        <td className="px-4 py-3"><button onClick={()=>setTools(tools.filter(t=>t.qr!==tool.qr))} className="w-6 h-6 rounded flex items-center justify-center" style={{ color:"var(--muted-foreground)" }}><Trash2 size={13}/></button></td>
                      </tr>);
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </SectionCard>
          {canConfirm&&<div className="rounded-lg border p-4 flex items-center gap-3" style={{ background:"#F0F9FF", borderColor:"#BAE6FD" }}><CheckCircle2 size={18} style={{ color:"#0284C7" }}/><p className="text-xs" style={{ color:"#0369A1" }}><strong>Listo para confirmar.</strong> Préstamo para <strong>Carlos Mendoza Ríos</strong> · {tools.length} herramienta{tools.length!==1?"s":""} · Devolver el <strong>{selectedDate}</strong></p></div>}
          <div className="flex justify-end gap-3 pb-2">
            <button onClick={()=>{setDniInput("");setOperatorFound(false);setTools([]);setSelectedDay(null);}} className="px-4 py-2.5 rounded-md text-sm font-semibold border flex items-center gap-1.5" style={{ borderColor:"var(--border)", color:"var(--muted-foreground)", background:"#fff" }}><X size={14}/>Cancelar</button>
            <button disabled={!canConfirm} className="px-6 py-2.5 rounded-md text-sm font-bold text-white flex items-center gap-2" style={{ background:canConfirm?"var(--accent)":"var(--muted)", color:canConfirm?"#fff":"var(--muted-foreground)", cursor:canConfirm?"pointer":"not-allowed" }}><CheckCircle2 size={15}/>Confirmar Préstamo</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function DevolucionesView() {
  const [dniInput,setDniInput]=useState("");
  const [operator,setOperator]=useState<typeof OPERATORS_DB[string]|null>(null);
  const [returnStates,setReturnStates]=useState<Record<string,string>>({});
  const [notFound,setNotFound]=useState(false);
  const handleSearch=()=>{const k=dniInput.trim();const f=OPERATORS_DB[k];if(f){setOperator(f);setReturnStates({});setNotFound(false);}else{setOperator(null);setNotFound(true);}};
  const setReturn=(qr:string,val:string)=>setReturnStates(s=>({...s,[qr]:val}));
  const allSet=operator&&operator.tools.every(qr=>returnStates[qr]);
  const hasIssue=Object.values(returnStates).some(v=>v==="Dañada"||v==="Perdida");
  return (
    <div className="flex-1 overflow-y-auto px-7 py-5" style={{ scrollbarWidth:"none" }}>
      <div className="flex flex-col gap-5 max-w-4xl">
        <SectionCard>
          <StepHeader step={1} title="Buscar Préstamo Activo" subtitle="Escanee el fotocheck o ingrese el DNI del operario"/>
          <div className="p-5">
            <div className="flex gap-2">
              <div className="flex-1 relative"><ScanLine size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color:"var(--muted-foreground)" }}/>
                <input type="text" placeholder="DNI… (prueba: 47823091 · 36541890 · 52198734)" value={dniInput} onChange={e=>{setDniInput(e.target.value);setNotFound(false);}} onKeyDown={e=>e.key==="Enter"&&handleSearch()}
                  className="w-full pl-8 pr-3 py-2.5 text-sm rounded-md border outline-none" style={{ background:"var(--input-background)", borderColor:notFound?"var(--destructive)":"var(--border)", color:"var(--foreground)", fontFamily:"'DM Mono', monospace" }}/>
              </div>
              <button onClick={handleSearch} className="px-4 rounded-md text-sm font-semibold text-white flex items-center gap-1.5" style={{ background:"var(--primary)" }}><Search size={14}/>Buscar</button>
            </div>
            {notFound&&<p className="text-xs mt-2" style={{ color:"var(--destructive)" }}>No se encontró un préstamo activo con ese DNI.</p>}
            {operator&&(
              <div className="mt-3 flex items-center gap-4 p-4 rounded-xl border" style={{ background:"#F0F9FF", borderColor:"#BAE6FD" }}>
                <div className="w-11 h-11 rounded-full flex items-center justify-center text-lg font-bold text-white shrink-0" style={{ background:"var(--primary)" }}>{operator.name.charAt(0)}</div>
                <div className="flex-1"><p className="font-bold text-sm" style={{ color:"var(--foreground)" }}>{operator.name}</p><p className="text-xs" style={{ color:"var(--muted-foreground)", fontFamily:"'DM Mono', monospace" }}>{operator.code} · DNI {operator.dni}</p></div>
                <div className="text-right"><p className="text-xs font-semibold" style={{ color:"var(--muted-foreground)" }}>Fecha de préstamo</p><p className="text-sm font-bold" style={{ color:"var(--primary)" }}>{operator.loanDate}</p></div>
              </div>
            )}
          </div>
        </SectionCard>
        {operator&&(
          <SectionCard>
            <StepHeader step={2} title="Inspección de Herramientas" subtitle={`Herramientas de ${operator.name}`}/>
            <div className="p-4">
              {hasIssue&&<div className="flex items-center gap-2 mb-3 px-4 py-2.5 rounded-lg" style={{ background:"#FEF3C7", border:"1px solid #FDE68A" }}><AlertCircle size={14} style={{ color:"#D97706" }}/><p className="text-xs font-semibold" style={{ color:"#92400E" }}>Se detectaron herramientas con incidencias.</p></div>}
              <table className="w-full text-sm border-collapse rounded-lg overflow-hidden border" style={{ borderColor:"var(--border)" }}>
                <thead><tr style={{ background:"var(--muted)" }}>{["Código QR","Nombre de Herramienta","Estado de Retorno *"].map(h=><th key={h} className="text-left px-4 py-3 border-b font-semibold" style={{ borderColor:"var(--border)", color:"var(--muted-foreground)", fontSize:10, textTransform:"uppercase", letterSpacing:"0.06em", fontFamily:"'DM Mono', monospace" }}>{h}</th>)}</tr></thead>
                <tbody>
                  {operator.tools.map((qr,idx)=>{const tool=TOOL_DB[qr]??{name:qr,qr,category:"–",icon:Wrench};const Icon=tool.icon;const val=returnStates[qr]??"";const sc=val==="Buen Estado"?"#15803D":val==="Dañada"?"#D97706":val==="Perdida"?"#B91C1C":"var(--muted-foreground)";return(
                    <tr key={qr} className="border-b" style={{ borderColor:"var(--border)", background:idx%2===1?"#FAFBFD":"#fff" }}>
                      <td className="px-4 py-3 text-xs" style={{ color:"var(--secondary)", fontFamily:"'DM Mono', monospace" }}>{qr}</td>
                      <td className="px-4 py-3"><div className="flex items-center gap-2"><div className="w-7 h-7 rounded-md flex items-center justify-center shrink-0" style={{ background:"#EFF6FF" }}><Icon size={13} style={{ color:"var(--accent)" }}/></div><span className="font-medium text-sm" style={{ color:"var(--foreground)" }}>{tool.name}</span></div></td>
                      <td className="px-4 py-3"><div className="relative"><select value={val} onChange={e=>setReturn(qr,e.target.value)} className="w-full appearance-none pl-3 pr-8 py-2 text-sm rounded-md border outline-none font-semibold" style={{ background:val?"#fff":"var(--input-background)", borderColor:!val?"var(--destructive)":"var(--border)", color:sc }}>
                        <option value="" disabled>Seleccionar…</option><option value="Buen Estado">✓ Buen Estado</option><option value="Dañada">⚠ Dañada</option><option value="Perdida">✕ Perdida</option>
                      </select><ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color:"var(--muted-foreground)" }}/></div></td>
                    </tr>);
                  })}
                </tbody>
              </table>
            </div>
          </SectionCard>
        )}
        {operator&&(
          <div className="flex justify-end gap-3 pb-2">
            <button onClick={()=>{setOperator(null);setDniInput("");setReturnStates({});}} className="px-4 py-2.5 rounded-md text-sm font-semibold border flex items-center gap-1.5" style={{ borderColor:"var(--border)", color:"var(--muted-foreground)", background:"#fff" }}><X size={14}/>Cancelar</button>
            <button disabled={!allSet} className="px-6 py-2.5 rounded-md text-sm font-bold text-white flex items-center gap-2" style={{ background:allSet?(hasIssue?"#D97706":"var(--accent)"):"var(--muted)", color:allSet?"#fff":"var(--muted-foreground)", cursor:allSet?"pointer":"not-allowed" }}><Undo2 size={15}/>Registrar Devolución e Inspección</button>
          </div>
        )}
      </div>
    </div>
  );
}

function IncidenciasView() {
  const today = new Date().toLocaleDateString("es-PE",{day:"2-digit",month:"2-digit",year:"numeric"});
  const [form,setForm]=useState({assignmentId:"",type:"",description:""});
  const set=(k:string,v:string)=>setForm(f=>({...f,[k]:v}));
  const canSubmit=form.assignmentId&&form.type&&form.description.length>20;
  return (
    <div className="flex-1 overflow-y-auto px-7 py-5" style={{ scrollbarWidth:"none" }}>
      <div className="flex flex-col gap-5 max-w-3xl">
        <div>
          <div className="flex items-center gap-2 mb-3"><Zap size={15} style={{ color:"#B91C1C" }}/><h2 className="text-sm font-bold" style={{ color:"var(--foreground)" }}>Alertas de Activos con Retraso</h2><span className="ml-auto px-2 py-0.5 rounded-full text-xs font-bold" style={{ background:"#FEE2E2", color:"#B91C1C" }}>{OVERDUE_ALERTS.length} sin devolver</span></div>
          <div className="rounded-xl border overflow-hidden" style={{ borderColor:"#FECACA", background:"#FFF8F8" }}>
            {OVERDUE_ALERTS.map(alert=>(
              <div key={alert.id} className="flex items-center gap-4 px-5 py-3.5 border-b last:border-b-0" style={{ borderColor:"#FECACA" }}>
                <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ background:"#FEE2E2" }}><AlertCircle size={15} style={{ color:"#B91C1C" }}/></div>
                <div className="flex-1 min-w-0"><p className="text-sm font-semibold" style={{ color:"#7F1D1D" }}>{alert.operator}</p><p className="text-xs mt-0.5 truncate" style={{ color:"#B91C1C" }}>Herramienta: <strong>{alert.tool}</strong> · Préstamo: {alert.loanDate}</p></div>
                <span className="px-2.5 py-1 rounded-full text-xs font-bold" style={{ background:"#FEE2E2", color:"#B91C1C" }}>+{alert.days} día{alert.days!==1?"s":""} de retraso</span>
              </div>
            ))}
          </div>
        </div>
        <SectionCard>
          <div className="flex items-center gap-2 px-5 py-4 border-b" style={{ borderColor:"var(--border)" }}><FileText size={15} style={{ color:"var(--primary)" }}/><span className="font-bold text-sm" style={{ color:"var(--foreground)" }}>Reportar Nueva Incidencia</span></div>
          <div className="p-5 flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-xs font-semibold mb-1.5 block" style={{ color:"var(--muted-foreground)" }}>ID de Asignación Original *</label><input type="text" placeholder="ej. LOAN-2025-0143" value={form.assignmentId} onChange={e=>set("assignmentId",e.target.value)} className="w-full px-3 py-2.5 text-sm rounded-md border outline-none" style={{ background:"var(--input-background)", borderColor:"var(--border)", color:"var(--foreground)", fontFamily:"'DM Mono', monospace" }}/></div>
              <div><label className="text-xs font-semibold mb-1.5 block" style={{ color:"var(--muted-foreground)" }}>Fecha de Reporte</label><input type="text" readOnly value={today} className="w-full px-3 py-2.5 text-sm rounded-md border outline-none" style={{ background:"#F1F5F9", borderColor:"var(--border)", color:"var(--muted-foreground)", fontFamily:"'DM Mono', monospace" }}/></div>
            </div>
            <div><label className="text-xs font-semibold mb-1.5 block" style={{ color:"var(--muted-foreground)" }}>Tipo de Incidencia *</label><div className="relative"><select value={form.type} onChange={e=>set("type",e.target.value)} className="w-full appearance-none px-3 py-2.5 text-sm rounded-md border outline-none pr-8" style={{ background:"var(--input-background)", borderColor:"var(--border)", color:form.type?"var(--foreground)":"var(--muted-foreground)" }}><option value="" disabled>Seleccione…</option><option value="Pérdida">Pérdida</option><option value="Robo">Robo</option><option value="Rotura Total">Rotura Total</option></select><ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color:"var(--muted-foreground)" }}/></div></div>
            <div><label className="text-xs font-semibold mb-1.5 block" style={{ color:"var(--muted-foreground)" }}>Descripción Detallada *</label><textarea rows={5} placeholder="Describa detalladamente el suceso o el motivo de la baja del activo..." value={form.description} onChange={e=>set("description",e.target.value)} className="w-full px-3 py-3 text-sm rounded-md border outline-none resize-none" style={{ background:"var(--input-background)", borderColor:"var(--border)", color:"var(--foreground)", lineHeight:1.6 }}/><p className="text-xs mt-1 text-right" style={{ color:"var(--muted-foreground)" }}>{form.description.length} / mínimo 20</p></div>
            <div className="flex justify-end gap-3 pt-1">
              <button onClick={()=>setForm({assignmentId:"",type:"",description:""})} className="px-4 py-2.5 rounded-md text-sm font-semibold border flex items-center gap-1.5" style={{ borderColor:"var(--border)", color:"var(--muted-foreground)", background:"#fff" }}><X size={14}/>Limpiar</button>
              <button disabled={!canSubmit} className="px-6 py-2.5 rounded-md text-sm font-bold text-white flex items-center gap-2" style={{ background:canSubmit?"#C0392B":"var(--muted)", color:canSubmit?"#fff":"var(--muted-foreground)", cursor:canSubmit?"pointer":"not-allowed" }}><AlertTriangle size={15}/>Emitir Reporte de Incidencia</button>
            </div>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}

// ─── ALMACENERO SHELL ────────────────────────────────────────────────────────

const ALMC_VIEW_META: Record<string,{title:string;subtitle:string}> = {
  dashboard:    { title:"Panel de Control",                    subtitle:"Resumen operativo del día"                },
  inventario:   { title:"Inventario de Herramientas",          subtitle:"Stock físico actual del almacén"          },
  prestamos:    { title:"Registrar Préstamo de Herramientas",  subtitle:"Flujo de salida de activos a obra"        },
  devoluciones: { title:"Registro de Devoluciones",            subtitle:"Recepción e inspección de herramientas"   },
  incidencias:  { title:"Gestión de Incidencias",              subtitle:"Alertas activas y reportes de baja"       },
};

function AlmaceneroApp({ user, onLogout }: { user: SessionUser; onLogout: () => void }) {
  const [activeNav,setActiveNav] = useState("dashboard");
  const meta = ALMC_VIEW_META[activeNav];
  const today = new Date().toLocaleDateString("es-PE",{weekday:"long",year:"numeric",month:"long",day:"numeric"});
  return (
    <div className="flex h-screen w-full overflow-hidden" style={{ fontFamily:"'Inter', system-ui, sans-serif", background:"var(--background)" }}>
      <aside className="flex flex-col w-60 shrink-0 h-full" style={{ background:"var(--sidebar)", borderRight:"1px solid var(--sidebar-border)" }}>
        <div className="px-5 py-5 border-b" style={{ borderColor:"var(--sidebar-border)" }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background:"var(--accent)" }}><HardHat size={18} color="#fff"/></div>
            <div><p className="text-white font-bold text-sm tracking-wide">JOBA PERÚ</p><p className="text-xs" style={{ color:"var(--muted-foreground)", fontSize:10 }}>Sistema de Herramientas</p></div>
          </div>
        </div>
        <nav className="flex-1 py-4 px-3 flex flex-col gap-0.5">
          <p className="px-2 mb-2 text-xs font-semibold uppercase tracking-widest" style={{ color:"#3D5A73", fontSize:10 }}>Módulos</p>
          {ALMC_NAV.map(({icon:Icon,label,id})=>{const isActive=activeNav===id;return(
            <button key={id} onClick={()=>setActiveNav(id)} className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium w-full text-left transition-all duration-150"
              style={{ background:isActive?"var(--sidebar-accent)":"transparent", color:isActive?"var(--sidebar-accent-foreground)":"var(--sidebar-foreground)", borderLeft:isActive?"3px solid var(--accent)":"3px solid transparent" }}>
              <Icon size={16}/><span>{label}</span>{isActive&&<ChevronRight size={12} className="ml-auto opacity-50"/>}
            </button>);
          })}
        </nav>
        <div className="mx-3 mb-2 p-3 rounded-lg flex items-center gap-2.5" style={{ background:"var(--sidebar-accent)" }}>
          <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ background:"var(--accent)" }}><User size={14} color="#fff"/></div>
          <div className="min-w-0 flex-1"><p className="text-xs font-semibold text-white truncate">{user.name}</p><p className="text-xs truncate" style={{ color:"var(--muted-foreground)", fontSize:10 }}>Almacenero</p></div>
        </div>
        <button onClick={onLogout} className="mx-3 mb-4 flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition" style={{ color:"#B91C1C", background:"rgba(185,28,28,0.08)" }}>
          <LogOut size={13}/>Cerrar Sesión
        </button>
      </aside>
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="flex items-center justify-between px-7 py-3.5 border-b shrink-0 bg-white" style={{ borderColor:"var(--border)" }}>
          <div><h1 className="font-bold text-base" style={{ color:"var(--foreground)", letterSpacing:"-0.01em" }}>{meta.title}</h1><p className="text-xs mt-0.5" style={{ color:"var(--muted-foreground)" }}>{today}</p></div>
          <div className="flex items-center gap-3">
            <button className="w-8 h-8 rounded-full flex items-center justify-center relative" style={{ background:"var(--muted)" }}><Bell size={15} style={{ color:"var(--muted-foreground)" }}/><span className="absolute top-1 right-1 w-2 h-2 rounded-full border-2 border-white" style={{ background:"var(--accent)" }}/></button>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium" style={{ background:"var(--muted)", color:"var(--muted-foreground)" }}><span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block"/>Turno Activo</div>
          </div>
        </header>
        {activeNav==="dashboard"    && <DashboardView/>}
        {activeNav==="inventario"   && <InventarioView/>}
        {activeNav==="prestamos"    && <PrestamosView/>}
        {activeNav==="devoluciones" && <DevolucionesView/>}
        {activeNav==="incidencias"  && <IncidenciasView/>}
      </div>
    </div>
  );
}

// ─── ADMIN VIEWS ──────────────────────────────────────────────────────────────

const ADMIN_NAV = [
  { icon: LayoutDashboard, label: "Panel Ejecutivo",  id: "panel"    },
  { icon: ShieldCheck,     label: "Auditoría / Bajas",id: "auditoria"},
  { icon: TrendingUp,      label: "Reportes",         id: "reportes" },
  { icon: Users,           label: "Usuarios",         id: "usuarios" },
  { icon: Settings,        label: "Configuración",    id: "config"   },
];

function AdminAuditoriaView() {
  const [rows, setRows] = useState(AUDIT_ROWS);
  const [approved, setApproved] = useState<Set<number>>(new Set());

  const handleApprove = (idx: number) => setApproved(s => new Set(s).add(idx));

  return (
    <div className="flex-1 overflow-y-auto px-7 py-6" style={{ scrollbarWidth:"none" }}>
      {/* Summary bar */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Reportes Pendientes de Aprobación", value: rows.length - approved.size, color: "#B91C1C", bg: "#FEF2F2" },
          { label: "Bajas Aprobadas este Mes",          value: approved.size + 7,            color: "#1B4F8A", bg: "#EFF6FF" },
          { label: "Costo Total Acumulado (S/.)",        value: `${rows.reduce((a,r)=>a+r.cost,0).toLocaleString("es-PE")}`, color: "#92400E", bg: "#FFFBEB" },
        ].map(({ label, value, color, bg }) => (
          <div key={label} className="bg-white rounded-xl border p-4 flex items-center gap-4" style={{ borderColor:"var(--border)" }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: bg }}>
              <AlertCircle size={18} style={{ color }} />
            </div>
            <div>
              <p className="text-2xl font-bold leading-none" style={{ color }}>{value}</p>
              <p className="text-xs font-medium mt-1" style={{ color:"var(--muted-foreground)" }}>{label}</p>
            </div>
          </div>
        ))}
      </div>

      <SectionCard>
        <div className="flex items-center gap-2 px-6 py-4 border-b" style={{ borderColor:"var(--border)" }}>
          <ShieldCheck size={16} style={{ color:"#B91C1C" }} />
          <span className="font-bold text-sm" style={{ color:"var(--foreground)" }}>Auditoría y Bajas de Activos</span>
          <span className="ml-auto px-2 py-0.5 rounded-full text-xs font-bold" style={{ background:"#FEE2E2", color:"#B91C1C" }}>
            {rows.length - approved.size} pendiente{rows.length - approved.size !== 1 ? "s" : ""}
          </span>
        </div>
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr style={{ background:"var(--muted)" }}>
              {["Código de Activo","Nombre","Operario Responsable","Tipo de Incidencia","Costo de Reposición (S/.)","Acciones"].map(h => (
                <th key={h} className="text-left px-5 py-3 border-b font-semibold" style={{ borderColor:"var(--border)", color:"var(--muted-foreground)", fontSize:10, textTransform:"uppercase", letterSpacing:"0.06em", fontFamily:"'DM Mono', monospace" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => {
              const isApproved = approved.has(idx);
              return (
                <tr key={row.code} className="border-b transition" style={{ borderColor:"var(--border)", background: isApproved ? "#F0FDF4" : idx%2===1 ? "#FAFBFD" : "#fff", opacity: isApproved ? 0.75 : 1 }}>
                  <td className="px-5 py-4 text-xs font-semibold" style={{ color:"var(--secondary)", fontFamily:"'DM Mono', monospace" }}>{row.code}</td>
                  <td className="px-5 py-4 font-medium text-sm" style={{ color:"var(--foreground)" }}>{row.name}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0" style={{ background:"var(--secondary)" }}>{row.operator.charAt(0)}</div>
                      <span className="text-sm" style={{ color:"var(--foreground)" }}>{row.operator}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <Badge color={row.type === "Robo" ? "red" : "yellow"}>
                      {row.type === "Robo" ? <AlertCircle size={10}/> : <Zap size={10}/>}
                      {row.type}
                    </Badge>
                  </td>
                  <td className="px-5 py-4">
                    <span className="font-bold text-sm" style={{ color: "#B91C1C" }}>S/. {row.cost.toLocaleString("es-PE")}</span>
                  </td>
                  <td className="px-5 py-4">
                    {isApproved ? (
                      <span className="flex items-center gap-1 text-xs font-semibold" style={{ color:"#15803D" }}><CheckCircle2 size={13}/>Baja Aprobada</span>
                    ) : (
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleApprove(idx)}
                          className="px-3 py-1.5 rounded-md text-xs font-bold text-white transition"
                          style={{ background:"#B91C1C" }}>
                          Aprobar Baja
                        </button>
                        <button className="px-3 py-1.5 rounded-md text-xs font-semibold border flex items-center gap-1 transition"
                          style={{ borderColor:"var(--border)", color:"var(--muted-foreground)", background:"#fff" }}>
                          <Eye size={12}/>Revisar Detalle
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

function AdminReportesView() {
  return (
    <div className="flex-1 overflow-y-auto px-7 py-6" style={{ scrollbarWidth:"none" }}>
      <div className="grid grid-cols-3 gap-5 mb-6">
        {[
          { label: "Total Capital en Riesgo",    value: `S/. ${CAPITAL_RIESGO.toLocaleString("es-PE")}`,    sub: "por devoluciones atrasadas",    color: "#B91C1C", bg:"#FEF2F2", icon: AlertCircle },
          { label: "Costo por Reposiciones",     value: `S/. ${COSTO_REPOSICION.toLocaleString("es-PE")}`,  sub: "mes actual · Jul 2025",          color: "#92400E", bg:"#FFFBEB", icon: DollarSign  },
          { label: "Tendencia vs. Mes Anterior", value: "+23%",                                              sub: "incremento en pérdidas",         color: "#7C3AED", bg:"#F5F3FF", icon: TrendingUp  },
        ].map(({ label, value, sub, color, bg, icon: Icon }) => (
          <div key={label} className="bg-white rounded-xl border p-5 flex items-start gap-4" style={{ borderColor:"var(--border)" }}>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: bg }}><Icon size={22} style={{ color }}/></div>
            <div>
              <p className="text-2xl font-bold leading-none" style={{ color, fontFamily:"'DM Mono', monospace" }}>{value}</p>
              <p className="text-xs font-semibold mt-2 leading-tight" style={{ color:"var(--foreground)" }}>{label}</p>
              <p className="text-xs mt-0.5" style={{ color:"var(--muted-foreground)" }}>{sub}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-5 gap-5">
        {/* Line chart */}
        <SectionCard className="col-span-3">
          <div className="flex items-center gap-2 px-6 py-4 border-b" style={{ borderColor:"var(--border)" }}>
            <TrendingUp size={15} style={{ color:"#B91C1C" }}/>
            <span className="font-bold text-sm" style={{ color:"var(--foreground)" }}>Tendencia de Pérdidas — Últimos 6 Meses</span>
          </div>
          <div className="px-5 py-5">
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={LOSS_TREND} margin={{ left: -10, right: 10, top: 5, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                <XAxis dataKey="month" tick={{ fontSize:11, fill:"#5A7190" }} axisLine={false} tickLine={false}/>
                <YAxis tick={{ fontSize:11, fill:"#5A7190" }} axisLine={false} tickLine={false}/>
                <Tooltip contentStyle={{ fontSize:12, borderRadius:8, border:"1px solid var(--border)", boxShadow:"0 4px 12px rgba(0,0,0,0.08)" }}/>
                <Legend wrapperStyle={{ fontSize:12, paddingTop:8 }}/>
                <Line type="monotone" dataKey="perdidas" stroke="#B91C1C" strokeWidth={2.5} dot={{ r:4, fill:"#B91C1C" }} name="Pérdidas"/>
                <Line type="monotone" dataKey="robos"    stroke="#D97706" strokeWidth={2.5} dot={{ r:4, fill:"#D97706" }} name="Robos" strokeDasharray="5 3"/>
              </LineChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        {/* Financial summary */}
        <div className="col-span-2 flex flex-col gap-4">
          <SectionCard>
            <div className="flex items-center gap-2 px-5 py-4 border-b" style={{ borderColor:"var(--border)" }}>
              <DollarSign size={15} style={{ color:"#B91C1C" }}/>
              <span className="font-bold text-sm" style={{ color:"var(--foreground)" }}>Impacto Económico del Mes</span>
            </div>
            <div className="p-5 flex flex-col gap-4">
              <div className="rounded-xl p-4 flex flex-col gap-1" style={{ background:"#FEF2F2", border:"1px solid #FECACA" }}>
                <p className="text-xs font-semibold uppercase tracking-wider" style={{ color:"#B91C1C", letterSpacing:"0.08em" }}>Total Capital en Riesgo</p>
                <p className="text-4xl font-bold leading-none mt-1" style={{ color:"#7F1D1D", fontFamily:"'DM Mono', monospace" }}>
                  S/. {CAPITAL_RIESGO.toLocaleString("es-PE")}
                </p>
                <p className="text-xs mt-1" style={{ color:"#B91C1C" }}>Por devoluciones vencidas sin resolver</p>
              </div>
              <div className="rounded-xl p-4 flex flex-col gap-1" style={{ background:"#FFFBEB", border:"1px solid #FDE68A" }}>
                <p className="text-xs font-semibold uppercase tracking-wider" style={{ color:"#92400E", letterSpacing:"0.08em" }}>Costo Total por Reposiciones</p>
                <p className="text-4xl font-bold leading-none mt-1" style={{ color:"#78350F", fontFamily:"'DM Mono', monospace" }}>
                  S/. {COSTO_REPOSICION.toLocaleString("es-PE")}
                </p>
                <p className="text-xs mt-1" style={{ color:"#B45309" }}>Herramientas dadas de baja · Jul 2025</p>
              </div>
              <div className="flex items-center justify-between px-4 py-3 rounded-lg" style={{ background:"var(--muted)" }}>
                <span className="text-xs font-semibold" style={{ color:"var(--muted-foreground)" }}>Total Exposición</span>
                <span className="text-base font-bold" style={{ color:"var(--foreground)", fontFamily:"'DM Mono', monospace" }}>
                  S/. {(CAPITAL_RIESGO + COSTO_REPOSICION).toLocaleString("es-PE")}
                </span>
              </div>
            </div>
          </SectionCard>

          <SectionCard>
            <div className="px-5 py-4">
              <p className="text-xs font-bold mb-3" style={{ color:"var(--muted-foreground)" }}>DISTRIBUCIÓN POR TIPO</p>
              {[{ label:"Pérdidas", pct:58, color:"#B91C1C" },{ label:"Robos", pct:29, color:"#D97706" },{ label:"Daños", pct:13, color:"#2563EB" }].map(({ label, pct, color }) => (
                <div key={label} className="mb-3">
                  <div className="flex justify-between text-xs mb-1">
                    <span style={{ color:"var(--foreground)" }}>{label}</span>
                    <span style={{ color, fontFamily:"'DM Mono', monospace" }}>{pct}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full" style={{ background:"var(--muted)" }}>
                    <div className="h-2 rounded-full transition-all" style={{ width:`${pct}%`, background:color }}/>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}

function AdminPlaceholderView({ label }: { label: string }) {
  return (
    <div className="flex-1 flex items-center justify-center flex-col gap-3" style={{ color:"var(--muted-foreground)" }}>
      <Settings size={32} style={{ opacity:0.3 }}/>
      <p className="text-sm font-medium">{label} — en construcción</p>
    </div>
  );
}

function AdminApp({ user, onLogout }: { user: SessionUser; onLogout: () => void }) {
  const [activeNav,setActiveNav] = useState("auditoria");
  const today = new Date().toLocaleDateString("es-PE",{weekday:"long",year:"numeric",month:"long",day:"numeric"});

  const titles: Record<string,{title:string;subtitle:string}> = {
    panel:     { title:"Panel Ejecutivo",         subtitle:"Vista de alto nivel · Joba Perú" },
    auditoria: { title:"Auditoría y Bajas de Activos", subtitle:"Gestión de herramientas con incidencias graves" },
    reportes:  { title:"Reportes Estadísticos",   subtitle:"Impacto económico y tendencias" },
    usuarios:  { title:"Gestión de Usuarios",     subtitle:"Roles y permisos del sistema" },
    config:    { title:"Configuración",           subtitle:"Parámetros del sistema" },
  };
  const meta = titles[activeNav];

  return (
    <div className="flex h-screen w-full overflow-hidden" style={{ fontFamily:"'Inter', system-ui, sans-serif", background:"var(--background)" }}>
      {/* Sidebar — purple-accented for admin */}
      <aside className="flex flex-col w-60 shrink-0 h-full" style={{ background:"#1A0A2E", borderRight:"1px solid rgba(124,58,237,0.15)" }}>
        <div className="px-5 py-5 border-b" style={{ borderColor:"rgba(124,58,237,0.15)" }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background:"#7C3AED" }}><Shield size={16} color="#fff"/></div>
            <div><p className="text-white font-bold text-sm tracking-wide">JOBA PERÚ</p><p className="text-xs" style={{ color:"#6B7DB3", fontSize:10 }}>Panel Administrador</p></div>
          </div>
        </div>

        <div className="mx-4 mt-4 mb-2 px-3 py-2 rounded-lg" style={{ background:"rgba(124,58,237,0.12)", border:"1px solid rgba(124,58,237,0.2)" }}>
          <p className="text-xs font-bold" style={{ color:"#A78BFA", fontSize:10, textTransform:"uppercase", letterSpacing:"0.08em" }}>Administrador General</p>
        </div>

        <nav className="flex-1 py-2 px-3 flex flex-col gap-0.5">
          {ADMIN_NAV.map(({ icon:Icon, label, id }) => {
            const isActive = activeNav === id;
            return (
              <button key={id} onClick={() => setActiveNav(id)} className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium w-full text-left transition-all duration-150"
                style={{ background:isActive?"rgba(124,58,237,0.18)":"transparent", color:isActive?"#C4B5FD":"#94A3B8", borderLeft:isActive?"3px solid #7C3AED":"3px solid transparent" }}>
                <Icon size={15}/><span>{label}</span>{isActive&&<ChevronRight size={12} className="ml-auto opacity-50"/>}
              </button>
            );
          })}
        </nav>

        <div className="mx-3 mb-2 p-3 rounded-lg flex items-center gap-2.5" style={{ background:"rgba(124,58,237,0.12)" }}>
          <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ background:"#7C3AED" }}><User size={14} color="#fff"/></div>
          <div className="min-w-0 flex-1"><p className="text-xs font-semibold text-white truncate">{user.name}</p><p className="text-xs truncate" style={{ color:"#6B7DB3", fontSize:10 }}>Administrador</p></div>
        </div>
        <button onClick={onLogout} className="mx-3 mb-4 flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition" style={{ color:"#F87171", background:"rgba(185,28,28,0.1)" }}>
          <LogOut size={13}/>Cerrar Sesión
        </button>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="flex items-center justify-between px-7 py-3.5 border-b shrink-0 bg-white" style={{ borderColor:"var(--border)" }}>
          <div><h1 className="font-bold text-base" style={{ color:"var(--foreground)", letterSpacing:"-0.01em" }}>{meta.title}</h1><p className="text-xs mt-0.5" style={{ color:"var(--muted-foreground)" }}>{today}</p></div>
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-1 rounded-full text-xs font-bold" style={{ background:"#F5F3FF", color:"#7C3AED" }}>
              <Shield size={11} className="inline mr-1"/>Admin General
            </span>
            <button className="w-8 h-8 rounded-full flex items-center justify-center relative" style={{ background:"var(--muted)" }}><Bell size={15} style={{ color:"var(--muted-foreground)" }}/><span className="absolute top-1 right-1 w-2 h-2 rounded-full border-2 border-white bg-red-500"/></button>
          </div>
        </header>
        {activeNav === "auditoria" && <AdminAuditoriaView/>}
        {activeNav === "reportes"  && <AdminReportesView/>}
        {activeNav === "panel"     && <AdminPlaceholderView label="Panel Ejecutivo"/>}
        {activeNav === "usuarios"  && <AdminPlaceholderView label="Gestión de Usuarios"/>}
        {activeNav === "config"    && <AdminPlaceholderView label="Configuración"/>}
      </div>
    </div>
  );
}

// ─── ROOT ─────────────────────────────────────────────────────────────────────

export default function App() {
  const [session, setSession] = useState<SessionUser | null>(null);
  const handleLogin  = (u: SessionUser) => setSession(u);
  const handleLogout = () => setSession(null);

  if (!session) return <LoginScreen onLogin={handleLogin} />;
  if (session.role === "admin") return <AdminApp user={session} onLogout={handleLogout} />;
  return <AlmaceneroApp user={session} onLogout={handleLogout} />;
}
