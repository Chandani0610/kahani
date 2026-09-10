// src/components/JungleFriends.jsx

import { useRef, useState, useEffect, useCallback, useMemo } from "react";
import { Typography } from "@material-tailwind/react";
import { motion } from "framer-motion";

// Pre-load images with priority
const friends = [
  { image: "/images/Home/monkey.avif", priority: true },
  { image: "/images/Home/Tiger.avif", priority: true },
  { image: "/images/Home/rabbit.avif" },
  { image: "/images/Home/girrafe.avif" },
  { image: "/images/Home/owl.avif" },
  { image: "/images/Home/elephant.avif" },
];

// Memoized video sources
const VIDEO_SOURCES = {
  mobile: "/images/Home/backround1.mp4",
  desktop: "/images/Home/background.mp4",
};

// Card entrance animation
const cardVariants = {
  hidden: { opacity: 0, scale: 0.5, rotateY: 90, y: 30 },
  visible: (custom) => {
    const isMobile =
      typeof window !== "undefined" && window.innerWidth < 768;
    return {
      opacity: 1,
      scale: 1,
      rotateY: 0,
      y: 0,
      transition: {
        delay: isMobile ? 0 : custom * 0.08,
        duration: 0.4,
        type: "spring",
        bounce: 0.2,
        stiffness: 300,
      },
    };
  },
};

// Floating animation
const floatingVariants = {
  animate: (index) => ({
    y: [0, -6, 0],
    transition: {
      duration: 2.5,
      repeat: Infinity,
      ease: "easeInOut",
      delay: index * 0.15,
    },
  }),
};

function JungleFriends() {
  const sectionRef = useRef(null);
  const videoRef = useRef(null);
  const [videoSrc, setVideoSrc] = useState(VIDEO_SOURCES.desktop);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Optimized resize handler
  useEffect(() => {
    let timeoutId;
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        const mobile = window.innerWidth < 768;
        setIsMobile(mobile);
        setVideoSrc(mobile ? VIDEO_SOURCES.mobile : VIDEO_SOURCES.desktop);
      }, 150);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(timeoutId);
    };
  }, []);

  // Video initialization – Start with Audio ON
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedData = () => {
      // Video is ready - start the fade from image to video
      setIsVideoReady(true);
      video.muted = false;
      video.volume = 0.5;
      setIsAudioOn(true);

      video
        .play()
        .then(() => {
          console.log("✅ Video playing with Audio ON");
        })
        .catch((err) => {
          console.log("Autoplay prevented:", err);
          // Fallback: mute if autoplay blocked
          video.muted = true;
          setIsAudioOn(false);
          video.play().catch(() => {});
        });
    };

    const handleCanPlayThrough = () => {
      setIsVideoReady(true);
    };

    video.addEventListener("loadeddata", handleLoadedData);
    video.addEventListener("canplaythrough", handleCanPlayThrough);

    return () => {
      video.removeEventListener("loadeddata", handleLoadedData);
      video.removeEventListener("canplaythrough", handleCanPlayThrough);
    };
  }, [videoSrc]);

  // Instant Toggle – No timing delays
  const handleToggleAudio = useCallback(
    (e) => {
      if (e) {
        e.stopPropagation();
        e.preventDefault();
      }

      const video = videoRef.current;
      if (!video || !isVideoReady) {
        console.log("Video not ready yet");
        return;
      }

      const nextState = !isAudioOn;
      video.muted = !nextState;
      video.volume = 0.5;

      if (nextState) {
        video.play().catch(() => {});
      }

      setIsAudioOn(nextState);
      console.log(nextState ? "🔊 Audio ON" : "🔇 Audio OFF");
    },
    [isAudioOn, isVideoReady]
  );

  // Intersection Observer – pause when off-screen
  useEffect(() => {
    const currentSection = sectionRef.current;
    const currentVideo = videoRef.current;
    if (!currentSection || !currentVideo) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && isVideoReady) {
          currentVideo.play().catch(() => {});
        } else {
          currentVideo.pause();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(currentSection);
    return () => {
      if (currentSection) observer.unobserve(currentSection);
    };
  }, [isVideoReady]);

  // Title animation
  const titleVariants = useMemo(
    () => ({
      hidden: { opacity: 0, scale: 0.6, y: -20 },
      visible: {
        opacity: 1,
        scale: 1,
        y: 0,
        transition: {
          type: "spring",
          stiffness: 150,
          damping: 15,
          duration: 0.5,
        },
      },
    }),
    []
  );

  return (
    <>
      {/* Critical CSS - No white flash, fallback image visible immediately */}
      <style>{`
        #jungle-friends-section {
          background: transparent !important;
          background-image: url('/images/Home/fallback-bg.avif') !important;
          background-size: cover !important;
          background-position: center !important;
          background-repeat: no-repeat !important;
        }
        
        /* Smooth fade transition for image to video */
        .fallback-overlay {
          position: absolute;
          inset: 0;
          z-index: 0;
          background-image: url('/images/Home/fallback-bg.avif') !important;
          background-size: cover !important;
          background-position: center !important;
          background-repeat: no-repeat !important;
          will-change: opacity;
          transition: opacity 0.4s ease-in-out !important;
        }
        
        .video-element {
          position: absolute;
          inset: 0;
          z-index: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          pointer-events: none;
          will-change: opacity;
          transition: opacity 0.4s ease-in-out !important;
        }
        
        body {
          background: transparent !important;
          margin: 0;
          padding: 0;
        }
      `}</style>

      <section
        ref={sectionRef}
        id="jungle-friends-section"
        className="relative h-screen w-full overflow-hidden flex flex-col justify-center"
        style={{ 
          willChange: "transform",
          background: "transparent",
          backgroundColor: "transparent",
        }}
        data-testid="jungle-friends-section"
      >
        {/* ============================================ */}
        {/* STEP 1: Show Fallback Background Image (No white screen) */}
        {/* ============================================ */}
        <div
          className="fallback-overlay"
          style={{
            opacity: isVideoReady ? 0 : 1,
            transition: "opacity 0.4s ease-in-out",
          }}
        />

        {/* ============================================ */}
        {/* STEP 2: Load Video in Background (Video is hidden) */}
        {/* ============================================ */}
        <video
          key={videoSrc}
          ref={videoRef}
          src={videoSrc}
          muted={!isAudioOn}
          loop
          playsInline
          preload="auto"
          className="video-element"
          style={{
            opacity: isVideoReady ? 1 : 0,
            transition: "opacity 0.4s ease-in-out",
          }}
        >
          Your browser does not support the video tag.
        </video>

        {/* Transparent overlay for content readability */}
        <div className="absolute inset-0 bg-transparent z-0 pointer-events-none"></div>

        {/* ============================================ */}
        {/* STEP 3-4: Video Ready → Fade from Image to Video */}
        {/* ============================================ */}
        {/* Content Wrapper - Always visible on top */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6">
          {/* Title Section */}
          <div className="mb-6 md:mb-8 text-center md:text-left mt-[10vh] mobile-title-wrapper sm:mt-0 relative z-20">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              variants={titleVariants}
              className="space-y-0.5 md:space-y-1 select-none"
            >
              <Typography
                variant="h1"
                className="text-2xl sm:text-4xl lg:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-200 via-amber-300 to-yellow-400 drop-shadow-[0_2px_0_rgba(120,53,15,0.6)] md:drop-shadow-[0_4px_0_rgba(120,53,15,0.6)] tracking-wide inline-block md:block"
                style={{
                  fontFamily: "'Comic Sans MS', 'Chalkboard SE', sans-serif",
                  WebkitTextStroke: "1px #78350f",
                }}
              >
                Welcome to
              </Typography>

              <Typography
                variant="h1"
                className="text-4xl sm:text-6xl lg:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-b from-green-300 via-emerald-400 to-emerald-500 drop-shadow-[0_3px_0_rgba(6,78,59,0.7)] md:drop-shadow-[0_5px_0_rgba(6,78,59,0.7)] tracking-wider block"
                style={{
                  fontFamily: "'Comic Sans MS', 'Chalkboard SE', sans-serif",
                  WebkitTextStroke: "2px #064e3b",
                  animation: "pulse 2s infinite",
                }}
              >
                KahaniLand
              </Typography>
            </motion.div>
          </div>

          {/* Friends Images */}
          <div
            className={`flex flex-wrap gap-x-2 gap-y-4 ${
              isMobile
                ? "grid grid-cols-3 gap-2"
                : "md:grid md:grid-cols-3 md:gap-2 lg:gap-3 md:w-fit"
            }`}
          >
            {friends.map((friend, index) => (
              <motion.div
                key={index}
                custom={index}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "0px" }}
                variants={cardVariants}
                className="flex justify-start"
              >
                <motion.div
                  variants={floatingVariants}
                  animate="animate"
                  custom={index}
                  whileHover={{
                    scale: 1.1,
                    y: -8,
                    transition: { type: "spring", stiffness: 400, damping: 15 },
                  }}
                  whileTap={{ scale: 0.95 }}
                  className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-full overflow-hidden border-4 border-white/90 shadow-xl bg-white cursor-pointer"
                  style={{ willChange: "transform" }}
                  data-testid={`jungle-friend-${index}`}
                >
                  <img
                    src={friend.image}
                    className="w-full h-full object-cover"
                    alt="Jungle friend"
                    loading={friend.priority ? "eager" : "lazy"}
                    fetchPriority={friend.priority ? "high" : "auto"}
                    decoding="async"
                    width="96"
                    height="96"
                  />
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* ============================================ */}
        {/* STEP 5: Video Playing (No white flash) */}
        {/* ============================================ */}
        {/* Sound Toggle Button – BOTTOM CENTER */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[9999]">
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.92 }}
            onClick={handleToggleAudio}
            data-testid="sound-toggle-button"
            aria-label={isAudioOn ? "Turn sound off" : "Turn sound on"}
            title={isAudioOn ? "Click to Mute" : "Click to Unmute"}
            className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold text-white shadow-lg
                        backdrop-blur-sm border-2 transition-all duration-300 cursor-pointer
                        ${
                          isAudioOn
                            ? "bg-white/10 border-white/30 hover:bg-white/20 hover:border-white/50"
                            : "bg-white/10 border-white/30 hover:bg-white/20 hover:border-white/50"
                        }`}
            style={{
              WebkitTapHighlightColor: "transparent",
              touchAction: "manipulation",
              userSelect: "none",
              fontFamily: "'Comic Sans MS', 'Chalkboard SE', sans-serif",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
            }}
          >
            {/* Icon */}
            <span className="text-lg leading-none">
              {isAudioOn ? "🔊" : "🔇"}
            </span>

            {/* Label */}
            <span className="text-xs sm:text-sm tracking-wide">
              {isAudioOn ? "ON" : "OFF"}
            </span>

            {/* Small status indicator */}
            <span
              className={`w-2 h-2 rounded-full ${
                isAudioOn ? "bg-green-400 animate-pulse" : "bg-gray-400"
              }`}
            />
          </motion.button>
        </div>
      </section>
    </>
  );
}

export default JungleFriends;