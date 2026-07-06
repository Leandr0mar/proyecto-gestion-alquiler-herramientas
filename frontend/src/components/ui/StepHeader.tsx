export function StepHeader({ step, title, subtitle }: { step: number; title: string; subtitle: string }) {
  return (
    <div className="flex items-start gap-3 px-5 py-4 border-b" style={{ borderColor: "var(--border)" }}>
      <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5" style={{ background: "var(--primary)", color: "#fff" }}>
        {step}
      </div>
      <div>
        <h2 className="text-sm font-bold" style={{ color: "var(--foreground)" }}>{title}</h2>
        <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>{subtitle}</p>
      </div>
    </div>
  );
}
