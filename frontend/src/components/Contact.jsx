import { useState, useEffect } from 'react';
import { FaEnvelope, FaPhone, FaMapMarker, FaTimes, FaPaperPlane } from 'react-icons/fa';
import { contactService } from '../services/contactService';

const Contact = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
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
    setIsSubmitting(true);
    setError('');

    try {
      await contactService.submit(formData);
      setSubmitStatus('success');
      setFormData({ name: '', email: '', subject: '', message: '' });
      
      setTimeout(() => {
        onClose();
        setSubmitStatus(null);
      }, 2500);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send message. Please try again.');
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes pop-in {
          0% { opacity: 0; transform: scale(0.7) translateY(50px); }
          70% { transform: scale(1.05) translateY(-10px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes rocket-float {
          0%, 100% { transform: translateY(0) rotate(-5deg); }
          50% { transform: translateY(-12px) rotate(5deg); }
        }
        @keyframes rocket-blast {
          0% { transform: translate(0, 0) scale(1); opacity: 1; }
          100% { transform: translate(400px, -400px) scale(1.5); opacity: 0; }
        }
        @keyframes bear-peek {
          0%, 100% { transform: translateY(4px) rotate(2deg); }
          50% { transform: translateY(-3px) rotate(-3deg); }
        }
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        
        .animate-fadeIn { animation: fadeIn 0.3s ease-out forwards; }
        .animate-pop-in { animation: pop-in 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
        .animate-rocket-float { animation: rocket-float 3.5s ease-in-out infinite; }
        .animate-rocket-blast { animation: rocket-blast 1.4s cubic-bezier(0.6, -0.28, 0.735, 0.045) forwards; }
        .animate-bear-peek { animation: bear-peek 4s ease-in-out infinite; }
        .animate-bounce-slow { animation: bounce-slow 2s ease-in-out infinite; }

        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

        .contact-modal {
          width: 92%;
          max-width: 28rem;
          max-height: 90vh;
          border-radius: clamp(1.5rem, 3vw, 2.5rem);
          padding: 1%;
          border: 4px solid #fcd34d;
        }

        @media (max-width: 480px) {
          .contact-modal {
            width: 95%;
            border-radius: 1rem;
          }
          .contact-modal h2 {
            font-size: clamp(1.2rem, 5vw, 1.5rem) !important;
          }
          .contact-info-grid {
            grid-template-columns: 1fr !important;
            gap: 0.5rem !important;
          }
          .rocket-icon, .bear-icon {
            display: none !important;
          }
          .close-btn {
            width: 2rem !important;
            height: 2rem !important;
            top: 0.5rem !important;
            right: 0.5rem !important;
          }
          .close-btn svg {
            font-size: 0.8rem !important;
          }
        }

        @media (min-width: 481px) and (max-width: 768px) {
          .contact-modal {
            max-width: 90%;
          }
          .contact-info-grid {
            grid-template-columns: 1fr 1fr 1fr !important;
          }
        }
      `}</style>

      <div 
        className="fixed inset-0 bg-purple-950/50 backdrop-blur-md z-[150] animate-fadeIn"
        onClick={onClose}
      />
      
      <div className="fixed inset-0 z-[160] flex items-center justify-center p-[2%] pointer-events-none">
        <div 
          className="contact-modal no-scrollbar shadow-[0_20px_50px_rgba(147,51,234,0.4)] transform-gpu transition-all duration-500 relative animate-pop-in pointer-events-auto text-white select-none overflow-y-auto"
          style={{
            backgroundImage: `url("/images/Other/contact_bg.avif")`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        >
          <div className="absolute inset-0 opacity-15 pointer-events-none mix-blend-overlay bg-[repeat-x] bottom-0" 
               style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1440 320'%3E%3Cpath fill='%23ffffff' d='M0,288L48,272C96,256,192,224,288,197.3C384,171,480,149,576,165.3C672,181,768,235,864,245.3C960,256,1056,224,1152,197.3C1248,171,1344,149,1392,138.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z'%3E%3C/path%3E%3C/svg%3E")`, backgroundSize: 'contain', backgroundPosition: 'bottom' }} />

          <div className={`rocket-icon absolute -left-[10%] -top-[14%] z-50 pointer-events-none transition-all duration-700 ${isSubmitting ? 'animate-rocket-blast' : 'animate-rocket-float'}`}>
            <svg width="clamp(60px, 10vw, 110px)" height="clamp(60px, 10vw, 110px)" viewBox="0 0 100 100">
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

          <div className="bear-icon absolute right-[12%] -top-[clamp(30px,5vw,52px)] z-30 pointer-events-none animate-bear-peek">
            <svg width="clamp(50px, 8vw, 90px)" height="clamp(35px, 5vw, 60px)" viewBox="0 0 100 66" fill="none">
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

          <button
            onClick={onClose}
            className="close-btn absolute top-[3%] right-[3%] text-white hover:text-yellow-300 hover:rotate-90 transition-all duration-300 z-50 bg-pink-600 hover:bg-pink-700 rounded-full p-[2%] flex items-center justify-center w-[10%] max-w-[2.5rem] aspect-square border-2 border-white shadow-md cursor-pointer"
          >
            <FaTimes className="text-[clamp(0.8rem,1.5vw,1.5rem)]" />
          </button>

          <div className="p-[5%] sm:p-[6%] relative z-10">
            <div className="text-center mb-[6%]">
              <div className="inline-block p-[3%] bg-yellow-400 rounded-full mb-[2%] border-2 border-white shadow-md animate-bounce-slow">
                <FaEnvelope className="text-[clamp(1.5rem,3vw,2.5rem)] text-purple-700" />
              </div>
              <h2 className="text-[clamp(1.5rem,4vw,2.5rem)] font-black tracking-wide text-white drop-shadow-[0_4px_3px_rgba(0,0,0,0.4)]">
                Let's Talk! 🌟
              </h2>
              <p className="text-yellow-200 font-extrabold text-[clamp(0.7rem,1.2vw,1rem)] drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]">
                Bache aur Parents, humse baat karein!
              </p>
            </div>

            <div className="contact-info-grid grid grid-cols-3 gap-[2%] mb-[5%]">
              <div className="bg-white/15 border-2 border-white/30 backdrop-blur-md rounded-2xl p-[3%] text-center hover:bg-white/25 hover:border-yellow-300 transition-all duration-300 hover:-translate-y-1">
                <div className="bg-blue-400 p-[3%] rounded-full w-[30%] max-w-[2.5rem] aspect-square flex items-center justify-center mx-auto mb-[2%] border border-white">
                  <FaEnvelope className="text-white text-[clamp(0.5rem,1vw,0.8rem)]" />
                </div>
                <p className="text-yellow-200 text-[clamp(0.4rem,0.6vw,0.6rem)] font-black uppercase tracking-wider">Email</p>
                <p className="text-white text-[clamp(0.4rem,0.6vw,0.6rem)] font-bold truncate">hello@kahaniland.com</p>
              </div>

              <div className="bg-white/15 border-2 border-white/30 backdrop-blur-md rounded-2xl p-[3%] text-center hover:bg-white/25 hover:border-yellow-300 transition-all duration-300 hover:-translate-y-1">
                <div className="bg-green-400 p-[3%] rounded-full w-[30%] max-w-[2.5rem] aspect-square flex items-center justify-center mx-auto mb-[2%] border border-white">
                  <FaPhone className="text-white text-[clamp(0.5rem,1vw,0.8rem)]" />
                </div>
                <p className="text-yellow-200 text-[clamp(0.4rem,0.6vw,0.6rem)] font-black uppercase tracking-wider">Phone</p>
                <p className="text-white text-[clamp(0.4rem,0.6vw,0.6rem)] font-bold truncate">+1 (555) 123-4567</p>
              </div>

              <div className="bg-white/15 border-2 border-white/30 backdrop-blur-md rounded-2xl p-[3%] text-center hover:bg-white/25 hover:border-yellow-300 transition-all duration-300 hover:-translate-y-1">
                <div className="bg-pink-400 p-[3%] rounded-full w-[30%] max-w-[2.5rem] aspect-square flex items-center justify-center mx-auto mb-[2%] border border-white">
                  <FaMapMarker className="text-white text-[clamp(0.5rem,1vw,0.8rem)]" />
                </div>
                <p className="text-yellow-200 text-[clamp(0.4rem,0.6vw,0.6rem)] font-black uppercase tracking-wider">Magic Place</p>
                <p className="text-white text-[clamp(0.4rem,0.6vw,0.6rem)] font-bold truncate">KahaniLand Box</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-[3%]">
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-[4%] py-[3%] text-[clamp(0.7rem,0.9vw,0.9rem)] bg-purple-950/40 border-2 border-white/40 rounded-2xl text-white placeholder-purple-200/60 focus:outline-none focus:ring-4 focus:ring-yellow-300 focus:border-yellow-400 font-bold transition-all duration-300"
                placeholder="✍️ Type Your Magic Name..."
              />

              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-[4%] py-[3%] text-[clamp(0.7rem,0.9vw,0.9rem)] bg-purple-950/40 border-2 border-white/40 rounded-2xl text-white placeholder-purple-200/60 focus:outline-none focus:ring-4 focus:ring-yellow-300 focus:border-yellow-400 font-bold transition-all duration-300"
                placeholder="✉️ Type Super Dad/Mom Email..."
              />

              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                className="w-full px-[4%] py-[3%] text-[clamp(0.7rem,0.9vw,0.9rem)] bg-purple-950/40 border-2 border-white/40 rounded-2xl text-white placeholder-purple-200/60 focus:outline-none focus:ring-4 focus:ring-yellow-300 focus:border-yellow-400 font-bold transition-all duration-300"
                placeholder="📌 Subject (Optional)"
              />

              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                rows="3"
                className="w-full px-[4%] py-[3%] text-[clamp(0.7rem,0.9vw,0.9rem)] bg-purple-950/40 border-2 border-white/40 rounded-2xl text-white placeholder-purple-200/60 focus:outline-none focus:ring-4 focus:ring-yellow-300 focus:border-yellow-400 font-bold transition-all duration-300 resize-none h-[clamp(5rem,8vw,7rem)]"
                placeholder="💬 Write us a cute message or secret..."
              />

              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-[3%] rounded-2xl font-black text-white shadow-[0_6px_0_#b45309] transition-all duration-300 transform-gpu flex items-center justify-center gap-[2%] text-[clamp(0.8rem,1vw,1rem)] cursor-pointer uppercase tracking-wider relative overflow-hidden border-2 border-white ${
                  isSubmitting 
                    ? 'bg-amber-700 border-gray-400 shadow-none translate-y-[6px]' 
                    : 'bg-gradient-to-r from-yellow-400 via-orange-400 to-yellow-500 hover:from-yellow-300 hover:to-orange-500 active:translate-y-[4px] active:shadow-[0_2px_0_#b45309]'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <span className="animate-spin text-[clamp(1rem,1.5vw,1.5rem)]">✨</span>
                    <span>Launching Message...</span>
                  </>
                ) : submitStatus === 'success' ? (
                  <>
                    <span className="text-[clamp(1rem,1.5vw,1.5rem)] animate-bounce">🎉</span>
                    <span>Yay! Message Landed!</span>
                  </>
                ) : (
                  <>
                    <span>Send Message</span>
                    <FaPaperPlane className="text-[clamp(0.5rem,0.7vw,0.7rem)] group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>

              {error && (
                <div className="text-center text-red-300 font-black text-[clamp(0.6rem,0.8vw,0.8rem)] bg-red-900/20 py-[2%] rounded-xl border border-red-300/40">
                  ⚠️ {error}
                </div>
              )}

              {submitStatus === 'success' && (
                <div className="text-center text-yellow-300 font-black text-[clamp(0.6rem,0.8vw,0.8rem)] animate-fadeIn bg-black/20 py-[2%] rounded-xl border border-dashed border-yellow-300/40">
                  🚀 Magic Rocket sent your letter into the stars successfully!
                </div>
              )}
            </form>

            <div className="mt-[4%] text-center text-purple-100/70 font-bold text-[clamp(0.4rem,0.6vw,0.6rem)] bg-white/10 rounded-full py-[1%]">
              <p>🧸 Parents Note: We respond super fast inside 24 hours!</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Contact;