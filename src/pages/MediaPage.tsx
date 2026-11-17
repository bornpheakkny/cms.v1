import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, Copy, FileText, ImageOff, Trash2 } from "lucide-react";
import { useState } from "react";
import type { Media } from "../shared";
import { http } from "../lib/api";
import { cldThumb } from "../lib/upload";
import { UploadButton } from "../components/MediaPicker";
import { useConfirm } from "../components/confirm";
import { Card, EmptyState, IconButton, PageHeader, Spinner } from "../components/ui";

export function MediaPage() {
  const qc = useQueryClient();
  const confirm = useConfirm();
  const [copied, setCopied] = useState<string | null>(null);
  const { data = [], isLoading } = useQuery({ queryKey: ["media"], queryFn: () => http.get<Media[]>("/admin/media") });
  const remove = useMutation({
    mutationFn: (id: string) => http.del(`/admin/media/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["media"] }),
  });
  const updateAlt = useMutation({
    mutationFn: ({ id, alt }: { id: string; alt: string }) => http.patch(`/admin/media/${id}`, { alt }),
  });

  const copy = async (m: Media) => {
    await navigator.clipboard.writeText(m.url);
    setCopied(m.id);
    setTimeout(() => setCopied((c) => (c === m.id ? null : c)), 1500);
  };

  const askDelete = async (m: Media) => {
    const ok = await confirm({
      title: "Delete this file?",
      message: "It will be removed from Cloudinary too. Anything still using it on the portfolio will show a broken image.",
      confirmLabel: "Delete",
      danger: true,
    });
    if (ok) remove.mutate(m.id);
  };

  return (
    <>
      <PageHeader
        title="Media"
        subtitle="Images and PDFs stored on Cloudinary. Uploads go straight from your browser to Cloudinary."
        action={<UploadButton multiple onUploaded={() => {}} />}
      />

      {isLoading ? (
        <Spinner />
      ) : data.length === 0 ? (
        <Card>
          <EmptyState icon={ImageOff} title="No media yet" text="Upload images for project covers, galleries and your avatar." />
        </Card>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {data.map((m) => (
            <Card key={m.id} className="group overflow-hidden p-0">
              <div className="aspect-square border-b border-line bg-surface-2">
                {m.format === "pdf" ? (
                  <div className="flex size-full flex-col items-center justify-center gap-2 text-fg-subtle">
                    <FileText size={28} />
                    <span className="text-xs font-medium uppercase">PDF</span>
                  </div>
                ) : (
                  <img src={cldThumb(m.url, 400)} alt={m.alt} className="size-full object-cover" />
                )}
              </div>
              <div className="space-y-2 p-3">
                <input
                  defaultValue={m.alt}
                  placeholder="Add alt text…"
                  aria-label="Alt text"
                  onBlur={(e) => e.target.value !== m.alt && updateAlt.mutate({ id: m.id, alt: e.target.value })}
                  className="h-8 w-full rounded-md border border-transparent bg-transparent px-2 text-xs text-fg transition-colors outline-none placeholder:text-fg-subtle hover:border-line focus:border-accent focus:bg-surface-2 focus-visible:outline-none"
                />
                <div className="flex items-center justify-between pl-2">
                  <span className="text-xs text-fg-subtle tabular-nums">{m.width && m.height ? `${m.width} × ${m.height}` : m.format}</span>
                  <div className="flex">
                    <IconButton label={copied === m.id ? "Copied" : "Copy URL"} icon={copied === m.id ? Check : Copy} size="sm" onClick={() => copy(m)} />
                    <IconButton label="Delete file" icon={Trash2} size="sm" tone="danger" onClick={() => askDelete(m)} />
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
