import { useState, type ReactNode } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowDown, ArrowUp, Pencil, Plus, Trash2 } from "lucide-react";
import type { ZodObject } from "zod";
import { z } from "zod";
import { ApiError, http } from "../lib/api";
import { Button, Card, Modal, PageHeader } from "./ui";
import { FormFields, type FieldDef } from "./fields";

type Row = { id: string } & Record<string, unknown>;

/**
 * Generic list + create/edit modal for any orderable admin resource.
 * Used by Skills, Projects, Experience and Education.
 */
export function ResourcePage({
  title,
  subtitle,
  endpoint,
  schema,
  fields,
  defaults,
  renderRow,
}: {
  title: string;
  subtitle?: string;
  endpoint: string; // e.g. "/admin/projects"
  schema: ZodObject;
  fields: FieldDef[];
  defaults: Record<string, unknown>;
  renderRow: (row: Row) => ReactNode;
}) {
  const qc = useQueryClient();
  const key = [endpoint];
  const { data: rows = [], isLoading } = useQuery({ queryKey: key, queryFn: () => http.get<Row[]>(endpoint) });

  const [editing, setEditing] = useState<Row | null>(null);
  const [values, setValues] = useState<Record<string, unknown>>(defaults);
  const [errors, setErrors] = useState<Record<string, string[] | undefined>>({});
  const [open, setOpen] = useState(false);

  const openForm = (row: Row | null) => {
    setEditing(row);
    setValues(row ? { ...defaults, ...row } : defaults);
    setErrors({});
    setOpen(true);
  };

  const save = useMutation({
    mutationFn: (body: unknown) => (editing ? http.put(`${endpoint}/${editing.id}`, body) : http.post(endpoint, body)),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: key });
      setOpen(false);
    },
    onError: (e) => {
      if (e instanceof ApiError && e.details) setErrors(e.details);
      else setErrors({ _form: [(e as Error).message] });
    },
  });

  const remove = useMutation({
    mutationFn: (id: string) => http.del(`${endpoint}/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  });

  const reorder = useMutation({
    mutationFn: (ids: string[]) => http.patch(`${endpoint}/reorder`, { ids }),
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  });

  const move = (i: number, dir: -1 | 1) => {
    const ids = rows.map((r) => r.id);
    const j = i + dir;
    if (j < 0 || j >= ids.length) return;
    [ids[i], ids[j]] = [ids[j], ids[i]];
    reorder.mutate(ids);
  };

  const submit = () => {
    // strip server-managed fields, then validate with the shared schema
    const { id: _id, createdAt: _c, updatedAt: _u, ...body } = values;
    const parsed = schema.safeParse(body);
    if (!parsed.success) return setErrors(z.flattenError(parsed.error).fieldErrors as Record<string, string[]>);
    save.mutate(parsed.data);
  };

  return (
    <>
      <PageHeader title={title} subtitle={subtitle} action={<Button onClick={() => openForm(null)}><Plus size={16} /> New</Button>} />
      <Card className="divide-y divide-space-700 p-0">
        {isLoading && <p className="p-5 text-sm text-slate-500">Loading…</p>}
        {!isLoading && rows.length === 0 && <p className="p-5 text-sm text-slate-500">Nothing here yet.</p>}
        {rows.map((row, i) => (
          <div key={row.id} className="flex items-center gap-3 px-5 py-3">
            <div className="flex flex-col">
              <button className="text-slate-500 hover:text-white disabled:opacity-20" disabled={i === 0} onClick={() => move(i, -1)} aria-label="Move up"><ArrowUp size={14} /></button>
              <button className="text-slate-500 hover:text-white disabled:opacity-20" disabled={i === rows.length - 1} onClick={() => move(i, 1)} aria-label="Move down"><ArrowDown size={14} /></button>
            </div>
            <div className="min-w-0 flex-1">{renderRow(row)}</div>
            <Button variant="ghost" onClick={() => openForm(row)}><Pencil size={14} /></Button>
            <Button variant="danger" onClick={() => confirm("Delete this item?") && remove.mutate(row.id)}><Trash2 size={14} /></Button>
          </div>
        ))}
      </Card>

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? `Edit ${title.replace(/s$/, "")}` : `New ${title.replace(/s$/, "")}`}>
        <form onSubmit={(e) => { e.preventDefault(); submit(); }} className="space-y-5">
          <FormFields fields={fields} values={values} errors={errors} onChange={setValues} />
          {errors._form && <p className="text-sm text-rose-400">{errors._form[0]}</p>}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={save.isPending}>{save.isPending ? "Saving…" : "Save"}</Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
