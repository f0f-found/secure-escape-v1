import { navigation } from "../../constants/navigation";
import type { AdminLoginResponse } from "../../types/auth";
import Logo from "./Logo";
import SidebarItem from "./SideBarItem";

type SidebarProps = {
  admin: AdminLoginResponse | null;
  onLogout: () => void;
};

export default function Sidebar({ admin, onLogout }: SidebarProps) {
  const navItems = admin
    ? navigation[admin.adminRole as keyof typeof navigation]
    : [];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col">
      <Logo />

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => (
          <SidebarItem key={item.path} {...item} />
        ))}
      </nav>

      <div className="p-4 border-t border-slate-200">
        <button
          onClick={onLogout}
          className="w-full   border border-slate-200 py-3 text-slate-600 hover:bg-slate-50 transition"
        >
          Sign out
        </button>
      </div>
    </aside>
  );
}
