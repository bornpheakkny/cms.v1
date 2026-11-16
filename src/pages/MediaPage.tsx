import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Copy, Trash2 } from "lucide-react";
import type { Media } from "../shared";
import { http } from "../lib/api";
import { cldThumb } from "../lib/upload";
import { UploadButton } from "../components/MediaPicker";
import { Card, PageHeader } from "../components/ui";

export function MediaPage() {
  const qc = useQueryClient();
  const { data = [] } = useQuery({ queryKey: ["media"], queryFn: () => http.get<Media[]>("/admin/media") });
  const remove = useMutation({
    mutationFn: (id: string) => http.del(`/admin/media/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["media"] }),
  });
  const updateAlt = useMutation({
    mutationFn: ({ id, alt }: { id: string; alt: string }) => http.patch(`/admin/media/${id}`, { alt }),
  });

  return (
    <>
      <PageHeader title="Media" subtitle="Stored on Cloudinary. Uploads go straight from your browser to Cloudinary." action={<div className="flex items-center gap-2"><UploadButton multiple onUploaded={() => {}} /></div>} />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {data.map((m) => (
          <Card key={m.id} className="space-y-2 p-3">
            <img src={cldThumb(m.url, 400)} alt={m.alt} className="aspect-square w-full rounded-lg object-cover" />
            <input
              defaultValue={m.alt}
              placeholder="Alt text"
              onBlur={(e) => e.target.value !== m.alt && updateAlt.mutate({ id: m.id, alt: e.target.value })}
              className="w-full rounded border border-space-600 bg-space-900 px-2 py-1 text-xs"
            />
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>{m.width && m.height ? `${m.width}×${m.height}` : m.format}</span>
              <div className="flex gap-2">
                <button title="Copy URL" onClick={() => navigator.clipboard.writeText(m.url)} className="hover:text-white"><Copy size={14} /></button>
                <button title="Delete" onClick={() => confirm("Delete from Cloudinary too?") && remove.mutate(m.id)} className="hover:text-rose-400"><Trash2 size={14} /></button>
              </div>
            </div>
          </Card>
        ))}
      </div>
      {data.length === 0 && <p className="text-sm text-slate-500">No media yet.</p>}
    </>
  );
}
