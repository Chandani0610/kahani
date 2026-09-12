import { Link } from "react-router-dom";
import {
  FaTimes,
  FaUserFriends,
  FaClock,
  FaBookOpen,
} from "react-icons/fa";

// =========================================
// BACKEND URL
// =========================================

const API_BASE_URL =
  import.meta.env.VITE_API_URL?.replace(/\/api\/?$/, "") ||
  "http://localhost:5000";

// =========================================
// DEFAULT IMAGE
// =========================================

const DEFAULT_IMAGE = "/images/Stories/Adventuretales.avif";

// =========================================
// IMAGE URL HELPER
// =========================================

const getImageUrl = (image) => {
  if (!image) {
    return DEFAULT_IMAGE;
  }

  // Already complete URL
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

  // Backend relative path
  // Example:
  // /uploads/stories/story-123.jpg
  if (typeof image === "string" && image.startsWith("/")) {
    return `${API_BASE_URL}${image}`;
  }

  // Relative path without /
  if (typeof image === "string") {
    return `${API_BASE_URL}/${image}`;
  }

  return DEFAULT_IMAGE;
};

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
// GET CATEGORY NAME
// =========================================

const getCategoryName = (story) => {
  // category: "Adventure"
  if (
    story?.category &&
    typeof story.category === "string"
  ) {
    return story.category;
  }

  // category_name: "Adventure"
  if (
    story?.category_name &&
    typeof story.category_name === "string"
  ) {
    return story.category_name;
  }

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
// DEFAULT CATEGORY COLOR
// =========================================

const DEFAULT_CATEGORY_COLOR = "bg-yellow-300";

// =========================================
// STORY MODAL
// =========================================

const StoryModal = ({
  isOpen,
  story,
  onClose,
  getCategoryColor,
}) => {
  // =========================================
  // DON'T RENDER
  // =========================================

  if (!isOpen || !story) {
    return null;
  }

  // =========================================
  // STORY DATA
  // =========================================

  const image =
    story.image ||
    story.image_url ||
    "";

  const imageUrl = getImageUrl(image);

  const categoryName = getCategoryName(story);

  // =========================================
  // CATEGORY COLOR
  // =========================================

  const categoryColor =
    typeof getCategoryColor === "function"
      ? getCategoryColor(categoryName)
      : DEFAULT_CATEGORY_COLOR;

  // =========================================
  // IMAGE ERROR
  // =========================================

  const handleImageError = (event) => {
    event.currentTarget.onerror = null;
    event.currentTarget.src = DEFAULT_IMAGE;
  };

  // =========================================
  // STORY CONTENT
  // =========================================

  const storyContent =
    story.story ||
    story.content ||
    "The full story content is not available.";

  // =========================================
  // MODAL
  // =========================================

  return (
    <div
      className="
        fixed
        inset-0
        z-50
        flex
        items-center
        justify-center
        p-4
        sm:p-6
      "
      style={{
        background: "rgba(30, 41, 59, 0.5)",
        backdropFilter: "blur(12px)",
      }}
      onClick={onClose}
    >
      {/* =================================================
          MODAL CONTAINER
      ================================================= */}

      <div
        className="
          bg-white
          w-full
          max-w-xl
          rounded-[2.5rem]
          overflow-hidden
          shadow-[0_24px_50px_-12px_rgba(0,0,0,0.4)]
          border-8
          border-yellow-300
          max-h-[85vh]
          flex
          flex-col
          relative
        "
        onClick={(event) => event.stopPropagation()}
      >
        {/* =================================================
            CLOSE BUTTON
        ================================================= */}

        <button
          onClick={onClose}
          aria-label="Close story"
          className="
            absolute
            top-4
            right-4
            z-20
            bg-pink-500
            hover:bg-pink-600
            text-white
            rounded-full
            p-3
            shadow-md
            border-2
            border-white
            transition-transform
            duration-200
            hover:scale-110
          "
        >
          <FaTimes className="text-base" />
        </button>

        {/* =================================================
            IMAGE SECTION
        ================================================= */}

        <div
          className="
            w-full
            h-48
            sm:h-60
            flex-shrink-0
            relative
            bg-gradient-to-br
            from-yellow-100
            to-orange-100
          "
        >
          <img
            src={imageUrl}
            className="
              w-full
              h-full
              object-cover
            "
            alt={story.title || "Story"}
            loading="eager"
            decoding="async"
            onError={handleImageError}
          />

          {/* IMAGE GRADIENT */}

          <div
            className="
              absolute
              inset-0
              bg-gradient-to-t
              from-stone-900/80
              via-transparent
              to-transparent
              pointer-events-none
            "
          />

          {/* =================================================
              CATEGORY + TITLE
          ================================================= */}

          <div
            className="
              absolute
              bottom-4
              left-6
              right-6
            "
          >
            {/* CATEGORY */}

            <span
              className={`
                inline-block
                px-3
                py-1
                border-b-2
                rounded-xl
                text-stone-900
                text-xs
                font-black
                uppercase
                tracking-wider
                shadow-md
                ${categoryColor}
              `}
            >
              {categoryName}
            </span>

            {/* TITLE */}

            <h3
              className="
                text-white
                font-black
                text-2xl
                sm:text-3xl
                mt-1.5
                drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]
                line-clamp-2
              "
            >
              {story.title || "Untitled Story"}
            </h3>
          </div>

          {/* DRAFT BADGE */}

          {story.status === "draft" && (
            <div
              className="
                absolute
                top-4
                left-4
                bg-yellow-500
                text-white
                px-3
                py-1
                rounded-full
                text-[10px]
                font-black
                uppercase
                shadow-md
              "
            >
              Draft
            </div>
          )}
        </div>

        {/* =================================================
            STORY META
        ================================================= */}

        <div
          className="
            bg-amber-100/70
            px-6
            py-2.5
            flex
            flex-wrap
            items-center
            gap-3
            text-xs
            font-black
            text-amber-950
            border-b-2
            border-amber-200/50
          "
        >
          {/* AGE GROUP */}

          <span
            className="
              flex
              items-center
              gap-1
              bg-white
              py-1
              px-3
              rounded-xl
              shadow-sm
              border
              border-amber-200
            "
          >
            <FaUserFriends
              className="
                text-pink-500
                text-sm
              "
            />

            {story.age_group || "All Ages"}
          </span>

          {/* READ TIME */}

          <span
            className="
              flex
              items-center
              gap-1
              bg-white
              py-1
              px-3
              rounded-xl
              shadow-sm
              border
              border-amber-200
            "
          >
            <FaClock
              className="
                text-cyan-500
                text-sm
              "
            />

            {story.read_time || "5 min"}
          </span>

          {/* LANGUAGE */}

          {story.language && (
            <span
              className="
                flex
                items-center
                gap-1
                bg-white
                py-1
                px-3
                rounded-xl
                shadow-sm
                border
                border-amber-200
              "
            >
              🌐 {story.language}
            </span>
          )}
        </div>

        {/* =================================================
            STORY CONTENT
        ================================================= */}

        <div
          className="
            p-6
            sm:p-8
            overflow-y-auto
            flex-grow
            space-y-5
            bg-stone-50
          "
        >
          {/* DESCRIPTION */}

          {story.description && (
            <div
              className="
                bg-amber-50
                p-4
                rounded-2xl
                border-2
                border-amber-100
              "
            >
              <p
                className="
                  text-stone-700
                  text-sm
                  sm:text-base
                  leading-relaxed
                  italic
                "
              >
                "{story.description}"
              </p>
            </div>
          )}

          {/* STORY */}

          <div
            className="
              text-stone-800
              font-bold
              leading-relaxed
              text-base
              sm:text-lg
              bg-white
              p-6
              rounded-[2rem]
              shadow-inner
              border-2
              border-stone-100
              font-serif
            "
          >
            <div className="flex items-center gap-2 mb-4">
              <FaBookOpen className="text-pink-500" />

              <span
                className="
                  text-pink-600
                  font-black
                  font-sans
                  text-sm
                  uppercase
                  tracking-wide
                "
              >
                Story
              </span>
            </div>

            <p className="whitespace-pre-wrap">
              {storyContent}
            </p>
          </div>

          {/* =================================================
              DECORATIVE STARS
          ================================================= */}

          <div
            className="
              flex
              justify-center
              items-center
              gap-2
              py-1
            "
          >
            <span className="text-xl">
              ⭐
            </span>

            <span
              className="
                h-1
                w-20
                bg-gradient-to-r
                from-transparent
                via-yellow-400
                to-transparent
                rounded-full
              "
            ></span>

            <span className="text-xl">
              ⭐
            </span>
          </div>

          {/* =================================================
              SPARKLE BADGES
          ================================================= */}

          <div
            className="
              bg-gradient-to-r
              from-cyan-100
              to-blue-100
              rounded-2xl
              p-4
              border-2
              border-cyan-200
              shadow-sm
            "
          >
            <p
              className="
                text-xs
                font-black
                text-cyan-950
                mb-2
                flex
                items-center
                gap-1
              "
            >
              ✨ Sparkle Badges Collected!
            </p>

            <div
              className="
                flex
                flex-wrap
                gap-2
              "
            >
              <span
                className="
                  px-3
                  py-1
                  bg-white
                  text-pink-600
                  rounded-xl
                  text-xs
                  font-black
                  shadow-sm
                  border
                  border-pink-100
                "
              >
                🌟 Fun Play
              </span>

              <span
                className="
                  px-3
                  py-1
                  bg-white
                  text-amber-600
                  rounded-xl
                  text-xs
                  font-black
                  shadow-sm
                  border
                  border-amber-100
                "
              >
                🧠 Wise Mind
              </span>

              <span
                className="
                  px-3
                  py-1
                  bg-white
                  text-indigo-600
                  rounded-xl
                  text-xs
                  font-black
                  shadow-sm
                  border
                  border-indigo-100
                "
              >
                🚀 Dream Big
              </span>
            </div>
          </div>
        </div>

        {/* =================================================
            FOOTER
        ================================================= */}

        <div
          className="
            p-4
            sm:p-5
            bg-white
            border-t-2
            border-stone-100
            text-center
            flex-shrink-0
          "
        >
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 max-w-xl mx-auto w-full">
            <Link
              to={`/story/${story.id || story._id}`}
              state={{ cardImage: imageUrl, story }}
              onClick={onClose}
              className="text-amber-700 hover:text-amber-800 font-black text-sm flex items-center gap-1.5 py-2 px-4 rounded-xl hover:bg-amber-50 transition-colors"
            >
              <FaBookOpen className="text-amber-600" />
              <span>Open Full Story Page 📖</span>
            </Link>

            <button
              onClick={onClose}
              className="
                px-8
                py-3
                bg-gradient-to-b
                from-green-400
                to-emerald-500
                hover:brightness-105
                text-white
                rounded-full
                font-black
                shadow-[0_4px_0_#059669]
                border-b-2
                border-emerald-600
                active:translate-y-1
                active:shadow-none
                transition-all
                text-sm
                sm:text-base
                w-full
                sm:w-auto
                tracking-wide
                cursor-pointer
              "
            >
              I'm Done Reading! 😊🎉
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoryModal;