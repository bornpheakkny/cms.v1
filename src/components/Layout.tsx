import { NavLink, Outlet } from "react-router-dom";
import { Briefcase, FolderKanban, GraduationCap, Image, LayoutDashboard, LogOut, Mail, Orbit, User } from "lucide-react";
import { useAuth } from "../lib/auth";

const nav = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/profile", label: "Profile", icon: User },
  { to: "/skills", label: "Skills", icon: Orbit },
  { to: "/projects", label: "Projects", icon: FolderKanban },
  { to: "/experience", label: "Experience", icon: Briefcase },
  { to: "/education", label: "Education", icon: GraduationCap },
  { to: "/media", label: "Media", icon: Image },
  { to: "/messages", label: "Messages", icon: Mail },
];

export function Layout() {
  const { user, logout } = useAuth();
  return (
    <div className="flex min-h-full">
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-space-700 bg-space-900/80 p-4 backdrop-blur md:flex">
        <div className="mb-8 flex items-center gap-2 px-2">
          <img src="/favicon.svg" className="size-7" alt="" />
          <span className="font-semibold text-white">Portfolio CMS</span>
        </div>
        <nav className="flex-1 space-y-1">
          {nav.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${
                  isActive ? "bg-indigo-500/20 text-white" : "text-slate-400 hover:bg-space-800 hover:text-white"
                }`
              }
            >
              <Icon size={16} /> {label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-space-700 pt-4">
          <p className="truncate px-2 text-xs text-slate-500">{user?.email}</p>
          <button onClick={logout} className="mt-2 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-400 hover:bg-space-800 hover:text-white">
            <LogOut size={16} /> Log out
          </button>
        </div>
      </aside>

      {/* mobile nav */}
      <div className="flex w-full flex-col">
        <div className="flex gap-1 overflow-x-auto border-b border-space-700 bg-space-900/80 p-2 md:hidden">
          {nav.map(({ to, label, end }) => (
            <NavLink key={to} to={to} end={end} className={({ isActive }) => `whitespace-nowrap rounded-md px-3 py-1.5 text-xs ${isActive ? "bg-indigo-500/20 text-white" : "text-slate-400"}`}>
              {label}
            </NavLink>
          ))}
        </div>
        <main className="mx-auto w-full max-w-5xl flex-1 p-6 md:p-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
