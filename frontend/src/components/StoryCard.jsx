
// src/components/StoryCard.jsx

import { motion } from "framer-motion";
import { FaUserFriends, FaClock, FaBookOpen } from "react-icons/fa";

// =========================================
// BACKEND URL
// =========================================

const API_BASE_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000/api"
).replace(/\/api\/?$/, "");

// =========================================
// CATEGORY MAP
// =========================================

const CATEGORY_MAP = {
  1: "Adventure",
  2: "Science Fiction",
  3: "Mystery",
  4: "Educational",
  5: "Bedtime",
  6: "Fairy Tale",
  7: "Moral Story",
};

// =========================================
// GET STORY ID
// =========================================

const getStoryId = (story) => {
  return story?.id || story?._id || null;
};

// =========================================
// CHECK WHETHER STORY HAS IMAGE
// =========================================

const storyHasImage = (story) => {
  if (!story) return false;

  // Backend may return boolean
  if (
    story.has_image === true ||
    story.hasImage === true
  ) {
    return true;
  }

  // Backend may return 1 / "1"
  if (
    story.has_image === 1 ||
    story.has_image === "1" ||
    story.hasImage === 1 ||
    story.hasImage === "1"
  ) {
    return true;
  }

  // Backend may return image metadata
  if (
    story.image_metadata?.exists === true ||
    story.imageMetadata?.exists === true
  ) {
    return true;
  }

  // Backend may return image size
  if (
    Number(story.image_size) > 0 ||
    Number(story.imageSize) > 0
  ) {
    return true;
  }

  // Actual image data exists
  if (story.image) return true;
  if (story.image_url) return true;

  return false;
};

// =========================================
// GET IMAGE URL
// =========================================

const getImageUrl = (story) => {
  if (!story) {
    return "/images/Stories/default.avif";
  }

  const image = story.image || story.image_url || "";

  // -----------------------------------------
  // Base64 image
  // -----------------------------------------

  if (
    typeof image === "string" &&
    image.startsWith("data:image/")
  ) {
    return image;
  }

  // -----------------------------------------
  // Complete URL
  // -----------------------------------------

  if (
    typeof image === "string" &&
    (
      image.startsWith("http://") ||
      image.startsWith("https://") ||
      image.startsWith("blob:")
    )
  ) {
    return image;
  }

  // -----------------------------------------
  // Existing backend path
  // -----------------------------------------

  if (
    typeof image === "string" &&
    image.startsWith("/")
  ) {
    return `${API_BASE_URL}${image}`;
  }

  // -----------------------------------------
  // Relative backend path
  // -----------------------------------------

  if (
    typeof image === "string" &&
    image.trim() !== ""
  ) {
    return `${API_BASE_URL}/${image.replace(/^\/+/, "")}`;
  }

  // -----------------------------------------
  // NEW BACKEND IMAGE ENDPOINT
  //
  // /api/stories/:id/image
  // -----------------------------------------

  const storyId = getStoryId(story);

  if (storyId && storyHasImage(story)) {
    return `${API_BASE_URL}/api/stories/${storyId}/image`;
  }

  // -----------------------------------------
  // Default image
  // -----------------------------------------

  return "/images/Stories/default.avif";
};

// =========================================
// GET CATEGORY NAME
// =========================================

const getCategoryName = (story) => {
  // API returns:
  // category: "Adventure"

  if (
    story?.category &&
    typeof story.category === "string"
  ) {
    return story.category;
  }

  // API returns:
  // category_name: "Adventure"

  if (
    story?.category_name &&
    typeof story.category_name === "string"
  ) {
    return story.category_name;
  }

  // API returns:
  // category: { name: "Adventure" }

  if (
    story?.category &&
    typeof story.category === "object"
  ) {
    return (
      story.category.name ||
      story.category.category_name ||
      "Uncategorized"
    );
  }

  // API returns:
  // category_id: 1

  if (
    story?.category_id !== undefined &&
    story?.category_id !== null
  ) {
    return (
      CATEGORY_MAP[story.category_id] ||
      CATEGORY_MAP[String(story.category_id)] ||
      "Uncategorized"
    );
  }

  return "Uncategorized";
};

// =========================================
// STORY CARD
// =========================================

const StoryCard = ({
  story,
  onClick,
  getCategoryColor,
}) => {
  // =========================================
  // IMAGE
  // =========================================

  const imageUrl = getImageUrl(story);

  // =========================================
  // CATEGORY
  // =========================================

  const categoryName = getCategoryName(story);

  // =========================================
  // CATEGORY COLOR
  // =========================================

  const categoryColor =
    typeof getCategoryColor === "function"
      ? getCategoryColor(categoryName)
      : "bg-yellow-300";

  // =========================================
  // CLICK HANDLER
  // =========================================

  const handleCardClick = () => {
    if (typeof onClick === "function") {
      onClick(story);
    }
  };

  // =========================================
  // IMAGE ERROR
  // =========================================

  const handleImageError = (event) => {
    // Prevent infinite error loop
    event.currentTarget.onerror = null;

    event.currentTarget.src =
      "/images/Stories/default.avif";
  };

  // =========================================
  // RENDER
  // =========================================

  return (
    <motion.div
      initial={{
        opacity: 0,
        scale: 0.8,
      }}
      animate={{
        opacity: 1,
        scale: 1,
      }}
      transition={{
        type: "spring",
        damping: 15,
      }}
      whileHover={{
        scale: 1.05,
        rotate: 1,
      }}
      className="story-card select-none pointer-events-auto"
    >
      {/* =========================================
          CARD
      ========================================= */}

      <div
        className="
          w-full
          overflow-hidden
          rounded-3xl
          shadow-2xl
          bg-white
          border-4
          border-white
          shadow-[0_8px_24px_rgba(0,0,0,0.3)]
          cursor-pointer
        "
        onClick={handleCardClick}
      >
        {/* =========================================
            IMAGE SECTION
        ========================================= */}

        <div className="relative">
          <img
            src={imageUrl}
            alt={story?.title || "Story"}
            className="
              story-image
              w-full
              object-cover
              rounded-t-2xl
              pointer-events-none
            "
            loading="lazy"
            decoding="async"
            onError={handleImageError}
          />

          {/* =========================================
              CATEGORY BADGE
          ========================================= */}

          <div className="absolute top-[6%] left-[6%]">
            <span
              className={`
                px-3
                py-1
                border-b-2
                rounded-xl
                text-stone-900
                text-[clamp(8px,0.7vw,11px)]
                font-black
                shadow-md
                uppercase
                tracking-wide
                ${categoryColor}
              `}
            >
              {categoryName}
            </span>
          </div>

          {/* =========================================
              IMAGE GRADIENT
          ========================================= */}

          <div
            className="
              absolute
              inset-0
              bg-gradient-to-t
              from-black/70
              via-transparent
              to-transparent
              pointer-events-none
            "
          />

          {/* =========================================
              TITLE
          ========================================= */}

          <div className="absolute bottom-0 w-full p-[4%]">
            <p
              className="
                text-white
                font-black
                text-[clamp(0.85rem,1.1vw,1.3rem)]
                drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]
                text-center
              "
            >
              {story?.title || "Untitled Story"}
            </p>
          </div>

          {/* =========================================
              DRAFT BADGE
          ========================================= */}

          {story?.status === "draft" && (
            <div
              className="
                absolute
                top-[6%]
                right-[6%]
                bg-yellow-500
                text-white
                text-[10px]
                font-black
                px-3
                py-1
                rounded-full
                shadow-md
                uppercase
              "
            >
              Draft
            </div>
          )}
        </div>

        {/* =========================================
            CARD INFORMATION
        ========================================= */}

        <div
          className="
            p-[5%]
            bg-amber-50/50
            space-y-[4%]
            border-t
            border-amber-100
          "
        >
          {/* =========================================
              AGE + READ TIME
          ========================================= */}

          <div
            className="
              flex
              items-center
              justify-between
              text-slate-600
              font-bold
              text-[clamp(8px,0.7vw,11px)]
              gap-2
            "
          >
            {/* AGE GROUP */}

            <span
              className="
                flex
                items-center
                gap-1
                bg-white
                px-2
                py-0.5
                rounded-lg
                shadow-sm
              "
            >
              <FaUserFriends className="text-pink-500" />

              {story?.age_group || "All Ages"}
            </span>

            {/* READ TIME */}

            <span
              className="
                flex
                items-center
                gap-1
                bg-white
                px-2
                py-0.5
                rounded-lg
                shadow-sm
              "
            >
              <FaClock className="text-cyan-500" />

              {story?.read_time || "5 min"}
            </span>
          </div>

          {/* =========================================
              LANGUAGE
          ========================================= */}

          {story?.language && (
            <div className="text-center">
              <span
                className="
                  inline-block
                  bg-white
                  px-3
                  py-1
                  rounded-lg
                  shadow-sm
                  text-slate-500
                  font-bold
                  text-[clamp(8px,0.65vw,10px)]
                "
              >
                🌐 {story.language}
              </span>
            </div>
          )}

          {/* =========================================
              READ STORY BUTTON
          ========================================= */}

          <motion.button
            whileTap={{
              scale: 0.95,
            }}
            className="
              w-full
              bg-gradient-to-b
              from-pink-400
              to-pink-500
              hover:from-pink-500
              hover:to-pink-600
              text-white
              rounded-2xl
              shadow-[0_4px_0_#db2777]
              active:translate-y-1
              active:shadow-none
              text-[clamp(9px,0.8vw,12px)]
              font-black
              py-[4%]
              border-b-2
              border-pink-600
              tracking-wider
              flex
              items-center
              justify-center
              gap-2
            "
            onClick={(event) => {
              event.stopPropagation();

              if (typeof onClick === "function") {
                onClick(story);
              }
            }}
          >
            <FaBookOpen />

            Read Story Now! 📖
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default StoryCard;

