import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  EnvelopeIcon,
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon,
  ShieldCheckIcon,
  SparklesIcon,
  KeyIcon,
} from '@heroicons/react/24/outline';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login, logout, user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated as admin
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'admin' || user.role === 'superadmin') {
        navigate('/admin', { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate]);

  // Clear fields on mount
  useEffect(() => {
    setEmail('');
    setPassword('');
    const timer = setTimeout(() => {
      setEmail('');
      setPassword('');
    }, 120);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await login({
        email: email.trim(),
        password,
        portal: 'admin',
      });

      if (
        response?.user?.role === 'admin' ||
        response?.user?.role === 'superadmin'
      ) {
        navigate('/admin', { replace: true });
      } else {
        await logout();
        setError('Access denied: Only administrators can log in here.');
      }
    } catch (err) {
      console.error('Admin login error:', err);
      setError(
        err.response?.data?.message ||
        err.message ||
        'Login failed. Please check your credentials.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 bg-slate-950"
      style={{
        backgroundImage: "radial-gradient(ellipse at top, #1e293b 0%, #0f172a 50%, #020617 100%)",
      }}
    >
      {/* Decorative ambient background glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Main Card */}
      <div className="w-full max-w-4xl backdrop-blur-xl bg-slate-900/80 rounded-3xl shadow-2xl relative z-10 border border-slate-700/60 overflow-hidden">
        <div className="flex flex-col md:flex-row">
          
          {/* Left Side - Dark Slate Admin Security Hero */}
          <div
            className="w-full md:w-1/2 p-8 md:p-10 flex flex-col justify-between relative min-h-[420px] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 border-b md:border-b-0 md:border-r border-slate-800"
          >
            <div className="relative z-10">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl shadow-lg mb-5 relative">
                <ShieldCheckIcon className="w-8 h-8 text-emerald-400" />
                <div className="absolute -top-1 -right-1">
                  <SparklesIcon className="w-4 h-4 text-emerald-300 animate-pulse" />
                </div>
              </div>

              <div className="inline-block px-2.5 py-0.5 rounded-md bg-emerald-950/70 border border-emerald-800/60 text-[11px] font-semibold tracking-wide uppercase text-emerald-400 mb-3">
                Restricted Administration Area
              </div>

              <h1 className="text-3xl font-extrabold mb-3 text-white">
                Admin <span className="text-emerald-400">Portal</span>
              </h1>

              <p className="text-slate-400 text-sm leading-relaxed mb-6">
                Central management system for KahaniLand stories, video channels, subscribers, and platform governance.
              </p>

              <div className="space-y-3 text-xs text-slate-300">
                <div className="flex items-center space-x-2.5">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400"></div>
                  <span>Role-Based Access Control (RBAC)</span>
                </div>
                <div className="flex items-center space-x-2.5">
                  <div className="w-2 h-2 rounded-full bg-indigo-400 shadow-sm shadow-indigo-400"></div>
                  <span>Full CRUD & Media Upload Moderation</span>
                </div>
                <div className="flex items-center space-x-2.5">
                  <div className="w-2 h-2 rounded-full bg-amber-400 shadow-sm shadow-amber-400"></div>
                  <span>Activity Logs & User Privilege Management</span>
                </div>
              </div>
            </div>

            {/* Security Notice */}
            <div className="relative z-10 pt-6 mt-6 border-t border-slate-800 flex items-center space-x-2 text-xs text-slate-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Authorized personnel and administration access only.</span>
            </div>
          </div>

          {/* Right Side - Secure Form */}
          <div className="w-full md:w-1/2 p-8 md:p-10 bg-slate-900/90 flex flex-col justify-center">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white">Admin Sign In</h2>
              <p className="text-slate-400 text-sm mt-1">
                Enter your administrative credentials to continue
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-950/40 border border-red-800/60 text-red-300 rounded-xl text-sm flex items-start space-x-2">
                <span className="mt-0.5 text-base">⚠️</span>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
              {/* Hidden dummy fields to prevent browser autofill */}
              <input
                type="text"
                name="prevent_admin_autofill"
                style={{ display: 'none', position: 'absolute', opacity: 0 }}
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
              />
              <input
                type="password"
                name="prevent_admin_autofill_pwd"
                style={{ display: 'none', position: 'absolute', opacity: 0 }}
                tabIndex={-1}
                autoComplete="new-password"
                aria-hidden="true"
              />

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Administrator Email
                </label>
                <div className="relative">
                  <EnvelopeIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input
                    type="email"
                    name="admin_portal_email"
                    id="admin_portal_email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@example.com"
                    className="w-full pl-10 pr-3 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm text-white placeholder-slate-500 transition shadow-inner"
                    required
                    disabled={loading}
                    autoComplete="off"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-medium text-slate-300">
                    Password
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-xs text-emerald-400 hover:text-emerald-300 font-medium transition"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <LockClosedIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="admin_portal_password"
                    id="admin_portal_password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter admin password"
                    className="w-full pl-10 pr-11 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm text-white placeholder-slate-500 transition shadow-inner"
                    required
                    disabled={loading}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition"
                    disabled={loading}
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="w-5 h-5" />
                    ) : (
                      <EyeIcon className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center space-x-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 text-emerald-500 bg-slate-800 border-slate-700 rounded focus:ring-emerald-500 focus:ring-offset-slate-900"
                    disabled={loading}
                  />
                  <span className="text-xs text-slate-400">Keep session active</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold rounded-xl hover:from-emerald-500 hover:to-teal-500 transition shadow-lg hover:shadow-emerald-500/25 disabled:opacity-50 disabled:cursor-not-allowed text-sm flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Verifying Credentials...</span>
                  </>
                ) : (
                  <>
                    <KeyIcon className="w-5 h-5" />
                    <span>Authorize &amp; Enter Dashboard</span>
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 pt-4 border-t border-slate-800 text-center">
              <p className="text-[11px] text-slate-500">
                🔒 Enterprise AES-256 JWT Encryption &bull; KahaniLand Administrative Console
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;