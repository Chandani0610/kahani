import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  EnvelopeIcon,
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon,
  BookOpenIcon,
  SparklesIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login, logout } = useAuth();
  const navigate = useNavigate();

  // Clear any browser autofilled admin credentials on page mount
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
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password.');
      return;
    }

    setLoading(true);

    try {
      const response = await login({
        email: email.trim(),
        password,
        portal: 'user',
      });

      // If user is admin/superadmin, give them direct access to admin dashboard
      if (response?.user?.role === 'admin' || response?.user?.role === 'superadmin') {
        navigate('/admin', { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message ||
        err.message ||
        'Invalid email or password.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        backgroundImage: "url('/images/video/vide05.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* 50/50 Split Container */}
      <div className="w-full max-w-4xl backdrop-blur-md bg-white/15 rounded-3xl shadow-2xl relative z-10 border border-white/20 overflow-hidden">
        <div className="flex flex-col md:flex-row">
          
          {/* Left Side - Welcoming Reader Branding */}
          <div
            className="w-full md:w-1/2 p-8 md:p-10 flex flex-col justify-between relative min-h-[420px]"
            style={{
              backgroundImage: "url('/images/Home/background2.avif')",
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
            }}
          >
            <div className="relative z-10">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-white/20 rounded-2xl shadow-lg mb-5 backdrop-blur-md border border-white/30 relative">
                <BookOpenIcon className="w-7 h-7 text-white" />
                <div className="absolute -top-1 -right-1">
                  <SparklesIcon className="w-4 h-4 text-yellow-300 animate-bounce" />
                </div>
              </div>

              <h1 className="text-3xl font-extrabold mb-3 leading-tight">
                <span className="text-yellow-300">Welcome</span>
                <span className="text-white"> Back to </span>
                <span className="text-pink-300">Kahani</span>
                <span className="text-blue-300">Land</span>
              </h1>

              <p className="text-white/90 text-sm leading-relaxed mb-6">
                Discover immersive bedtime stories, enchanting tales, and video adventures created for curious minds.
              </p>

              <div className="space-y-2.5 text-xs text-white/85 font-medium">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-yellow-300"></div>
                  <span>Thousands of captivating stories & audiobooks</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-300"></div>
                  <span>Personal reading bookmarks & history</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-pink-300"></div>
                  <span>Kid-friendly, safe & certified content</span>
                </div>
              </div>
            </div>

            {/* Encouraging reader message */}
            <div className="relative z-10 pt-6 mt-4 border-t border-white/20 flex items-center space-x-2 text-xs text-white/80">
              <SparklesIcon className="w-4 h-4 text-yellow-300" />
              <span>Enjoy unlimited magical stories &amp; audiobooks!</span>
            </div>
          </div>

          {/* Right Side - Modern Login Form */}
          <div className="w-full md:w-1/2 p-8 md:p-10 bg-white/90 backdrop-blur-xl flex flex-col justify-center">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900">User Login</h2>
              <p className="text-gray-600 text-sm mt-1">
                Enter your credentials to continue your journey
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm flex items-start space-x-2">
                <span className="mt-0.5 text-base">⚠️</span>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
              {/* Hidden dummy fields to prevent aggressive browser autofill of saved admin credentials */}
              <input
                type="text"
                name="prevent_autofill_user"
                style={{ display: 'none', position: 'absolute', opacity: 0 }}
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
              />
              <input
                type="password"
                name="prevent_autofill_pass"
                style={{ display: 'none', position: 'absolute', opacity: 0 }}
                tabIndex={-1}
                autoComplete="new-password"
                aria-hidden="true"
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <EnvelopeIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    name="reader_login_email"
                    id="reader_login_email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full pl-10 pr-3 py-2.5 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition text-sm text-gray-900 placeholder-gray-400 shadow-sm"
                    required
                    disabled={loading}
                    autoComplete="off"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-xs text-green-600 hover:text-green-700 font-medium transition"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <LockClosedIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="reader_login_password"
                    id="reader_login_password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full pl-10 pr-11 py-2.5 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition text-sm text-gray-900 placeholder-gray-400 shadow-sm"
                    required
                    disabled={loading}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
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
                    className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                    disabled={loading}
                  />
                  <span className="text-xs text-gray-600">Remember my session</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl hover:from-green-600 hover:to-emerald-700 transition shadow-lg hover:shadow-green-500/30 disabled:opacity-50 disabled:cursor-not-allowed text-sm flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <UserCircleIcon className="w-5 h-5" />
                    <span>Sign In</span>
                  </>
                )}
              </button>
            </form>

            <div className="mt-5 text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <Link
                  to="/register"
                  className="text-green-600 hover:text-green-700 font-bold transition underline"
                >
                  Create one here
                </Link>
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-200 text-center">
              <p className="text-[11px] text-gray-500">
                🔒 Protected with 256-bit SSL encryption &bull; KahaniLand
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;