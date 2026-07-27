import { NavLink } from "react-router-dom";

type SidebarItemProps = {
  label: string;
  path: string;
};

export default function SidebarItem({ label, path }: SidebarItemProps) {
  return (
    <NavLink
      to={path}
      className={({ isActive }) =>
        `flex items-center rounded-xl px-4 py-3 transition ${
          isActive
            ? "bg-[#12355B] text-white"
            : "text-slate-600 hover:bg-slate-100"
        }`
      }
    >
      {label}
    </NavLink>
  );
}
