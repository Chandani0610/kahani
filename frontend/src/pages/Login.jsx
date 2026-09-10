import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  EnvelopeIcon,
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon,
  ShieldCheckIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // ✅ FIXED: Pass as object with email and password
      const response = await login({
        email: email.trim(),
        password,
      });

      if (response?.user?.role === 'admin' || response?.user?.role === 'superadmin') {
        navigate('/admin', { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'Invalid email or password.');
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
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Card with 50/50 split */}
      <div className="w-full max-w-4xl backdrop-blur-md bg-white/10 rounded-3xl shadow-2xl relative z-10 border border-white/20 overflow-hidden">
        <div className="flex flex-col md:flex-row">
          {/* Left Side - Title/Branding with Background Image - 50% */}
          <div 
            className="w-full md:w-1/2 p-8 flex flex-col justify-center items-center md:items-start relative min-h-[400px]"
            style={{
              backgroundImage: "url('/images/Home/background2.avif')",
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat'
            }}
          >
            {/* Content */}
            <div className="relative z-10">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-2xl shadow-lg mb-4 backdrop-blur-sm relative">
                <ShieldCheckIcon className="w-8 h-8 text-white" />
                <div className="absolute -top-1 -right-1">
                  <SparklesIcon className="w-5 h-5 text-yellow-400 animate-pulse" />
                </div>
              </div>
              
              {/* Multi-colored text */}
              <h1 className="text-2xl md:text-3xl font-bold mb-2 text-center md:text-left">
                <span className="text-yellow-300">Welcome</span>
                <span className="text-white"> Back to </span>
                <span className="text-pink-300">Kahani</span>
                <span className="text-blue-300">Land</span>
              </h1>
              
              <p className="text-white/90 text-sm text-center md:text-left">
                <span className="text-green-300">Sign in</span>
                <span className="text-white"> to manage your </span>
                <span className="text-yellow-300">content</span>
              </p>
              
              <div className="mt-4 flex items-center space-x-2">
                <div className="w-2 h-2 bg-yellow-300 rounded-full"></div>
                <span className="text-xs text-white/80">
                  <span className="text-green-300">Secure</span>
                  <span className="text-white"> • </span>
                  <span className="text-pink-300">256-bit</span>
                  <span className="text-white"> encryption</span>
                </span>
              </div>

              {/* Decorative multi-colored dots */}
              <div className="mt-6 flex space-x-2">
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-300 animate-pulse"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-pink-300 animate-pulse delay-100"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-blue-300 animate-pulse delay-200"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-green-300 animate-pulse delay-300"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-purple-300 animate-pulse delay-400"></div>
              </div>
            </div>
          </div>

          {/* Right Side - Login Form - Transparent - 50% */}
          <div className="w-full md:w-1/2 p-8 bg-transparent">
            <div className="text-left mb-6">
              <h2 className="text-2xl font-bold text-black">Welcome Back!</h2>
              <p className="text-gray-700 text-sm mt-1">Sign in to manage your content</p>
            </div>

            {error && (
              <div className="mb-4 p-2.5 bg-red-100 border border-red-300 text-red-700 rounded-xl text-sm flex items-start space-x-2">
                <span className="mt-0.5">⚠️</span>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
              <div>
                <label className="block text-sm font-medium text-gray-800 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-600" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full pl-10 pr-3 py-2.5 bg-white/70 backdrop-blur-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition text-sm text-gray-800 placeholder-gray-500"
                    required
                    disabled={loading}
                    autoComplete="off"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-800 mb-1">
                  Password
                </label>
                <div className="relative">
                  <LockClosedIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-600" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full pl-10 pr-12 py-2.5 bg-white/70 backdrop-blur-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition text-sm text-gray-800 placeholder-gray-500"
                    required
                    disabled={loading}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition"
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

              <div className="flex items-center justify-between">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 text-green-500 border-gray-300 rounded focus:ring-green-500"
                    disabled={loading}
                  />
                  <span className="text-sm text-gray-700">Remember me</span>
                </label>
                <Link
                  to="/forgot-password"
                  className="text-sm text-green-600 hover:text-green-700 font-medium transition"
                >
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all shadow-lg hover:shadow-green-500/30 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                {loading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Signing in...</span>
                  </div>
                ) : (
                  'Sign in'
                )}
              </button>
            </form>

            <div className="mt-5 text-center">
              <p className="text-sm text-gray-700">
                Don't have an account?{' '}
                <Link to="/register" className="text-green-600 hover:text-green-700 font-medium transition">
                  Sign up
                </Link>
              </p>
            </div>

            <div className="mt-5 pt-4 border-t border-gray-200 text-center">
              <p className="text-xs text-gray-500">
                🔒 Secure Login • 256-bit Encryption
              </p>
              <p className="text-[10px] text-gray-400 mt-1">
                &copy; {new Date().getFullYear()} KahaniLand. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;