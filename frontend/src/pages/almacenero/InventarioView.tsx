import { useState, useMemo, useEffect } from "react";
import { Search, Filter, Plus, CheckCircle2, Clock } from "lucide-react";
import { Badge } from "../../components/shared/Badge";
// Ya no importamos INVENTORY_DATA de mockData

// 1. Definimos la interfaz basada en tu modelo de Java
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
  
  // 2. Nuevo estado para guardar las herramientas reales
  const [inventario, setInventario] = useState<Herramienta[]>([]);
  const [cargando, setCargando] = useState(true);

  // 3. Efecto para llamar a la API al cargar el componente
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
  }, []); // Se ejecuta solo una vez al montar

  // 4. Actualizamos el filtro para usar los campos reales de Java
  const filtered = useMemo(() => inventario.filter(t =>
    t.nombreHerramienta.toLowerCase().includes(search.toLowerCase()) ||
    t.categoria.toLowerCase().includes(search.toLowerCase()) ||
    t.codigoHerramienta.toLowerCase().includes(search.toLowerCase())
  ), [search, inventario]);

  if (cargando) {
    return <div className="p-8 text-center text-slate-500">Cargando inventario desde la base de datos...</div>;
  }

  return (
    <>
      {/* ... (Aquí mantienes tu código del Modal y los botones superiores igual) ... */}
      
      <div className="flex-1 overflow-y-auto px-7 py-6" style={{ scrollbarWidth: "none" }}>
        {/* ... (Tu buscador y tus tarjetas de resumen) ... */}
        
        <div className="bg-white rounded-xl border overflow-hidden" style={{ borderColor:"var(--border)" }}>
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr style={{ background:"var(--muted)" }}>
                {["ID","Código QR / Barras","Nombre de Herramienta","Categoría","Estado de Conservación","Disponibilidad"].map(h=>(
                  <th key={h} className="text-left px-4 py-3 border-b font-semibold text-slate-500 text-[10px] uppercase tracking-wider font-mono">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((tool, idx)=>(
                <tr key={tool.id} className="border-b transition hover:bg-blue-50/30" style={{ background:idx%2===1?"#FAFBFD":"#fff" }}>
                  <td className="px-4 py-3 text-xs font-semibold text-slate-400 font-mono">{tool.id}</td>
                  <td className="px-4 py-3 text-xs text-blue-600 font-mono">{tool.codigoHerramienta}</td>
                  <td className="px-4 py-3 font-medium text-sm text-slate-800">{tool.nombreHerramienta}</td>
                  <td className="px-4 py-3"><Badge color="blue">{tool.categoria}</Badge></td>
                  <td className="px-4 py-3">
                    {/* Evaluamos el estado real ("Nuevo", "Usado", "Dañado", etc.) */}
                    <Badge color={tool.estado.toLowerCase() === "nuevo" ? "green" : "gray"}>{tool.estado}</Badge>
                  </td>
                    <td className="px-4 py-3">
                    {tool.disponibilidad === "DISPONIBLE" 
                      ? <Badge color="green"><CheckCircle2 size={10}/>DISPONIBLE</Badge>
                      : tool.disponibilidad === "PRESTADO"
                        ? <Badge color="yellow"><Clock size={10}/>PRESTADO</Badge>
                        : <Badge color="red"><Clock size={10}/>NO DISPONIBLE</Badge>
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}