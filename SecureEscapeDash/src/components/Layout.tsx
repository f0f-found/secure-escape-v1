import { useNavigate } from "react-router-dom";
import { clearToken, getAdminUser } from "../utils/tokenStore";

import Sidebar from "./Layout/SideBar";
import TopBar from "./Layout/TopBar";

export default function Layout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const admin = getAdminUser();
  // console.log(admin);

  const handleLogout = () => {
    clearToken();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-slate-100 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col">
        {/* Navigation */}
        <Sidebar admin={admin} onLogout={handleLogout} />
      </aside>

      {/* Right side */}
      <div className="flex-1 flex flex-col">
        {/* Topbar */}

        <TopBar admin={admin} />

        {/* Page */}

        <main className="flex-1 overflow-auto p-8">{children}</main>
      </div>
    </div>
  );
}
