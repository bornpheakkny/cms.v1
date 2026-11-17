import { useId, useState, type ReactNode } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronDown, ChevronUp, Inbox, Pencil, Plus, Trash2 } from "lucide-react";
import type { ZodObject } from "zod";
import { z } from "zod";
import { ApiError, http } from "../lib/api";
import { Button, Card, EmptyState, IconButton, Modal, Notice, PageHeader, Spinner } from "./ui";
import { useConfirm } from "./confirm";
import { FormFields, type FieldDef } from "./fields";

type Row = { id: string } & Record<string, unknown>;

/**
 * Generic list + create/edit modal for any orderable admin resource.
 * Used by Skills, Projects, Experience and Education.
 */
export function ResourcePage({
  title,
  singular,
  subtitle,
  endpoint,
  schema,
  fields,
  defaults,
  renderRow,
  describe,
}: {
  title: string;
  singular: string;
  subtitle?: string;
  endpoint: string; // e.g. "/admin/projects"
  schema: ZodObject;
  fields: FieldDef[];
  defaults: Record<string, unknown>;
  renderRow: (row: Row) => ReactNode;
  /** short name of a row, used in the delete confirmation */
  describe: (row: Row) => string;
}) {
  const qc = useQueryClient();
  const confirm = useConfirm();
  const formId = useId();
  const key = [endpoint];
  const { data: rows = [], isLoading, error } = useQuery({ queryKey: key, queryFn: () => http.get<Row[]>(endpoint) });

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

  const askDelete = async (row: Row) => {
    const ok = await confirm({
      title: `Delete ${singular.toLowerCase()}?`,
      message: `“${describe(row)}” will be removed from your portfolio. This can't be undone.`,
      confirmLabel: "Delete",
      danger: true,
    });
    if (ok) remove.mutate(row.id);
  };

  const submit = () => {
    // strip server-managed fields, then validate with the shared schema
    const { id: _id, createdAt: _c, updatedAt: _u, ...body } = values;
    const parsed = schema.safeParse(body);
    if (!parsed.success) return setErrors(z.flattenError(parsed.error).fieldErrors as Record<string, string[]>);
    save.mutate(parsed.data);
  };

  const addButton = (
    <Button onClick={() => openForm(null)}>
      <Plus size={16} /> New {singular.toLowerCase()}
    </Button>
  );

  return (
    <>
      <PageHeader title={title} subtitle={subtitle} action={addButton} />

      <Card className="overflow-hidden p-0">
        {isLoading ? (
          <Spinner />
        ) : error ? (
          <div className="p-5">
            <Notice>{(error as Error).message}</Notice>
          </div>
        ) : rows.length === 0 ? (
          <EmptyState icon={Inbox} title={`No ${title.toLowerCase()} yet`} text={`Add your first ${singular.toLowerCase()} to show it on the portfolio.`} action={addButton} />
        ) : (
          <ul className="divide-y divide-line">
            {rows.map((row, i) => (
              <li key={row.id} className="group flex items-center gap-3 px-4 py-3 transition-colors hover:bg-surface-2 sm:px-5">
                <div className="flex flex-col">
                  <IconButton label="Move up" icon={ChevronUp} size="sm" className="h-5" disabled={i === 0 || reorder.isPending} onClick={() => move(i, -1)} />
                  <IconButton label="Move down" icon={ChevronDown} size="sm" className="h-5" disabled={i === rows.length - 1 || reorder.isPending} onClick={() => move(i, 1)} />
                </div>
                <button type="button" className="min-w-0 flex-1 cursor-pointer text-left" onClick={() => openForm(row)}>
                  {renderRow(row)}
                </button>
                <div className="flex items-center gap-1 sm:opacity-60 sm:transition-opacity sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
                  <IconButton label={`Edit ${describe(row)}`} icon={Pencil} onClick={() => openForm(row)} />
                  <IconButton label={`Delete ${describe(row)}`} icon={Trash2} tone="danger" onClick={() => askDelete(row)} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? `Edit ${singular.toLowerCase()}` : `New ${singular.toLowerCase()}`}
        description={editing ? describe(editing) : undefined}
        footer={
          <>
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" form={formId} loading={save.isPending}>
              {save.isPending ? "Saving…" : editing ? "Save changes" : `Create ${singular.toLowerCase()}`}
            </Button>
          </>
        }
      >
        <form
          id={formId}
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
          className="space-y-5"
          noValidate
        >
          {errors._form && <Notice>{errors._form[0]}</Notice>}
          <FormFields fields={fields} values={values} errors={errors} onChange={setValues} />
        </form>
      </Modal>
    </>
  );
}
