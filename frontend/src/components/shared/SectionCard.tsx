import type { ReactNode } from "react";

export function SectionCard({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-xl border bg-white ${className}`} style={{ borderColor: "var(--border)" }}>{children}</div>;
}
