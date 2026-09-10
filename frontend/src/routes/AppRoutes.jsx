import { Routes, Route } from "react-router-dom";

// Layouts
import MainLayout from "../layouts/MainLayout";
import AdminLayout from "../layouts/AdminLayout";

// Public Pages
import Home from "../pages/Home";
import Stories from "../pages/Stories";
import Videos from "../pages/Videos";
import AllVideos from "../pages/AllVideos";
import AllStories from "../pages/AllStories";
import StoryDetail from "../components/StoryDetail";
import Newsletter from "../components/Newsletter";
import Login from "../pages/Login";
import Register from "../pages/Register";
import AdminLogin from "../pages/Admin/AdminLogin";

// Protected Route
import ProtectedRoute from "../components/ProtectedRoute";

// Admin Pages
import AdminDashboard from "../pages/Admin/Dashboard";
import AdminStories from "../pages/Admin/AdminStories";
import AdminVideos from "../pages/Admin/AdminVideos";
import AdminContacts from "../pages/Admin/AdminContacts";
import AdminNewsletters from "../pages/Admin/AdminNewsletters";
import AdminUsers from "../pages/Admin/AdminUsers";
import AdminSettings from "../pages/Admin/AdminSettings";

const NotFound = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 to-pink-500">
    <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-md w-full">
      <h1 className="text-6xl font-bold text-purple-600">404</h1>
      <p className="mt-3 text-gray-600 text-lg">Oops! Page Not Found</p>
      <p className="text-gray-500 text-sm mt-1">The page you're looking for doesn't exist.</p>
    </div>
  </div>
);

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes with MainLayout */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/stories" element={<Stories />} />
        <Route path="/all-stories" element={<AllStories />} />
        <Route path="/story/:id" element={<StoryDetail />} />
        <Route path="/videos" element={<Videos />} />
        <Route path="/all-videos" element={<AllVideos />} />
        
        {/* ✅ Newsletter route – now used by Navbar navigation */}
        <Route path="/newsletter" element={<Newsletter />} />
      </Route>

      {/* Authentication Routes – kept for direct access, but Navbar uses popups */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/Admin-login" element={<AdminLogin />} />

      {/* Protected Admin Routes */}
      <Route
        element={
          <ProtectedRoute 
            roles={["admin", "superadmin"]} 
            redirectTo="/Admin-login"
            AdminRedirect="/Admin-login"
            unauthorizedRedirect="/"
          />
        }
      >
        <Route path="/Admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="stories" element={<AdminStories />} />
          <Route path="videos" element={<AdminVideos />} />
          <Route path="contacts" element={<AdminContacts />} />
          <Route path="newsletters" element={<AdminNewsletters />} />
           <Route path="users" element={<AdminUsers />} /> 
           <Route path="settings" element={<AdminSettings />} />
        </Route>
      </Route>

      {/* 404 Catch-All Route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;