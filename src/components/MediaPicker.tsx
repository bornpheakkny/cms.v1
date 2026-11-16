import { useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Upload } from "lucide-react";
import type { Media } from "../shared";
import { http } from "../lib/api";
import { cldThumb, uploadToCloudinary } from "../lib/upload";
import { Button, Modal } from "./ui";

export function useUpload() {
  const qc = useQueryClient();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const upload = async (files: FileList | File[]) => {
    setBusy(true);
    setError(null);
    try {
      const out: Media[] = [];
      for (const f of Array.from(files)) out.push(await uploadToCloudinary(f));
      qc.invalidateQueries({ queryKey: ["media"] });
      return out;
    } catch (e) {
      setError((e as Error).message);
      return [];
    } finally {
      setBusy(false);
    }
  };
  return { upload, busy, error };
}

export function UploadButton({ onUploaded, multiple }: { onUploaded: (m: Media[]) => void; multiple?: boolean }) {
  const ref = useRef<HTMLInputElement>(null);
  const { upload, busy, error } = useUpload();
  return (
    <>
      <input
        ref={ref}
        type="file"
        accept="image/*,application/pdf"
        multiple={multiple}
        hidden
        onChange={async (e) => {
          if (e.target.files?.length) onUploaded(await upload(e.target.files));
          e.target.value = "";
        }}
      />
      <Button type="button" variant="ghost" disabled={busy} onClick={() => ref.current?.click()}>
        <Upload size={14} /> {busy ? "Uploading…" : "Upload"}
      </Button>
      {error && <span className="text-xs text-rose-400">{error}</span>}
    </>
  );
}

export function MediaPicker({ open, onClose, onPick }: { open: boolean; onClose: () => void; onPick: (m: Media) => void }) {
  const { data = [] } = useQuery({ queryKey: ["media"], queryFn: () => http.get<Media[]>("/admin/media"), enabled: open });
  return (
    <Modal open={open} onClose={onClose} title="Media library" wide>
      <div className="mb-4 flex items-center gap-3">
        <UploadButton multiple onUploaded={(m) => m[0] && onPick(m[0])} />
        <span className="text-xs text-slate-500">Click an image to select it</span>
      </div>
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
        {data.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => onPick(m)}
            className="group overflow-hidden rounded-lg border border-space-600 hover:border-indigo-400"
          >
            <img src={cldThumb(m.url)} alt={m.alt} className="aspect-square w-full object-cover transition group-hover:scale-105" />
          </button>
        ))}
        {data.length === 0 && <p className="col-span-full text-sm text-slate-500">No media yet — upload something.</p>}
      </div>
    </Modal>
  );
}
