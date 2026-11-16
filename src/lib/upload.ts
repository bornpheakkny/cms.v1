import type { Media } from "../shared";
import { http } from "./api";

type Signature = { timestamp: number; folder: string; signature: string; apiKey: string; cloudName: string };

/** Upload a file directly to Cloudinary (signed by our API), then register it in the media library. */
export async function uploadToCloudinary(file: File): Promise<Media> {
  const sig = await http.post<Signature>("/admin/media/sign");
  const form = new FormData();
  form.append("file", file);
  form.append("api_key", sig.apiKey);
  form.append("timestamp", String(sig.timestamp));
  form.append("signature", sig.signature);
  form.append("folder", sig.folder);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${sig.cloudName}/auto/upload`, {
    method: "POST",
    body: form,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error?.message ?? "Upload failed");

  return http.post<Media>("/admin/media", {
    publicId: data.public_id,
    url: data.secure_url,
    width: data.width ?? null,
    height: data.height ?? null,
    format: data.format ?? null,
    bytes: data.bytes ?? null,
    alt: file.name.replace(/\.[^.]+$/, ""),
  });
}

/** Cloudinary on-the-fly transform, e.g. thumbnails in the CMS. */
export const cldThumb = (url: string, w = 300) =>
  url.includes("/upload/") ? url.replace("/upload/", `/upload/c_fill,w_${w},h_${w},q_auto,f_auto/`) : url;
