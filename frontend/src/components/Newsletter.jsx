// src/components/Newsletter.jsx
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  FaEnvelope,
  FaGift,
  FaBookOpen,
  FaPaintBrush,
  FaRocket,
  FaStar,
  FaCheckCircle,
  FaTimes,
  FaSpinner,
  FaUser,
  FaEnvelopeOpen,
} from "react-icons/fa";
import { newsletterService } from '../services/newsletterService';

const Newsletter = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(location.pathname === '/newsletter');
  const [formData, setFormData] = useState({ name: "", email: "" });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");

  // Open automatically if route is /newsletter
  useEffect(() => {
    if (location.pathname === '/newsletter') {
      setIsOpen(true);
    }
  }, [location.pathname]);

  // Listen for custom event to open newsletter
  useEffect(() => {
    const handleOpenNewsletter = () => {
      setIsOpen(true);
    };

    window.addEventListener('openNewsletter', handleOpenNewsletter);

    return () => {
      window.removeEventListener('openNewsletter', handleOpenNewsletter);
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.name.trim() || !formData.email.trim()) {
      setError("Please fill in both fields.");
      return;
    }

    if (!formData.email.includes("@") || !formData.email.includes(".")) {
      setError("Please enter a valid email address.");
      return;
    }

    if (formData.name.trim().length < 2) {
      setError("Name must be at least 2 characters long.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      // Call API to subscribe
      const response = await newsletterService.subscribe(
        formData.email.trim(),
        formData.name.trim()
      );

      console.log("Newsletter subscription response:", response);

      setSubmitSuccess(true);
      setSubmitMessage("🎉 You've successfully joined the KahaniLand Story Club!");
      setSubmitted(true);
      setFormData({ name: "", email: "" });

      // Close modal after 4 seconds
      setTimeout(() => {
        setIsOpen(false);
        setSubmitted(false);
        setSubmitSuccess(false);
        setSubmitMessage("");
        if (location.pathname === '/newsletter') {
          navigate('/', { replace: true });
        }
      }, 4000);

    } catch (error) {
      console.error("Newsletter subscription error:", error);
      
      // Handle duplicate email error
      if (error.response?.data?.message?.toLowerCase().includes("already")) {
        setError("This email is already subscribed to our newsletter!");
      } else {
        setError(error.response?.data?.message || "Failed to subscribe. Please try again.");
      }
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (isSubmitting) return; // Prevent closing while submitting
    setIsOpen(false);
    setSubmitted(false);
    setSubmitSuccess(false);
    setSubmitMessage("");
    setError("");
    if (location.pathname === '/newsletter') {
      navigate('/', { replace: true });
    }
  };

  // Keyboard shortcut to open newsletter (Ctrl+Shift+N)
  useEffect(() => {
    const handleKeyboardShortcut = (e) => {
      if (e.ctrlKey && e.shiftKey && (e.key === 'N' || e.key === 'n')) {
        e.preventDefault();
        setIsOpen(true);
      }
    };

    document.addEventListener('keydown', handleKeyboardShortcut);
    return () => {
      document.removeEventListener('keydown', handleKeyboardShortcut);
    };
  }, []);

  // Escape key to close
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, isSubmitting]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }

        @keyframes pop-in {
          0% {
            opacity: 0;
            transform: scale(0.7) rotateX(-20deg) translateY(50px);
          }
          70% {
            transform: scale(1.05) rotateX(5deg) translateY(-10px);
          }
          100% {
            opacity: 1;
            transform: scale(1) rotateX(0deg) translateY(0);
          }
        }
        .animate-pop-in {
          animation: pop-in 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }

        @keyframes rocket-float {
          0%, 100% { transform: translateY(0) rotate(-5deg) scale(1); }
          50% { transform: translateY(-12px) rotate(5deg) scale(1.05); }
        }
        .animate-rocket-float {
          animation: rocket-float 3.5s ease-in-out infinite;
        }

        @keyframes rocket-blast {
          0% { transform: translate(0, 0) scale(1); opacity: 1; }
          40% { transform: translate(-15px, 15px) scale(0.9) rotate(-10deg); }
          100% { transform: translate(400px, -400px) scale(1.5); opacity: 0; }
        }
        .animate-rocket-blast {
          animation: rocket-blast 1.4s cubic-bezier(0.6, -0.28, 0.735, 0.045) forwards;
        }

        @keyframes bear-peek {
          0%, 100% { transform: translateY(4px) rotate(2deg); }
          50% { transform: translateY(-3px) rotate(-3deg); }
        }
        .animate-bear-peek {
          animation: bear-peek 4s ease-in-out infinite;
        }

        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        .animate-pulse {
          animation: pulse 1.5s ease-in-out infinite;
        }

        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        .perspective-2000 {
          perspective: 2000px;
        }

        .shake-animation {
          animation: shake 0.5s ease-in-out;
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
      `}</style>

      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-purple-950/60 backdrop-blur-md z-[150] animate-fadeIn"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-[160] flex items-center justify-center p-4 pointer-events-none perspective-2000">
        <div 
          className="no-scrollbar rounded-[2.5rem] shadow-[0_20px_50px_rgba(147,51,234,0.4)] max-w-4xl w-full max-h-[90vh] overflow-y-auto border-4 border-yellow-300 transform-gpu transition-all duration-500 relative animate-pop-in pointer-events-auto p-1 text-white select-none"
          style={{
            backgroundImage: `url("/images/Other/newsLetter_bg.avif")`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        >
          
          {/* Background overlay */}
          <div className="absolute inset-0 opacity-15 pointer-events-none mix-blend-overlay bg-[repeat-x] bottom-0" 
               style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1440 320'%3E%3Cpath fill='%23ffffff' d='M0,288L48,272C96,256,192,224,288,197.3C384,171,480,149,576,165.3C672,181,768,235,864,245.3C960,256,1056,224,1152,197.3C1248,171,1344,149,1392,138.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z'%3E%3C/path%3E%3C/svg%3E")`, backgroundSize: 'contain', backgroundPosition: 'bottom' }} />

          {/* Rocket Animation */}
          <div className={`absolute -left-10 -top-14 z-50 pointer-events-none transition-all duration-700 ${isSubmitting ? 'animate-rocket-blast' : 'animate-rocket-float'}`}>
            <svg width="110" height="110" viewBox="0 0 100 100">
              <defs>
                <linearGradient id="rocketBody" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FF5252" />
                  <stop offset="100%" stopColor="#C62828" />
                </linearGradient>
                <linearGradient id="rocketNose" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FFEB3B" />
                  <stop offset="100%" stopColor="#F57F17" />
                </linearGradient>
              </defs>
              <path d="M25 75 Q10 90 20 80 Q5 95 15 85" stroke="#FF9100" strokeWidth="8" strokeLinecap="round" className={isSubmitting ? 'block' : 'hidden'} />
              <path d="M25 65 L10 75 L20 50 Z" fill="#FF8F00" />
              <path d="M50 40 L65 25 L55 15 Z" fill="#FF8F00" />
              <rect x="20" y="30" width="50" height="35" rx="15" fill="url(#rocketBody)" transform="rotate(-45 45 47)" />
              <path d="M50 15 C65 30 65 30 50 15 Z" fill="url(#rocketNose)" />
              <circle cx="52" cy="42" r="7" fill="#E0F7FA" stroke="#B2EBF2" strokeWidth="2" />
            </svg>
          </div>

          {/* Bear Animation */}
          <div className="absolute right-12 -top-[52px] z-30 pointer-events-none animate-bear-peek">
            <svg width="90" height="60" viewBox="0 0 100 66" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="25" cy="30" r="14" fill="#B07D4F" />
              <circle cx="25" cy="30" r="7" fill="#FFCDA0" />
              <circle cx="75" cy="30" r="14" fill="#B07D4F" />
              <circle cx="75" cy="30" r="7" fill="#FFCDA0" />
              <circle cx="50" cy="45" r="28" fill="#C68B59" />
              <circle cx="50" cy="54" r="11" fill="#FFCDA0" />
              <ellipse cx="50" cy="48" rx="4" ry="2.5" fill="#42210B" />
              <circle cx="38" cy="40" r="4.5" fill="#fff" />
              <circle cx="38" cy="40" r="2.5" fill="#000" />
              <circle cx="62" cy="40" r="4.5" fill="#fff" />
              <circle cx="62" cy="40" r="2.5" fill="#000" />
            </svg>
          </div>

          {/* Close Button */}
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className={`absolute top-4 right-4 text-white hover:text-yellow-300 hover:rotate-90 transition-all duration-300 z-50 bg-pink-600 hover:bg-pink-700 rounded-full p-2 flex items-center justify-center w-10 h-10 border-2 border-white shadow-md cursor-pointer ${
              isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <FaTimes className="text-xl" />
          </button>

          {/* Main Content */}
          <div className="p-5 sm:p-8 relative z-10">
            <div className="text-center mb-6">
              <div className="inline-block p-3.5 bg-yellow-400 rounded-full mb-2 border-2 border-white shadow-md animate-bounce-slow">
                <FaRocket className="text-3xl text-purple-700" />
              </div>
              <h2 className="text-3xl sm:text-4xl font-sans font-black tracking-wide text-white drop-shadow-[0_4px_3px_rgba(0,0,0,0.4)]">
                Join the KahaniLand Story Club 🎉
              </h2>
              <p className="text-yellow-200 font-extrabold text-sm sm:text-base drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]">
                Do you love stories? Then join the KahaniLand Story Club!
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 items-start">
              {/* Left side - Benefits */}
              <div className="bg-white/15 border-2 border-white/30 backdrop-blur-md rounded-2xl p-5 md:p-6 hover:bg-white/25 hover:border-yellow-300 transition-all duration-300 hover:-translate-y-1 transform-gpu shadow-sm">
                <h3 className="text-xl font-bold text-yellow-200 mb-3 flex items-center gap-2">
                  <FaStar className="text-yellow-400" />
                  Story Club members get:
                </h3>
                <ul className="space-y-3 text-white text-sm sm:text-base">
                  <li className="flex items-start gap-3">
                    <span className="text-pink-300 text-lg mt-0.5">
                      <FaEnvelope />
                    </span>
                    <span>
                      <strong>📬 New story updates</strong> – A new story in your inbox every week!
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-orange-300 text-lg mt-0.5">
                      <FaGift />
                    </span>
                    <span>
                      <strong>🎁 Special character adventures</strong> – Exclusive missions with your favourite characters.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-blue-300 text-lg mt-0.5">
                      <FaBookOpen />
                    </span>
                    <span>
                      <strong>📚 Exclusive short stories</strong> – Stories written just for our members.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-300 text-lg mt-0.5">
                      <FaPaintBrush />
                    </span>
                    <span>
                      <strong>🎨 Fun activities for kids</strong> – Colouring, puzzles, and creative challenges.
                    </span>
                  </li>
                </ul>
                <div className="mt-4 p-3 bg-white/10 border-2 border-white/20 rounded-xl backdrop-blur-sm">
                  <p className="text-xs italic text-yellow-200 flex items-start gap-2">
                    <FaRocket className="text-yellow-300 text-lg animate-bounce" />
                    <span>
                      Every newsletter is a <strong>mini‑adventure</strong> that boosts children's imagination.
                    </span>
                  </p>
                </div>
              </div>

              {/* Right side - Form */}
              <div className="bg-white/15 border-2 border-white/30 backdrop-blur-md rounded-2xl p-5 md:p-6 hover:bg-white/25 hover:border-yellow-300 transition-all duration-300 hover:-translate-y-1 transform-gpu shadow-sm">
                <h4 className="text-xl font-bold text-center text-yellow-200 mb-1">
                  👉 Join the Story Club today!
                </h4>
                <p className="text-center text-white/80 mb-4 text-xs">
                  Become part of the KahaniLand family – it's free!
                </p>

                {submitted && submitSuccess ? (
                  <div className="flex flex-col items-center justify-center py-6 text-green-300">
                    <FaCheckCircle className="text-5xl mb-2 animate-pulse" />
                    <p className="text-xl font-bold text-white">🎉 Thank you for joining!</p>
                    <p className="text-white/80 text-sm text-center">
                      {submitMessage || "Check your email for a welcome surprise."}
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-semibold text-yellow-200 mb-1 flex items-center gap-1">
                        <FaUser className="text-xs" />
                        Name
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Your name"
                        className={`w-full px-4 py-2.5 rounded-xl text-sm bg-purple-950/40 border-2 text-white placeholder-purple-200/60 focus:outline-none focus:ring-4 focus:ring-yellow-300 focus:border-yellow-400 font-bold transition-all duration-300 shadow-inner ${
                          error && !formData.name.trim() ? 'border-red-400 ring-2 ring-red-400/50' : 'border-white/40'
                        }`}
                        required
                        disabled={isSubmitting}
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-semibold text-yellow-200 mb-1 flex items-center gap-1">
                        <FaEnvelopeOpen className="text-xs" />
                        Email
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="you@email.com"
                        className={`w-full px-4 py-2.5 rounded-xl text-sm bg-purple-950/40 border-2 text-white placeholder-purple-200/60 focus:outline-none focus:ring-4 focus:ring-yellow-300 focus:border-yellow-400 font-bold transition-all duration-300 shadow-inner ${
                          error && !formData.email.trim() ? 'border-red-400 ring-2 ring-red-400/50' : 'border-white/40'
                        }`}
                        required
                        disabled={isSubmitting}
                      />
                    </div>
                    
                    {error && (
                      <p className="text-red-300 text-sm font-semibold flex items-center gap-1 shake-animation">
                        <span>⚠️</span>
                        {error}
                      </p>
                    )}

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className={`w-full py-3 rounded-2xl font-black text-white shadow-[0_6px_0_#b45309] transition-all duration-300 transform-gpu flex items-center justify-center gap-3 text-base cursor-pointer uppercase tracking-wider relative overflow-hidden border-2 border-white ${
                        isSubmitting 
                          ? 'bg-amber-700 border-gray-400 shadow-none translate-y-[6px]' 
                          : 'bg-gradient-to-r from-yellow-400 via-orange-400 to-yellow-500 hover:from-yellow-300 hover:to-orange-500 active:translate-y-[4px] active:shadow-[0_2px_0_#b45309]'
                      }`}
                    >
                      {isSubmitting ? (
                        <>
                          <FaSpinner className="text-xl animate-spin" />
                          <span>Joining Club...</span>
                        </>
                      ) : (
                        <>
                          <FaRocket className="text-xl" />
                          Join Story Club
                        </>
                      )}
                    </button>
                    
                    <div className="flex items-center justify-center gap-2 text-[10px] text-white/60 mt-1">
                      <span>🔒 No spam, only magical stories.</span>
                      <span className="w-px h-3 bg-white/20"></span>
                      <span>Unsubscribe anytime.</span>
                    </div>
                  </form>
                )}
              </div>
            </div>

            <div className="mt-4 text-center text-purple-100/70 font-bold text-[11px] bg-white/10 rounded-full py-1.5 px-4">
              <p>🧸 Parents Note: We respond super fast inside 24 hours!</p>
            </div>

            {/* Footer with keyboard shortcut hint */}
            <div className="mt-3 text-center text-white/30 text-[10px]">
              Press <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-[9px]">Ctrl</kbd> + <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-[9px]">Shift</kbd> + <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-[9px]">N</kbd> to open
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Newsletter;