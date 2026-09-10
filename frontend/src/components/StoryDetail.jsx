// src/components/StoryDetail.jsx

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

import {
  FaClock,
  FaTag,
  FaEye,
  FaHeart,
  FaBookOpen,
  FaArrowLeft,
} from "react-icons/fa";

import { storyService } from "../services/storyService";

// ======================================================
// BACKEND URL
// ======================================================

const API_BASE_URL = (
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api"
)
  .replace(/\/api\/?$/, "")
  .replace(/\/+$/, "");

// ======================================================
// GET STORY ID
// ======================================================

const getStoryId = (story) => {
  if (!story) return null;

  return story.id ?? story._id ?? null;
};

// ======================================================
// CHECK BASE64 IMAGE
// ======================================================

const isBase64Image = (value) => {
  return (
    typeof value === "string" &&
    value.trim().toLowerCase().startsWith("data:image/")
  );
};

// ======================================================
// CHECK NORMAL URL
// ======================================================

const isValidHttpUrl = (value) => {
  if (typeof value !== "string") return false;

  const url = value.trim();

  return (
    url.startsWith("http://") ||
    url.startsWith("https://") ||
    url.startsWith("blob:")
  );
};

// ======================================================
// CHECK STORY HAS IMAGE
// ======================================================

const storyHasImage = (story) => {
  if (!story) return false;

  // Boolean flags
  if (
    story.has_image === true ||
    story.hasImage === true ||
    story.image_exists === true ||
    story.imageExists === true
  ) {
    return true;
  }

  // Numeric/string flags
  if (
    story.has_image === 1 ||
    story.has_image === "1" ||
    story.has_image === "true" ||
    story.hasImage === 1 ||
    story.hasImage === "1" ||
    story.hasImage === "true" ||
    story.image_exists === 1 ||
    story.image_exists === "1" ||
    story.imageExists === 1 ||
    story.imageExists === "1"
  ) {
    return true;
  }

  // Metadata
  if (
    story.image_metadata?.exists === true ||
    story.imageMetadata?.exists === true
  ) {
    return true;
  }

  // Base64
  if (isBase64Image(story.image)) {
    return true;
  }

  if (isBase64Image(story.image_url)) {
    return true;
  }

  // Normal image
  if (
    typeof story.image === "string" &&
    story.image.trim() !== ""
  ) {
    return true;
  }

  if (
    typeof story.image_url === "string" &&
    story.image_url.trim() !== ""
  ) {
    return true;
  }

  return false;
};

// ======================================================
// GET IMAGE URL
// ======================================================

const getImageUrl = (story) => {
  const DEFAULT_IMAGE =
    "/images/Stories/default.avif";

  if (!story) {
    return DEFAULT_IMAGE;
  }

  // ====================================================
  // IMPORTANT:
  // BASE64 MUST BE RETURNED DIRECTLY.
  // DO NOT ADD API_BASE_URL.
  // ====================================================

  if (isBase64Image(story.image)) {
    return story.image.trim();
  }

  if (isBase64Image(story.image_url)) {
    return story.image_url.trim();
  }

  // ====================================================
  // IMAGE_URL
  // ====================================================

  if (
    typeof story.image_url === "string" &&
    story.image_url.trim() !== ""
  ) {
    const imageUrl = story.image_url.trim();

    // Complete URL
    if (isValidHttpUrl(imageUrl)) {
      return imageUrl;
    }

    // Local absolute path
    if (imageUrl.startsWith("/")) {
      return `${API_BASE_URL}${imageUrl}`;
    }

    // Relative path
    return `${API_BASE_URL}/${imageUrl.replace(/^\/+/, "")}`;
  }

  // ====================================================
  // IMAGE
  // ====================================================

  if (
    typeof story.image === "string" &&
    story.image.trim() !== ""
  ) {
    const image = story.image.trim();

    // Complete URL
    if (isValidHttpUrl(image)) {
      return image;
    }

    // Local absolute path
    if (image.startsWith("/")) {
      return `${API_BASE_URL}${image}`;
    }

    // Relative path
    return `${API_BASE_URL}/${image.replace(/^\/+/, "")}`;
  }

  // ====================================================
  // DATABASE BLOB IMAGE
  // ====================================================

  const storyId = getStoryId(story);

  if (storyId && storyHasImage(story)) {
    return `${API_BASE_URL}/api/stories/${storyId}/image`;
  }

  // ====================================================
  // DEFAULT
  // ====================================================

  return DEFAULT_IMAGE;
};

// ======================================================
// CATEGORY MAP
// ======================================================

const CATEGORY_MAP = {
  1: "Adventure",
  2: "Science Fiction",
  3: "Mystery",
  4: "Educational",
  5: "Bedtime",
  6: "Fairy Tale",
  7: "Moral Story",
};

// ======================================================
// CATEGORY NAME
// ======================================================

const getCategoryName = (story) => {
  if (!story) {
    return "Uncategorized";
  }

  if (
    typeof story.category === "string" &&
    story.category.trim()
  ) {
    return story.category.trim();
  }

  if (
    typeof story.category_name === "string" &&
    story.category_name.trim()
  ) {
    return story.category_name.trim();
  }

  if (
    story.category &&
    typeof story.category === "object"
  ) {
    return (
      story.category.name ||
      story.category.category_name ||
      "Uncategorized"
    );
  }

  if (
    story.category_id !== undefined &&
    story.category_id !== null
  ) {
    return (
      CATEGORY_MAP[story.category_id] ||
      CATEGORY_MAP[String(story.category_id)] ||
      "Uncategorized"
    );
  }

  return "Uncategorized";
};

// ======================================================
// MAIN COMPONENT
// ======================================================

const StoryDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [story, setStory] = useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  // ====================================================
  // FETCH STORY
  // ====================================================

  useEffect(() => {
    let mounted = true;

    const fetchStory = async () => {
      if (!id) {
        setError("Story ID is missing.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const response =
          await storyService.getById(id);

        console.log(
          "📖 Story Detail API Response:",
          response
        );

        if (!mounted) return;

        let storyData = null;

        // API response:
        // { success: true, data: {...} }

        if (
          response?.data &&
          !Array.isArray(response.data)
        ) {
          storyData = response.data;
        }

        // API response:
        // { story: {...} }

        else if (
          response?.story &&
          !Array.isArray(response.story)
        ) {
          storyData = response.story;
        }

        // Direct object

        else if (
          response &&
          typeof response === "object" &&
          !Array.isArray(response)
        ) {
          storyData = response;
        }

        if (!storyData) {
          throw new Error("Story not found.");
        }

        console.log(
          "📚 STORY DATA:",
          storyData
        );

        console.log(
          "🖼️ STORY IMAGE:",
          storyData.image
        );

        console.log(
          "🖼️ STORY IMAGE URL:",
          storyData.image_url
        );

        setStory(storyData);
      } catch (err) {
        console.error(
          "❌ Failed to load story:",
          err
        );

        if (!mounted) return;

        setError(
          err?.response?.data?.message ||
            err?.response?.data?.error ||
            err?.message ||
            "Failed to load story."
        );
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchStory();

    return () => {
      mounted = false;
    };
  }, [id]);

  // ====================================================
  // LOADING
  // ====================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div
            className="
              w-14
              h-14
              border-4
              border-white/20
              border-t-yellow-400
              rounded-full
              animate-spin
              mx-auto
            "
          />

          <p className="text-white mt-4 text-lg font-semibold">
            Loading story...
          </p>
        </div>
      </div>
    );
  }

  // ====================================================
  // ERROR
  // ====================================================

  if (error || !story) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
        <div
          className="
            max-w-md
            w-full
            bg-white/10
            backdrop-blur-md
            border
            border-white/20
            rounded-2xl
            p-8
            text-center
          "
        >
          <div className="text-5xl mb-4">
            😕
          </div>

          <h2 className="text-xl font-bold text-white mb-3">
            Story Not Found
          </h2>

          <p className="text-white/70 mb-6">
            {error || "This story could not be loaded."}
          </p>

          <button
            onClick={() => navigate(-1)}
            className="
              px-6
              py-3
              bg-yellow-400
              hover:bg-yellow-300
              text-gray-900
              rounded-xl
              font-bold
              transition
            "
          >
            ← Back to Stories
          </button>
        </div>
      </div>
    );
  }

  // ====================================================
  // IMAGE URL
  // ====================================================

  const imageUrl = getImageUrl(story);

  // ====================================================
  // IMAGE DEBUG
  // ====================================================

  console.log(
    "🖼️ FINAL IMAGE URL:",
    imageUrl
  );

  console.log(
    "🖼️ FINAL IMAGE TYPE:",
    typeof imageUrl
  );

  console.log(
    "🖼️ FINAL IMAGE IS BASE64:",
    isBase64Image(imageUrl)
  );

  // ====================================================
  // IMAGE ERROR
  // ====================================================

  const handleImageError = (event) => {
    console.error(
      "❌ IMAGE FAILED TO LOAD"
    );

    console.error(
      "❌ IMAGE SRC:",
      event.currentTarget.src
    );

    console.error(
      "❌ IMAGE URL VARIABLE:",
      imageUrl
    );

    event.currentTarget.onerror = null;

    event.currentTarget.src =
      "/images/Stories/default.avif";
  };

  // ====================================================
  // IMAGE LOAD
  // ====================================================

  const handleImageLoad = () => {
    console.log(
      "✅ Story image loaded:",
      story.title
    );

    console.log(
      "✅ Loaded image source:",
      imageUrl
    );
  };

  // ====================================================
  // BACK
  // ====================================================

  const handleBack = () => {
    navigate(-1);
  };

  // ====================================================
  // CATEGORY
  // ====================================================

  const categoryName =
    getCategoryName(story);

  // ====================================================
  // CONTENT
  // ====================================================

  const storyContent =
    story.story ||
    story.content ||
    story.description ||
    "Story content is not available.";

  // ====================================================
  // DATE
  // ====================================================

  const getFormattedDate = (date) => {
    if (!date) {
      return "N/A";
    }

    try {
      return new Date(
        date
      ).toLocaleDateString();
    } catch {
      return "N/A";
    }
  };

  // ====================================================
  // RETURN
  // ====================================================

  return (
    <div
      className="
        min-h-screen
        flex
        flex-col
        md:flex-row
        bg-gray-900
      "
    >
      {/* ==================================================
          LEFT IMAGE
      ================================================== */}

      <div
        className="
          w-full
          md:w-1/2
          h-[55vh]
          md:h-screen
          relative
          md:sticky
          md:top-0
          overflow-hidden
          bg-gray-900
        "
      >
        {/* ================================================
            REAL IMAGE
        ================================================= */}

        <img
          src={imageUrl}
          alt={story.title || "Story"}
          onLoad={handleImageLoad}
          onError={handleImageError}
          loading="eager"
          decoding="async"
          fetchPriority="high"
          className="
            absolute
            inset-0
            w-full
            h-full
            object-cover
            object-center
          "
        />

        {/* ================================================
            DARK OVERLAY
        ================================================= */}

        <div
          className="
            absolute
            inset-0
            bg-black/50
            pointer-events-none
          "
        />

        {/* ================================================
            GRADIENT
        ================================================= */}

        <div
          className="
            absolute
            inset-0
            bg-gradient-to-r
            from-black/10
            via-black/20
            to-black/60
            pointer-events-none
          "
        />

        {/* ================================================
            CENTER BOOK ICON
        ================================================= */}

        <motion.div
          initial={{
            opacity: 0,
            scale: 0.7,
          }}
          animate={{
            opacity: 1,
            scale: 1,
          }}
          transition={{
            duration: 0.7,
          }}
          className="
            absolute
            inset-0
            flex
            items-center
            justify-center
            pointer-events-none
          "
        >
          <div className="text-center">
            <div
              className="
                w-32
                h-32
                md:w-48
                md:h-48
                border-2
                border-white/20
                rounded-full
                flex
                items-center
                justify-center
                backdrop-blur-sm
                bg-white/5
              "
            >
              <FaBookOpen
                className="
                  w-12
                  h-12
                  md:w-20
                  md:h-20
                  text-white/30
                "
              />
            </div>

            <p
              className="
                mt-5
                text-white/50
                text-sm
                tracking-widest
                uppercase
              "
            >
              {categoryName}
            </p>
          </div>
        </motion.div>

        {/* ================================================
            TOP LEFT CORNER
        ================================================= */}

        <div
          className="
            absolute
            top-8
            left-8
            w-16
            h-16
            border-t-2
            border-l-2
            border-white/20
            pointer-events-none
          "
        />

        {/* ================================================
            BOTTOM RIGHT CORNER
        ================================================= */}

        <div
          className="
            absolute
            bottom-8
            right-8
            w-16
            h-16
            border-b-2
            border-r-2
            border-white/20
            pointer-events-none
          "
        />

        {/* ================================================
            BACK BUTTON
        ================================================= */}

        <button
          onClick={handleBack}
          className="
            absolute
            top-6
            left-6
            z-20
            flex
            items-center
            gap-2
            px-4
            py-2
            bg-black/50
            hover:bg-black/70
            backdrop-blur-md
            text-white
            rounded-xl
            border
            border-white/20
            transition
            font-semibold
          "
        >
          <FaArrowLeft />
          Back
        </button>

        {/* ================================================
            DRAFT
        ================================================= */}

        {story.status === "draft" && (
          <div
            className="
              absolute
              top-6
              right-6
              z-20
              bg-yellow-500
              text-white
              px-4
              py-2
              rounded-full
              text-xs
              font-black
            "
          >
            DRAFT
          </div>
        )}
      </div>

      {/* ==================================================
          RIGHT CONTENT
      ================================================== */}

      <motion.div
        initial={{
          x: 40,
          opacity: 0,
        }}
        animate={{
          x: 0,
          opacity: 1,
        }}
        transition={{
          duration: 0.5,
        }}
        className="
          w-full
          md:w-1/2
          bg-black/50
          backdrop-blur-sm
          p-6
          md:p-10
          min-h-screen
          overflow-y-auto
        "
      >
        <div className="max-w-2xl mx-auto">

          {/* ================================================
              CATEGORY
          ================================================= */}

          <span
            className="
              inline-block
              bg-yellow-400
              text-gray-900
              text-sm
              font-bold
              px-4
              py-1.5
              rounded-full
              mb-4
            "
          >
            {categoryName}
          </span>

          {/* ================================================
              TITLE
          ================================================= */}

          <motion.h1
            initial={{
              y: 20,
              opacity: 0,
            }}
            animate={{
              y: 0,
              opacity: 1,
            }}
            transition={{
              duration: 0.5,
            }}
            className="
              text-3xl
              md:text-4xl
              lg:text-5xl
              font-bold
              leading-tight
              mb-4
              bg-gradient-to-r
              from-green-400
              via-pink-400
              via-yellow-400
              via-purple-400
              to-orange-400
              bg-clip-text
              text-transparent
            "
          >
            {story.title || "Untitled Story"}
          </motion.h1>

          {/* ================================================
              DESCRIPTION
          ================================================= */}

          {story.description && (
            <p
              className="
                text-white/80
                text-lg
                md:text-xl
                mb-6
                italic
              "
            >
              "{story.description}"
            </p>
          )}

          {/* ================================================
              META
          ================================================= */}

          <div
            className="
              flex
              flex-wrap
              items-center
              gap-3
              text-sm
              text-white/90
              mb-6
              p-4
              bg-white/10
              backdrop-blur-md
              rounded-xl
              border
              border-white/20
            "
          >
            {story.read_time && (
              <span
                className="
                  flex
                  items-center
                  gap-2
                  px-3
                  py-1.5
                  bg-white/10
                  rounded-full
                "
              >
                <FaClock className="text-purple-300" />
                {story.read_time}
              </span>
            )}

            {story.age_group && (
              <span
                className="
                  flex
                  items-center
                  gap-2
                  px-3
                  py-1.5
                  bg-white/10
                  rounded-full
                "
              >
                <FaTag className="text-purple-300" />
                {story.age_group}
              </span>
            )}

            {story.language && (
              <span
                className="
                  flex
                  items-center
                  gap-2
                  px-3
                  py-1.5
                  bg-white/10
                  rounded-full
                "
              >
                🌐
                {story.language}
              </span>
            )}
          </div>

          {/* ================================================
              STATS
          ================================================= */}

          {(story.views !== undefined ||
            story.likes !== undefined ||
            story.featured) && (
            <div
              className="
                flex
                flex-wrap
                gap-3
                mb-6
              "
            >
              {story.views !== undefined && (
                <span
                  className="
                    flex
                    items-center
                    gap-2
                    px-3
                    py-1.5
                    bg-white/10
                    rounded-full
                    text-white/70
                    text-sm
                  "
                >
                  <FaEye className="text-blue-400" />
                  {story.views || 0} views
                </span>
              )}

              {story.likes !== undefined && (
                <span
                  className="
                    flex
                    items-center
                    gap-2
                    px-3
                    py-1.5
                    bg-white/10
                    rounded-full
                    text-white/70
                    text-sm
                  "
                >
                  <FaHeart className="text-red-400" />
                  {story.likes || 0} likes
                </span>
              )}

              {story.featured && (
                <span
                  className="
                    px-3
                    py-1.5
                    bg-yellow-500/20
                    rounded-full
                    text-yellow-300
                    text-sm
                  "
                >
                  ⭐ Featured
                </span>
              )}
            </div>
          )}

          {/* ================================================
              STORY CONTENT
          ================================================= */}

          <div
            className="
              bg-white/10
              backdrop-blur-md
              rounded-2xl
              p-6
              border
              border-white/20
              shadow-xl
            "
          >
            <h2
              className="
                text-xl
                font-bold
                text-white
                mb-5
                flex
                items-center
                gap-3
              "
            >
              <FaBookOpen className="text-purple-400" />

              Story

              <span
                className="
                  flex-1
                  h-px
                  bg-gradient-to-r
                  from-white/20
                  to-transparent
                "
              />
            </h2>

            <div
              className="
                whitespace-pre-wrap
                leading-relaxed
                text-base
                md:text-lg
                text-white/90
              "
            >
              {storyContent}
            </div>
          </div>

          {/* ================================================
              FOOTER
          ================================================= */}

          <div
            className="
              mt-6
              pt-4
              border-t
              border-white/20
              flex
              flex-col
              sm:flex-row
              justify-between
              items-center
              gap-4
            "
          >
            <span className="text-white/40 text-xs">
              Updated:{" "}
              {getFormattedDate(
                story.updated_at
              )}
            </span>

            <button
              onClick={handleBack}
              className="
                px-4
                py-2
                bg-white/10
                hover:bg-white/20
                text-white
                rounded-lg
                transition
                border
                border-white/20
                text-sm
                font-bold
                flex
                items-center
                gap-2
              "
            >
              <FaArrowLeft />
              Back to Stories
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default StoryDetail;