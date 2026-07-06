import type { ReactNode } from "react";

export type BadgeColor = "green" | "yellow" | "red" | "blue" | "gray" | "purple";

export function Badge({ children, color }: { children: ReactNode; color: BadgeColor }) {
  const s = {
    green: ["#DCFCE7", "#15803D"],
    yellow: ["#FEF9C3", "#A16207"],
    red: ["#FEE2E2", "#B91C1C"],
    blue: ["#EFF6FF", "#1D4ED8"],
    gray: ["#F1F5F9", "#475569"],
    purple: ["#F5F3FF", "#6D28D9"],
  }[color];

  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold" style={{ background: s[0], color: s[1] }}>
      {children}
    </span>
  );
}
