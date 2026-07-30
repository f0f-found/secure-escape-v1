import { Navigate } from "react-router-dom";
import { ADMIN_ROLES } from "../constants/roles";
import { getAdminUser } from "../utils/tokenStore";

export default function RoleRedirect() {
  const user = getAdminUser();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  switch (user.adminRole) {
    case ADMIN_ROLES.FraudAnalyst:
      return <Navigate to="/analyst" replace />;

    case ADMIN_ROLES.FraudManager:
      return <Navigate to="/manager" replace />;

    case ADMIN_ROLES.SecureEscapeAdmin:
      return <Navigate to="/admin" replace />;

    case ADMIN_ROLES.SystemAdmin:
      return <Navigate to="/admin" replace />;

    default:
      return <Navigate to="/login" replace />;
  }
}
