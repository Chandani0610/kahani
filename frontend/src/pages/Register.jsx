import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  UserIcon, 
  EnvelopeIcon, 
  LockClosedIcon,
  PhoneIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      setError('Please enter a valid email address');
      setLoading(false);
      return;
    }

    try {
      // Call register with object parameter as expected by AuthContext
      await register({
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim() || '',
        password: formData.password
      });
      
      navigate('/');
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
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
            {/* Dark Overlay for better readability */}
            <div className="absolute inset-0 bg-black/20"></div>
            
            {/* Content */}
            <div className="relative z-10">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-2xl shadow-lg mb-4 backdrop-blur-sm">
                <span className="text-white font-bold text-3xl">K</span>
              </div>
              
              {/* Multi-colored text */}
              <h1 className="text-2xl md:text-3xl font-bold mb-2 text-center md:text-left">
                <span className="text-yellow-300">Welcome</span>
                <span className="text-white"> to </span>
                <span className="text-pink-300">Kahani</span>
                <span className="text-blue-300">Land</span>
              </h1>
              
              <p className="text-white/90 text-sm text-center md:text-left">
                <span className="text-green-300">Create</span>
                <span className="text-white"> your account and </span>
                <span className="text-yellow-300">start</span>
                <span className="text-white"> your </span>
                <span className="text-pink-300">journey</span>
              </p>
              
              <div className="mt-4 flex items-center space-x-2">
                <div className="w-2 h-2 bg-yellow-300 rounded-full"></div>
                <span className="text-xs text-white/80">
                  <span className="text-green-300">Join</span>
                  <span className="text-white"> thousands of </span>
                  <span className="text-pink-300">happy</span>
                  <span className="text-white"> readers</span>
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

          {/* Right Side - Registration Form - Transparent - 50% */}
          <div className="w-full md:w-1/2 p-8 bg-transparent">
            <div className="text-left mb-6">
              <h2 className="text-2xl font-bold text-black">Create Account</h2>
              <p className="text-gray-700 text-sm mt-1">Fill in your details to get started</p>
            </div>

            {error && (
              <div className="mb-4 p-2.5 bg-red-100 border border-red-300 text-red-700 rounded-xl text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-800 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-600" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full pl-10 pr-3 py-2.5 bg-white/70 backdrop-blur-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition text-sm text-gray-800 placeholder-gray-500"
                    placeholder="Enter your name"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-800 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-600" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full pl-10 pr-3 py-2.5 bg-white/70 backdrop-blur-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition text-sm text-gray-800 placeholder-gray-500"
                    placeholder="Enter your email"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-800 mb-1">
                  Phone Number (Optional)
                </label>
                <div className="relative">
                  <PhoneIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-600" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full pl-10 pr-3 py-2.5 bg-white/70 backdrop-blur-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition text-sm text-gray-800 placeholder-gray-500"
                    placeholder="Enter your phone no"
                    disabled={loading}
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
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full pl-10 pr-12 py-2.5 bg-white/70 backdrop-blur-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition text-sm text-gray-800 placeholder-gray-500"
                    placeholder="Enter your password"
                    required
                    minLength="6"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
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

              <div>
                <label className="block text-sm font-medium text-gray-800 mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <LockClosedIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-600" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full pl-10 pr-12 py-2.5 bg-white/70 backdrop-blur-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition text-sm text-gray-800 placeholder-gray-500"
                    placeholder="Enter your confirm password"
                    required
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    disabled={loading}
                  >
                    {showConfirmPassword ? (
                      <EyeSlashIcon className="w-5 h-5" />
                    ) : (
                      <EyeIcon className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all shadow-lg hover:shadow-green-500/30 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                {loading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Creating account...</span>
                  </div>
                ) : (
                  'Create Account'
                )}
              </button>
            </form>

            <div className="mt-5 text-center">
              <p className="text-sm text-gray-700">
                Already have an account?{' '}
                <Link to="/login" className="text-green-600 hover:text-green-700 font-medium transition">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;