import { useState, useEffect, useRef } from "react";
import { motion, useAnimation } from "framer-motion";
import {
  FaYoutube,
  FaFacebook,
  FaHome,
  FaBookOpen,
  FaVideo,
  FaStar,
  FaGem,
  FaExternalLinkAlt,
  
  
} from "react-icons/fa";
//import { Link } from "react-router-dom";

const Footer = () => {
  const currentYear = 2026;
  const [email, setEmail] = useState("");
  const controls = useAnimation();
  const timerRef = useRef(null);

  const handleViewportEnter = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    controls.start({ 
      opacity: 1, 
      y: 0,
      transition: { type: "spring", stiffness: 100, damping: 15, bounce: 0.3 }
    });
  };

  const handleViewportLeave = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    controls.set({ opacity: 0, y: 40 });
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-fadeInUp");
          }
        });
      },
      { threshold: 0.1 }
    );

    const elements = document.querySelectorAll(".footer-animate");
    elements.forEach((el) => observer.observe(el));

    return () => {
      elements.forEach((el) => observer.unobserve(el));
    };
  }, []);

  const handleNavigation = (e, href) => {
    e.preventDefault();
    const targetHref = href === "#home" ? "#characters" : href;
    const element = document.querySelector(targetHref);

    if (element) {
      const headerOffset = 90;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  const handleSocialClick = (e, link) => {
    e.preventDefault();
    if (link && link !== "#") {
      window.open(link, "_blank", "noopener,noreferrer");
    }
  };

  const handleCompanyClick = (e) => {
    e.preventDefault();
    window.open("https://technovani.com", "_blank", "noopener,noreferrer");
  };

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (email) {
      setEmail("");
      alert("Thank you for subscribing to KahaniLand! 🎉");
    }
  };

  const socialLinks = [
    {
      name: "YouTube",
      icon: <FaYoutube size={22} />,
      hoverColor: "hover:text-red-500 hover:scale-120 hover:rotate-6",
      link: "https://www.youtube.com/@KahaniLandOfficial",
    },
    {
      name: "Facebook",
      icon: <FaFacebook size={22} />,
      hoverColor: "hover:text-blue-500 hover:scale-120 hover:-rotate-6",
      link: "https://www.facebook.com/KahaniLand",
    },
  ];

  const footerSections = [
    {
      title: "Explore",
      links: [
        { name: "Home", href: "#home", icon: <FaHome className="text-xs" />, color: "text-sky-400 group-hover:animate-bounce" },
        { name: "Videos", href: "#videos", icon: <FaVideo className="text-xs" />, color: "text-rose-400 group-hover:animate-bounce" },
        { name: "Stories", href: "#stories", icon: <FaBookOpen className="text-xs" />, color: "text-lime-400 group-hover:animate-bounce" },
      ],
    },
  ];

  return (
    <footer
      className="relative overflow-hidden w-full select-none py-6 px-4 sm:px-6 bg-cover bg-center bg-[url('/images/video/footer.png')] md:bg-[url('/images/video/footer.png')]"
    >
      <style>{`
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(15px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-bounce-slow { animation: bounce-slow 2.5s ease-in-out infinite; }
        .animate-fadeInUp { animation: fadeInUp 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
        .animate-spin-slow { animation: spin-slow 8s linear infinite; }
        .footer-animate { opacity: 0; }

        .wood-board-container {
          background-color: #fce7c4;
          background-image: 
            repeating-linear-gradient(90deg, rgba(139, 92, 26, 0.04) 0px, rgba(139, 92, 26, 0.04) 4px, transparent 4px, transparent 30px),
            linear-gradient(to bottom, #fce7c4 0%, #f9d29d 100%);
          border-radius: 30px 15px 30px 15px / 15px 30px 15px 30px;
          border: 8px solid #7c2d12;
          box-shadow: 
            inset 0 0 15px rgba(124, 45, 18, 0.3),
            0 10px 25px rgba(0, 0, 0, 0.35),
            0 0 0 3px #451a03;
          position: relative;
        }

        .engraved-title {
          font-family: 'Comic Sans MS', 'Chalkboard SE', sans-serif;
          font-weight: 900;
          color: #451a03;
          text-shadow: 1px 1px 0px rgba(255, 255, 255, 0.7);
        }

        .engraved-text {
          color: #7c2d12;
          font-weight: 800;
          font-family: 'Comic Sans MS', sans-serif;
        }

        .wood-input {
          background: #ffffff;
          border: 2.5px solid #7c2d12;
          color: #451a03;
          font-weight: 800;
          border-radius: 14px;
          box-shadow: inset 0 3px 0px rgba(124, 45, 18, 0.15);
          transition: all 0.2s ease;
        }
        .wood-input:focus {
          border-color: #f59e0b;
          outline: none;
        }

        .rainbow-btn {
          background: linear-gradient(90deg, #ff4b5c, #ff9f43, #10ac84, #00d2d3, #54a0ff, #9b5de5);
          background-size: 200% auto;
          color: #ffffff;
          font-weight: 900;
          text-shadow: 0 1.5px 3px rgba(0,0,0,0.4);
          border: 2.5px solid #451a03;
          border-radius: 14px;
          box-shadow: 0 4px 0px #451a03;
          transition: all 0.2s ease;
        }
        .rainbow-btn:hover {
          background-position: right center;
          transform: translateY(-1px);
          box-shadow: 0 5px 0px #451a03;
        }
        .rainbow-btn:active {
          transform: translateY(2px);
          box-shadow: 0 2px 0px #451a03;
        }

        .rainbow-divider {
          height: 5px;
          background: linear-gradient(90deg, #ff4b5c, #ff9f43, #10ac84, #00d2d3, #54a0ff);
          border-radius: 99px;
          border: 1.5px solid #451a03;
        }

        .wood-leg-left, .wood-leg-right {
          position: absolute;
          bottom: -28px;
          width: 24px;
          height: 32px;
          background: #451a03;
          border: 2.5px solid #1c0d02;
          z-index: -1;
        }
        .wood-leg-left { left: 14%; border-radius: 0 0 8px 12px; transform: rotate(-3deg); }
        .wood-leg-right { right: 14%; border-radius: 0 0 12px 8px; transform: rotate(3deg); }
      `}</style>

      <motion.div 
        id="wood-footer-board"
        initial={{ opacity: 0, y: 40 }} 
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, amount: 0.15 }}
        onViewportEnter={handleViewportEnter}
        onViewportLeave={handleViewportLeave}
        animate={controls}
        className="relative w-full max-w-3xl mx-auto mt-16 mb-4 p-4 sm:p-7 wood-board-container"
      >
        <FaStar className="absolute top-3 left-3 text-amber-500 text-lg animate-spin-slow" />
        <FaGem className="absolute top-3 right-3 text-emerald-500 text-lg animate-pulse" />
        <FaStar className="absolute bottom-14 left-3 text-rose-500 text-lg animate-pulse" />
        <FaGem className="absolute bottom-14 right-3 text-sky-500 text-lg animate-spin-slow" />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-3 items-start text-center">
          {/* Brand */}
          <div className="flex flex-col items-center footer-animate w-full">
            <div className="flex flex-col items-center gap-0.5 mb-1">
  <img
    src="/images/Navbar/logo.avif"
    alt="KahaniLand"
    className="h-14 sm:h-16 object-contain animate-bounce-slow brightness-0 invert"
  />
  <h2 className="engraved-title text-2xl sm:text-3xl tracking-wide text-white font-bold drop-shadow-lg">
    KahaniLand
  </h2>
</div>
            <p className="engraved-text text-xs italic mb-1 text-amber-900">
              Every Story, a New Adventure ✨
            </p>
            <p className="engraved-text text-[11px] max-w-xs leading-relaxed opacity-90">
              A magical world of stories for kids.
            </p>

            <div className="flex gap-3 mt-3 justify-center">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.link}
                  onClick={(e) => handleSocialClick(e, social.link)}
                  className={`text-[#451a03] p-1.5 bg-white/40 rounded-full border-2 border-transparent hover:border-[#451a03] hover:bg-white transition-all duration-300 ${social.hoverColor} shadow-sm`}
                  aria-label={social.name}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {footerSections.map((section, idx) => (
            <div
              key={section.title}
              className="flex flex-col items-center footer-animate w-full md:pt-2"
              style={{ animationDelay: `${(idx + 1) * 0.12}s` }}
            >
              <h3 className="engraved-title text-lg mb-2.5 border-b-2 border-[#7c2d12]/20 pb-0.5 px-4">
                🧸 {section.title}
              </h3>
              <ul className="flex flex-col items-center space-y-1.5 w-full max-w-[180px]">
                {section.links.map((link) => (
                  <li key={link.name} className="w-full">
                    <a
                      href={link.href}
                      onClick={(e) => handleNavigation(e, link.href)}
                      className="group flex items-center justify-center gap-2 engraved-text py-1.5 px-3 rounded-xl hover:bg-white border-2 border-transparent hover:border-[#451a03] transition-all duration-200 text-xs shadow-sm bg-white/30"
                    >
                      <span className={`${link.color}`}>{link.icon}</span>
                      <span className="text-[#451a03]">{link.name}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Newsletter */}
          <div className="flex flex-col items-center footer-animate w-full md:pt-2" style={{ animationDelay: '0.24s' }}>
            <h3 className="engraved-title text-lg mb-2 border-b-2 border-[#7c2d12]/20 pb-0.5 px-4">
              🚀 Newsletter
            </h3>
            <p className="engraved-text text-[11px] mb-2.5 max-w-xs opacity-90">
              Subscribe for magical updates!
            </p>
            <form onSubmit={handleNewsletterSubmit} className="flex flex-col gap-2 w-full max-w-[240px]">
              <input
                type="email"
                placeholder="Your magical email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 text-xs text-center wood-input"
                required
              />
              <button type="submit" className="w-full py-2 text-xs font-black uppercase tracking-wider rainbow-btn cursor-pointer">
                Join the Fun! 🎉
              </button>
            </form>
          </div>
        </div>

        {/* Divider */}
        <div className="relative mt-5 pt-2">
          <div className="rainbow-divider mb-3 mx-auto max-w-xl"></div>
          <div className="flex flex-col justify-center items-center text-center">
            <p className="engraved-text text-[11px] flex flex-wrap items-center justify-center gap-0.5 text-amber-950">
              © {currentYear} 
              <a href="#" onClick={handleCompanyClick} className="font-black text-amber-900 underline hover:text-amber-700 inline-flex items-center gap-0.5 mx-1">
                Technovani <FaExternalLinkAlt className="text-[8px]" />
              </a>
              • All rights reserved.
            </p>
          </div>
        </div>

        {/* Legs */}
        <div className="hidden sm:block wood-leg-left"></div>
        <div className="hidden sm:block wood-leg-right"></div>
      </motion.div>
    </footer>
  );
};

export default Footer;