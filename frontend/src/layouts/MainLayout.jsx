// src/layouts/MainLayout.jsx - Simplified version
import { Outlet } from "react-router-dom";

const MainLayout = () => {
  return (
    <div className="min-h-screen">
      <Outlet />
    </div>
  );
};

export default MainLayout;