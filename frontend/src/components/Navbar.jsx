import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  FaBars,
  FaTimes,
  FaRocket,
  FaHome,
  FaVideo,
  FaBookOpen,
  FaEnvelope,
  FaNewspaper,
  FaCrown,
  FaYoutube,
  FaStar,
  FaUser,
  FaSignInAlt,
  FaUserPlus,
  FaUserCog,
  FaArrowRight,
} from "react-icons/fa";
import { useAuth } from "../hooks/useAuth";

const Navbar = () => {
  const { user, isAuthenticated, logout, isAdmin, isSuperAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isHoveringCTA, setIsHoveringCTA] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const toggleRef = useRef(null);
  const userMenuRef = useRef(null);

  // Close mobile menu on route change
  useEffect(() => {
    const closeMenus = () => {
      setMenuOpen(false);
      setShowUserMenu(false);
    };
    closeMenus();
  }, [location.pathname]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setMenuOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = originalOverflow || "unset";
    }
    return () => {
      document.body.style.overflow = originalOverflow || "unset";
    };
  }, [menuOpen]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        setMenuOpen(false);
        setShowUserMenu(false);
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ============ DIRECT NAVIGATION HANDLERS ============
  
  // Home - Direct page navigation
  const handleHome = () => {
    setMenuOpen(false);
    setShowUserMenu(false);
    navigate("/");
  };

  // Stories - Direct page navigation
  const handleStories = () => {
    setMenuOpen(false);
    setShowUserMenu(false);
    navigate("/stories");
  };

  // Videos - Direct page navigation to VideoSection
  const handleVideos = () => {
    setMenuOpen(false);
    setShowUserMenu(false);
    navigate("/videos");
  };

  // Contact - Opens popup (NO page navigation) - FIXED
  const handleContact = (e) => {
    e.preventDefault(); // Prevent any default behavior
    setMenuOpen(false);
    setShowUserMenu(false);
    // Dispatch custom event for popup
    window.dispatchEvent(new CustomEvent("openContact"));
  };

  // Newsletter - Opens popup (NO page navigation) - FIXED
  const handleNewsletter = (e) => {
    e.preventDefault(); // Prevent any default behavior
    setMenuOpen(false);
    setShowUserMenu(false);
    // Dispatch custom event for popup
    window.dispatchEvent(new CustomEvent("openNewsletter"));
  };

  // Login - Direct page navigation
  const handleLogin = () => {
    navigate("/login");
    setMenuOpen(false);
    setShowUserMenu(false);
  };

  // Register - Direct page navigation
  const handleRegister = () => {
    navigate("/register");
    setMenuOpen(false);
    setShowUserMenu(false);
  };

  // Dashboard - Direct page navigation (Admin only)
  const handleDashboard = () => {
    navigate("/admin");
    setMenuOpen(false);
    setShowUserMenu(false);
  };

  // YouTube - External link (opens in new tab)
  const handleYouTube = () => {
    window.open("https://www.youtube.com/@KahaniLandOfficial", "_blank");
    setMenuOpen(false);
    setShowUserMenu(false);
  };

  // Logout - Logout and redirect to Login
  const handleLogout = async () => {
    await logout();
    setShowUserMenu(false);
    navigate("/login");
  };

  const isActiveRoute = (path) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <>
      <style>{`
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        .animate-bounce-slow {
          animation: bounce-slow 2.2s ease-in-out infinite;
          will-change: transform;
        }

        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(16px) scale(0.96); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }

        @keyframes gradient-shift {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient {
          animation: gradient-shift 6s ease infinite;
          background-size: 200% 200%;
        }

        @keyframes monkey-swing {
          0%, 100% { transform: rotate(-5deg); transform-origin: top center; }
          50% { transform: rotate(5deg); transform-origin: top center; }
        }
        .animate-monkey-swing {
          animation: monkey-swing 3s ease-in-out infinite;
        }

        .transform-gpu {
          transform: translateZ(0);
          backface-visibility: hidden;
        }

        .mobile-toggle-btn {
          width: 44px;
          height: 44px;
          font-size: 18px;
          flex-shrink: 0;
          position: relative;
          z-index: 60;
          border-bottom: 3px solid #b45309;
        }

        .mobile-dropdown-wrap {
          position: absolute;
          left: 0;
          right: 0;
          top: calc(100% + 10px);
          z-index: 50;
          padding: 0 8px;
          pointer-events: none;
        }
        .mobile-dropdown-wrap.open {
          pointer-events: auto;
        }

        .mobile-dropdown-inner {
          max-height: 0;
          opacity: 0;
          overflow: hidden;
          transition: max-height 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275),
                      opacity 0.3s ease,
                      transform 0.3s ease;
          transform: translateY(-15px) scale(0.95);
          transform-origin: top center;
          border-radius: 2rem;
          background: linear-gradient(to bottom, rgba(76, 29, 149, 0.95), rgba(46, 16, 101, 0.95));
          border: 4px solid #1f1906;
          box-shadow: 0 24px 60px rgba(0, 0, 0, 0.6);
        }
        .mobile-dropdown-inner.open {
          max-height: 85vh;
          opacity: 1;
          transform: translateY(0) scale(1);
        }

        .mobile-dropdown-scroll {
          max-height: 75vh;
          overflow-y: auto;
          padding: 20px 16px;
        }

        .nav-link-desktop {
          transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          white-space: nowrap;
          font-family: 'Comic Sans MS', 'Chalkboard SE', sans-serif;
          position: relative;
        }
        .nav-link-desktop:hover {
          transform: scale(1.05);
          background: linear-gradient(135deg, rgba(255,255,255,0.25), rgba(255,255,255,0.1));
          box-shadow: 0 8px 15px rgba(0,0,0,0.1);
        }
        .nav-link-desktop.active {
          background: linear-gradient(135deg, rgba(255,255,255,0.3), rgba(255,255,255,0.15));
          border-color: #fbbf24 !important;
          box-shadow: 0 0 20px rgba(251, 191, 36, 0.2);
        }

        .nav-link-auth {
          background: linear-gradient(135deg, #f97316, #ea580c) !important;
          border-color: #f97316 !important;
          color: white !important;
        }
        .nav-link-auth:hover {
          background: linear-gradient(135deg, #ea580c, #c2410c) !important;
          border-color: #ea580c !important;
          transform: scale(1.05);
        }
        .nav-link-auth svg {
          color: white !important;
        }

        .nav-link-login {
          border-color: rgba(255, 255, 255, 0.3) !important;
        }
        .nav-link-login:hover {
          background: rgba(255, 255, 255, 0.15) !important;
          border-color: #fbbf24 !important;
        }

        .mobile-link {
          animation: fadeInUp 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.1) both;
          font-family: 'Comic Sans MS', 'Chalkboard SE', sans-serif;
        }

        .mobile-link-auth {
          background: linear-gradient(135deg, #f97316, #ea580c) !important;
          border-color: #f97316 !important;
          color: white !important;
          justify-content: center;
        }
        .mobile-link-auth:hover {
          background: linear-gradient(135deg, #ea580c, #c2410c) !important;
          border-color: #ea580c !important;
        }
        .mobile-link-auth svg {
          color: white !important;
        }

        .mobile-link-login {
          border-color: rgba(255, 255, 255, 0.2) !important;
          justify-content: center;
        }
        .mobile-link-login:hover {
          background: rgba(255,255,255,0.1) !important;
          border-color: #fbbf24 !important;
        }

        .logo-img {
          height: 48px;
          width: auto;
          object-fit: contain;
          transition: transform 0.3s ease;
          cursor: pointer;
        }
        @media (min-width: 640px) { .logo-img { height: 56px; } }
        @media (min-width: 1024px) { .logo-img { height: 110px; } }
        @media (min-width: 1280px) { .logo-img { height: 130px; } }

        .navbar-container {
          background: rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          border-radius: 2rem;
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.15);
          padding: 8px 16px;
          border: 3px solid rgba(255, 255, 255, 0.4);
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: relative;
          min-height: 70px;
        }
        @media (min-width: 768px) {
          .navbar-container {
            border-radius: 3rem;
            padding: 10px 28px;
            border: 4px solid rgba(255, 255, 255, 0.5);
            min-height: 80px;
          }
        }
        @media (min-width: 1024px) {
          .navbar-container {
            min-height: 90px;
            padding: 12px 32px;
          }
        }

        .navbar-gradient {
          display: none;
        }

        @media (max-width: 1023px) {
          .logo-wrapper { 
            flex: 1; 
            display: flex; 
            align-items: center;
            margin-right: 10px;
          }
        }
        @media (min-width: 1024px) {
          .logo-wrapper { 
            position: absolute; 
            left: 16px; 
            top: 50%; 
            transform: translateY(-50%); 
            z-index: 10; 
          }
          .desktop-spacer { 
            display: block; 
            width: 135px; 
            flex-shrink: 0; 
          }
        }
        @media (min-width: 1280px) {
          .logo-wrapper { left: 20px; }
          .desktop-spacer { width: 150px; }
        }

        .user-menu-dropdown {
          position: absolute;
          top: calc(100% + 10px);
          right: 0;
          background: white;
          border-radius: 1.5rem;
          padding: 8px;
          min-width: 200px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
          border: 2px solid #e5e7eb;
          z-index: 100;
          animation: fadeInUp 0.2s ease-out;
        }

        body {
          margin: 0 !important;
          padding: 0 !important;
        }

        header {
          position: fixed !important;
          top: 0 !important;
          left: 0 !important;
          width: 100% !important;
          z-index: 50 !important;
          padding-top: 0.5rem !important;
          padding-bottom: 0.5rem !important;
          margin: 0 !important;
        }

        .page-content {
          padding-top: 100px !important;
        }

        @media (min-width: 768px) {
          .page-content {
            padding-top: 120px !important;
          }
        }
        @media (min-width: 1024px) {
          .page-content {
            padding-top: 140px !important;
          }
        }
      `}</style>
      
      <header className="fixed top-0 left-0 w-full z-[9999] m-0 p-0">
        {/* Hanging Monkey Mascot */}
        <div className="hidden lg:block absolute right-[14%] top-[12px] z-30 pointer-events-none animate-monkey-swing transform-gpu">
          <svg width="55" height="90" viewBox="0 0 100 160" fill="none">
            <line x1="50" y1="0" x2="50" y2="70" stroke="#facc15" strokeWidth="3" strokeDasharray="3 3" />
            <circle cx="50" cy="95" r="18" fill="#a16207" />
            <circle cx="50" cy="95" r="12" fill="#fef08a" />
            <circle cx="50" cy="65" r="15" fill="#a16207" />
            <circle cx="43" cy="65" r="7" fill="#fef08a" />
            <circle cx="57" cy="65" r="7" fill="#fef08a" />
            <circle cx="46" cy="62" r="2.5" fill="#000" />
            <circle cx="54" cy="62" r="2.5" fill="#000" />
            <path d="M45 71 Q50 75 55 71" stroke="#000" strokeWidth="2" strokeLinecap="round" fill="none" />
          </svg>
        </div>

        {/* Mobile Overlay */}
        <div 
          className={`fixed inset-0 bg-black/60 z-40 transition-opacity duration-300 ${menuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`} 
          onClick={() => setMenuOpen(false)} 
        />

        {/* Main Navbar */}
        <nav className="w-full max-w-7xl mx-auto px-2 sm:px-6 relative">
          <div className="navbar-container">
            <div className="navbar-gradient"><div /></div>

            {/* Logo - Direct link to Home */}
            <div className="logo-wrapper">
              <img
                src="/images/Navbar/logo.avif"
                alt="KahaniLand"
                className="logo-img animate-bounce-slow transform-gpu"
                style={{ animationDuration: '3s' }}
                onClick={handleHome}
              />
            </div>

            <div className="desktop-spacer hidden lg:block" />

            {/* ============ DESKTOP NAVIGATION ============ */}
            <div className="hidden lg:flex items-center gap-1 xl:gap-3 relative z-10 mx-auto lg:pl-6">
              
              {/* HOME - Direct Page */}
              <button
                onClick={handleHome}
                className={`nav-link-desktop group flex items-center gap-2 px-4 py-2 rounded-full text-white font-black text-xs xl:text-sm tracking-wide border-2 ${
                  isActiveRoute("/") ? 'border-yellow-300 bg-white/20' : 'border-transparent hover:border-yellow-300'
                } hover:text-yellow-200 transform-gpu cursor-pointer`}
              >
                <FaHome className={`text-yellow-300 text-sm xl:text-base transition-transform duration-300 group-hover:scale-125 group-hover:rotate-12 filter drop-shadow ${
                  isActiveRoute("/") ? 'scale-110' : ''
                }`} />
                <span className="drop-shadow-[0_2px_2px_rgba(0,0,0,0.4)] text-white group-hover:text-yellow-300 font-black">
                  Home
                </span>
                {isActiveRoute("/") && (
                  <span className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-6 h-1 bg-yellow-400 rounded-full shadow-lg"></span>
                )}
              </button>

              {/* STORIES - Direct Page */}
              <button
                onClick={handleStories}
                className={`nav-link-desktop group flex items-center gap-2 px-4 py-2 rounded-full text-white font-black text-xs xl:text-sm tracking-wide border-2 ${
                  isActiveRoute("/stories") ? 'border-yellow-300 bg-white/20' : 'border-transparent hover:border-yellow-300'
                } hover:text-yellow-200 transform-gpu cursor-pointer`}
              >
                <FaBookOpen className={`text-yellow-300 text-sm xl:text-base transition-transform duration-300 group-hover:scale-125 group-hover:rotate-12 filter drop-shadow ${
                  isActiveRoute("/stories") ? 'scale-110' : ''
                }`} />
                <span className="drop-shadow-[0_2px_2px_rgba(0,0,0,0.4)] text-white group-hover:text-yellow-300 font-black">
                  Stories
                </span>
                {isActiveRoute("/stories") && (
                  <span className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-6 h-1 bg-yellow-400 rounded-full shadow-lg"></span>
                )}
              </button>

              {/* VIDEOS - Direct Page (VideoSection) */}
              <button
                onClick={handleVideos}
                className={`nav-link-desktop group flex items-center gap-2 px-4 py-2 rounded-full text-white font-black text-xs xl:text-sm tracking-wide border-2 ${
                  isActiveRoute("/videos") ? 'border-yellow-300 bg-white/20' : 'border-transparent hover:border-yellow-300'
                } hover:text-yellow-200 transform-gpu cursor-pointer`}
              >
                <FaVideo className={`text-yellow-300 text-sm xl:text-base transition-transform duration-300 group-hover:scale-125 group-hover:rotate-12 filter drop-shadow ${
                  isActiveRoute("/videos") ? 'scale-110' : ''
                }`} />
                <span className="drop-shadow-[0_2px_2px_rgba(0,0,0,0.4)] text-white group-hover:text-yellow-300 font-black">
                  Videos
                </span>
                {isActiveRoute("/videos") && (
                  <span className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-6 h-1 bg-yellow-400 rounded-full shadow-lg"></span>
                )}
              </button>
              
              {/* CONTACT - Popup (NO Page Navigation) - FIXED */}
              <button
                onClick={handleContact}
                type="button"
                className="nav-link-desktop group flex items-center gap-2 px-4 py-2 rounded-full text-white font-black text-xs xl:text-sm tracking-wide border-2 border-transparent hover:border-yellow-300 hover:text-yellow-200 transform-gpu cursor-pointer"
              >
                <FaEnvelope className="text-yellow-300 text-sm xl:text-base transition-transform duration-300 group-hover:scale-125" />
                <span className="drop-shadow-[0_2px_2px_rgba(0,0,0,0.4)]">Contact</span>
              </button>
              
              {/* NEWSLETTER - Popup (NO Page Navigation) - FIXED */}
              <button
                onClick={handleNewsletter}
                type="button"
                className="nav-link-desktop group flex items-center gap-2 px-4 py-2 rounded-full text-white font-black text-xs xl:text-sm tracking-wide border-2 border-transparent hover:border-yellow-300 hover:text-yellow-200 transform-gpu cursor-pointer"
              >
                <FaNewspaper className="text-yellow-300 text-sm xl:text-base transition-transform duration-300 group-hover:scale-125" />
                <span className="drop-shadow-[0_2px_2px_rgba(0,0,0,0.4)]">Newsletter</span>
              </button>
            </div>

            {/* ============ DESKTOP RIGHT SECTION ============ */}
            <div className="hidden lg:flex items-center gap-3 z-10">
              
              {/* User Menu */}
              {isAuthenticated ? (
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 px-3 py-2 rounded-full bg-white/20 hover:bg-white/30 transition border-2 border-white/30 text-white font-bold"
                  >
                    <FaUser />
                    <span className="text-sm">{user?.name?.split(' ')[0] || 'User'}</span>
                  </button>
                  
                  {showUserMenu && (
                    <div className="user-menu-dropdown">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="font-bold text-gray-800">{user?.name}</p>
                        <p className="text-sm text-gray-500">{user?.email}</p>
                        <span className="inline-block mt-1 px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full font-bold">
                          {user?.role || 'user'}
                        </span>
                      </div>
                      <div className="py-1">
                        {(isAdmin || isSuperAdmin) && (
                          <button
                            onClick={handleDashboard}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-600 rounded-lg transition flex items-center gap-2 font-bold"
                          >
                            <FaUserCog /> Dashboard
                          </button>
                        )}
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition flex items-center gap-2 font-bold"
                        >
                          <FaSignInAlt className="rotate-180" /> Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  {/* LOGIN - Direct Page */}
                  <button
                    onClick={handleLogin}
                    className="nav-link-desktop nav-link-login group flex items-center gap-2 px-4 py-2 rounded-full text-white font-black text-xs xl:text-sm tracking-wide border-2 hover:border-yellow-300 hover:text-yellow-200 transform-gpu cursor-pointer"
                  >
                    <FaSignInAlt className="text-yellow-300 text-sm xl:text-base transition-transform duration-300 group-hover:scale-125" />
                    <span className="drop-shadow-[0_2px_2px_rgba(0,0,0,0.4)]">Login</span>
                  </button>
                  
                  {/* SIGN UP - Direct Page */}
                  <button
                    onClick={handleRegister}
                    className="nav-link-desktop nav-link-auth group flex items-center gap-2 px-5 py-2.5 rounded-full text-white font-black text-xs xl:text-sm tracking-wide border-2 transform-gpu cursor-pointer shadow-lg"
                  >
                    <FaUserPlus className="text-sm xl:text-base transition-transform duration-300 group-hover:scale-125" />
                    <span className="drop-shadow-[0_2px_2px_rgba(0,0,0,0.4)]">Sign Up</span>
                  </button>
                </>
              )}

              {/* YOUTUBE - External Link (New Tab) */}
              <button
                className="group relative bg-gradient-to-b from-red-400 to-red-600 hover:from-red-500 hover:to-red-700 px-5 py-2.5 rounded-full font-black text-white shadow-[0_5px_0_#991b1b] active:translate-y-1 active:shadow-none transition-all text-xs xl:text-sm flex items-center gap-2 tracking-wider border border-red-400 transform-gpu cursor-pointer"
                onMouseEnter={() => setIsHoveringCTA(true)}
                onMouseLeave={() => setIsHoveringCTA(false)}
                onClick={handleYouTube}
              >
                <FaYoutube className="text-lg xl:text-xl animate-pulse text-white" />
                <span>YOUTUBE</span>
                <FaRocket
                  className={`transition-all duration-500 ease-out ${isHoveringCTA
                    ? "translate-x-2 -translate-y-2 rotate-45 scale-120 text-yellow-300"
                    : "text-white/80"
                  }`}
                />
              </button>
            </div>

            {/* ============ MOBILE TOGGLE ============ */}
            <button
              ref={toggleRef}
              className="lg:hidden mobile-toggle-btn flex items-center justify-center rounded-full bg-gradient-to-b from-amber-400 to-orange-500 text-white shadow-md border-2 border-white hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer transform-gpu"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle Navigation"
              aria-expanded={menuOpen}
            >
              <div className={`transition-transform duration-300 transform-gpu ${menuOpen ? "rotate-180" : "rotate-0"}`}>
                {menuOpen ? <FaTimes className="text-sm" /> : <FaBars className="text-sm" />}
              </div>
            </button>
          </div>

          {/* ============ MOBILE DROPDOWN ============ */}
          <div className={`mobile-dropdown-wrap ${menuOpen ? "open" : ""}`}>
            <div className={`mobile-dropdown-inner ${menuOpen ? "open" : ""}`}>
              <div className="mobile-dropdown-scroll">
                
                {/* HOME - Direct Page */}
                <button
                  onClick={handleHome}
                  className={`mobile-link group flex items-center gap-4 py-3 px-5 mb-2 rounded-2xl text-white font-black text-base hover:bg-white/10 transition-all duration-200 transform-gpu cursor-pointer border ${
                    isActiveRoute("/") ? 'border-yellow-300 bg-white/20' : 'border-transparent hover:border-white/20'
                  } shadow-sm w-full`}
                  style={{ animationDelay: '0s' }}
                >
                  <FaHome className={`text-yellow-300 text-xl group-hover:scale-125 transition-transform duration-200 ${
                    isActiveRoute("/") ? 'scale-110' : ''
                  }`} />
                  <span className="tracking-wide group-hover:text-yellow-300 drop-shadow-md">
                    Home
                  </span>
                  {isActiveRoute("/") && (
                    <FaArrowRight className="ml-auto text-yellow-300 text-sm" />
                  )}
                </button>

                {/* STORIES - Direct Page */}
                <button
                  onClick={handleStories}
                  className={`mobile-link group flex items-center gap-4 py-3 px-5 mb-2 rounded-2xl text-white font-black text-base hover:bg-white/10 transition-all duration-200 transform-gpu cursor-pointer border ${
                    isActiveRoute("/stories") ? 'border-yellow-300 bg-white/20' : 'border-transparent hover:border-white/20'
                  } shadow-sm w-full`}
                  style={{ animationDelay: '0.05s' }}
                >
                  <FaBookOpen className={`text-yellow-300 text-xl group-hover:scale-125 transition-transform duration-200 ${
                    isActiveRoute("/stories") ? 'scale-110' : ''
                  }`} />
                  <span className="tracking-wide group-hover:text-yellow-300 drop-shadow-md">
                    Stories
                  </span>
                  {isActiveRoute("/stories") && (
                    <FaArrowRight className="ml-auto text-yellow-300 text-sm" />
                  )}
                </button>

                {/* VIDEOS - Direct Page (VideoSection) */}
                <button
                  onClick={handleVideos}
                  className={`mobile-link group flex items-center gap-4 py-3 px-5 mb-2 rounded-2xl text-white font-black text-base hover:bg-white/10 transition-all duration-200 transform-gpu cursor-pointer border ${
                    isActiveRoute("/videos") ? 'border-yellow-300 bg-white/20' : 'border-transparent hover:border-white/20'
                  } shadow-sm w-full`}
                  style={{ animationDelay: '0.1s' }}
                >
                  <FaVideo className={`text-yellow-300 text-xl group-hover:scale-125 transition-transform duration-200 ${
                    isActiveRoute("/videos") ? 'scale-110' : ''
                  }`} />
                  <span className="tracking-wide group-hover:text-yellow-300 drop-shadow-md">
                    Videos
                  </span>
                  {isActiveRoute("/videos") && (
                    <FaArrowRight className="ml-auto text-yellow-300 text-sm" />
                  )}
                </button>

                {/* CONTACT - Popup (NO Page Navigation) - FIXED */}
                <button
                  onClick={handleContact}
                  type="button"
                  className="mobile-link w-full group flex items-center gap-4 py-3 px-5 mb-2 rounded-2xl text-white font-black text-base hover:bg-white/10 transition-all duration-200 border border-transparent hover:border-white/20"
                  style={{ animationDelay: '0.15s' }}
                >
                  <FaEnvelope className="text-yellow-300 text-xl" />
                  <span>Contact</span>
                </button>
                
                {/* NEWSLETTER - Popup (NO Page Navigation) - FIXED */}
                <button
                  onClick={handleNewsletter}
                  type="button"
                  className="mobile-link w-full group flex items-center gap-4 py-3 px-5 mb-2 rounded-2xl text-white font-black text-base hover:bg-white/10 transition-all duration-200 border border-transparent hover:border-white/20"
                  style={{ animationDelay: '0.2s' }}
                >
                  <FaNewspaper className="text-yellow-300 text-xl" />
                  <span>Newsletter</span>
                </button>

                {/* ============ MOBILE AUTH LINKS ============ */}
                {isAuthenticated ? (
                  <>
                    <div className="mobile-link flex items-center gap-4 py-3 px-5 mb-2 rounded-2xl bg-white/10 border border-white/20">
                      <FaUser className="text-yellow-300 text-xl" />
                      <div>
                        <p className="text-white font-bold">{user?.name}</p>
                        <p className="text-white/60 text-sm">{user?.email}</p>
                      </div>
                    </div>
                    {(isAdmin || isSuperAdmin) && (
                      <button
                        onClick={handleDashboard}
                        className="mobile-link w-full group flex items-center gap-4 py-3 px-5 mb-2 rounded-2xl text-white font-black text-base hover:bg-white/10 transition-all duration-200 border border-transparent hover:border-white/20"
                      >
                        <FaUserCog className="text-yellow-300 text-xl" />
                        <span>Dashboard</span>
                      </button>
                    )}
                    <button
                      onClick={handleLogout}
                      className="mobile-link w-full group flex items-center gap-4 py-3 px-5 mb-2 rounded-2xl text-red-300 font-black text-base hover:bg-red-500/20 transition-all duration-200 border border-transparent hover:border-red-400/30"
                    >
                      <FaSignInAlt className="text-red-300 text-xl rotate-180" />
                      <span>Logout</span>
                    </button>
                  </>
                ) : (
                  <>
                    {/* LOGIN - Direct Page */}
                    <button
                      onClick={handleLogin}
                      className="mobile-link mobile-link-login w-full group flex items-center gap-4 py-3 px-5 mb-2 rounded-2xl text-white font-black text-base hover:bg-white/10 transition-all duration-200 border-2"
                      style={{ animationDelay: '0.25s' }}
                    >
                      <FaSignInAlt className="text-yellow-300 text-xl" />
                      <span>Login</span>
                    </button>
                    
                    {/* SIGN UP - Direct Page */}
                    <button
                      onClick={handleRegister}
                      className="mobile-link mobile-link-auth w-full group flex items-center justify-center gap-4 py-3 px-5 mb-2 rounded-2xl text-white font-black text-base transition-all duration-200 border-2 shadow-lg"
                      style={{ animationDelay: '0.3s' }}
                    >
                      <FaUserPlus className="text-white text-xl" />
                      <span>Sign Up</span>
                    </button>
                  </>
                )}

                {/* YOUTUBE - External Link (New Tab) */}
                <button
                  className="group mt-4 w-full bg-gradient-to-b from-red-400 to-red-600 py-3.5 rounded-2xl font-black text-white text-sm shadow-[0_4px_0_#991b1b] flex items-center justify-center gap-2 transform-gpu active:translate-y-1 active:shadow-none border border-red-400 transition-all duration-150"
                  onClick={handleYouTube}
                >
                  <FaYoutube className="text-2xl animate-bounce" style={{ animationDuration: '2.5s' }} />
                  <span>SUBSCRIBE ON YOUTUBE ✨</span>
                </button>

                {/* Trust Badges */}
                <div className="mt-5 pt-4 border-t border-white/10 flex flex-wrap items-center justify-center gap-2 text-xs text-yellow-300/90 font-black tracking-wide">
                  <span className="flex items-center gap-1 bg-white/10 px-2.5 py-1 rounded-lg"><FaCrown className="text-yellow-400 text-sm animate-pulse" /> 100% Kids Safe</span>
                  <span className="flex items-center gap-1 bg-white/10 px-2.5 py-1 rounded-lg">🚫 Ad-Free</span>
                  <span className="flex items-center gap-1 bg-white/10 px-2.5 py-1 rounded-lg"><FaStar className="text-yellow-400" /> Fun Learning</span>
                </div>
              </div>
            </div>
          </div>
        </nav>
      </header>
    </>
  );
};

export default Navbar;