import { useState, useMemo, useEffect } from "react";
import { Search, Filter, Plus, CheckCircle2, Clock, X } from "lucide-react";
import { Badge } from "../../components/shared/Badge";
import { SectionCard } from "../../components/shared/SectionCard";

interface Herramienta {
  id: number;
  codigoHerramienta: string;
  nombreHerramienta: string;
  categoria: string;
  disponibilidad: string;
  estado: string;
}

export default function InventarioView() {
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [inventario, setInventario] = useState<Herramienta[]>([]);
  const [cargando, setCargando] = useState(true);

  // Estados para los filtros
  const [filtroCategoria, setFiltroCategoria] = useState("TODAS");
  const [filtroDisponibilidad, setFiltroDisponibilidad] = useState("TODAS");
  const [filtroEstado, setFiltroEstado] = useState("TODOS");
  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  useEffect(() => {
    const fetchInventario = async () => {
      try {
        const response = await fetch("http://localhost:8080/api/herramientas");
        if (response.ok) {
          const data = await response.json();
          setInventario(data);
        } else {
          console.error("Error al cargar inventario");
        }
      } catch (error) {
        console.error("Error de conexión:", error);
      } finally {
        setCargando(false);
      }
    };

    fetchInventario();
  }, []);

  // Extraer categorías y estados únicos para los selects de filtros
  const categoriasUnicas = useMemo(() => Array.from(new Set(inventario.map(h => h.categoria))), [inventario]);
  const estadosUnicos = useMemo(() => Array.from(new Set(inventario.map(h => h.estado))), [inventario]);

  const filtered = useMemo(() => {
    return inventario.filter(t => {
      // Filtro de texto (Buscador general)
      const coincideTexto = t.nombreHerramienta.toLowerCase().includes(search.toLowerCase()) ||
                            t.categoria.toLowerCase().includes(search.toLowerCase()) ||
                            t.codigoHerramienta.toLowerCase().includes(search.toLowerCase());
      
      // Filtros desplegables
      const coincideCategoria = filtroCategoria === "TODAS" || t.categoria === filtroCategoria;
      const coincideDisponibilidad = filtroDisponibilidad === "TODAS" || t.disponibilidad === filtroDisponibilidad;
      const coincideEstado = filtroEstado === "TODOS" || t.estado === filtroEstado;

      return coincideTexto && coincideCategoria && coincideDisponibilidad && coincideEstado;
    });
  }, [search, inventario, filtroCategoria, filtroDisponibilidad, filtroEstado]);

  const limpiarFiltros = () => {
    setFiltroCategoria("TODAS");
    setFiltroDisponibilidad("TODAS");
    setFiltroEstado("TODOS");
    setSearch("");
  };

  const filtrosActivos = (filtroCategoria !== "TODAS" || filtroDisponibilidad !== "TODAS" || filtroEstado !== "TODOS" || search !== "");

  if (cargando) {
    return <div className="p-8 text-center text-slate-500 flex items-center justify-center gap-2"><Clock size={16} className="animate-spin" /> Cargando inventario...</div>;
  }

  return (
    <div className="flex-1 overflow-y-auto px-7 py-6 bg-slate-50 relative" style={{ scrollbarWidth: "none" }}>
      
      {/* Cabecera y Buscador */}
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-800">Inventario General</h2>
              <p className="text-xs text-slate-500">Gestión de stock físico e historial de herramientas</p>
            </div>

        </div>

        <SectionCard>
          <div className="p-4 flex flex-col gap-4">
            {/* Barra de búsqueda principal y botón de filtros */}
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Buscar por código QR, nombre o categoría..." 
                  value={search} 
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-md border border-slate-200 outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition font-mono bg-white" 
                />
              </div>
              <button 
                onClick={() => setMostrarFiltros(!mostrarFiltros)} 
                className={`px-4 rounded-md text-sm font-semibold flex items-center gap-1.5 transition border ${mostrarFiltros ? 'bg-slate-100 text-slate-700 border-slate-300' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
              >
                <Filter size={14} /> Filtros {filtrosActivos && <span className="w-2 h-2 rounded-full bg-red-500 ml-1"></span>}
              </button>
            </div>

            {/* Panel de Filtros Avanzados (Condicional) */}
            {mostrarFiltros && (
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-100 animate-in fade-in slide-in-from-top-2 duration-200">
                
                {/* Filtro Categoría */}
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">Categoría</label>
                  <select 
                    value={filtroCategoria} 
                    onChange={(e) => setFiltroCategoria(e.target.value)}
                    className="w-full text-sm border border-slate-200 rounded-md py-1.5 px-3 bg-white text-slate-700 outline-none focus:border-red-500"
                  >
                    <option value="TODAS">Todas las categorías</option>
                    {categoriasUnicas.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>

                {/* Filtro Disponibilidad */}
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">Disponibilidad</label>
                  <select 
                    value={filtroDisponibilidad} 
                    onChange={(e) => setFiltroDisponibilidad(e.target.value)}
                    className="w-full text-sm border border-slate-200 rounded-md py-1.5 px-3 bg-white text-slate-700 outline-none focus:border-red-500"
                  >
                    <option value="TODAS">Todas</option>
                    <option value="DISPONIBLE">Disponibles</option>
                    <option value="PRESTADO">Prestados a Obra</option>
                  </select>
                </div>

                {/* Filtro Estado */}
                <div className="flex items-end gap-2">
                   <div className="flex-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">Estado Físico</label>
                    <select 
                        value={filtroEstado} 
                        onChange={(e) => setFiltroEstado(e.target.value)}
                        className="w-full text-sm border border-slate-200 rounded-md py-1.5 px-3 bg-white text-slate-700 outline-none focus:border-red-500"
                    >
                        <option value="TODOS">Todos los estados</option>
                        {estadosUnicos.map(est => <option key={est} value={est}>{est}</option>)}
                    </select>
                  </div>
                  {filtrosActivos && (
                     <button onClick={limpiarFiltros} title="Limpiar filtros" className="h-8 px-3 rounded-md text-slate-500 bg-slate-100 hover:bg-red-50 hover:text-red-600 transition flex items-center gap-1 text-xs font-medium border border-slate-200">
                       <X size={14}/> Limpiar
                     </button>
                  )}
                </div>

              </div>
            )}
          </div>
        </SectionCard>
      </div>

      {/* Resultados y Tabla */}
      <div className="flex justify-between items-end mb-2 px-1">
        <p className="text-xs font-semibold text-slate-500">Mostrando {filtered.length} resultados</p>
      </div>

      <div className="bg-white rounded-xl border overflow-hidden shadow-sm" style={{ borderColor:"var(--border)" }}>
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr style={{ background:"#F8FAFC" }}>
              {["ID","Código QR / Barras","Nombre de Herramienta","Categoría","Estado de Conservación","Disponibilidad"].map(h=>(
                <th key={h} className="text-left px-5 py-3.5 border-b font-semibold text-slate-500 text-[10px] uppercase tracking-wider font-mono">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
               <tr><td colSpan={6} className="text-center py-12 text-slate-400 font-medium">No se encontraron herramientas con los filtros actuales.</td></tr>
            ) : (
                filtered.map((tool, idx)=>(
                <tr key={tool.id} className="border-b transition hover:bg-slate-50" style={{ background:idx%2===1?"#FAFAFA":"#fff" }}>
                    <td className="px-5 py-3 text-xs font-semibold text-slate-400 font-mono">{tool.id}</td>
                    <td className="px-5 py-3 text-xs text-blue-600 font-mono font-semibold">{tool.codigoHerramienta}</td>
                    <td className="px-5 py-3 font-medium text-sm text-slate-800">{tool.nombreHerramienta}</td>
                    <td className="px-5 py-3"><Badge color="blue">{tool.categoria}</Badge></td>
                    <td className="px-5 py-3">
                    <Badge color={tool.estado.toLowerCase().includes("nuevo") || tool.estado.toLowerCase().includes("bueno") ? "green" : tool.estado.toLowerCase().includes("dañado") ? "red" : "yellow"}>
                        {tool.estado}
                    </Badge>
                    </td>
                    <td className="px-5 py-3">
                    {tool.disponibilidad === "DISPONIBLE" 
                        ? <Badge color="green"><CheckCircle2 size={10}/>DISPONIBLE</Badge>
                        : tool.disponibilidad === "PRESTADO"
                        ? <Badge color="yellow"><Clock size={10}/>EN OBRA</Badge>
                        : <Badge color="red"><Clock size={10}/>NO DISPONIBLE</Badge>
                    }
                    </td>
                </tr>
                ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Placeholder (Si lo necesitas implementar después) */}
      {showModal && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-xl p-6 w-96 text-center">
                <h3 className="font-bold text-lg mb-2">Nuevo Registro</h3>
                <p className="text-sm text-slate-500 mb-4">El formulario de creación de herramientas está en construcción.</p>
                <button onClick={() => setShowModal(false)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-semibold transition">Cerrar</button>
            </div>
         </div>
      )}
    </div>
  );
}