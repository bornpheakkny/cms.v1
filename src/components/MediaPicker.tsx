import { useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ImageOff, Upload } from "lucide-react";
import type { Media } from "../shared";
import { http } from "../lib/api";
import { cldThumb, uploadToCloudinary } from "../lib/upload";
import { Button, EmptyState, Modal, Notice, Spinner } from "./ui";

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

export function UploadButton({
  onUploaded,
  multiple,
  variant = "primary",
}: {
  onUploaded: (m: Media[]) => void;
  multiple?: boolean;
  variant?: "primary" | "secondary";
}) {
  const ref = useRef<HTMLInputElement>(null);
  const { upload, busy, error } = useUpload();
  return (
    <div className="flex flex-wrap items-center gap-3">
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
      <Button variant={variant} loading={busy} onClick={() => ref.current?.click()}>
        {!busy && <Upload size={15} />} {busy ? "Uploading…" : "Upload"}
      </Button>
      {error && <Notice>{error}</Notice>}
    </div>
  );
}

export function MediaPicker({ open, onClose, onPick }: { open: boolean; onClose: () => void; onPick: (m: Media) => void }) {
  const { data = [], isLoading } = useQuery({ queryKey: ["media"], queryFn: () => http.get<Media[]>("/admin/media"), enabled: open });
  const images = data.filter((m) => m.format !== "pdf");

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Media library"
      description="Pick an image, or upload a new one."
      size="lg"
      footer={
        <>
          <div className="mr-auto">
            <UploadButton variant="secondary" multiple onUploaded={(m) => m[0] && onPick(m[0])} />
          </div>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
        </>
      }
    >
      {isLoading ? (
        <Spinner />
      ) : images.length === 0 ? (
        <EmptyState icon={ImageOff} title="No images yet" text="Upload an image and it will be selected automatically." />
      ) : (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-5">
          {images.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => onPick(m)}
              title={m.alt || "Select image"}
              className="group relative aspect-square overflow-hidden rounded-lg border border-line bg-surface-2 transition-colors hover:border-accent focus-visible:border-accent"
            >
              <img src={cldThumb(m.url)} alt={m.alt} className="size-full object-cover transition-transform duration-300 group-hover:scale-105" />
              <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-2 pt-6 pb-1.5 text-left text-[11px] font-medium text-white opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                Select
              </span>
            </button>
          ))}
        </div>
      )}
    </Modal>
  );
}
