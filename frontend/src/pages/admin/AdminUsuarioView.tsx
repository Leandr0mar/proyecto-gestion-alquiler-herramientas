import { useState, useEffect } from "react";
import { Users, UserPlus, Edit, Trash2, CheckCircle, XCircle, X } from "lucide-react";
import { SectionCard } from "../../components/shared/SectionCard";
import { Badge } from "../../components/shared/Badge";

// Interfaz que refleja tu entidad Usuario de Java
interface Rol {
  id: number;
  nombre?: string;
}

interface Usuario {
  id: number;
  codUsuario: string;
  nombre: string;
  apellido: string;
  correo: string;
  password?: string; // Opcional para el frontend al editar
  estado: boolean;
  especialidad: string;
  nivelPermiso: number;
  roles: Rol[];
}

export default function AdminUsuariosView() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [cargando, setCargando] = useState(true);

  // Estados para el Modal
  const [modalAbierto, setModalAbierto] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [usuarioIdEdicion, setUsuarioIdEdicion] = useState<number | null>(null);

  // Estado del formulario
  const [formData, setFormData] = useState({
    codUsuario: "",
    nombre: "",
    apellido: "",
    correo: "",
    password: "",
    especialidad: "",
    nivelPermiso: 1,
    roles: [{ id: 1 }] // Enviamos por defecto un rol para cumplir la validación @NotEmpty del backend
  });

  const fetchUsuarios = async () => {
    try {
      const response = await fetch("http://localhost:8080/api/admin/usuarios");
      if (response.ok) {
        const data = await response.json();
        setUsuarios(data);
      }
    } catch (error) {
      console.error("Error al cargar usuarios:", error);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const handleCambiarEstado = async (id: number, estadoActual: boolean) => {
    const accion = estadoActual ? "desactivar" : "activar";
    if (!confirm(`¿Está seguro de ${accion} este usuario?`)) return;

    try {
      const response = await fetch(`http://localhost:8080/api/admin/usuarios/${id}/estado`, {
        method: "PATCH"
      });

      if (response.ok) {
        setUsuarios(usuarios.map(u => u.id === id ? { ...u, estado: !u.estado } : u));
      } else {
        alert("Ocurrió un error al intentar cambiar el estado del usuario.");
      }
    } catch (error) {
      console.error(error);
      alert("Error de red al conectar con el servidor.");
    }
  };

  // Funciones para manejar el Modal
  const abrirModalCrear = () => {
    setModoEdicion(false);
    setUsuarioIdEdicion(null);
    setFormData({
      codUsuario: "",
      nombre: "",
      apellido: "",
      correo: "",
      password: "",
      especialidad: "",
      nivelPermiso: 1,
      roles: [{ id: 1 }]
    });
    setModalAbierto(true);
  };

  const abrirModalEditar = (usuario: Usuario) => {
    setModoEdicion(true);
    setUsuarioIdEdicion(usuario.id);
    setFormData({
      codUsuario: usuario.codUsuario,
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      correo: usuario.correo,
      password: "", // Se deja vacío; el backend solo lo actualiza si se envía texto
      especialidad: usuario.especialidad || "",
      nivelPermiso: usuario.nivelPermiso,
      roles: usuario.roles && usuario.roles.length > 0 ? usuario.roles : [{ id: 1 }]
    });
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Preparamos el payload quitando la contraseña si está vacía en modo edición
    const payload = { ...formData, nivelPermiso: Number(formData.nivelPermiso) };
    if (modoEdicion && !payload.password) {
      delete payload.password;
    }

    const url = modoEdicion 
      ? `http://localhost:8080/api/admin/usuarios/${usuarioIdEdicion}` 
      : "http://localhost:8080/api/admin/usuarios";
    
    const method = modoEdicion ? "PUT" : "POST";

    try {
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        fetchUsuarios(); // Recargar la tabla
        cerrarModal();
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error("Error del servidor:", errorData);
        alert("Error al guardar el usuario. Verifica los datos y validaciones.");
      }
    } catch (error) {
      console.error("Error de red:", error);
      alert("Error de red al conectar con el servidor.");
    }
  };

  if (cargando) return <div className="p-8 text-center text-slate-500">Cargando usuarios...</div>;

  const usuariosActivos = usuarios.filter(u => u.estado).length;

  return (
    <div className="flex-1 overflow-y-auto px-7 py-6 bg-slate-50 relative" style={{ scrollbarWidth:"none" }}>
      
      {/* Tarjetas de métricas (Sin cambios) */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border p-4 flex items-center gap-4 shadow-sm" style={{ borderColor:"var(--border)" }}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-blue-50">
            <Users size={18} className="text-blue-600" />
          </div>
          <div>
            <p className="text-2xl font-bold leading-none font-mono text-blue-700">{usuarios.length}</p>
            <p className="text-xs font-medium mt-1 text-slate-500">Total Usuarios Registrados</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border p-4 flex items-center gap-4 shadow-sm" style={{ borderColor:"var(--border)" }}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-green-50">
            <CheckCircle size={18} className="text-green-600" />
          </div>
          <div>
            <p className="text-2xl font-bold leading-none font-mono text-green-700">{usuariosActivos}</p>
            <p className="text-xs font-medium mt-1 text-slate-500">Usuarios Activos</p>
          </div>
        </div>
      </div>

      <SectionCard>
        <div className="flex items-center justify-between px-6 py-4 border-b bg-white rounded-t-xl" style={{ borderColor:"var(--border)" }}>
          <div className="flex items-center gap-2">
            <Users size={16} className="text-blue-600" />
            <span className="font-bold text-sm text-slate-800">Gestión de Usuarios</span>
          </div>
          <button 
            onClick={abrirModalCrear}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold text-white transition bg-violet-600 hover:bg-violet-700 shadow-sm"
          >
            <UserPlus size={14} /> Nuevo Usuario
          </button>
        </div>
        
        <table className="w-full text-sm border-collapse bg-white">
          <thead>
            <tr className="bg-slate-50">
              {["Código", "Nombre Completo", "Correo", "Especialidad", "Nivel", "Estado", "Acciones"].map(h => (
                <th key={h} className="text-left px-5 py-3 border-b font-semibold text-slate-500 text-[10px] uppercase tracking-wider font-mono">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {usuarios.length === 0 && (
              <tr><td colSpan={7} className="text-center py-8 text-slate-400">No hay usuarios registrados.</td></tr>
            )}
            {usuarios.map((usuario) => (
              <tr key={usuario.id} className="border-b transition hover:bg-slate-50">
                <td className="px-5 py-4 text-xs font-semibold text-slate-600 font-mono">{usuario.codUsuario}</td>
                <td className="px-5 py-4 font-medium text-sm text-slate-800">
                  {usuario.nombre} {usuario.apellido}
                </td>
                <td className="px-5 py-4 text-xs text-slate-600">{usuario.correo}</td>
                <td className="px-5 py-4 text-xs text-slate-600">{usuario.especialidad || "N/A"}</td>
                <td className="px-5 py-4 font-mono text-xs">{usuario.nivelPermiso}</td>
                <td className="px-5 py-4">
                  <Badge color={usuario.estado ? "green" : "red"}>
                    {usuario.estado ? "Activo" : "Inactivo"}
                  </Badge>
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => abrirModalEditar(usuario)}
                      className="p-1.5 text-slate-400 hover:text-blue-600 transition" 
                      title="Editar"
                    >
                      <Edit size={16} />
                    </button>
                    <button 
                      onClick={() => handleCambiarEstado(usuario.id, usuario.estado)}
                      className={`p-1.5 transition ${usuario.estado ? 'text-slate-400 hover:text-red-600' : 'text-slate-400 hover:text-green-600'}`} 
                      title={usuario.estado ? "Desactivar" : "Activar"}
                    >
                      {usuario.estado ? <XCircle size={16} /> : <CheckCircle size={16} />}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </SectionCard>

      {/* MODAL DE CREACIÓN / EDICIÓN */}
      {modalAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-lg overflow-hidden flex flex-col">
            
            {/* Header del Modal */}
            <div className="px-6 py-4 border-b flex items-center justify-between bg-slate-50">
              <h2 className="font-bold text-slate-800 flex items-center gap-2">
                {modoEdicion ? <Edit size={18} className="text-blue-600"/> : <UserPlus size={18} className="text-violet-600"/>}
                {modoEdicion ? "Editar Usuario" : "Crear Nuevo Usuario"}
              </h2>
              <button onClick={cerrarModal} className="text-slate-400 hover:text-slate-600 transition">
                <X size={20} />
              </button>
            </div>

            {/* Cuerpo del Modal (Formulario) */}
            <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
              
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-600">Código de Usuario *</label>
                  <input required name="codUsuario" value={formData.codUsuario} onChange={handleChange}
                    className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500" 
                    placeholder="Ej. U001" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-600">Correo Electrónico *</label>
                  <input required type="email" name="correo" value={formData.correo} onChange={handleChange}
                    className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500" 
                    placeholder="correo@empresa.com" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-600">Nombres *</label>
                  <input required name="nombre" value={formData.nombre} onChange={handleChange}
                    className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-600">Apellidos *</label>
                  <input required name="apellido" value={formData.apellido} onChange={handleChange}
                    className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-600">Especialidad</label>
                  <input name="especialidad" value={formData.especialidad} onChange={handleChange}
                    className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500" 
                    placeholder="Ej. Soporte, Ventas..." />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-600">Nivel de Permiso (1-5) *</label>
                  <input required type="number" min="1" max="5" name="nivelPermiso" value={formData.nivelPermiso} onChange={handleChange}
                    className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500" />
                </div>
              </div>

              <div className="flex flex-col gap-1 mt-2">
                <label className="text-xs font-semibold text-slate-600">
                  Contraseña {modoEdicion && <span className="text-slate-400 font-normal">(Dejar en blanco para no cambiar)</span>}
                </label>
                <input 
                  required={!modoEdicion} // Solo es obligatoria si se está creando
                  type="password" 
                  name="password" 
                  value={formData.password} 
                  onChange={handleChange}
                  minLength={8}
                  className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500" 
                  placeholder="Mínimo 8 caracteres" />
              </div>

              {/* Footer del Modal */}
              <div className="flex items-center justify-end gap-3 mt-4 pt-4 border-t">
                <button type="button" onClick={cerrarModal} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition">
                  Cancelar
                </button>
                <button type="submit" className="px-4 py-2 text-sm font-bold text-white bg-violet-600 hover:bg-violet-700 rounded-lg transition shadow-sm">
                  {modoEdicion ? "Guardar Cambios" : "Crear Usuario"}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}
    </div>
  );
}