import { useNavigate } from "react-router-dom";
import {
  clearToken,
  getAdminUser,
} from "../utils/tokenStore";

import Sidebar from "./Layout/SideBar";
import TopBar from "./Layout/TopBar";

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const navigate = useNavigate();
  const admin = getAdminUser();

  const handleLogout = () => {
    clearToken();
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen bg-[#EAF1F7]">
      <aside className="flex w-64 shrink-0 flex-col border-r border-[#CBD9E6] bg-white">
        <Sidebar
          admin={admin}
          onLogout={handleLogout}
        />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar admin={admin} />

        <main
          className="flex-1 overflow-auto px-5 py-6 sm:px-6 lg:px-8"
          style={{
            background:
              "linear-gradient(135deg, #EDF3F8 0%, #E7EFF6 55%, #EDF3F8 100%)",
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}