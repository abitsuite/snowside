// packages/desktop/src/components/ui.tsx
import { useState, type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode } from "react";

export function Card({ title, children, className = "" }: { title?: string; children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-lg border border-line bg-surface-1 ${className}`}>
      {title && (
        <div className="border-b border-line px-4 py-2.5 text-sm font-bold text-ink">{title}</div>
      )}
      <div className="p-4">{children}</div>
    </div>
  );
}

type BtnVariant = "primary" | "ghost" | "danger" | "cta";

export function Button({
  variant = "primary",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: BtnVariant }) {
  const base =
    "inline-flex items-center justify-center gap-1.5 rounded px-4 py-2 text-sm font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-50";
  const styles: Record<BtnVariant, string> = {
    primary: "bg-accent text-surface-0 hover:bg-accent-strong",
    ghost: "border border-line bg-surface-2 text-muted hover:text-ink hover:bg-surface-3",
    danger: "border border-err/40 bg-transparent text-err hover:bg-err/10",
    cta: "bg-cta text-white hover:bg-cta-hover",
  };
  return <button className={`${base} ${styles[variant]} ${className}`} {...props} />;
}

export function Input({ className = "", ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={`w-full rounded border border-line bg-surface-0 px-3 py-2 font-mono text-sm text-ink placeholder-faint outline-none focus:border-accent ${className}`}
      {...props}
    />
  );
}

export function Stat({ label, value, mono = true }: { label: string; value: ReactNode; mono?: boolean }) {
  return (
    <div className="rounded-lg border border-line bg-surface-1 p-4">
      <div className="text-xs font-bold uppercase tracking-wide text-faint">{label}</div>
      <div className={`mt-1 text-lg font-bold text-ink ${mono ? "font-mono" : ""}`}>{value}</div>
    </div>
  );
}

export function StatusDot({ ok, warn }: { ok: boolean; warn?: boolean }) {
  const color = ok ? "bg-ok" : warn ? "bg-warn" : "bg-err";
  return <span className={`inline-block h-2 w-2 rounded-full ${color}`} />;
}

export function SubTabs<T extends string>({
  tabs,
  active,
  onChange,
}: {
  tabs: { id: T; label: string }[];
  active: T;
  onChange: (t: T) => void;
}) {
  return (
    <div className="mb-4 flex gap-1 border-b border-line">
      {tabs.map((t) => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          className={`px-4 py-2 text-sm font-bold transition-colors ${
            active === t.id
              ? "border-b-2 border-accent text-ink"
              : "text-muted hover:text-ink"
          }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

export function CopyButton({ text, className = "" }: { text: string; className?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      className={`rounded border border-line bg-surface-2 px-2 py-1 text-xs text-muted hover:text-ink ${className}`}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        } catch {
          // clipboard unavailable
        }
      }}
    >
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <div className="mb-1 text-xs font-bold uppercase tracking-wide text-faint">{label}</div>
      {children}
    </label>
  );
}
