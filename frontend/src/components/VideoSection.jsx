
// src/components/VideoSection.jsx

import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import {
  FaFilter,
  FaStar,
  FaArrowLeft,
  FaPlay,
  FaClock,
} from "react-icons/fa";

import { motion } from "framer-motion";

import { videoService } from "../services/videoService";

import VideoCard from "./VideoCard";
import VideoModal from "./VideoModal";
import Navbar from "./Navbar";

const VideoSection = ({
  videos: propVideos,
  showOnlyGrid = false,
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  // ==========================================
  // STATE
  // ==========================================

  const [fetchedVideos, setFetchedVideos] = useState([]);

  const [hasLoaded, setHasLoaded] = useState(
    propVideos !== undefined
  );

  const [error, setError] = useState(null);

  const [modal, setModal] = useState(null);

  const [showFilters, setShowFilters] = useState(false);

  // ==========================================
  // URL CATEGORY
  // ==========================================

  const params = useMemo(
    () => new URLSearchParams(location.search),
    [location.search]
  );

  const initialCategory =
    params.get("category") || null;

  const [selectedCategory, setSelectedCategory] =
    useState(initialCategory);

  // ==========================================
  // VIDEO SOURCE
  // ==========================================

  /*
    Home.jsx already sends videos.

    Therefore:
    Home page  -> use propVideos
    All Videos -> fetch from API
  */

  const rawVideos =
    propVideos !== undefined
      ? propVideos
      : fetchedVideos;

  // ==========================================
  // FETCH VIDEOS
  // ==========================================

  const fetchVideos = useCallback(async () => {
    try {
      setError(null);

      const data = await videoService.getAll();

      setFetchedVideos(
        Array.isArray(data) ? data : []
      );

      setHasLoaded(true);
    } catch (err) {
      console.error(
        "Error fetching videos:",
        err
      );

      setError(
        "Failed to load videos. Please try again."
      );

      setHasLoaded(true);
    }
  }, []);

  // ==========================================
  // FETCH ONLY FOR STANDALONE PAGE
  // ==========================================

  useEffect(() => {
    if (propVideos !== undefined) {
      return;
    }

    const timeoutId = setTimeout(() => {
      fetchVideos();
    }, 0);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [propVideos, fetchVideos]);

  // ==========================================
  // EXTRACT YOUTUBE VIDEO ID
  // ==========================================

  const extractVideoId = useCallback((url) => {
    if (!url || typeof url !== "string") {
      return null;
    }

    const cleanUrl = url.trim();

    const patterns = [
      /youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/,
      /youtube\.com\/watch\?.*v=([a-zA-Z0-9_-]{11})/,
      /youtu\.be\/([a-zA-Z0-9_-]{11})/,
      /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
      /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
      /^([a-zA-Z0-9_-]{11})$/,
    ];

    for (const pattern of patterns) {
      const match = cleanUrl.match(pattern);

      if (match) {
        return match[1];
      }
    }

    return null;
  }, []);

  // ==========================================
  // YOUTUBE THUMBNAIL
  // ==========================================

  const getThumbnail = useCallback(
    (videoId) => {
      if (!videoId) {
        return "/images/video-placeholder.jpg";
      }

      /*
        mqdefault is lightweight and loads faster.
      */

      return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
    },
    []
  );

  // ==========================================
  // YOUTUBE EMBED URL
  // ==========================================

  const getEmbedUrl = useCallback(
    (videoId) => {
      if (!videoId) {
        return "";
      }

      return `https://www.youtube.com/embed/${videoId}?autoplay=1&playsinline=1&rel=0&modestbranding=1`;
    },
    []
  );

  // ==========================================
  // VALID VIDEOS
  // ==========================================

  const validVideos = useMemo(() => {
    if (!Array.isArray(rawVideos)) {
      return [];
    }

    return rawVideos.filter((video) =>
      extractVideoId(video?.youtube_url)
    );
  }, [rawVideos, extractVideoId]);

  // ==========================================
  // CATEGORIES
  // ==========================================

  const categories = useMemo(() => {
    const unique = new Set(
      validVideos
        .map((video) => video?.category)
        .filter(Boolean)
    );

    return [...unique];
  }, [validVideos]);

  // ==========================================
  // FILTER VIDEOS
  // ==========================================

  const filteredVideos = useMemo(() => {
    if (!selectedCategory) {
      return validVideos;
    }

    return validVideos.filter(
      (video) =>
        video.category === selectedCategory
    );
  }, [selectedCategory, validVideos]);

  // ==========================================
  // SYNC CATEGORY WITH URL
  // ==========================================

  useEffect(() => {
    if (!showOnlyGrid) {
      return;
    }

    const currentParams = new URLSearchParams(
      location.search
    );

    if (selectedCategory) {
      currentParams.set(
        "category",
        selectedCategory
      );
    } else {
      currentParams.delete("category");
    }

    const queryString =
      currentParams.toString();

    const targetPath = queryString
      ? `/all-videos?${queryString}`
      : "/all-videos";

    const currentPath =
      `${location.pathname}${location.search}`;

    if (currentPath !== targetPath) {
      navigate(targetPath, {
        replace: true,
      });
    }
  }, [
    selectedCategory,
    navigate,
    showOnlyGrid,
    location.search,
    location.pathname,
  ]);

  // ==========================================
  // CATEGORY CLICK
  // ==========================================

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
    setShowFilters(false);
  };

  // ==========================================
  // CLEAR FILTER
  // ==========================================

  const clearFilters = () => {
    setSelectedCategory(null);
    setShowFilters(false);

    if (showOnlyGrid) {
      navigate("/all-videos", {
        replace: true,
      });
    }
  };

  // ==========================================
  // VIEW ALL VIDEOS
  // ==========================================

  const handleViewAllVideos = () => {
    const queryParams = new URLSearchParams();

    if (selectedCategory) {
      queryParams.set(
        "category",
        selectedCategory
      );
    }

    const queryString =
      queryParams.toString();

    navigate(
      queryString
        ? `/all-videos?${queryString}`
        : "/all-videos"
    );
  };

  // ==========================================
  // LIGHTWEIGHT ANIMATION
  // ==========================================

  const keyframeAnimationCSS = `
    @keyframes floatUpward {

      0% {
        transform:
          translate3d(0, 105vh, 0)
          rotate(0deg);
      }

      25% {
        transform:
          translate3d(
            calc(var(--x-offset) * 0.4),
            72vh,
            0
          )
          rotate(1.5deg);
      }

      50% {
        transform:
          translate3d(
            calc(var(--x-offset) * -0.4),
            40vh,
            0
          )
          rotate(-1.5deg);
      }

      75% {
        transform:
          translate3d(
            calc(var(--x-offset) * 0.2),
            12vh,
            0
          )
          rotate(0.8deg);
      }

      100% {
        transform:
          translate3d(0, -35vh, 0)
          rotate(0deg);
      }
    }
  `;

  // ==========================================
  // PARACHUTE COLORS
  // ==========================================

  const parachutePatterns = [
    [
      "from-red-500 to-orange-500",
      "from-amber-400 to-yellow-300",
      "from-teal-400 to-cyan-500",
      "from-pink-500 to-purple-600",
    ],

    [
      "from-cyan-500 to-blue-600",
      "from-pink-400 to-rose-500",
      "from-yellow-400 to-amber-300",
      "from-orange-500 to-red-500",
    ],
  ];

  // ==========================================
  // ERROR STATE
  // ==========================================

  if (error && showOnlyGrid) {
    return (
      <>
        <Navbar />

        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 to-indigo-900 p-4">

          <div className="bg-red-500/20 border-2 border-red-400 text-red-200 px-6 py-5 rounded-xl max-w-md text-center">

            <p className="text-4xl mb-3">
              😅
            </p>

            <p className="font-bold">
              {error}
            </p>

            <button
              onClick={fetchVideos}
              className="mt-4 px-6 py-2 bg-yellow-400 text-purple-900 rounded-xl font-bold hover:bg-yellow-300 transition"
            >
              Try Again 🔄
            </button>

          </div>
        </div>
      </>
    );
  }

  // ==========================================
  // ALL VIDEOS GRID
  // ==========================================

  if (showOnlyGrid) {
    return (
      <>
        <Navbar />

        <section className="min-h-screen w-full relative py-8 px-4 md:py-12 md:px-8 page-content">

          {/* Background */}
          <div
            className="absolute inset-0 w-full h-full z-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage:
                "url('/images/video/vide05.png')",
            }}
          />

          <div className="absolute inset-0 bg-white/10 z-0" />

          <div className="relative z-10 max-w-7xl mx-auto">

            {/* =====================================
                FILTERS
            ===================================== */}

            <div className="mb-8">

              <button
                onClick={() =>
                  setShowFilters(
                    !showFilters
                  )
                }
                className="md:hidden flex items-center justify-center gap-2 px-6 py-3 bg-white/90 backdrop-blur-sm rounded-full border border-white/20 font-bold text-gray-700 w-full"
              >
                <FaFilter />

                {showFilters
                  ? "Hide Categories"
                  : "Show Categories"}
              </button>

              <div
                className={`mt-4 ${
                  showFilters
                    ? "block"
                    : "hidden md:block"
                }`}
              >

                <div className="flex flex-wrap gap-2.5">

                  {/* ALL */}
                  <button
                    onClick={clearFilters}
                    className={`px-5 py-2.5 rounded-full font-bold flex items-center gap-2 border-2 shadow-sm backdrop-blur-sm ${
                      !selectedCategory
                        ? "bg-yellow-400 text-yellow-900 border-yellow-500 scale-105 shadow-md"
                        : "bg-white/80 text-gray-800 border-white/30 hover:bg-white"
                    }`}
                  >
                    <FaStar
                      className={
                        !selectedCategory
                          ? "text-yellow-600"
                          : "text-gray-400"
                      }
                    />

                    All
                  </button>

                  {/* CATEGORIES */}
                  {categories.map(
                    (category) => (
                      <button
                        key={category}
                        onClick={() =>
                          handleCategoryClick(
                            category
                          )
                        }
                        className={`px-5 py-2.5 rounded-full font-bold border-2 shadow-sm backdrop-blur-sm ${
                          selectedCategory ===
                          category
                            ? "bg-yellow-400 text-yellow-900 border-yellow-500 scale-105 shadow-md"
                            : "bg-white/80 text-gray-800 border-white/30 hover:bg-white"
                        }`}
                      >
                        {category}
                      </button>
                    )
                  )}

                </div>
              </div>
            </div>

            {/* =====================================
                VIDEO GRID
            ===================================== */}

            {!hasLoaded ? null : filteredVideos.length === 0 ? (

              <div className="text-center py-16 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-lg">

                <p className="text-4xl mb-4">
                  🎬
                </p>

                <h3 className="text-2xl font-bold text-white">
                  No videos found
                </h3>

                <p className="text-gray-300 mt-2">
                  Try selecting a different category
                </p>

              </div>

            ) : (

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">

                {filteredVideos.map(
                  (video, index) => {

                    const videoId =
                      extractVideoId(
                        video.youtube_url
                      );

                    if (!videoId) {
                      return null;
                    }

                    return (
                      <motion.div
                        key={
                          video.id || index
                        }
                        initial={{
                          opacity: 0,
                          y: 15,
                        }}
                        animate={{
                          opacity: 1,
                          y: 0,
                        }}
                        transition={{
                          duration: 0.25,
                          delay:
                            index * 0.02,
                        }}
                        className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-200 hover:-translate-y-1 cursor-pointer border border-white/20"
                        onClick={() =>
                          setModal(videoId)
                        }
                      >

                        {/* Thumbnail */}
                        <div className="relative aspect-video overflow-hidden bg-gray-100">

                          <img
                            src={getThumbnail(
                              videoId
                            )}
                            alt={
                              video.title ||
                              "Video"
                            }
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                            loading={
                              index < 4
                                ? "eager"
                                : "lazy"
                            }
                            decoding="async"
                            fetchPriority={
                              index < 4
                                ? "high"
                                : "auto"
                            }
                          />

                          {/* Play */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-150 flex items-center justify-center">

                            <div className="w-14 h-14 bg-yellow-400 rounded-full flex items-center justify-center shadow-xl">

                              <FaPlay className="text-gray-900 text-xl ml-1" />

                            </div>

                          </div>

                          {/* Duration */}
                          {video.duration && (
                            <div className="absolute bottom-3 right-3 bg-black/80 text-white text-xs font-bold px-2.5 py-1 rounded-md flex items-center gap-1">

                              <FaClock className="text-yellow-400 text-[10px]" />

                              {video.duration}

                            </div>
                          )}

                        </div>

                        {/* Grid Title */}
                        <div className="p-4">

                          <h3 className="text-gray-800 font-bold text-base line-clamp-2 group-hover:text-yellow-600 transition-colors">

                            {video.title ||
                              "Untitled Video"}

                          </h3>

                          {video.category && (
                            <span className="inline-block mt-2 px-3 py-1 bg-yellow-100 text-yellow-700 text-xs font-semibold rounded-full">
                              {video.category}
                            </span>
                          )}

                        </div>

                      </motion.div>
                    );
                  }
                )}

              </div>
            )}

            {/* =====================================
                BACK TO TOP
            ===================================== */}

            {filteredVideos.length > 0 && (
              <div className="flex justify-center mt-12">

                <button
                  onClick={() =>
                    window.scrollTo({
                      top: 0,
                      behavior: "smooth",
                    })
                  }
                  className="px-8 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-yellow-950 font-black rounded-full transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 flex items-center gap-3"
                >

                  <FaArrowLeft className="rotate-90" />

                  Back to Top

                </button>

              </div>
            )}

          </div>

          {/* Modal */}
          <VideoModal
            videoId={modal}
            onClose={() =>
              setModal(null)
            }
            getEmbedUrl={getEmbedUrl}
          />

        </section>
      </>
    );
  }

  // ==========================================
  // HOME / FLYING VIDEO VIEW
  // ==========================================

  return (
    <div className="relative w-full h-[100vh] overflow-hidden flex flex-col select-none z-20">

      {/* Animation CSS */}
      <style>
        {keyframeAnimationCSS}
      </style>

      {/* Background */}
      <div
        className="absolute inset-0 w-full h-full z-0 bg-cover bg-center bg-no-repeat brightness-110 saturate-110"
        style={{
          backgroundImage:
            "url('/images/video/vide05.png')",
        }}
      />

      {/* ========================================
          FLYING VIDEO CARDS
      ======================================== */}

      <div className="absolute inset-0 w-full h-full z-10">

        <div className="relative w-full h-full">

          {validVideos
            .slice(0, 5)
            .map((video, index) => {

              const videoId =
                extractVideoId(
                  video.youtube_url
                );

              if (!videoId) {
                return null;
              }

              return (
                <VideoCard
                  key={`flying-${video.id}-${index}`}
                  video={video}
                  videoId={videoId}
                  idx={index}
                  parachutePatterns={
                    parachutePatterns
                  }
                  getThumbnail={
                    getThumbnail
                  }
                  setModal={setModal}
                  hideTitle={true}
                />
              );
            })}

        </div>
      </div>

      {/* ========================================
          WATCH ALL VIDEOS
      ======================================== */}

      {validVideos.length > 0 && (
        <div className="absolute bottom-8 left-0 right-0 z-30 flex justify-center">

          <button
            onClick={handleViewAllVideos}
            className="group px-10 py-4 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 border-b-4 border-yellow-600 text-yellow-950 font-black rounded-full transition-all duration-300 text-lg shadow-2xl hover:scale-105 active:scale-95 flex items-center gap-3"
          >

            <FaPlay className="group-hover:animate-bounce" />

            Watch All Videos

            <span className="text-sm font-normal opacity-75">
              ({validVideos.length} videos)
            </span>

          </button>

        </div>
      )}

      {/* ========================================
          VIDEO MODAL
      ======================================== */}

      <VideoModal
        videoId={modal}
        onClose={() =>
          setModal(null)
        }
        getEmbedUrl={getEmbedUrl}
      />

    </div>
  );
};

export default VideoSection;
