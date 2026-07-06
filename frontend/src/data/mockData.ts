import { AlertTriangle, Drill, Hammer, HardHat, Wrench, type LucideIcon } from "lucide-react";

export type Role = "almacenero" | "admin";

export interface SessionUser {
  role: Role;
  name: string;
  email: string;
}

export interface ToolDefinition {
  qr: string;
  name: string;
  category: string;
  icon: LucideIcon;
}

export const USERS: Record<string, { password: string; role: Role; name: string }> = {
  "almacen@jobaperu.pe": { password: "Joba2025$", role: "almacenero", name: "Roberto Vargas" },
  "admin@jobaperu.pe": { password: "Admin2025#", role: "admin", name: "Ing. Patricia Soto" },
};

export const MONTH_NAMES = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
export const DAYS = ["Do", "Lu", "Ma", "Mi", "Ju", "Vi", "Sa"];

export function getMiniCalendar(y: number, m: number) {
  return { firstDay: new Date(y, m, 1).getDay(), daysInMonth: new Date(y, m + 1, 0).getDate() };
}

export const TOOL_DB: Record<string, ToolDefinition> = {
  "QR-WR-0043": { qr: "QR-WR-0043", name: 'Llave Francesa 12"', category: "Herramienta Manual", icon: Wrench },
  "QR-DR-0091": { qr: "QR-DR-0091", name: "Taladro Percutor Bosch", category: "Herramienta Eléctrica", icon: Drill },
  "QR-HM-0017": { qr: "QR-HM-0017", name: "Martillo de Demolición", category: "Herramienta Eléctrica", icon: Hammer },
  "QR-WR-0055": { qr: "QR-WR-0055", name: 'Llave Stilson 18"', category: "Herramienta Manual", icon: Wrench },
};

export const INVENTORY_DATA = [
  { id: "H-001", qr: "QR-WR-0043", name: 'Llave Francesa 12"', category: "Herramienta Manual", condition: "Nuevo", available: true },
  { id: "H-002", qr: "QR-DR-0091", name: "Taladro Percutor Bosch", category: "Herramienta Eléctrica", condition: "Usado", available: false },
  { id: "H-003", qr: "QR-HM-0017", name: "Martillo de Demolición", category: "Herramienta Eléctrica", condition: "Nuevo", available: true },
  { id: "H-004", qr: "QR-WR-0055", name: 'Llave Stilson 18"', category: "Herramienta Manual", condition: "Usado", available: true },
  { id: "H-005", qr: "QR-RM-0022", name: "Rotomartillo Dewalt", category: "Herramienta Eléctrica", condition: "Usado", available: false },
  { id: "H-006", qr: "QR-AM-0008", name: 'Amoladora Angular 7"', category: "Herramienta Eléctrica", condition: "Nuevo", available: true },
  { id: "H-007", qr: "QR-SL-0031", name: "Sierra Circular Makita", category: "Herramienta Eléctrica", condition: "Usado", available: false },
  { id: "H-008", qr: "QR-PA-0014", name: "Pala Cuchara #3", category: "Herramienta Manual", condition: "Usado", available: true },
  { id: "H-009", qr: "QR-NV-0047", name: "Nivel Torpedo 30cm", category: "Instrumento", condition: "Nuevo", available: true },
  { id: "H-010", qr: "QR-CA-0063", name: "Caja de Herramientas Completa", category: "Set Especial", condition: "Nuevo", available: false },
];

export const OPERATORS_DB: Record<string, { name: string; dni: string; specialty: string; code: string; loanDate: string; tools: string[] }> = {
  "47823091": { name: "Carlos Mendoza Ríos", dni: "47823091", specialty: "Electricista Industrial", code: "OP-2241", loanDate: "04 Jul 2025", tools: ["QR-DR-0091", "QR-AM-0008"] },
  "36541890": { name: "Lucía Torres Vega", dni: "36541890", specialty: "Soldadora Estructural", code: "OP-1987", loanDate: "03 Jul 2025", tools: ["QR-RM-0022", "QR-WR-0055"] },
  "52198734": { name: "Marco Huanca Quispe", dni: "52198734", specialty: "Albañil de Obras", code: "OP-3012", loanDate: "02 Jul 2025", tools: ["QR-PA-0014", "QR-WR-0043"] },
};

export const OVERDUE_ALERTS = [
  { id: "AL-001", operator: "Lucía Torres Vega", tool: "Rotomartillo Dewalt", days: 3, loanDate: "01 Jul 2025" },
  { id: "AL-002", operator: "Marco Huanca Quispe", tool: "Sierra Circular Makita", days: 5, loanDate: "29 Jun 2025" },
  { id: "AL-003", operator: "Pedro Salinas Cuba", tool: 'Amoladora Angular 9"', days: 1, loanDate: "03 Jul 2025" },
];

export const RECENT_LOANS = [
  { time: "08:14", operator: "Carlos Mendoza Ríos", tools: 3 },
  { time: "09:02", operator: "Ana Flores Paredes", tools: 2 },
  { time: "10:31", operator: "Jesús Cáceres López", tools: 1 },
  { time: "11:47", operator: "Rosa Ticona Mamani", tools: 4 },
  { time: "13:05", operator: "Iván Salas Quiñones", tools: 2 },
];

export const DAMAGE_CHART = [
  { name: "Rotomartillos", value: 14 },
  { name: "Amoladoras", value: 11 },
  { name: "Taladros", value: 8 },
  { name: "Palas", value: 6 },
  { name: "Sierras", value: 5 },
];

export const CHART_COLORS = ["#1B4F8A", "#2563EB", "#3B82F6", "#60A5FA", "#93C5FD"];

export const AUDIT_ROWS = [
  { code: "QR-RM-0019", name: "Rotomartillo Bosch GBH", operator: "Diego Cárdenas Ríos", type: "Pérdida", cost: 890 },
  { code: "QR-AM-0005", name: 'Amoladora Makita 9"', operator: "Lucía Torres Vega", type: "Robo", cost: 650 },
  { code: "QR-SL-0012", name: "Sierra Circular Dewalt", operator: "Marco Huanca Quispe", type: "Pérdida", cost: 1100 },
  { code: "QR-DR-0034", name: "Taladro Inalámbrico Ryobi", operator: "Pedro Salinas Cuba", type: "Robo", cost: 520 },
  { code: "QR-HM-0009", name: "Martillo Demoledor SDS", operator: "Ana Flores Paredes", type: "Pérdida", cost: 430 },
];

export const LOSS_TREND = [
  { month: "Feb", perdidas: 2, robos: 1 },
  { month: "Mar", perdidas: 4, robos: 2 },
  { month: "Abr", perdidas: 3, robos: 1 },
  { month: "May", perdidas: 6, robos: 3 },
  { month: "Jun", perdidas: 5, robos: 4 },
  { month: "Jul", perdidas: 8, robos: 3 },
];

export const CAPITAL_RIESGO = 14750;
export const COSTO_REPOSICION = 3590;
