import { useState } from "react";
import { ArrowDown, ArrowUp, ImagePlus, Plus, X } from "lucide-react";
import { Field, Input, Textarea, Button } from "./ui";
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
    <div className="grid gap-4 sm:grid-cols-2">
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
        <input type="checkbox" className="size-5 accent-indigo-500" checked={!!value} onChange={(e) => set(e.target.checked)} />
      );
    case "color":
      return (
        <div className="flex gap-2">
          <input type="color" className="h-9 w-12 rounded border border-space-600 bg-transparent" value={(value as string) || "#61dafb"} onChange={(e) => set(e.target.value)} />
          <Input value={(value as string) ?? ""} onChange={(e) => set(e.target.value)} />
        </div>
      );
    case "select":
      return (
        <select
          className="w-full rounded-lg border border-space-600 bg-space-900 px-3 py-2 text-sm"
          value={(value as string) ?? ""}
          onChange={(e) => set(e.target.value)}
        >
          {def.options?.map((o) => (
            <option key={o} value={o}>{o}</option>
          ))}
        </select>
      );
    case "tags":
      return <TagInput value={(value as string[]) ?? []} onChange={set} />;
    case "links":
      return <LinksInput value={(value as LinkRow[]) ?? []} onChange={set} />;
    case "image":
      return (
        <div className="flex items-center gap-3">
          {value ? (
            <div className="relative">
              <img src={cldThumb(value as string, 160)} className="size-20 rounded-lg object-cover" alt="" />
              <button type="button" onClick={() => set("")} className="absolute -right-2 -top-2 rounded-full bg-rose-500 p-0.5 text-white"><X size={12} /></button>
            </div>
          ) : null}
          <Button type="button" variant="ghost" onClick={() => setPicker(true)}><ImagePlus size={14} /> Choose</Button>
          <Input placeholder="…or paste a URL" value={(value as string) ?? ""} onChange={(e) => set(e.target.value)} />
          <MediaPicker open={picker} onClose={() => setPicker(false)} onPick={(m) => { set(m.url); setPicker(false); }} />
        </div>
      );
    case "images": {
      const list = (value as string[]) ?? [];
      return (
        <div className="flex flex-wrap items-center gap-3">
          {list.map((url, i) => (
            <div key={url + i} className="relative">
              <img src={cldThumb(url, 160)} className="size-20 rounded-lg object-cover" alt="" />
              <button type="button" onClick={() => set(list.filter((_, j) => j !== i))} className="absolute -right-2 -top-2 rounded-full bg-rose-500 p-0.5 text-white"><X size={12} /></button>
            </div>
          ))}
          <Button type="button" variant="ghost" onClick={() => setPicker(true)}><ImagePlus size={14} /> Add</Button>
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
      {value.length === 0 && <p className="text-sm text-slate-500">No repositories yet.</p>}
      {value.map((row, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className="flex flex-col">
            <button type="button" className="text-slate-500 hover:text-white disabled:opacity-20" disabled={i === 0} onClick={() => move(i, -1)} aria-label="Move up">
              <ArrowUp size={12} />
            </button>
            <button type="button" className="text-slate-500 hover:text-white disabled:opacity-20" disabled={i === value.length - 1} onClick={() => move(i, 1)} aria-label="Move down">
              <ArrowDown size={12} />
            </button>
          </div>
          <Input className="w-40 shrink-0" placeholder="Label, e.g. API" value={row.label} onChange={(e) => update(i, { label: e.target.value })} />
          <Input type="url" placeholder="https://github.com/you/repo" value={row.url} onChange={(e) => update(i, { url: e.target.value })} />
          <button type="button" onClick={() => onChange(value.filter((_, j) => j !== i))} className="rounded-full p-1 text-slate-400 hover:bg-rose-500/20 hover:text-rose-300" aria-label="Remove repository">
            <X size={14} />
          </button>
        </div>
      ))}
      <Button type="button" variant="ghost" onClick={() => onChange([...value, { label: "", url: "" }])}>
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
    <div className="flex flex-wrap items-center gap-2 rounded-lg border border-space-600 bg-space-900/80 p-2">
      {value.map((t) => (
        <span key={t} className="inline-flex items-center gap-1 rounded-full bg-indigo-500/20 px-2.5 py-1 text-xs text-indigo-200">
          {t}
          <button type="button" onClick={() => onChange(value.filter((x) => x !== t))}><X size={11} /></button>
        </span>
      ))}
      <input
        className="min-w-32 flex-1 bg-transparent px-1 text-sm outline-none"
        placeholder="Type and press Enter"
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
