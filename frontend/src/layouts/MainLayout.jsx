// src/layouts/MainLayout.jsx
import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Contact from "../components/Contact";
import Newsletter from "../components/Newsletter";

const MainLayout = () => {
  const [isContactOpen, setIsContactOpen] = useState(false);

  useEffect(() => {
    const handleOpenContact = () => {
      setIsContactOpen(true);
    };

    window.addEventListener("openContact", handleOpenContact);
    return () => {
      window.removeEventListener("openContact", handleOpenContact);
    };
  }, []);

  return (
    <div className="min-h-screen relative">
      <Outlet />
      {/* Global Contact popup modal - works from any page via Navbar */}
      <Contact
        isOpen={isContactOpen}
        onClose={() => setIsContactOpen(false)}
      />
      {/* Global Newsletter popup modal - works from any page via Navbar */}
      <Newsletter />
    </div>
  );
};

export default MainLayout;