import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { Check } from "lucide-react";
import { profileSchema, type Profile as P } from "../shared";
import { ApiError, http } from "../lib/api";
import { Button, Card, Notice, PageHeader } from "../components/ui";
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
  const [formError, setFormError] = useState<string | null>(null);

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
    onError: (e) => {
      if (e instanceof ApiError && e.details) setErrors(e.details);
      else setFormError((e as Error).message);
    },
  });

  return (
    <>
      <PageHeader title="Profile" subtitle="Your personal information: the sun at the centre of your portfolio." />
      <Card className="p-0">
        <form
          className="divide-y divide-line"
          onSubmit={(e) => {
            e.preventDefault();
            const { id: _i, updatedAt: _u, ...body } = values;
            const parsed = profileSchema.safeParse(body);
            if (!parsed.success) return setErrors(z.flattenError(parsed.error).fieldErrors as Record<string, string[]>);
            setErrors({});
            setFormError(null);
            save.mutate(parsed.data);
          }}
        >
          <div className="space-y-5 p-6">
            {formError && <Notice>{formError}</Notice>}
            <FormFields fields={fields} values={values} errors={errors} onChange={setValues} />
          </div>
          <div className="flex items-center justify-end gap-3 rounded-b-xl bg-surface-2/60 px-6 py-4">
            {saved && (
              <span className="inline-flex items-center gap-1.5 text-sm text-success" role="status">
                <Check size={15} /> Saved
              </span>
            )}
            <Button type="submit" loading={save.isPending}>
              {save.isPending ? "Saving…" : "Save profile"}
            </Button>
          </div>
        </form>
      </Card>
    </>
  );
}
