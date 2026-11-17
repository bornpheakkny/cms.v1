import { useState } from "react";
import { ChevronDown, ChevronUp, ImagePlus, Plus, Trash2, X } from "lucide-react";
import { Button, Field, IconButton, Input, Select, Switch, Textarea, cx } from "./ui";
import { MediaPicker } from "./MediaPicker";
import { cldThumb } from "../lib/upload";

export type FieldDef = {
  name: string;
  label: string;
  type: "text" | "textarea" | "number" | "checkbox" | "date" | "tags" | "image" | "images" | "select" | "color" | "url" | "email" | "links";
  options?: readonly string[];
  hint?: string;
  rows?: number;
  full?: boolean; // span both columns
};

type Values = Record<string, unknown>;

/** Get/set nested values like "socials.linkedin". */
export const getPath = (o: Values, path: string): unknown =>
  path.split(".").reduce<unknown>((acc, k) => (acc as Values | undefined)?.[k], o);
export const setPath = (o: Values, path: string, v: unknown): Values => {
  const [head, ...rest] = path.split(".");
  if (!rest.length) return { ...o, [head]: v };
  return { ...o, [head]: setPath((o[head] as Values) ?? {}, rest.join("."), v) };
};

const toDateInput = (v: unknown) => (v ? new Date(v as string).toISOString().slice(0, 10) : "");

export function FormFields({
  fields,
  values,
  errors,
  onChange,
}: {
  fields: FieldDef[];
  values: Values;
  errors: Record<string, string[] | undefined>;
  onChange: (next: Values) => void;
}) {
  return (
    <div className="grid gap-x-4 gap-y-5 sm:grid-cols-2">
      {fields.map((f) => {
        const value = getPath(values, f.name);
        const set = (v: unknown) => onChange(setPath(values, f.name, v));
        const err = errors[f.name.split(".")[0]]?.[0];
        const wide = f.full || ["textarea", "images", "tags", "image", "links"].includes(f.type);
        return (
          <div key={f.name} className={wide ? "sm:col-span-2" : ""}>
            <Field label={f.label} error={err} hint={f.hint}>
              <FieldInput def={f} value={value} set={set} />
            </Field>
          </div>
        );
      })}
    </div>
  );
}

function FieldInput({ def, value, set }: { def: FieldDef; value: unknown; set: (v: unknown) => void }) {
  const [picker, setPicker] = useState(false);
  switch (def.type) {
    case "textarea":
      return <Textarea rows={def.rows ?? 5} value={(value as string) ?? ""} onChange={(e) => set(e.target.value)} />;
    case "number":
      return <Input type="number" value={(value as number) ?? 0} onChange={(e) => set(Number(e.target.value))} />;
    case "date":
      return <Input type="date" value={toDateInput(value)} onChange={(e) => set(e.target.value || null)} />;
    case "checkbox":
      return (
        <div className="flex h-9 items-center gap-3">
          <Switch checked={!!value} onChange={set} label={def.label} />
          <span className="text-sm text-fg-muted">{value ? "On" : "Off"}</span>
        </div>
      );
    case "color":
      return (
        <div className="flex gap-2">
          <label
            className="relative size-9 shrink-0 cursor-pointer overflow-hidden rounded-lg border border-line-strong transition-colors hover:border-fg-subtle"
            style={{ background: (value as string) || "#61dafb" }}
            title="Pick a color"
          >
            <input type="color" className="absolute inset-0 cursor-pointer opacity-0" value={(value as string) || "#61dafb"} onChange={(e) => set(e.target.value)} />
          </label>
          <Input className="font-mono" value={(value as string) ?? ""} onChange={(e) => set(e.target.value)} />
        </div>
      );
    case "select":
      return (
        <Select value={(value as string) ?? ""} onChange={(e) => set(e.target.value)}>
          {def.options?.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </Select>
      );
    case "tags":
      return <TagInput value={(value as string[]) ?? []} onChange={set} />;
    case "links":
      return <LinksInput value={(value as LinkRow[]) ?? []} onChange={set} />;
    case "image":
      return (
        <div className="flex flex-wrap items-center gap-3 sm:flex-nowrap">
          {value ? <Thumb url={value as string} onRemove={() => set("")} /> : <EmptyThumb onClick={() => setPicker(true)} />}
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <Button variant="secondary" size="sm" className="self-start" onClick={() => setPicker(true)}>
              <ImagePlus size={14} /> {value ? "Replace" : "Choose image"}
            </Button>
            <Input placeholder="…or paste an image URL" value={(value as string) ?? ""} onChange={(e) => set(e.target.value)} />
          </div>
          <MediaPicker open={picker} onClose={() => setPicker(false)} onPick={(m) => { set(m.url); setPicker(false); }} />
        </div>
      );
    case "images": {
      const list = (value as string[]) ?? [];
      return (
        <div className="flex flex-wrap items-center gap-3">
          {list.map((url, i) => (
            <Thumb key={url + i} url={url} onRemove={() => set(list.filter((_, j) => j !== i))} />
          ))}
          <EmptyThumb onClick={() => setPicker(true)} label="Add image" />
          <MediaPicker open={picker} onClose={() => setPicker(false)} onPick={(m) => { set([...list, m.url]); setPicker(false); }} />
        </div>
      );
    }
    default:
      return (
        <Input
          type={def.type === "email" ? "email" : def.type === "url" ? "url" : "text"}
          value={(value as string) ?? ""}
          onChange={(e) => set(e.target.value)}
        />
      );
  }
}

type LinkRow = { label: string; url: string };

/** Editable list of { label, url } — e.g. a project's repositories (Portfolio, CMS, API). */
function LinksInput({ value, onChange }: { value: LinkRow[]; onChange: (v: LinkRow[]) => void }) {
  const update = (i: number, patch: Partial<LinkRow>) => onChange(value.map((row, j) => (j === i ? { ...row, ...patch } : row)));
  const move = (i: number, dir: -1 | 1) => {
    const next = [...value];
    const j = i + dir;
    if (j < 0 || j >= next.length) return;
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };
  return (
    <div className="space-y-2">
      {value.length > 0 && (
        <div className="divide-y divide-line rounded-lg border border-line bg-surface-2/50">
          {value.map((row, i) => (
            <div key={i} className="flex items-center gap-2 p-2">
              <div className="flex flex-col">
                <IconButton label="Move up" icon={ChevronUp} size="sm" className="h-4" disabled={i === 0} onClick={() => move(i, -1)} />
                <IconButton label="Move down" icon={ChevronDown} size="sm" className="h-4" disabled={i === value.length - 1} onClick={() => move(i, 1)} />
              </div>
              <Input className="w-32 shrink-0 sm:w-40" placeholder="Label, e.g. API" value={row.label} onChange={(e) => update(i, { label: e.target.value })} />
              <Input type="url" placeholder="https://github.com/you/repo" value={row.url} onChange={(e) => update(i, { url: e.target.value })} />
              <IconButton label="Remove repository" icon={Trash2} tone="danger" onClick={() => onChange(value.filter((_, j) => j !== i))} />
            </div>
          ))}
        </div>
      )}
      <Button variant="secondary" size="sm" onClick={() => onChange([...value, { label: "", url: "" }])}>
        <Plus size={14} /> Add repository
      </Button>
    </div>
  );
}

function TagInput({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  const [draft, setDraft] = useState("");
  const add = () => {
    const t = draft.trim();
    if (t && !value.includes(t)) onChange([...value, t]);
    setDraft("");
  };
  return (
    <div className="flex min-h-9 flex-wrap items-center gap-1.5 rounded-lg border border-line bg-surface-2 px-2 py-1.5 transition-colors hover:border-line-strong focus-within:border-accent focus-within:ring-3 focus-within:ring-accent-soft">
      {value.map((t) => (
        <span key={t} className="inline-flex items-center gap-1 rounded-md border border-line-strong bg-elevated py-0.5 pr-1 pl-2 text-xs text-fg">
          {t}
          <button
            type="button"
            aria-label={`Remove ${t}`}
            className="rounded p-0.5 text-fg-subtle transition-colors hover:bg-danger-soft hover:text-danger"
            onClick={() => onChange(value.filter((x) => x !== t))}
          >
            <X size={11} />
          </button>
        </span>
      ))}
      <input
        className="h-6 min-w-32 flex-1 bg-transparent px-1 text-sm text-fg outline-none placeholder:text-fg-subtle focus-visible:outline-none"
        placeholder={value.length ? "Add more…" : "Type and press Enter"}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            add();
          }
        }}
        onBlur={add}
      />
    </div>
  );
}

function Thumb({ url, onRemove }: { url: string; onRemove: () => void }) {
  return (
    <div className="group relative size-20 shrink-0 overflow-hidden rounded-lg border border-line bg-surface-2">
      <img src={cldThumb(url, 160)} className="size-full object-cover" alt="" />
      <button
        type="button"
        onClick={onRemove}
        aria-label="Remove image"
        className="absolute top-1 right-1 rounded-md bg-black/70 p-1 text-white opacity-0 backdrop-blur transition-opacity group-hover:opacity-100 hover:bg-danger focus-visible:opacity-100"
      >
        <X size={12} />
      </button>
    </div>
  );
}

function EmptyThumb({ onClick, label = "Choose image" }: { onClick: () => void; label?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={cx(
        "flex size-20 shrink-0 flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-line-strong text-fg-subtle transition-colors",
        "hover:border-accent hover:bg-accent-soft hover:text-accent",
      )}
    >
      <ImagePlus size={18} />
      <span className="text-[10px] font-medium">{label === "Choose image" ? "Choose" : "Add"}</span>
    </button>
  );
}
