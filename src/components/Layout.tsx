import { NavLink, Outlet } from "react-router-dom";
import { Briefcase, ExternalLink, FolderKanban, GraduationCap, Image, LayoutDashboard, LogOut, Mail, Orbit, User, type LucideIcon } from "lucide-react";
import { useAuth } from "../lib/auth";
import { cx } from "./ui";

type NavItem = { to: string; label: string; icon: LucideIcon; end?: boolean };

const sections: { label: string; items: NavItem[] }[] = [
  {
    label: "Overview",
    items: [{ to: "/", label: "Dashboard", icon: LayoutDashboard, end: true }],
  },
  {
    label: "Content",
    items: [
      { to: "/profile", label: "Profile", icon: User },
      { to: "/skills", label: "Skills", icon: Orbit },
      { to: "/projects", label: "Projects", icon: FolderKanban },
      { to: "/experience", label: "Experience", icon: Briefcase },
      { to: "/education", label: "Education", icon: GraduationCap },
    ],
  },
  {
    label: "Library",
    items: [
      { to: "/media", label: "Media", icon: Image },
      { to: "/messages", label: "Messages", icon: Mail },
    ],
  },
];
const allItems = sections.flatMap((s) => s.items);

export function Layout() {
  const { user, logout } = useAuth();
  const portfolioUrl = import.meta.env.VITE_PORTFOLIO_URL as string | undefined;

  return (
    <div className="flex min-h-full">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-line bg-surface md:flex">
        <div className="flex h-16 items-center gap-2.5 border-b border-line px-5">
          <img src="/favicon.svg" className="size-7" alt="" />
          <span className="font-semibold tracking-tight text-fg">Portfolio CMS</span>
        </div>

        <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-5" aria-label="Main">
          {sections.map((section) => (
            <div key={section.label}>
              <p className="mb-1.5 px-3 text-[11px] font-medium tracking-wider text-fg-subtle uppercase">{section.label}</p>
              <div className="space-y-0.5">
                {section.items.map(({ to, label, icon: Icon, end }) => (
                  <NavLink
                    key={to}
                    to={to}
                    end={end}
                    className={({ isActive }) =>
                      cx(
                        "relative flex h-9 items-center gap-3 rounded-lg px-3 text-sm transition-colors duration-150",
                        isActive
                          ? "bg-accent-soft font-medium text-fg before:absolute before:top-2 before:bottom-2 before:-left-3 before:w-0.5 before:rounded-full before:bg-accent"
                          : "text-fg-muted hover:bg-elevated hover:text-fg",
                      )
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <Icon size={16} className={isActive ? "text-accent" : undefined} /> {label}
                      </>
                    )}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div className="space-y-1 border-t border-line p-3">
          {portfolioUrl && (
            <a
              href={portfolioUrl}
              target="_blank"
              rel="noreferrer"
              className="flex h-9 items-center gap-3 rounded-lg px-3 text-sm text-fg-muted transition-colors hover:bg-elevated hover:text-fg"
            >
              <ExternalLink size={16} /> View portfolio
            </a>
          )}
          <div className="flex items-center gap-3 rounded-lg px-3 py-2">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-accent-soft text-xs font-semibold text-accent uppercase">
              {user?.email?.[0] ?? "?"}
            </span>
            <p className="min-w-0 flex-1 truncate text-xs text-fg-muted">{user?.email}</p>
            <button
              onClick={logout}
              aria-label="Log out"
              title="Log out"
              className="rounded-md p-1.5 text-fg-subtle transition-colors hover:bg-elevated hover:text-fg"
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* mobile: top bar + scrollable tabs */}
        <div className="sticky top-0 z-40 border-b border-line bg-surface/95 backdrop-blur md:hidden">
          <div className="flex h-14 items-center justify-between px-4">
            <div className="flex items-center gap-2">
              <img src="/favicon.svg" className="size-6" alt="" />
              <span className="text-sm font-semibold text-fg">Portfolio CMS</span>
            </div>
            <button onClick={logout} aria-label="Log out" className="rounded-md p-2 text-fg-subtle hover:bg-elevated hover:text-fg">
              <LogOut size={16} />
            </button>
          </div>
          <nav className="flex gap-1 overflow-x-auto px-3 pb-2" aria-label="Main">
            {allItems.map(({ to, label, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  cx(
                    "rounded-md px-3 py-1.5 text-xs whitespace-nowrap transition-colors",
                    isActive ? "bg-accent-soft font-medium text-accent" : "text-fg-muted hover:text-fg",
                  )
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>
        </div>

        <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6 md:px-10 md:py-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
