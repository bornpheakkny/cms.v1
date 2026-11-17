import { FolderKanban } from "lucide-react";
import { SKILL_CATEGORIES, educationSchema, experienceSchema, projectSchema, skillSchema } from "../shared";
import { ResourcePage } from "../components/ResourcePage";
import { Badge } from "../components/ui";
import { cldThumb } from "../lib/upload";

const fmt = (d: unknown) => (d ? new Date(d as string).toLocaleDateString(undefined, { year: "numeric", month: "short" }) : "Present");

/** Two-line row text: title + muted meta line. */
const RowText = ({ title, meta }: { title: string; meta?: string }) => (
  <div className="min-w-0">
    <p className="truncate text-sm font-medium text-fg">{title}</p>
    {meta && <p className="mt-0.5 truncate text-xs text-fg-subtle">{meta}</p>}
  </div>
);

export const Skills = () => (
  <ResourcePage
    title="Skills"
    singular="Skill"
    subtitle="Each skill becomes a planet. Category sets the orbit; order sets its position on it."
    endpoint="/admin/skills"
    schema={skillSchema}
    describe={(r) => r.name as string}
    defaults={{ name: "", category: "core", level: 80, color: "#61dafb", iconUrl: "", description: "", orbitOrder: 0 }}
    fields={[
      { name: "name", label: "Name", type: "text" },
      { name: "category", label: "Orbit / category", type: "select", options: SKILL_CATEGORIES },
      { name: "level", label: "Level (0–100)", type: "number" },
      { name: "color", label: "Planet color", type: "color" },
      { name: "description", label: "Short description", type: "textarea", rows: 3 },
      { name: "iconUrl", label: "Icon", type: "image" },
    ]}
    renderRow={(r) => (
      <div className="flex items-center gap-3">
        <span className="size-3.5 shrink-0 rounded-full" style={{ background: r.color as string, boxShadow: `0 0 10px ${r.color}` }} />
        <span className="min-w-0 flex-1 truncate text-sm font-medium text-fg">{r.name as string}</span>
        <Badge>{r.category as string}</Badge>
        <div className="hidden w-28 items-center gap-2 sm:flex" aria-label={`Level ${r.level}%`}>
          <span className="h-1 flex-1 overflow-hidden rounded-full bg-elevated">
            <span className="block h-full rounded-full" style={{ width: `${r.level}%`, background: r.color as string }} />
          </span>
          <span className="w-8 text-right text-xs text-fg-subtle tabular-nums">{r.level as number}%</span>
        </div>
      </div>
    )}
  />
);

export const Projects = () => (
  <ResourcePage
    title="Projects"
    singular="Project"
    subtitle="Published projects appear in “Selected work”. The first one is featured."
    endpoint="/admin/projects"
    schema={projectSchema}
    describe={(r) => r.title as string}
    defaults={{ title: "", slug: "", summary: "", content: "", coverUrl: "", gallery: [], techStack: [], liveUrl: "", repos: [], featured: false, published: false, order: 0 }}
    fields={[
      { name: "title", label: "Title", type: "text" },
      { name: "slug", label: "Slug", type: "text", hint: "Used in the URL: /projects/my-slug" },
      { name: "summary", label: "Summary", type: "textarea", rows: 2 },
      { name: "content", label: "Details", type: "textarea", rows: 8, hint: "Separate paragraphs with a blank line." },
      { name: "coverUrl", label: "Cover image", type: "image" },
      { name: "gallery", label: "Gallery", type: "images" },
      { name: "techStack", label: "Tech stack", type: "tags" },
      { name: "liveUrl", label: "Live URL", type: "url" },
      { name: "repos", label: "Repositories", type: "links", hint: "One project can have several, e.g. Portfolio, CMS and API." },
      { name: "featured", label: "Featured", type: "checkbox" },
      { name: "published", label: "Published", type: "checkbox" },
    ]}
    renderRow={(r) => (
      <div className="flex items-center gap-3">
        {r.coverUrl ? (
          <img src={cldThumb(r.coverUrl as string, 96)} className="size-11 shrink-0 rounded-md border border-line object-cover" alt="" />
        ) : (
          <div className="flex size-11 shrink-0 items-center justify-center rounded-md border border-line bg-surface-2 text-fg-subtle">
            <FolderKanban size={16} />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <RowText title={r.title as string} meta={`/projects/${r.slug as string}`} />
        </div>
        <div className="hidden items-center gap-1.5 sm:flex">
          {Array.isArray(r.repos) && r.repos.length > 0 ? (
            <Badge>
              {r.repos.length} repo{r.repos.length > 1 ? "s" : ""}
            </Badge>
          ) : null}
          {r.featured ? <Badge tone="accent">Featured</Badge> : null}
        </div>
        <Badge tone={r.published ? "success" : "neutral"}>{r.published ? "Published" : "Draft"}</Badge>
      </div>
    )}
  />
);

export const ExperiencePage = () => (
  <ResourcePage
    title="Experience"
    singular="Position"
    subtitle="Shown as a timeline in the About section."
    endpoint="/admin/experience"
    schema={experienceSchema}
    describe={(r) => `${r.role} at ${r.company}`}
    defaults={{ company: "", role: "", location: "", startDate: null, endDate: null, description: "", techStack: [], order: 0 }}
    fields={[
      { name: "role", label: "Role", type: "text" },
      { name: "company", label: "Company", type: "text" },
      { name: "location", label: "Location", type: "text" },
      { name: "startDate", label: "Start date", type: "date" },
      { name: "endDate", label: "End date", type: "date", hint: "Leave empty if this is your current role." },
      { name: "description", label: "What you did", type: "textarea", rows: 8, hint: "One point per line." },
      { name: "techStack", label: "Tech used", type: "tags" },
    ]}
    renderRow={(r) => (
      <div className="flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <RowText title={`${r.role} · ${r.company}`} meta={`${fmt(r.startDate)} – ${fmt(r.endDate)}${r.location ? ` · ${r.location}` : ""}`} />
        </div>
        {!r.endDate && <Badge tone="success">Current</Badge>}
      </div>
    )}
  />
);

export const EducationPage = () => (
  <ResourcePage
    title="Education"
    singular="Education"
    subtitle="Listed under Experience in the About section."
    endpoint="/admin/education"
    schema={educationSchema}
    describe={(r) => `${r.degree}, ${r.school}`}
    defaults={{ school: "", degree: "", field: "", startDate: null, endDate: null, order: 0 }}
    fields={[
      { name: "school", label: "School", type: "text" },
      { name: "degree", label: "Degree", type: "text" },
      { name: "field", label: "Field of study", type: "text" },
      { name: "startDate", label: "Start date", type: "date" },
      { name: "endDate", label: "End date", type: "date" },
    ]}
    renderRow={(r) => (
      <RowText title={`${r.degree}${r.field ? ` · ${r.field}` : ""}`} meta={`${r.school} · ${fmt(r.startDate)} – ${fmt(r.endDate)}`} />
    )}
  />
);
