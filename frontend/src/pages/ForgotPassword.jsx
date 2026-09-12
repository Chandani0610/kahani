import { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  EnvelopeIcon,
  LockClosedIcon,
  KeyIcon,
  EyeIcon,
  EyeSlashIcon,
  CheckCircleIcon,
  ArrowLeftIcon,
  ShieldCheckIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';

const ForgotPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { forgotPassword, resetPassword } = useAuth();

  const tokenParam = searchParams.get('token') || '';

  // Mode: 'request' (enter email) or 'reset' (enter token + new password)
  const [mode, setMode] = useState(tokenParam ? 'reset' : 'request');
  
  // Step 1: Request reset states
  const [email, setEmail] = useState('');
  const [requestSent, setRequestSent] = useState(false);
  const [obtainedToken, setObtainedToken] = useState('');
  
  // Step 2: Reset states
  const [token, setToken] = useState(tokenParam);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  // Common states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  // Sync token param if URL changes
  useEffect(() => {
    if (tokenParam) {
      setToken(tokenParam);
      setMode('reset');
    }
  }, [tokenParam]);

  // Handle Request Reset Link (Step 1)
  const handleRequestSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }

    setError('');
    setMessage('');
    setLoading(true);

    try {
      const response = await forgotPassword(email.trim());
      setRequestSent(true);
      setMessage(response.message || 'Password reset instructions generated successfully.');
      
      // If token returned in development mode, save it for quick testing
      if (response.token) {
        setObtainedToken(response.token);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to send reset link.');
    } finally {
      setLoading(false);
    }
  };

  // Switch to Reset step with prefilled token
  const handleProceedToReset = (tokenToUse) => {
    setToken(tokenToUse || obtainedToken);
    setMode('reset');
    setError('');
    setMessage('');
  };

  // Handle Set New Password (Step 2)
  const handleResetSubmit = async (e) => {
    e.preventDefault();
    if (!token.trim()) {
      setError('A valid reset token is required.');
      return;
    }
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }

    setError('');
    setMessage('');
    setLoading(true);

    try {
      const response = await resetPassword({
        token: token.trim(),
        newPassword,
      });
      setResetSuccess(true);
      setMessage(response.message || 'Your password has been reset successfully!');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to reset password. The link or token may have expired.');
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
      <div className="w-full max-w-4xl backdrop-blur-md bg-white/10 rounded-3xl shadow-2xl relative z-10 border border-white/20 overflow-hidden">
        <div className="flex flex-col md:flex-row">
          {/* Left Side - Brand Banner */}
          <div
            className="w-full md:w-1/2 p-8 flex flex-col justify-center items-center md:items-start relative min-h-[400px]"
            style={{
              backgroundImage: "url('/images/Home/background2.avif')",
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
            }}
          >
            <div className="relative z-10">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-2xl shadow-lg mb-4 backdrop-blur-sm relative">
                <ShieldCheckIcon className="w-8 h-8 text-white" />
                <div className="absolute -top-1 -right-1">
                  <SparklesIcon className="w-5 h-5 text-yellow-400 animate-pulse" />
                </div>
              </div>

              <h1 className="text-2xl md:text-3xl font-bold mb-2 text-center md:text-left">
                <span className="text-yellow-300">Account</span>
                <span className="text-white"> Recovery </span>
                <span className="text-pink-300">Kahani</span>
                <span className="text-blue-300">Land</span>
              </h1>

              <p className="text-white/90 text-sm text-center md:text-left">
                <span className="text-green-300">Reset</span>
                <span className="text-white"> your password safely with </span>
                <span className="text-yellow-300">verified security</span>
              </p>

              <div className="mt-6 flex flex-col space-y-2 text-xs text-white/80">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-yellow-300 rounded-full"></div>
                  <span>Secure 15-minute encrypted JWT tokens</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-300 rounded-full"></div>
                  <span>Verified account security</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-pink-300 rounded-full"></div>
                  <span>Bcrypt-encrypted password storage</span>
                </div>
              </div>

              {/* Mode indicator tabs */}
              <div className="mt-8 flex bg-black/20 rounded-xl p-1 backdrop-blur-md">
                <button
                  type="button"
                  onClick={() => {
                    setMode('request');
                    setError('');
                  }}
                  className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold transition ${
                    mode === 'request'
                      ? 'bg-white text-gray-900 shadow'
                      : 'text-white/70 hover:text-white'
                  }`}
                >
                  1. Request Link
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode('reset');
                    setError('');
                  }}
                  className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold transition ${
                    mode === 'reset'
                      ? 'bg-white text-gray-900 shadow'
                      : 'text-white/70 hover:text-white'
                  }`}
                >
                  2. Set Password
                </button>
              </div>
            </div>
          </div>

          {/* Right Side - Form */}
          <div className="w-full md:w-1/2 p-8 bg-white/85 backdrop-blur-xl flex flex-col justify-center">
            {resetSuccess ? (
              // Reset Success View
              <div className="text-center py-6">
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircleIcon className="w-10 h-10" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Password Updated!</h2>
                <p className="text-sm text-gray-600 mb-6">
                  Your password has been changed successfully. You can now log into your KahaniLand account.
                </p>
                <div className="space-y-3">
                  <button
                    onClick={() => navigate('/login')}
                    className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl hover:from-green-600 hover:to-emerald-700 transition shadow-md"
                  >
                    Go to Login
                  </button>
                </div>
              </div>
            ) : mode === 'request' ? (
              // Step 1: Request Reset Link Form
              <div>
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Forgot Password?</h2>
                  <p className="text-gray-600 text-sm mt-1">
                    Enter the email associated with your account to receive a password reset link.
                  </p>
                </div>

                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm flex items-start space-x-2">
                    <span className="mt-0.5">⚠️</span>
                    <span>{error}</span>
                  </div>
                )}

                {message && (
                  <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-sm">
                    <p className="font-semibold">{message}</p>
                    {obtainedToken && (
                      <div className="mt-3 pt-2 border-t border-emerald-200/60">
                        <p className="text-xs text-emerald-700 mb-2">
                          Development demo reset token ready:
                        </p>
                        <button
                          type="button"
                          onClick={() => handleProceedToReset(obtainedToken)}
                          className="w-full py-2 px-3 bg-emerald-600 text-white text-xs font-bold rounded-lg hover:bg-emerald-700 transition shadow"
                        >
                          👉 Proceed to Set New Password Now
                        </button>
                      </div>
                    )}
                  </div>
                )}

                <form onSubmit={handleRequestSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Account Email Address
                    </label>
                    <div className="relative">
                      <EnvelopeIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="e.g. user@example.com"
                        className="w-full pl-10 pr-3 py-2.5 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm text-gray-800 transition"
                        required
                        disabled={loading}
                        autoFocus
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl hover:from-green-600 hover:to-emerald-700 transition shadow-lg hover:shadow-green-500/20 disabled:opacity-50 text-sm"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Sending Reset Link...</span>
                      </div>
                    ) : (
                      'Generate Reset Link'
                    )}
                  </button>
                </form>

                <div className="mt-4 text-center">
                  <button
                    type="button"
                    onClick={() => setMode('reset')}
                    className="text-xs text-green-700 hover:text-green-800 font-medium underline"
                  >
                    Already have a reset token? Enter it directly →
                  </button>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-200 flex items-center justify-between text-xs text-gray-600">
                  <Link to="/login" className="flex items-center space-x-1 text-green-600 hover:text-green-700 font-semibold">
                    <ArrowLeftIcon className="w-3.5 h-3.5" />
                    <span>Back to Login</span>
                  </Link>
                  <span className="text-gray-400">KahaniLand Security</span>
                </div>
              </div>
            ) : (
              // Step 2: Reset Password with Token
              <div>
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Set New Password</h2>
                  <p className="text-gray-600 text-sm mt-1">
                    Enter your verification token and your new chosen password.
                  </p>
                </div>

                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm flex items-start space-x-2">
                    <span className="mt-0.5">⚠️</span>
                    <span>{error}</span>
                  </div>
                )}

                <form onSubmit={handleResetSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Reset Token
                    </label>
                    <div className="relative">
                      <KeyIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={token}
                        onChange={(e) => setToken(e.target.value)}
                        placeholder="Paste verification token"
                        className="w-full pl-10 pr-3 py-2.5 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent text-xs text-gray-800 font-mono transition"
                        required
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      New Password
                    </label>
                    <div className="relative">
                      <LockClosedIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="At least 6 characters"
                        className="w-full pl-10 pr-12 py-2.5 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm text-gray-800 transition"
                        required
                        disabled={loading}
                        minLength={6}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                      >
                        {showPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <LockClosedIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter new password"
                        className="w-full pl-10 pr-3 py-2.5 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm text-gray-800 transition"
                        required
                        disabled={loading}
                        minLength={6}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl hover:from-green-600 hover:to-emerald-700 transition shadow-lg hover:shadow-green-500/20 disabled:opacity-50 text-sm"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Resetting Password...</span>
                      </div>
                    ) : (
                      'Update Password'
                    )}
                  </button>
                </form>

                <div className="mt-6 pt-4 border-t border-gray-200 flex items-center justify-between text-xs text-gray-600">
                  <button
                    type="button"
                    onClick={() => {
                      setMode('request');
                      setError('');
                    }}
                    className="flex items-center space-x-1 text-gray-600 hover:text-gray-800 font-medium"
                  >
                    <ArrowLeftIcon className="w-3.5 h-3.5" />
                    <span>Back to Request Link</span>
                  </button>
                  <Link to="/login" className="text-green-600 hover:text-green-700 font-semibold">
                    Sign In
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
