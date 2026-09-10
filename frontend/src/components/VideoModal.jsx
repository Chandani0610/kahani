
// src/components/VideoModal.jsx

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const VideoModal = ({ videoId, onClose, getEmbedUrl }) => {
  const [videoLoaded, setVideoLoaded] = useState(false);

  if (!videoId) return null;

  // Reliable YouTube thumbnail
  const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

  // Build fast YouTube embed URL
  const embedUrl = getEmbedUrl
    ? getEmbedUrl(videoId)
    : `https://www.youtube.com/embed/${videoId}?autoplay=1&playsinline=1&rel=0&modestbranding=1`;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.12 }}
        className="fixed inset-0 z-[100000] flex items-center justify-center p-3 md:p-4 bg-indigo-950/90 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.96, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.96, opacity: 0 }}
          transition={{
            duration: 0.12,
            ease: "easeOut",
          }}
          className="relative w-[95%] max-w-4xl rounded-3xl overflow-hidden border-[0.4rem] md:border-[0.6rem] border-yellow-400 bg-slate-900 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            aria-label="Close video"
            className="absolute top-3 right-3 md:top-4 md:right-4 z-30 w-10 h-10 md:w-12 md:h-12 rounded-full bg-red-500 text-white text-lg md:text-xl font-extrabold flex items-center justify-center hover:bg-red-600 border-2 md:border-4 border-white shadow-lg transition-transform hover:scale-110"
          >
            ✕
          </button>

          {/* Video Area */}
          <div className="relative pt-[56.25%] bg-black overflow-hidden">

            {/* Instant Thumbnail */}
            {!videoLoaded && (
              <img
                src={thumbnailUrl}
                alt="Video preview"
                className="absolute inset-0 w-full h-full object-cover"
              />
            )}

            {/* YouTube Video */}
            <iframe
              className={`absolute inset-0 w-full h-full transition-opacity duration-150 ${
                videoLoaded ? "opacity-100" : "opacity-0"
              }`}
              src={embedUrl}
              title="Video Player"
              frameBorder="0"
              loading="eager"
              allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
              allowFullScreen
              referrerPolicy="strict-origin-when-cross-origin"
              onLoad={() => setVideoLoaded(true)}
            />
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default VideoModal;
