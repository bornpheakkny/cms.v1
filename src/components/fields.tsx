import { useState } from "react";
import { ImagePlus, X } from "lucide-react";
import { Field, Input, Textarea, Button } from "./ui";
import { MediaPicker } from "./MediaPicker";
import { cldThumb } from "../lib/upload";

export type FieldDef = {
  name: string;
  label: string;
  type: "text" | "textarea" | "number" | "checkbox" | "date" | "tags" | "image" | "images" | "select" | "color" | "url" | "email";
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
        const wide = f.full || ["textarea", "images", "tags", "image"].includes(f.type);
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
