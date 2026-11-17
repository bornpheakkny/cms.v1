import {
  useEffect,
  useId,
  useRef,
  type ButtonHTMLAttributes,
  type ComponentType,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from "react";
import { ChevronDown, Loader2, X } from "lucide-react";

export const cx = (...c: (string | false | undefined | null)[]) => c.filter(Boolean).join(" ");

/* ====================================================================== */
/* Buttons                                                                 */
/* ====================================================================== */

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md";

const buttonBase =
  "inline-flex shrink-0 items-center justify-center gap-2 rounded-lg font-medium whitespace-nowrap transition-colors duration-150 disabled:pointer-events-none disabled:opacity-50";

const buttonVariant: Record<Variant, string> = {
  primary: "bg-accent text-accent-fg hover:bg-accent-hover",
  secondary: "border border-line-strong bg-surface-2 text-fg hover:border-fg-subtle hover:bg-elevated",
  ghost: "text-fg-muted hover:bg-elevated hover:text-fg",
  danger: "bg-danger-soft text-danger hover:bg-danger/20",
};

const buttonSize: Record<Size, string> = {
  sm: "h-8 px-3 text-xs",
  md: "h-9 px-4 text-sm",
};

export function Button({
  variant = "primary",
  size = "md",
  loading,
  className,
  children,
  disabled,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size; loading?: boolean }) {
  return (
    <button
      type="button"
      {...props}
      disabled={disabled || loading}
      className={cx(buttonBase, buttonVariant[variant], buttonSize[size], className)}
    >
      {loading && <Loader2 size={14} className="animate-spin" />}
      {children}
    </button>
  );
}

/** Square icon-only button. `label` is required: it becomes the accessible name and tooltip. */
export function IconButton({
  label,
  icon: Icon,
  tone = "default",
  size = "md",
  className,
  ...props
}: Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> & {
  label: string;
  icon: ComponentType<{ size?: number }>;
  tone?: "default" | "danger";
  size?: "sm" | "md";
}) {
  return (
    <button
      type="button"
      {...props}
      aria-label={label}
      title={label}
      className={cx(
        "inline-flex shrink-0 items-center justify-center rounded-lg text-fg-subtle transition-colors duration-150 disabled:pointer-events-none disabled:opacity-30",
        size === "md" ? "size-9" : "size-7",
        tone === "default" ? "hover:bg-elevated hover:text-fg" : "hover:bg-danger-soft hover:text-danger",
        className,
      )}
    >
      <Icon size={size === "md" ? 16 : 14} />
    </button>
  );
}

/* ====================================================================== */
/* Form controls                                                           */
/* ====================================================================== */

const control =
  "w-full rounded-lg border border-line bg-surface-2 px-3 text-sm text-fg placeholder:text-fg-subtle transition-colors duration-150 outline-none hover:border-line-strong focus:border-accent focus:ring-3 focus:ring-accent-soft focus-visible:outline-none disabled:opacity-60 aria-invalid:border-danger";

export const Input = ({ className, ...p }: InputHTMLAttributes<HTMLInputElement>) => (
  <input {...p} className={cx(control, "h-9", className)} />
);

export const Textarea = ({ className, ...p }: TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <textarea {...p} className={cx(control, "min-h-24 resize-y py-2 leading-relaxed", className)} />
);

export function Select({ className, children, ...p }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="relative">
      <select {...p} className={cx(control, "h-9 cursor-pointer appearance-none pr-9 capitalize", className)}>
        {children}
      </select>
      <ChevronDown size={16} className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-fg-subtle" />
    </div>
  );
}

/** Accessible on/off toggle, used for boolean fields. */
export function Switch({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label?: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cx(
        "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border transition-colors duration-150",
        checked ? "border-accent bg-accent" : "border-line-strong bg-surface-2 hover:border-fg-subtle",
      )}
    >
      <span
        className={cx(
          "inline-block size-4 rounded-full shadow transition-transform duration-150",
          checked ? "translate-x-6 bg-accent-fg" : "translate-x-1 bg-fg-muted",
        )}
      />
    </button>
  );
}

/** Label + control + hint / error. Not a <label> wrapper, so composite controls stay clickable. */
export function Field({ label, error, hint, children }: { label: string; error?: string; hint?: string; children: ReactNode }) {
  return (
    <div className="space-y-1.5">
      <span className="block text-sm font-medium text-fg">{label}</span>
      {children}
      {error ? <p className="text-xs text-danger">{error}</p> : hint ? <p className="text-xs text-fg-subtle">{hint}</p> : null}
    </div>
  );
}

/* ====================================================================== */
/* Surfaces                                                                */
/* ====================================================================== */

export const Card = ({ children, className }: { children: ReactNode; className?: string }) => (
  <div className={cx("rounded-xl border border-line bg-surface p-5", className)}>{children}</div>
);

export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b border-line pb-6">
      <div className="min-w-0">
        <h1 className="text-2xl font-semibold tracking-tight text-fg">{title}</h1>
        {subtitle && <p className="mt-1.5 max-w-2xl text-sm text-fg-muted">{subtitle}</p>}
      </div>
      {action && <div className="flex items-center gap-2">{action}</div>}
    </div>
  );
}

export function EmptyState({ icon: Icon, title, text, action }: { icon?: ComponentType<{ size?: number }>; title: string; text?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center px-6 py-14 text-center">
      {Icon && (
        <div className="mb-4 flex size-11 items-center justify-center rounded-full border border-line bg-surface-2 text-fg-subtle">
          <Icon size={20} />
        </div>
      )}
      <p className="font-medium text-fg">{title}</p>
      {text && <p className="mt-1 max-w-sm text-sm text-fg-muted">{text}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function Notice({ tone = "danger", children }: { tone?: "danger" | "success"; children: ReactNode }) {
  return (
    <p
      role={tone === "danger" ? "alert" : "status"}
      className={cx(
        "rounded-lg border px-3 py-2 text-sm",
        tone === "danger" ? "border-danger/30 bg-danger-soft text-danger" : "border-success/30 bg-success-soft text-success",
      )}
    >
      {children}
    </p>
  );
}

export const Spinner = ({ label = "Loading…" }: { label?: string }) => (
  <div className="flex items-center justify-center gap-2 py-12 text-sm text-fg-subtle">
    <Loader2 size={16} className="animate-spin" /> {label}
  </div>
);

type Tone = "neutral" | "success" | "warning" | "accent";
const badgeTone: Record<Tone, string> = {
  neutral: "border-line-strong bg-surface-2 text-fg-muted",
  success: "border-success/25 bg-success-soft text-success",
  warning: "border-warning/25 bg-warning-soft text-warning",
  accent: "border-accent/25 bg-accent-soft text-accent",
};

export const Badge = ({ children, tone = "neutral" }: { children: ReactNode; tone?: Tone }) => (
  <span className={cx("inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium capitalize", badgeTone[tone])}>
    {children}
  </span>
);

/* ====================================================================== */
/* Modal                                                                   */
/* ====================================================================== */

// open modals, innermost last: only the top one reacts to Esc, and scroll unlocks when all are closed
const modalStack: string[] = [];

const modalWidth = { sm: "sm:max-w-md", md: "sm:max-w-2xl", lg: "sm:max-w-4xl" } as const;

/**
 * Dialog with a fixed header and footer and a scrolling body.
 * Esc / backdrop click close it, focus moves in on open and back on close, page scroll is locked.
 */
export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = "md",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: keyof typeof modalWidth;
}) {
  const id = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    modalStack.push(id);
    document.body.style.overflow = "hidden";

    // focus the first field, or the panel itself
    const panel = panelRef.current;
    const first =
      panel?.querySelector<HTMLElement>("[data-autofocus]") ??
      panel?.querySelector<HTMLElement>("input:not([type=hidden]):not([type=file]), textarea, select");
    (first ?? panel)?.focus({ preventScroll: true });

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && modalStack[modalStack.length - 1] === id) {
        e.stopPropagation();
        closeRef.current();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      modalStack.splice(modalStack.indexOf(id), 1);
      if (!modalStack.length) document.body.style.overflow = "";
      previous?.focus?.({ preventScroll: true });
    };
  }, [open, id]);

  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex animate-fade-in items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center sm:p-6"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${id}-title`}
        aria-describedby={description ? `${id}-desc` : undefined}
        tabIndex={-1}
        className={cx(
          "flex max-h-[92dvh] w-full animate-modal-in flex-col rounded-t-2xl border border-line-strong bg-surface shadow-2xl shadow-black/50 outline-none sm:max-h-[min(88dvh,60rem)] sm:rounded-2xl",
          modalWidth[size],
        )}
      >
        <header className="flex items-start justify-between gap-4 border-b border-line px-6 py-4">
          <div className="min-w-0">
            <h2 id={`${id}-title`} className="text-base font-semibold text-fg">
              {title}
            </h2>
            {description && (
              <p id={`${id}-desc`} className="mt-0.5 text-sm text-fg-muted">
                {description}
              </p>
            )}
          </div>
          <IconButton label="Close" icon={X} size="sm" onClick={onClose} className="-mr-2" />
        </header>

        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>

        {footer && <footer className="flex items-center justify-end gap-2 rounded-b-2xl border-t border-line bg-surface-2/60 px-6 py-4">{footer}</footer>}
      </div>
    </div>
  );
}
