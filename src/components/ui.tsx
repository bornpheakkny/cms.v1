import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from "react";

const cx = (...c: (string | false | undefined | null)[]) => c.filter(Boolean).join(" ");

export function Button({
  variant = "primary",
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "ghost" | "danger" }) {
  return (
    <button
      {...props}
      className={cx(
        "inline-flex items-center justify-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition disabled:opacity-50",
        variant === "primary" && "bg-indigo-500 text-white hover:bg-indigo-400",
        variant === "ghost" && "border border-space-600 bg-space-800/60 text-slate-200 hover:bg-space-700",
        variant === "danger" && "bg-rose-500/15 text-rose-300 hover:bg-rose-500/25",
        className,
      )}
    />
  );
}

const inputCls =
  "w-full rounded-lg border border-space-600 bg-space-900/80 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/30";

export const Input = (p: InputHTMLAttributes<HTMLInputElement>) => <input {...p} className={cx(inputCls, p.className)} />;
export const Textarea = (p: TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <textarea {...p} className={cx(inputCls, "min-h-28", p.className)} />
);

export function Field({ label, error, hint, children }: { label: string; error?: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</span>
      {children}
      {hint && !error && <span className="block text-xs text-slate-500">{hint}</span>}
      {error && <span className="block text-xs text-rose-400">{error}</span>}
    </label>
  );
}

export const Card = ({ children, className }: { children: ReactNode; className?: string }) => (
  <div className={cx("rounded-2xl border border-space-700 bg-space-900/70 p-5 backdrop-blur", className)}>{children}</div>
);

export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold text-white">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-slate-400">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function Modal({ open, onClose, title, children, wide }: { open: boolean; onClose: () => void; title: string; children: ReactNode; wide?: boolean }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm" onMouseDown={onClose}>
      <div
        className={cx("my-8 w-full rounded-2xl border border-space-600 bg-space-900 p-6 shadow-2xl", wide ? "max-w-4xl" : "max-w-2xl")}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">{title}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white" aria-label="Close">✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

export const Badge = ({ children, tone = "slate" }: { children: ReactNode; tone?: "slate" | "green" | "amber" }) => (
  <span
    className={cx(
      "inline-flex rounded-full px-2 py-0.5 text-xs font-medium",
      tone === "slate" && "bg-space-700 text-slate-300",
      tone === "green" && "bg-emerald-500/15 text-emerald-300",
      tone === "amber" && "bg-amber-500/15 text-amber-300",
    )}
  >
    {children}
  </span>
);
