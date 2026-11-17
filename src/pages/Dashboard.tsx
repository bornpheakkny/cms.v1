import { useQueries } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { ArrowUpRight, Briefcase, FolderKanban, Image, Mail, Orbit } from "lucide-react";
import { http } from "../lib/api";
import { Card, PageHeader } from "../components/ui";

const items = [
  { key: "projects", label: "Projects", to: "/projects", icon: FolderKanban },
  { key: "skills", label: "Skills", to: "/skills", icon: Orbit },
  { key: "experience", label: "Experience", to: "/experience", icon: Briefcase },
  { key: "media", label: "Media files", to: "/media", icon: Image },
  { key: "messages", label: "Messages", to: "/messages", icon: Mail },
] as const;

export function Dashboard() {
  const results = useQueries({
    queries: items.map((i) => ({ queryKey: [`/admin/${i.key}`], queryFn: () => http.get<{ read?: boolean }[]>(`/admin/${i.key}`) })),
  });
  const unread = (results[4].data ?? []).filter((m) => !m.read).length;
  const portfolioUrl = import.meta.env.VITE_PORTFOLIO_URL as string | undefined;

  return (
    <>
      <PageHeader
        title="Dashboard"
        subtitle="Everything you save here goes live on your portfolio within seconds."
        action={
          portfolioUrl && (
            <a
              href={portfolioUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-9 items-center gap-2 rounded-lg border border-line-strong bg-surface-2 px-4 text-sm font-medium text-fg transition-colors hover:border-fg-subtle hover:bg-elevated"
            >
              View portfolio <ArrowUpRight size={15} />
            </a>
          )
        }
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map(({ key, label, to, icon: Icon }, i) => (
          <Link key={key} to={to} className="group rounded-xl">
            <Card className="h-full transition-colors group-hover:border-line-strong group-hover:bg-surface-2">
              <div className="flex items-center justify-between">
                <span className="flex size-9 items-center justify-center rounded-lg bg-accent-soft text-accent">
                  <Icon size={17} />
                </span>
                <ArrowUpRight size={16} className="text-fg-subtle opacity-0 transition-opacity group-hover:opacity-100" />
              </div>
              <p className="mt-4 text-3xl font-semibold tracking-tight text-fg tabular-nums">
                {results[i].isLoading ? <span className="inline-block h-8 w-10 animate-pulse rounded bg-elevated align-middle" /> : (results[i].data?.length ?? "—")}
              </p>
              <p className="mt-1 flex items-center gap-2 text-sm text-fg-muted">
                {label}
                {key === "messages" && unread > 0 && <span className="text-xs font-medium text-warning">· {unread} unread</span>}
              </p>
            </Card>
          </Link>
        ))}
      </div>
    </>
  );
}
