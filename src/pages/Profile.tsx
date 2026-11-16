import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { profileSchema, type Profile as P } from "../shared";
import { ApiError, http } from "../lib/api";
import { Button, Card, PageHeader } from "../components/ui";
import { FormFields, type FieldDef } from "../components/fields";

const fields: FieldDef[] = [
  { name: "name", label: "Full name", type: "text" },
  { name: "headline", label: "Headline", type: "text", hint: "e.g. Frontend Developer" },
  { name: "email", label: "Public email", type: "email" },
  { name: "location", label: "Location", type: "text" },
  { name: "bio", label: "About me", type: "textarea", rows: 7 },
  { name: "avatarUrl", label: "Avatar", type: "image" },
  { name: "resumeUrl", label: "Résumé (PDF URL)", type: "url" },
  { name: "socials.linkedin", label: "LinkedIn", type: "url" },
  { name: "socials.github", label: "GitHub", type: "url" },
  { name: "socials.telegram", label: "Telegram", type: "url" },
  { name: "socials.facebook", label: "Facebook", type: "url" },
  { name: "socials.website", label: "Website", type: "url" },
];

const empty = { name: "", headline: "", bio: "", location: "", email: "", avatarUrl: "", resumeUrl: "", socials: {} };

export function Profile() {
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ["/admin/profile"], queryFn: () => http.get<P | null>("/admin/profile") });
  const [values, setValues] = useState<Record<string, unknown>>(empty);
  const [errors, setErrors] = useState<Record<string, string[] | undefined>>({});
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (data) setValues({ ...empty, ...data });
  }, [data]);

  const save = useMutation({
    mutationFn: (body: unknown) => http.put("/admin/profile", body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/admin/profile"] });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    },
    onError: (e) => e instanceof ApiError && e.details && setErrors(e.details),
  });

  return (
    <>
      <PageHeader title="Profile" subtitle="Your personal information — the sun at the center of your portfolio." />
      <Card>
        <form
          className="space-y-5"
          onSubmit={(e) => {
            e.preventDefault();
            const { id: _i, updatedAt: _u, ...body } = values;
            const parsed = profileSchema.safeParse(body);
            if (!parsed.success) return setErrors(z.flattenError(parsed.error).fieldErrors as Record<string, string[]>);
            setErrors({});
            save.mutate(parsed.data);
          }}
        >
          <FormFields fields={fields} values={values} errors={errors} onChange={setValues} />
          <div className="flex items-center justify-end gap-3">
            {saved && <span className="text-sm text-emerald-300">Saved ✓</span>}
            <Button type="submit" disabled={save.isPending}>{save.isPending ? "Saving…" : "Save profile"}</Button>
          </div>
        </form>
      </Card>
    </>
  );
}
