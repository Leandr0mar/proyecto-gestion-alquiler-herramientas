import { useState } from "react";
import { LoginScreen } from "../pages/login/LoginScreen";
import { AlmaceneroApp } from "../pages/almacenero/AlmaceneroApp";
import { AdminApp } from "../pages/admin/AdminApp";
import type { SessionUser } from "../data/mockData";

export default function App() {
  const [session, setSession] = useState<SessionUser | null>(null);
  const handleLogin = (u: SessionUser) => setSession(u);
  const handleLogout = () => setSession(null);

  if (!session) return <LoginScreen onLogin={handleLogin} />;
  if (session.role === "admin") return <AdminApp user={session} onLogout={handleLogout} />;
  return <AlmaceneroApp user={session} onLogout={handleLogout} />;
}
