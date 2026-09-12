// src/layouts/AdminLayout.jsx
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  BookOpenIcon,
  VideoCameraIcon,
  UsersIcon,
  EnvelopeIcon,
  ArrowRightOnRectangleIcon,
  ChartBarIcon,
  HomeIcon,
  Bars3Icon,
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  MagnifyingGlassIcon,
  BellIcon,
  Cog6ToothIcon,
  UserGroupIcon,
  ArrowTopRightOnSquareIcon,
  SparklesIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  ChevronRightIcon as ChevronSmallRightIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect, useCallback, useRef, memo } from 'react';

// Memoized SidebarItem
const SidebarItem = memo(({ item, isActive, isCollapsed, onClick }) => {
  const Icon = item.icon;
  const active = isActive(item.path);

  return (
    <Link
      to={item.path}
      onClick={onClick}
      className={`group relative flex items-center ${
        isCollapsed ? 'justify-center px-2' : 'space-x-3 px-3.5'
      } py-2.5 my-1 rounded-xl font-medium text-sm transition-all duration-200 ${
        active
          ? 'bg-emerald-500/10 text-emerald-700 font-semibold shadow-sm border border-emerald-500/20'
          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
      }`}
      title={isCollapsed ? item.label : ''}
    >
      <Icon
        className={`w-5 h-5 flex-shrink-0 transition-colors duration-200 ${
          active ? 'text-emerald-600' : 'text-slate-400 group-hover:text-slate-600'
        }`}
      />
      {!isCollapsed && (
        <span className="flex-1 truncate tracking-tight">{item.label}</span>
      )}
      
      {/* Badge if available */}
      {!isCollapsed && item.badge && (
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
          item.badgeColor || 'bg-emerald-100 text-emerald-700'
        }`}>
          {item.badge}
        </span>
      )}

      {/* Floating Tooltip when Collapsed */}
      {isCollapsed && (
        <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-slate-900 text-white text-xs font-medium rounded-lg shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-150 whitespace-nowrap z-50">
          {item.label}
        </div>
      )}

      {/* Active Indicator Bar */}
      {active && !isCollapsed && (
        <span className="w-1.5 h-5 bg-emerald-500 rounded-full shadow-sm" />
      )}
      {active && isCollapsed && (
        <span className="absolute right-0 w-1 h-6 bg-emerald-500 rounded-l-full shadow-sm" />
      )}
    </Link>
  );
});
SidebarItem.displayName = 'SidebarItem';

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const userAvatar = user?.profile_image || localStorage.getItem('admin_avatar') || null;

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    const saved = localStorage.getItem('adminSidebarCollapsed');
    if (saved !== null) return JSON.parse(saved);
    return typeof window !== 'undefined' ? window.innerWidth < 1024 : false;
  });

  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const profileMenuRef = useRef(null);
  const notificationMenuRef = useRef(null);

  useEffect(() => {
    localStorage.setItem('adminSidebarCollapsed', JSON.stringify(isSidebarCollapsed));
  }, [isSidebarCollapsed]);

  // Click outside listener for dropdowns
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target)) {
        setShowProfileMenu(false);
      }
      if (notificationMenuRef.current && !notificationMenuRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = useCallback(async () => {
    try {
      await logout();
      navigate('/admin-login', { replace: true });
    } catch (error) {
      console.error('Logout error:', error);
      navigate('/admin-login', { replace: true });
    }
  }, [logout, navigate]);

  const toggleMobileMenu = useCallback(() => setIsMobileMenuOpen((prev) => !prev), []);
  const closeMobileMenu = useCallback(() => setIsMobileMenuOpen(false), []);
  const toggleSidebar = useCallback(() => setIsSidebarCollapsed((prev) => !prev), []);

  const isActive = useCallback(
    (path) => {
      if (path === '/admin') return location.pathname === '/admin';
      return location.pathname === path || location.pathname.startsWith(path + '/');
    },
    [location.pathname]
  );

  // Grouped menu sections
  const menuSections = [
    {
      title: 'Overview',
      items: [
        { path: '/admin', icon: ChartBarIcon, label: 'Dashboard' },
      ]
    },
    {
      title: 'Content Studio',
      items: [
        { path: '/admin/stories', icon: BookOpenIcon, label: 'Stories' },
        { path: '/admin/videos', icon: VideoCameraIcon, label: 'Videos' },
      ]
    },
    {
      title: 'Audience & Inquiries',
      items: [
        { path: '/admin/users', icon: UserGroupIcon, label: 'Users' },
        { path: '/admin/contacts', icon: UsersIcon, label: 'Contacts' },
        { path: '/admin/newsletters', icon: EnvelopeIcon, label: 'Newsletters' },
      ]
    },
    {
      title: 'Preferences',
      items: [
        { path: '/admin/settings', icon: Cog6ToothIcon, label: 'Settings' },
      ]
    }
  ];

  const allItems = menuSections.flatMap(s => s.items);
  const currentItem = allItems.find((item) => isActive(item.path));
  const currentPageLabel = currentItem?.label || 'Dashboard';

  const mockNotifications = [
    { id: 1, title: 'New Story Submission', desc: 'A teacher submitted "The Brave Mouse"', time: '10m ago', unread: true },
    { id: 2, title: 'Contact Inquiry', desc: 'Preschool licensing request from Ananya Roy', time: '1h ago', unread: true },
    { id: 3, title: 'Newsletter Milestone', desc: '5 new subscribers joined today', time: '3h ago', unread: false },
  ];

  return (
    <div className="flex h-screen bg-[#f8fafc] text-slate-800 font-sans antialiased overflow-hidden">
      {/* Mobile Menu Backdrop */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 lg:hidden transition-opacity duration-300"
          onClick={closeMobileMenu}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`bg-white border-r border-slate-200/80 flex flex-col fixed lg:static h-full z-50 transition-all duration-300 ease-in-out shadow-[1px_0_15px_rgba(0,0,0,0.03)] ${
          isSidebarCollapsed ? 'w-[76px]' : 'w-64'
        } ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div
          className={`h-16 border-b border-slate-100 flex items-center px-4 ${
            isSidebarCollapsed ? 'justify-center' : 'justify-between'
          }`}
        >
          <Link
            to="/admin"
            className="flex items-center gap-3 group focus:outline-none"
            onClick={closeMobileMenu}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-amber-500 flex items-center justify-center text-white font-black text-xl shadow-md shadow-emerald-600/20 group-hover:scale-105 transition-transform">
              K
            </div>
            {!isSidebarCollapsed && (
              <div className="leading-tight">
                <div className="flex items-center gap-1.5">
                  <h1 className="text-base font-bold tracking-tight text-slate-900">KahaniLand</h1>
                  <span className="text-[9px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded-md border border-emerald-200/70">
                    Pro
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-medium">Admin Control Center</p>
              </div>
            )}
          </Link>

          {/* Desktop Sidebar Toggle */}
          <button
            onClick={toggleSidebar}
            className="hidden lg:flex items-center justify-center w-7 h-7 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            title={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isSidebarCollapsed ? (
              <ChevronRightIcon className="w-4 h-4" />
            ) : (
              <ChevronLeftIcon className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Quick Visit Site Pill */}
        <div className={`p-3 border-b border-slate-100/80 ${isSidebarCollapsed ? 'px-2 text-center' : ''}`}>
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center ${
              isSidebarCollapsed ? 'justify-center' : 'justify-between'
            } px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100/80 border border-slate-200/60 transition-all group`}
            title="Open live website in new tab"
          >
            <div className="flex items-center gap-2">
              <HomeIcon className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition-colors" />
              {!isSidebarCollapsed && <span>View Live Site</span>}
            </div>
            {!isSidebarCollapsed && (
              <ArrowTopRightOnSquareIcon className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600" />
            )}
          </a>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-3 space-y-4 overflow-y-auto custom-scrollbar">
          {menuSections.map((section, idx) => (
            <div key={idx} className="space-y-1">
              {!isSidebarCollapsed && (
                <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  {section.title}
                </p>
              )}
              {section.items.map((item) => (
                <SidebarItem
                  key={item.path}
                  item={item}
                  isActive={isActive}
                  isCollapsed={isSidebarCollapsed}
                  onClick={closeMobileMenu}
                />
              ))}
            </div>
          ))}
        </nav>

        {/* User Profile Footer */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/60">
          <div
            className={`flex items-center ${
              isSidebarCollapsed ? 'justify-center' : 'justify-between'
            } w-full`}
          >
            {!isSidebarCollapsed ? (
              <>
                <div className="flex items-center space-x-3 min-w-0">
                  <div className="relative flex-shrink-0">
                    {userAvatar ? (
                      <img
                        src={userAvatar}
                        alt={user?.name || 'Admin'}
                        className="w-9 h-9 rounded-xl object-cover border border-emerald-500/50 shadow-sm"
                      />
                    ) : (
                      <div className="w-9 h-9 bg-gradient-to-tr from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-sm">
                        {user?.name?.charAt(0)?.toUpperCase() || 'A'}
                      </div>
                    )}
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-800 truncate">
                      {user?.name || 'Admin User'}
                    </p>
                    <p className="text-[11px] text-slate-400 truncate capitalize">
                      {user?.role || 'Administrator'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors flex-shrink-0"
                  title="Logout"
                >
                  <ArrowRightOnRectangleIcon className="w-4 h-4" />
                </button>
              </>
            ) : (
              <div className="relative group flex justify-center w-full">
                <div className="relative cursor-pointer">
                  {userAvatar ? (
                    <img
                      src={userAvatar}
                      alt={user?.name || 'Admin'}
                      className="w-9 h-9 rounded-xl object-cover border border-emerald-500/50 shadow-sm"
                    />
                  ) : (
                    <div className="w-9 h-9 bg-gradient-to-tr from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-sm">
                      {user?.name?.charAt(0)?.toUpperCase() || 'A'}
                    </div>
                  )}
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full" />
                </div>
                <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-slate-900 text-white text-xs font-medium rounded-lg shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all whitespace-nowrap z-50">
                  {user?.name || 'Admin'} • <span className="text-emerald-400 capitalize">{user?.role || 'admin'}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden min-w-0">
        {/* Top Navbar */}
        <header className="h-16 sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between shadow-xs">
          {/* Left: Mobile menu toggle & Breadcrumbs */}
          <div className="flex items-center gap-3">
            <button
              onClick={toggleMobileMenu}
              className="lg:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
              aria-label="Toggle navigation menu"
            >
              {isMobileMenuOpen ? (
                <XMarkIcon className="w-6 h-6" />
              ) : (
                <Bars3Icon className="w-6 h-6" />
              )}
            </button>

            {/* Breadcrumbs */}
            <div className="flex items-center gap-2 text-sm">
              <span className="text-slate-400 hover:text-slate-600 hidden sm:inline-flex items-center gap-1 font-medium">
                Admin
              </span>
              <span className="text-slate-300 hidden sm:inline">/</span>
              <span className="font-bold text-slate-800 tracking-tight flex items-center gap-1.5">
                {currentPageLabel}
              </span>
            </div>
          </div>

          {/* Right: Actions, Search, Notifications, Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Search Input */}
            <div className="hidden md:flex items-center bg-slate-100/80 hover:bg-slate-100 border border-slate-200/70 rounded-xl px-3 py-1.5 w-60 focus-within:w-72 focus-within:border-emerald-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-emerald-100 transition-all">
              <MagnifyingGlassIcon className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent outline-none ml-2 w-full text-xs text-slate-700 placeholder-slate-400"
              />
              <kbd className="hidden lg:inline text-[10px] font-mono text-slate-400 bg-white px-1.5 py-0.5 rounded border border-slate-200 shadow-2xs">
                ⌘K
              </kbd>
            </div>

            {/* Notifications Dropdown */}
            <div className="relative" ref={notificationMenuRef}>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className={`relative p-2 rounded-xl transition-colors ${
                  showNotifications ? 'bg-slate-100 text-slate-800' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/80'
                }`}
                aria-label="View notifications"
              >
                <BellIcon className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-500 rounded-full ring-2 ring-white" />
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 p-4 z-50 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-bold text-sm text-slate-800">Notifications</h3>
                      <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                        2 New
                      </span>
                    </div>
                    <button className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold">
                      Mark read
                    </button>
                  </div>
                  <div className="divide-y divide-slate-50 py-1">
                    {mockNotifications.map((n) => (
                      <div key={n.id} className="py-2.5 px-1 hover:bg-slate-50/80 rounded-lg transition-colors">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-xs font-semibold text-slate-800">{n.title}</p>
                          <span className="text-[10px] text-slate-400 whitespace-nowrap">{n.time}</span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{n.desc}</p>
                      </div>
                    ))}
                  </div>
                  <div className="pt-2 border-t border-slate-100 text-center">
                    <Link
                      to="/admin/contacts"
                      onClick={() => setShowNotifications(false)}
                      className="text-xs text-slate-600 hover:text-emerald-600 font-semibold inline-flex items-center gap-1"
                    >
                      View all messages <ChevronSmallRightIcon className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Profile Dropdown */}
            <div className="relative" ref={profileMenuRef}>
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2.5 p-1 pr-2 rounded-xl hover:bg-slate-100/80 transition-colors focus:outline-none"
              >
                {userAvatar ? (
                  <img
                    src={userAvatar}
                    alt={user?.name || 'Admin'}
                    className="w-8 h-8 rounded-xl object-cover border border-emerald-500/50 shadow-xs"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                    {user?.name?.charAt(0)?.toUpperCase() || 'A'}
                  </div>
                )}
                <div className="hidden md:block text-left">
                  <p className="text-xs font-bold text-slate-800 leading-tight">
                    {user?.name?.split(' ')[0] || 'Admin'}
                  </p>
                  <p className="text-[10px] text-emerald-600 font-semibold capitalize">
                    {user?.role || 'admin'}
                  </p>
                </div>
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-slate-100 py-1.5 z-50 animate-in fade-in duration-150">
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="text-xs font-bold text-slate-800">{user?.name || 'Admin User'}</p>
                    <p className="text-[11px] text-slate-400 truncate">{user?.email || 'admin@kahaniland.com'}</p>
                  </div>

                  <Link
                    to="/admin/settings"
                    onClick={() => setShowProfileMenu(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-emerald-600 transition-colors"
                  >
                    <Cog6ToothIcon className="w-4 h-4 text-slate-400" />
                    Settings & Profile
                  </Link>

                  <a
                    href="/"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setShowProfileMenu(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-emerald-600 transition-colors"
                  >
                    <ArrowTopRightOnSquareIcon className="w-4 h-4 text-slate-400" />
                    Visit Live Website
                  </a>

                  <div className="my-1 border-t border-slate-100" />

                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      handleLogout();
                    }}
                    className="flex items-center gap-2.5 w-full text-left px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50/70 transition-colors"
                  >
                    <ArrowRightOnRectangleIcon className="w-4 h-4 text-rose-500" />
                    Log Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Scrollable Body Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 custom-scrollbar">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;