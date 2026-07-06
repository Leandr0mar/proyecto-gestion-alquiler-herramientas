import { useState } from "react";
import { HardHat, Mail, Lock, AlertCircle, ShieldCheck, Package, Shield } from "lucide-react";

// Interfaz para la sesión en React
export interface SessionUser {
  role: string;
  name: string;
  email: string;
}

interface LoginScreenProps {
  onLogin: (u: SessionUser) => void;
}

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // CONEXIÓN AL BACKEND (Spring Boot)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("http://localhost:8080/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Enviamos los campos tal cual los espera LoginRequest en UsuarioController
        body: JSON.stringify({ 
          correo: email.toLowerCase().trim(), 
          contrasenia: password 
        })
      });

      if (response.ok) {
        // Obtenemos el objeto Usuario que retorna Spring Boot
        const usuarioDB = await response.json(); 
        
        // Mapeamos el rol desde la lista de roles que viene de la BD
        let userRole = "almacenero"; 
        if (usuarioDB.roles && usuarioDB.roles.length > 0) {
          const rolNombre = usuarioDB.roles[0].nombre.toLowerCase();
          if (rolNombre.includes("admin")) {
            userRole = "admin";
          }
        }

        // Pasamos el usuario autorizado a la App.tsx
        onLogin({ 
          role: userRole, 
          name: `${usuarioDB.nombre} ${usuarioDB.apellido}`, 
          email: usuarioDB.correo 
        });

      } else {
        // Si el backend lanza el RuntimeException (ej. "Contraseña incorrecta.")
        const errorText = await response.text();
        setError(errorText || "Correo o contraseña incorrectos. Verifique sus credenciales.");
      }
    } catch (err) {
      console.error("Error de conexión:", err);
      setError("Error al conectar con el servidor. ¿Está Spring Boot en ejecución?");
    } finally {
      setLoading(false);
    }
  };

  // Función para rellenar datos rápidamente en la presentación
  const fillDemo = (em: string, pw: string) => { 
    setEmail(em); 
    setPassword(pw); 
    setError(""); 
  };

  return (
    <div className="min-h-screen flex" style={{ fontFamily: "'Inter', system-ui, sans-serif", background: "var(--background)" }}>
      
      {/* Panel Izquierdo Corporativo (Visible solo en Desktop) */}
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
        </div>

        <p className="text-xs" style={{ color: "#3D5A73" }}>© 2026 Joba Perú S.A.C. · Todos los derechos reservados.</p>
      </div>

      {/* Panel Derecho (Formulario de Login) */}
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
                <input 
                  type="email" 
                  placeholder="usuario@jobaperu.pe" 
                  value={email} 
                  onChange={e => setEmail(e.target.value)} 
                  required
                  className="w-full pl-9 pr-4 py-3 text-sm rounded-lg border outline-none transition"
                  style={{ background: "#fff", borderColor: error ? "var(--destructive)" : "var(--border)", color: "var(--foreground)" }} 
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold mb-1.5 block" style={{ color: "var(--muted-foreground)" }}>Contraseña</label>
              <div className="relative">
                <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--muted-foreground)" }} />
                <input 
                  type={showPass ? "text" : "password"} 
                  placeholder="••••••••••" 
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                  required
                  className="w-full pl-9 pr-10 py-3 text-sm rounded-lg border outline-none transition"
                  style={{ background: "#fff", borderColor: error ? "var(--destructive)" : "var(--border)", color: "var(--foreground)" }} 
                />
                <button 
                  type="button" 
                  onClick={() => setShowPass(v => !v)}
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

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-3 rounded-lg text-sm font-bold text-white transition mt-1 shadow-sm"
              style={{ background: loading ? "var(--muted)" : "var(--primary)", cursor: loading ? "not-allowed" : "pointer" }}>
              {loading ? "Verificando en BD…" : "Ingresar al Sistema"}
            </button>
          </form>

          {/* Tarjeta de Autocompletado rápido para tu Demo Académica */}
          <div className="mt-8 rounded-xl border p-4" style={{ borderColor: "var(--border)", background: "var(--muted)" }}>
            <p className="text-xs font-bold mb-3 flex items-center gap-1.5" style={{ color: "var(--muted-foreground)" }}>
              <ShieldCheck size={12} />AUTOCOMPLETAR PARA DEMO
            </p>
            <div className="flex flex-col gap-2">
              {[
                { label: "Almacenero", email: "almacen@jobaperu.pe", pass: "Joba2026$",  icon: Package,   color: "#1B4F8A" },
                { label: "Administrador", email: "admin@jobaperu.pe", pass: "Admin2026#", icon: Shield,    color: "#7C3AED" },
              ].map(({ label, email: em, pass, icon: Icon, color }) => (
                <button 
                  key={em} 
                  type="button" 
                  onClick={() => fillDemo(em, pass)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg border text-left transition hover:opacity-90 bg-white"
                  style={{ borderColor: "var(--border)" }}
                >
                  <div className="w-7 h-7 rounded-md flex items-center justify-center shrink-0" style={{ background: color + "18" }}>
                    <Icon size={13} style={{ color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold" style={{ color: "var(--foreground)" }}>{label}</p>
                    <p className="text-[10px] truncate" style={{ color: "var(--muted-foreground)", fontFamily: "'DM Mono', monospace" }}>{em}</p>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold" style={{ background: color + "12", color }}>
                    Usar
                  </span>
                </button>
              ))}
            </div>
            <p className="text-[10px] text-slate-400 mt-3 italic text-center">
              Asegúrate de que estos usuarios existan en tu base de datos MySQL antes de iniciar sesión.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}