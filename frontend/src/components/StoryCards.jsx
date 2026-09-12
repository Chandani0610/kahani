// src/components/StoryCards.jsx

import { useState, useEffect, useMemo, useCallback } from "react";

import { useLocation, useNavigate } from "react-router-dom";

import { motion } from "framer-motion";

import {
  FaBookOpen,
  FaArrowLeft,
  FaClock,
  FaFilter,
} from "react-icons/fa";

import StoryModal from "./StoryModal";

import { storyService } from "../services/storyService";

import Navbar from "./Navbar";
import { StoryCardSkeleton } from "./common/LoadingComponents";

// ======================================================
// BACKEND IMAGE URL
// ======================================================

const getBackendImageUrl = (story) => {
  if (!story) return "";

  const id = story.id || story._id;

  if (!id) return "";

  // First priority: normalized image_url
  if (
    typeof story.image_url === "string" &&
    story.image_url.trim()
  ) {
    return story.image_url.trim();
  }

  // Second priority: direct image
  if (
    typeof story.image === "string" &&
    story.image.trim()
  ) {
    return story.image.trim();
  }

  // Get axios base URL
  const baseURL = String(
    storyService?.api?.defaults?.baseURL || ""
  ).replace(/\/+$/, "");

  if (baseURL) {
    return `${baseURL}/stories/${id}/image`;
  }

  // Safe fallback
  return `/api/stories/${id}/image`;
};

// ======================================================
// STORY CARD
// ======================================================

const StoryCard = ({ story, index, handleOpen }) => {
  const [imageError, setImageError] = useState(false);

  const imageUrl = useMemo(() => {
    const id = story?.id || story?._id;

    if (!id) {
      return "/images/Stories/Adventuretales.avif";
    }

    /*
     * IMPORTANT:
     * Recent API does not send the actual LONGBLOB.
     * It sends image metadata.
     *
     * Therefore directly use:
     *
     * /api/stories/:id/image
     */

    const normalizedUrl =
      typeof story?.image_url === "string"
        ? story.image_url.trim()
        : "";

    if (normalizedUrl) {
      return normalizedUrl;
    }

    const image =
      typeof story?.image === "string"
        ? story.image.trim()
        : "";

    if (image) {
      return image;
    }

    return `/api/stories/${id}/image`;
  }, [story]);

  const formattedReadTime = useMemo(() => {
    if (!story?.read_time) return "5 Min";
    const rt = String(story.read_time);
    return rt.toLowerCase().includes("min") ? rt : `${rt} Min`;
  }, [story]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.25,
        delay: index < 6 ? index * 0.02 : 0,
      }}
      className="
        group
        bg-white
        rounded-3xl
        overflow-hidden
        shadow-md
        hover:shadow-2xl
        transition-all
        duration-300
        hover:-translate-y-2
        cursor-pointer
        border-2
        border-amber-200/80
        hover:border-amber-400
        flex
        flex-col
        relative
      "
      onClick={() =>
        handleOpen(
          story,
          imageError
            ? "/images/Stories/Adventuretales.avif"
            : imageUrl
        )
      }
    >
      {/* =================================================
          IMAGE (Focus on Top & Middle, Bottom Part Removed)
      ================================================== */}
      <div className="relative aspect-[4/3] overflow-hidden bg-amber-50/50 flex items-center justify-center">
        {!imageError ? (
          <img
            src={imageUrl}
            alt={story.title || "Story"}
            className="
              w-full
              h-full
              object-cover
              object-top
              origin-top
              group-hover:scale-105
              transition-transform
              duration-500
              ease-out
            "
            loading={index < 4 ? "eager" : "lazy"}
            decoding="async"
            fetchPriority={index < 2 ? "high" : "auto"}
            onError={() => {
              setImageError(true);
            }}
          />
        ) : (
          <img
            src="/images/Stories/Adventuretales.avif"
            alt={story.title || "Story"}
            className="w-full h-full object-cover object-top"
          />
        )}

        {/* Hover Book Glow */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
          <div className="w-12 h-12 bg-amber-400 text-amber-950 rounded-full flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-200">
            <FaBookOpen className="text-xl" />
          </div>
        </div>

        {/* Category Pill Top Left */}
        {story.category && (
          <div className="absolute top-3 left-3 z-10">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/95 backdrop-blur-md text-[11px] font-black text-amber-900 shadow-sm border border-amber-200/70">
              <span>✨</span>
              <span>{story.category}</span>
            </span>
          </div>
        )}
      </div>

      {/* =================================================
          STORY CONTENT
      ================================================== */}
      <div className="p-5 flex-1 flex flex-col justify-between bg-gradient-to-b from-white to-amber-50/25">
        <div>
          <h3 className="text-amber-950 font-black text-base sm:text-lg line-clamp-1 group-hover:text-amber-600 transition-colors leading-snug">
            {story.title || "Untitled Story"}
          </h3>

          <p className="text-slate-500 text-xs sm:text-sm mt-1.5 line-clamp-2 leading-relaxed font-medium">
            {story.description ||
              story.story?.substring(0, 110) ||
              "Explore this magical illustrated story adventure!"}
          </p>
        </div>

        {/* Bottom Metadata & CTA Action */}
        <div className="mt-4 pt-3 border-t border-amber-100/90 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-amber-800 bg-amber-100/80 px-2.5 py-1 rounded-lg">
              🎈 {story.age_group || "All Ages"}
            </span>
            <span className="text-xs font-bold text-amber-800 bg-amber-100/80 px-2 py-1 rounded-lg flex items-center gap-1">
              <FaClock className="text-amber-600 text-[10px]" />
              <span>{formattedReadTime}</span>
            </span>
          </div>

          <div className="px-3.5 py-1.5 bg-gradient-to-r from-amber-400 via-orange-400 to-yellow-400 group-hover:from-amber-500 group-hover:to-orange-500 text-amber-950 font-black text-xs rounded-xl shadow-xs group-hover:shadow transition-all flex items-center gap-1.5 border-b border-amber-600">
            <span>Read</span>
            <span className="group-hover:translate-x-0.5 transition-transform">📖✨</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// ======================================================
// EMPTY STATE
// ======================================================

const EmptyState = () => (
  <div
    className="
      text-center
      py-16
      bg-white/80
      backdrop-blur-md
      rounded-3xl
      border-2
      border-dashed
      border-gray-300
    "
  >
    <div className="text-6xl mb-4">🦖</div>

    <p className="text-gray-700 text-2xl font-bold">
      No stories found!
    </p>

    <p className="text-gray-500 mt-2">
      Check back later for more stories.
    </p>
  </div>
);

// ======================================================
// STORY CARDS
// ======================================================

const StoryCards = ({
  showOnlyGrid = false,
  stories: propStories,
  loading: propLoading,
}) => {
  const location = useLocation();
  const navigate = useNavigate();

  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(
    propLoading !== undefined ? propLoading : propStories === undefined
  );
  const [error, setError] = useState(null);

  const rawStories = propStories !== undefined ? propStories : stories;
  const isLoading =
    propLoading !== undefined
      ? propLoading
      : propStories !== undefined
      ? false
      : loading;

  const [open, setOpen] = useState(false);
  const [selectedStory, setSelectedStory] = useState(null);

  const [showFilters, setShowFilters] = useState(false);

  // ====================================================
  // CATEGORY
  // ====================================================

  const params = useMemo(
    () => new URLSearchParams(location.search),
    [location.search]
  );

  const urlCategory = params.get("category");

  const [selectedCategory, setSelectedCategory] =
    useState(urlCategory || null);

  const allCategories = [
    "All",
    "Storytelling",
    "Entertainment",
    "Documentary",
    "Educational",
  ];

  // ====================================================
  // FETCH STORIES
  // ====================================================

  const fetchStories = useCallback(async () => {
    if (propStories !== undefined) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      let response;

      if (!showOnlyGrid) {
        // HOME = ONLY 4
        response = await storyService.getRecent(4);
      } else {
        // ALL STORIES PAGE = ALL
        response = await storyService.getAll();
      }

      let storiesData = [];

      if (Array.isArray(response)) {
        storiesData = response;
      } else if (
        response?.data &&
        Array.isArray(response.data)
      ) {
        storiesData = response.data;
      } else if (
        response?.stories &&
        Array.isArray(response.stories)
      ) {
        storiesData = response.stories;
      }

      console.log(
        `📚 StoryCards received ${storiesData.length} stories`
      );

      setStories(storiesData);
    } catch (err) {
      console.error(
        "❌ Error fetching stories:",
        err
      );

      setError(
        err?.message ||
          "Failed to load stories. Please try again."
      );

      setStories([]);
    } finally {
      setLoading(false);
    }
  }, [showOnlyGrid, propStories]);

  // ====================================================
  // LOAD
  // ====================================================

  useEffect(() => {
    if (propStories !== undefined) return;

    const loadStories = setTimeout(() => {
      fetchStories();
    }, 0);

    return () => clearTimeout(loadStories);
  }, [fetchStories, propStories]);

  // ====================================================
  // URL CATEGORY SYNC
  // ====================================================

  useEffect(() => {
    if (!showOnlyGrid) return;

    const currentParams =
      new URLSearchParams(location.search);

    const currentCategory =
      currentParams.get("category");

    if (
      selectedCategory &&
      selectedCategory !== currentCategory
    ) {
      currentParams.set(
        "category",
        selectedCategory
      );

      navigate(
        `/all-stories?${currentParams.toString()}`,
        {
          replace: true,
        }
      );
    }

    if (
      !selectedCategory &&
      currentCategory
    ) {
      currentParams.delete("category");

      const query =
        currentParams.toString();

      navigate(
        `/all-stories${
          query
            ? `?${query}`
            : ""
        }`,
        {
          replace: true,
        }
      );
    }
  }, [
    selectedCategory,
    location.search,
    navigate,
    showOnlyGrid,
  ]);

  // ====================================================
  // FILTER
  // ====================================================

  const filteredStories = useMemo(() => {
    if (
      !showOnlyGrid ||
      !selectedCategory ||
      selectedCategory === "All"
    ) {
      return rawStories;
    }

    return rawStories.filter(
      (story) =>
        story.category ===
        selectedCategory
    );
  }, [
    rawStories,
    selectedCategory,
    showOnlyGrid,
  ]);

  // ====================================================
  // OPEN STORY
  // ====================================================

  const handleOpen = (story, currentImageUrl) => {
    const id = story?.id || story?._id;
    if (!id) return;

    const finalImage =
      currentImageUrl ||
      (typeof story?.image === "string" && story.image.trim()) ||
      (typeof story?.image_url === "string" && story.image_url.trim()) ||
      `/api/stories/${id}/image`;

    navigate(`/story/${id}`, {
      state: { cardImage: finalImage, story },
    });
  };

  // ====================================================
  // CLOSE STORY
  // ====================================================

  const handleClose = () => {
    setOpen(false);
    setSelectedStory(null);
  };

  // ====================================================
  // CATEGORY CLICK
  // ====================================================

  const handleCategoryClick = (
    category
  ) => {
    const newCategory =
      category === "All"
        ? null
        : category;

    setSelectedCategory(
      newCategory
    );

    setShowFilters(false);

    if (newCategory) {
      navigate(
        `/all-stories?category=${encodeURIComponent(
          newCategory
        )}`
      );
    } else {
      navigate(
        "/all-stories"
      );
    }
  };

  // ====================================================
  // VIEW ALL
  // ====================================================

  const handleViewAllStories = () => {
    navigate(
      "/all-stories"
    );
  };

  // ====================================================
  // RETRY
  // ====================================================

  const handleRetry = () => {
    fetchStories();
  };

  // ====================================================
  // ERROR
  // ====================================================

  if (error) {
    return (
      <div
        className="
          w-full
          min-h-[400px]
          flex
          flex-col
          items-center
          justify-center
          p-4
        "
      >
        <div
          className="
            bg-white
            border-2
            border-red-200
            text-red-600
            px-6
            py-5
            rounded-xl
            max-w-md
            text-center
            shadow-lg
          "
        >
          <p className="text-4xl mb-2">
            😅
          </p>

          <p className="font-bold">
            {error}
          </p>

          <button
            onClick={handleRetry}
            className="
              mt-4
              px-6
              py-2
              bg-gray-800
              text-white
              rounded-xl
              font-bold
              hover:bg-gray-700
              transition
            "
          >
            Try Again 🔄
          </button>
        </div>
      </div>
    );
  }

  // ====================================================
  // CATEGORY FILTER
  // ====================================================

  const renderCategoryFilter = () => (
    <>
      <div className="mb-6">
        <button
          onClick={() =>
            setShowFilters(
              !showFilters
            )
          }
          className="
            md:hidden
            flex
            items-center
            justify-center
            gap-2
            px-6
            py-3
            bg-white/90
            backdrop-blur-sm
            rounded-full
            border
            border-white/20
            font-bold
            text-gray-700
            w-full
            hover:bg-white
            transition
          "
        >
          <FaFilter />

          {showFilters
            ? "Hide Categories"
            : "Show Categories"}
        </button>
      </div>

      <div
        className={`${
          showFilters
            ? "block"
            : "hidden md:block"
        } mb-8`}
      >
        <div className="flex flex-wrap gap-2.5">
          {allCategories.map(
            (category) => {
              const active =
                selectedCategory ===
                  category ||
                (!selectedCategory &&
                  category ===
                    "All");

              return (
                <button
                  key={category}
                  onClick={() =>
                    handleCategoryClick(
                      category
                    )
                  }
                  className={`
                    px-5
                    py-2.5
                    rounded-full
                    font-bold
                    transition-all
                    duration-200
                    border-2
                    shadow-sm
                    backdrop-blur-sm

                    ${
                      active
                        ? "bg-yellow-400 text-yellow-900 border-yellow-500 scale-105 shadow-md"
                        : "bg-white/80 text-gray-800 border-white/30 hover:bg-white"
                    }
                  `}
                >
                  {category ===
                  "All"
                    ? "📚 All"
                    : category}
                </button>
              );
            }
          )}
        </div>
      </div>
    </>
  );

  // ====================================================
  // ALL STORIES PAGE
  // ====================================================

  if (showOnlyGrid) {
    return (
      <>
        <Navbar
          storyCount={
            filteredStories.length
          }
          categoryCount={0}
        />

        <section
          className="
            min-h-screen
            w-full
            relative
            overflow-hidden
          "
        >
          <img
            src="/images/Other/auth.png"
            alt=""
            className="
              fixed
              inset-0
              w-full
              h-full
              object-cover
              z-0
              pointer-events-none
            "
          />

          <div
            className="
              fixed
              inset-0
              bg-white/10
              z-0
              pointer-events-none
            "
          />

          <div
            className="
              relative
              z-10
              max-w-7xl
              mx-auto
              px-4
              md:px-8
              pb-20
            "
          >
            <div className="pt-[4cm]" />

            {renderCategoryFilter()}

            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {Array.from({ length: 8 }).map((_, idx) => (
                  <StoryCardSkeleton key={`all-stories-skel-${idx}`} />
                ))}
              </div>
            ) : filteredStories.length === 0 ? (
              <EmptyState />
            ) : (
              <div
                className="
                  grid
                  grid-cols-1
                  sm:grid-cols-2
                  lg:grid-cols-3
                  xl:grid-cols-4
                  gap-6
                "
              >
                {filteredStories.map(
                  (
                    story,
                    index
                  ) => (
                    <StoryCard
                      key={
                        story._id ||
                        story.id ||
                        index
                      }
                      story={
                        story
                      }
                      index={
                        index
                      }
                      handleOpen={
                        handleOpen
                      }
                    />
                  )
                )}
              </div>
            )}

            {filteredStories.length >
              0 && (
              <button
                onClick={() =>
                  window.scrollTo(
                    {
                      top: 0,
                      behavior:
                        "smooth",
                    }
                  )
                }
                aria-label="Back to top"
                className="
                  fixed
                  bottom-8
                  right-8
                  p-4
                  bg-yellow-400
                  rounded-full
                  shadow-lg
                  hover:scale-110
                  transition-transform
                  z-30
                  border-2
                  border-yellow-500
                "
              >
                <FaArrowLeft
                  className="
                    rotate-90
                    text-yellow-950
                    text-xl
                  "
                />
              </button>
            )}
          </div>

          <StoryModal
            isOpen={open}
            story={selectedStory}
            onClose={handleClose}
          />
        </section>
      </>
    );
  }

  // ====================================================
  // HOME - ONLY 4 STORIES
  // ====================================================

  const homeStories =
    rawStories.slice(0, 4);

  return (
    <>
      <section
        className="
          w-full
          relative
          overflow-hidden
          py-10
          md:py-14
        "
      >
        <img
          src="/images/Other/auth.png"
          alt=""
          className="
            absolute
            inset-0
            w-full
            h-full
            object-cover
            z-0
            pointer-events-none
          "
        />

        <div
          className="
            absolute
            inset-0
            bg-white/10
            z-0
            pointer-events-none
          "
        />

        <div
          className="
            relative
            z-10
            max-w-7xl
            mx-auto
            px-4
            md:px-8
          "
        >
          <div className="pt-[2cm]" />

          <div className="text-center mb-8">
            <h2
              className="
                text-3xl
                md:text-4xl
                font-black
                text-yellow-950
                drop-shadow-sm
              "
            >
              📚 Magical Stories
            </h2>

            <p
              className="
                mt-2
                text-gray-700
                font-semibold
              "
            >
              Discover wonderful stories and adventures
            </p>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, idx) => (
                <StoryCardSkeleton key={`home-stories-skel-${idx}`} />
              ))}
            </div>
          ) : homeStories.length === 0 ? (
            <EmptyState />
          ) : (
            <div
              className="
                grid
                grid-cols-1
                sm:grid-cols-2
                lg:grid-cols-4
                gap-6
              "
            >
              {homeStories.map(
                (
                  story,
                  index
                ) => (
                  <StoryCard
                    key={
                      story._id ||
                      story.id ||
                      index
                    }
                    story={
                      story
                    }
                    index={
                      index
                    }
                    handleOpen={
                      handleOpen
                    }
                  />
                )
              )}
            </div>
          )}

          {/* =================================================
              WATCH ALL STORIES
          ================================================= */}

          {homeStories.length ===
            4 && (
            <div
              className="
                mt-10
                flex
                justify-center
              "
            >
              <button
                onClick={
                  handleViewAllStories
                }
                className="
                  group
                  px-10
                  py-4
                  bg-gradient-to-r
                  from-yellow-400
                  to-orange-500
                  hover:from-yellow-500
                  hover:to-orange-600
                  border-b-4
                  border-yellow-600
                  text-yellow-950
                  font-black
                  rounded-full
                  transition-all
                  duration-200
                  text-lg
                  shadow-lg
                  hover:scale-105
                  active:scale-95
                  flex
                  items-center
                  gap-3
                "
              >
                <FaBookOpen />

                Watch All Stories
              </button>
            </div>
          )}
        </div>

        <StoryModal
          isOpen={open}
          story={selectedStory}
          onClose={handleClose}
        />
      </section>
    </>
  );
};

export default StoryCards;