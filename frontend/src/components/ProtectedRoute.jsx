// src/routes/ProtectedRoute.jsx

import {
  Navigate,
  Outlet,
  useLocation,
} from "react-router-dom";

import { useAuth } from "../context/AuthContext";

// =========================================
// PROTECTED ROUTE
// =========================================

const ProtectedRoute = ({
  roles = [],
  redirectTo = "/login",
  adminRedirect: propAdminRedirect,
  AdminRedirect,
  unauthorizedRedirect = "/",
}) => {
  const {
    user,
    loading,
    initializing,
  } = useAuth();

  const location = useLocation();

  const effectiveAdminRedirect =
    propAdminRedirect || AdminRedirect || "/Admin-login";

  // =========================================
  // AUTH INITIALIZATION
  // =========================================

  if (loading || initializing) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="w-12 h-12 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin" />
        <p className="mt-4 text-sm font-semibold text-gray-600">Verifying access...</p>
      </div>
    );
  }

  // =========================================
  // USER NOT LOGGED IN
  // =========================================

  if (!user) {
    const adminRoute =
      location.pathname.toLowerCase().startsWith("/admin");

    return (
      <Navigate
        to={
          adminRoute
            ? effectiveAdminRedirect
            : redirectTo
        }
        state={{
          from: location,
        }}
        replace
      />
    );
  }

  // =========================================
  // ROLE CHECK
  // =========================================

  if (
    roles.length > 0 &&
    !roles.includes(user.role)
  ) {
    return (
      <Navigate
        to={unauthorizedRedirect}
        replace
      />
    );
  }

  // =========================================
  // AUTHORIZED USER
  // =========================================

  return <Outlet />;
};

export default ProtectedRoute;

