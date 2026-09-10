// src/components/admin/AdminLayout.jsx
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
} from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect, useCallback, memo } from 'react';

// Memoized SidebarItem
const SidebarItem = memo(({ item, isActive, isCollapsed, onClick }) => {
  const Icon = item.icon;
  return (
    <Link
      to={item.path}
      onClick={onClick}
      className={`flex items-center ${
        isCollapsed ? 'justify-center' : 'space-x-3'
      } px-3 py-3 rounded-lg transition-all duration-200 group relative ${
        isActive(item.path)
          ? 'bg-gradient-to-r from-green-50 to-green-100/50 text-green-600 shadow-sm border border-green-200/50'
          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
      }`}
      title={isCollapsed ? item.label : ''}
    >
      <Icon
        className={`w-5 h-5 flex-shrink-0 ${
          isActive(item.path) ? 'text-green-500' : 'text-gray-400'
        }`}
      />
      {!isCollapsed && <span className="font-medium text-sm flex-1">{item.label}</span>}
      {isCollapsed && (
        <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
          {item.label}
        </div>
      )}
      {isActive(item.path) && !isCollapsed && (
        <div className="w-1.5 h-8 bg-gradient-to-b from-green-400 to-green-500 rounded-full shadow-sm" />
      )}
      {isActive(item.path) && isCollapsed && (
        <div className="absolute right-0 w-1 h-8 bg-gradient-to-b from-green-400 to-green-500 rounded-full shadow-sm" />
      )}
    </Link>
  );
});
SidebarItem.displayName = 'SidebarItem';

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebarCollapsed');
    return saved ? JSON.parse(saved) : true;
  });
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', JSON.stringify(isSidebarCollapsed));
  }, [isSidebarCollapsed]);

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
  const toggleProfileMenu = useCallback(() => setShowProfileMenu((prev) => !prev), []);

  const isActive = useCallback(
    (path) => {
      if (path === '/admin') return location.pathname === '/admin';
      return location.pathname === path || location.pathname.startsWith(path + '/');
    },
    [location.pathname]
  );

  const menuItems = [
    { path: '/admin', icon: ChartBarIcon, label: 'Dashboard' },
    { path: '/admin/stories', icon: BookOpenIcon, label: 'Stories' },
    { path: '/admin/videos', icon: VideoCameraIcon, label: 'Videos' },
    { path: '/admin/users', icon: UserGroupIcon, label: 'Users' },
    { path: '/admin/contacts', icon: UsersIcon, label: 'Contacts' },
    { path: '/admin/newsletters', icon: EnvelopeIcon, label: 'Newsletters' },
    { path: '/admin/settings', icon: Cog6ToothIcon, label: 'Settings' },
  ];

  const currentPageLabel = menuItems.find((item) => isActive(item.path))?.label || 'Dashboard';

  return (
    <div className="flex h-screen bg-green-50">
      {/* Mobile Menu Toggle */}
      <button
        onClick={toggleMobileMenu}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-green-500 rounded-lg shadow-lg hover:bg-green-600 transition-colors"
      >
        {isMobileMenuOpen ? (
          <XMarkIcon className="w-6 h-6 text-white" />
        ) : (
          <Bars3Icon className="w-6 h-6 text-white" />
        )}
      </button>

      {/* Sidebar */}
      <aside
        className={`bg-white border-r border-gray-200 flex flex-col fixed h-full z-40 transition-all duration-300 ease-in-out ${
          isSidebarCollapsed ? 'w-20' : 'w-64'
        } lg:translate-x-0 ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Logo */}
        <div
          className={`p-4 border-b border-gray-200 flex items-center ${
            isSidebarCollapsed ? 'justify-center' : 'justify-between'
          }`}
        >
          <div className={`flex items-center ${isSidebarCollapsed ? 'space-x-0' : 'space-x-3'}`}>
            <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-md flex-shrink-0">
              <span className="text-white font-bold text-lg">K</span>
            </div>
            {!isSidebarCollapsed && (
              <div>
                <h1 className="text-lg font-bold text-gray-800">KahaniLand</h1>
                <p className="text-xs text-gray-500">Admin Panel</p>
              </div>
            )}
          </div>
          <button
            onClick={toggleSidebar}
            className="hidden lg:flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors flex-shrink-0"
          >
            {isSidebarCollapsed ? (
              <ChevronRightIcon className="w-4 h-4 text-gray-600" />
            ) : (
              <ChevronLeftIcon className="w-4 h-4 text-gray-600" />
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          <Link
            to="/"
            className={`flex items-center ${
              isSidebarCollapsed ? 'justify-center' : 'space-x-3'
            } px-3 py-3 rounded-lg text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-all duration-200 mb-4 border border-gray-200/50 group relative`}
            target="_blank"
            title={isSidebarCollapsed ? 'Visit Site' : ''}
          >
            <HomeIcon className="w-5 h-5 flex-shrink-0" />
            {!isSidebarCollapsed && <span className="font-medium text-sm">Visit Site</span>}
            {isSidebarCollapsed && (
              <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                Visit Site
              </div>
            )}
          </Link>

          {menuItems.map((item) => (
            <SidebarItem
              key={item.path}
              item={item}
              isActive={isActive}
              isCollapsed={isSidebarCollapsed}
              onClick={closeMobileMenu}
            />
          ))}
        </nav>

        {/* User Profile */}
        <div
          className={`p-3 border-t border-gray-200 bg-gray-50/30 ${
            isSidebarCollapsed ? 'flex justify-center' : ''
          }`}
        >
          <div
            className={`flex items-center ${
              isSidebarCollapsed ? 'justify-center' : 'justify-between'
            } w-full`}
          >
            {!isSidebarCollapsed ? (
              <>
                <div className="flex items-center space-x-3 min-w-0">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-500 rounded-full flex items-center justify-center text-white font-medium text-sm shadow-md flex-shrink-0">
                    {user?.name?.charAt(0)?.toUpperCase() || 'A'}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-700 truncate">
                      {user?.name || 'Admin'}
                    </p>
                    <p className="text-xs text-gray-500 capitalize flex items-center gap-1">
                      <span className="inline-block w-1.5 h-1.5 bg-green-400 rounded-full" />
                      {user?.role || 'admin'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                  title="Logout"
                >
                  <ArrowRightOnRectangleIcon className="w-5 h-5" />
                </button>
              </>
            ) : (
              <div className="relative group">
                <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-500 rounded-full flex items-center justify-center text-white font-medium text-sm shadow-md flex-shrink-0 cursor-pointer">
                  {user?.name?.charAt(0)?.toUpperCase() || 'A'}
                </div>
                <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                  {user?.name || 'Admin'}
                </div>
                <button
                  onClick={handleLogout}
                  className="absolute -top-1 -right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 shadow-lg"
                  title="Logout"
                >
                  <ArrowRightOnRectangleIcon className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black/20 z-30 lg:hidden" onClick={closeMobileMenu} />
      )}

      {/* Main Content */}
      <main
        className={`flex-1 transition-all duration-300 ${
          isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'
        } bg-green-50`}
      >
        {/* Top Navbar */}
        <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-sm border-b border-gray-200 px-4 md:px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-semibold text-gray-800">{currentPageLabel}</h2>
              <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full hidden sm:inline-block">
                {location.pathname.split('/').filter(Boolean).join(' / ')}
              </span>
            </div>

            <div className="flex items-center gap-3">
              {/* Search Bar */}
              <div className="hidden md:flex items-center bg-gray-100 rounded-xl px-3 py-1.5 w-64">
                <MagnifyingGlassIcon className="w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search stories, videos..."
                  className="bg-transparent outline-none ml-2 w-full text-sm"
                />
              </div>

              {/* Notification Bell */}
              <button className="relative p-2 text-gray-500 hover:text-green-500 transition-colors">
                <BellIcon className="w-6 h-6" />
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  3
                </span>
              </button>

              {/* Profile Dropdown */}
              <div className="relative">
                <button
                  onClick={toggleProfileMenu}
                  className="flex items-center gap-2 hover:bg-gray-100 rounded-full px-2 py-1 transition"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-green-500 rounded-full flex items-center justify-center text-white font-medium text-sm shadow-md">
                    {user?.name?.charAt(0)?.toUpperCase() || 'A'}
                  </div>
                  <span className="hidden md:inline text-sm font-medium text-gray-700">
                    {user?.name || 'Admin'}
                  </span>
                </button>

                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
                    <Link
                      to="/admin/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      Profile
                    </Link>
                    <Link
                      to="/admin/settings"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      Settings
                    </Link>
                    <hr className="my-1" />
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>

              {/* View Site Button */}
              <a
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm bg-gradient-to-r from-green-400 to-green-500 text-white px-4 py-2 rounded-lg font-medium hover:shadow-lg transition hidden sm:inline-block"
              >
                View Site
              </a>
            </div>
          </div>
        </header>

        <div className="p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;