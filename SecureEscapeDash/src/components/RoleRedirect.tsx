import { Navigate } from "react-router-dom";
import { getAdminUser } from "../utils/tokenStore";

export default function RoleRedirect() {
  const user = getAdminUser();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  switch (user.adminRole) {
    case "Admin":
      return <Navigate to="/admin" replace />;

    case "Manager":
      return <Navigate to="/manager" replace />;

    case "Analyst":
      return <Navigate to="/analyst" replace />;

    default:
      return <Navigate to="/login" replace />;
  }
}
