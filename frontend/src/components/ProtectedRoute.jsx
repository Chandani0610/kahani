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
  adminRedirect = "/admin-login",
  unauthorizedRedirect = "/",
}) => {
  const {
    user,
    loading,
    initializing,
  } = useAuth();

  const location = useLocation();

  // =========================================
  // AUTH INITIALIZATION
  //
  // Do NOT show a full-screen loading screen.
  // Wait silently until AuthContext finishes.
  // =========================================

  if (loading || initializing) {
    return null;
  }

  // =========================================
  // USER NOT LOGGED IN
  // =========================================

  if (!user) {
    const adminRoute =
      location.pathname.startsWith("/admin");

    return (
      <Navigate
        to={
          adminRoute
            ? adminRedirect
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

