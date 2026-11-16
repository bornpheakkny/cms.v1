import { SKILL_CATEGORIES, educationSchema, experienceSchema, projectSchema, skillSchema } from "../shared";
import { ResourcePage } from "../components/ResourcePage";
import { Badge } from "../components/ui";
import { cldThumb } from "../lib/upload";

const fmt = (d: unknown) => (d ? new Date(d as string).toLocaleDateString(undefined, { year: "numeric", month: "short" }) : "Present");

export const Skills = () => (
  <ResourcePage
    title="Skills"
    subtitle="Each skill becomes a planet. Category = which orbit; order = position on it."
    endpoint="/admin/skills"
    schema={skillSchema}
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
        <span className="size-4 rounded-full" style={{ background: r.color as string, boxShadow: `0 0 12px ${r.color}` }} />
        <span className="font-medium text-white">{r.name as string}</span>
        <Badge>{r.category as string}</Badge>
        <span className="text-xs text-slate-500">{r.level as number}%</span>
      </div>
    )}
  />
);

export const Projects = () => (
  <ResourcePage
    title="Projects"
    endpoint="/admin/projects"
    schema={projectSchema}
    defaults={{ title: "", slug: "", summary: "", content: "", coverUrl: "", gallery: [], techStack: [], liveUrl: "", repos: [], featured: false, published: false, order: 0 }}
    fields={[
      { name: "title", label: "Title", type: "text" },
      { name: "slug", label: "Slug", type: "text", hint: "used in the URL: /projects/my-slug" },
      { name: "summary", label: "Summary", type: "textarea", rows: 2 },
      { name: "content", label: "Details (Markdown supported)", type: "textarea", rows: 8 },
      { name: "coverUrl", label: "Cover image", type: "image" },
      { name: "gallery", label: "Gallery", type: "images" },
      { name: "techStack", label: "Tech stack", type: "tags" },
      { name: "liveUrl", label: "Live URL", type: "url" },
      { name: "repos", label: "Repositories", type: "links", hint: "one project can have several, e.g. Portfolio, CMS and API" },
      { name: "featured", label: "Featured", type: "checkbox" },
      { name: "published", label: "Published", type: "checkbox" },
    ]}
    renderRow={(r) => (
      <div className="flex items-center gap-3">
        {r.coverUrl ? <img src={cldThumb(r.coverUrl as string, 80)} className="size-10 rounded object-cover" alt="" /> : <div className="size-10 rounded bg-space-700" />}
        <div className="min-w-0">
          <p className="truncate font-medium text-white">{r.title as string}</p>
          <p className="truncate text-xs text-slate-500">/{r.slug as string}</p>
        </div>
        {Array.isArray(r.repos) && r.repos.length > 0 ? (
          <Badge>
            {r.repos.length} repo{r.repos.length > 1 ? "s" : ""}
          </Badge>
        ) : null}
        {r.featured ? <Badge tone="amber">featured</Badge> : null}
        <Badge tone={r.published ? "green" : "slate"}>{r.published ? "published" : "draft"}</Badge>
      </div>
    )}
  />
);

export const ExperiencePage = () => (
  <ResourcePage
    title="Experience"
    endpoint="/admin/experience"
    schema={experienceSchema}
    defaults={{ company: "", role: "", location: "", startDate: null, endDate: null, description: "", techStack: [], order: 0 }}
    fields={[
      { name: "role", label: "Role", type: "text" },
      { name: "company", label: "Company", type: "text" },
      { name: "location", label: "Location", type: "text" },
      { name: "startDate", label: "Start date", type: "date" },
      { name: "endDate", label: "End date", type: "date", hint: "leave empty if current" },
      { name: "description", label: "What you did", type: "textarea" },
      { name: "techStack", label: "Tech used", type: "tags" },
    ]}
    renderRow={(r) => (
      <div>
        <p className="font-medium text-white">{r.role as string} · <span className="text-slate-300">{r.company as string}</span></p>
        <p className="text-xs text-slate-500">{fmt(r.startDate)} – {fmt(r.endDate)}</p>
      </div>
    )}
  />
);

export const EducationPage = () => (
  <ResourcePage
    title="Education"
    endpoint="/admin/education"
    schema={educationSchema}
    defaults={{ school: "", degree: "", field: "", startDate: null, endDate: null, order: 0 }}
    fields={[
      { name: "school", label: "School", type: "text" },
      { name: "degree", label: "Degree", type: "text" },
      { name: "field", label: "Field of study", type: "text" },
      { name: "startDate", label: "Start date", type: "date" },
      { name: "endDate", label: "End date", type: "date" },
    ]}
    renderRow={(r) => (
      <div>
        <p className="font-medium text-white">{r.degree as string} {r.field ? `· ${r.field}` : ""}</p>
        <p className="text-xs text-slate-500">{r.school as string} · {fmt(r.startDate)} – {fmt(r.endDate)}</p>
      </div>
    )}
  />
);
