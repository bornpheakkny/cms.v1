import { useQueries } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { http } from "../lib/api";
import { Card, PageHeader } from "../components/ui";

const items = [
  { key: "projects", label: "Projects", to: "/projects" },
  { key: "skills", label: "Skills", to: "/skills" },
  { key: "experience", label: "Experience", to: "/experience" },
  { key: "media", label: "Media files", to: "/media" },
  { key: "messages", label: "Messages", to: "/messages" },
] as const;

export function Dashboard() {
  const results = useQueries({
    queries: items.map((i) => ({ queryKey: [`/admin/${i.key}`], queryFn: () => http.get<{ read?: boolean }[]>(`/admin/${i.key}`) })),
  });
  const unread = (results[4].data ?? []).filter((m) => !m.read).length;
  const portfolioUrl = import.meta.env.VITE_PORTFOLIO_URL as string | undefined;

  return (
    <>
      <PageHeader title="Dashboard" subtitle="Everything you save here goes live on your portfolio within seconds." />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item, i) => (
          <Link key={item.key} to={item.to}>
            <Card className="transition hover:border-indigo-400/60">
              <p className="text-sm text-slate-400">{item.label}</p>
              <p className="mt-2 text-3xl font-semibold text-white">{results[i].data?.length ?? "—"}</p>
              {item.key === "messages" && unread > 0 && <p className="mt-1 text-xs text-amber-300">{unread} unread</p>}
            </Card>
          </Link>
        ))}
      </div>
      {portfolioUrl && (
        <a href={portfolioUrl} target="_blank" rel="noreferrer" className="mt-6 inline-block text-sm text-indigo-300 hover:underline">
          View live portfolio ↗
        </a>
      )}
    </>
  );
}
