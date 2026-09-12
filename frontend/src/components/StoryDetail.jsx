// src/components/StoryDetail.jsx

import { useState, useEffect, useMemo, useRef } from "react";
import { useParams, useNavigate, useLocation, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaClock,
  FaEye,
  FaHeart,
  FaVolumeUp,
  FaVolumeMute,
  FaShareAlt,
  FaCheck,
  FaExpand,
  FaTimes,
  FaQuoteLeft,
  FaBookReader,
  FaChevronLeft,
  FaChevronRight,
  FaUserFriends,
} from "react-icons/fa";

import Navbar from "./Navbar";
import { storyService } from "../services/storyService";
import { MagicalLoader } from "./common/LoadingComponents";
import { getHindiStoryData } from "../utils/storyTranslations";

// ======================================================
// CATEGORY MAP & FALLBACK IMAGES
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

const STORY_THEMES = {
  1: { en: "Kindness • Friendship • Gratitude • Humility", hi: "दया • मित्रता • कृतज्ञता • विनम्रता" },
  2: { en: "Wisdom • Intelligence • Courage • Teamwork", hi: "बुद्धि • समझदारी • साहस • एकजुटता" },
  3: { en: "Curiosity • Imagination • Wonder • Bravery", hi: "जिज्ञासा • कल्पना • आश्चर्य • वीरता" },
  4: { en: "Loyalty • Trust • Compassion • Friendship", hi: "वफादारी • विश्वास • करुणा • सच्ची दोस्ती" },
  5: { en: "Courage • Determination • Kindness • Hope", hi: "साहस • दृढ़ संकल्प • दया • आशा" },
  6: { en: "Honesty • Integrity • Truthfulness • Honor", hi: "ईमानदारी • सत्यनिष्ठा • सच्चाई • सम्मान" },
  7: { en: "Hope • Positivity • Friendship • Joy", hi: "आशा • सकारात्मकता • मित्रता • आनंद" },
  8: { en: "Kindness • Helpfulness • Empathy • Generosity", hi: "दयालुता • सहायता • सहानुभूति • उदारता" },
  9: { en: "Guidance • Hope • Friendship • Wonder", hi: "मार्गदर्शन • आशा • मित्रता • कौतूहल" },
  10: { en: "Mystery • Adventure • Bravery • Discovery", hi: "रहस्य • रोमांच • वीरता • खोज" },
  11: { en: "Joy • Happiness • Laughter • Sharing", hi: "उमंग • खुशी • हंसी • मिल-बांटना" },
  12: { en: "Courage • Curiosity • Honesty • Value of Time", hi: "साहस • जिज्ञासा • ईमानदारी • समय का महत्व" },
  13: { en: "Honesty • Truth • Integrity • Goodness", hi: "ईमानदारी • सत्य • सत्यनिष्ठा • अच्छाई" },
};

const getCategoryFallbackImage = (categoryName) => {
  const cat = String(categoryName || "").toLowerCase();
  if (cat.includes("adventure") || cat.includes("fairy")) {
    return "/images/Stories/Adventuretales.avif";
  }
  if (cat.includes("bedtime")) {
    return "/images/Stories/BedtimeStories.avif";
  }
  if (cat.includes("animal")) {
    return "/images/Stories/AnimalStories.avif";
  }
  if (cat.includes("moral") || cat.includes("educat")) {
    return "/images/Stories/moralstories.avif";
  }
  return "/images/Stories/Adventuretales.avif";
};

// ======================================================
// BULLETPROOF IMAGE RESOLVER
// ======================================================

const getStoryImageUrl = (story) => {
  if (!story) return "/images/Stories/Adventuretales.avif";

  // 1. Direct Base64 Data URL
  if (
    typeof story.image === "string" &&
    story.image.trim().toLowerCase().startsWith("data:image/")
  ) {
    return story.image.trim();
  }
  if (
    typeof story.image_url === "string" &&
    story.image_url.trim().toLowerCase().startsWith("data:image/")
  ) {
    return story.image_url.trim();
  }

  // 2. Full HTTP(S) or Blob URL
  if (
    typeof story.image_url === "string" &&
    (story.image_url.startsWith("http://") ||
      story.image_url.startsWith("https://") ||
      story.image_url.startsWith("blob:"))
  ) {
    return story.image_url.trim();
  }
  if (
    typeof story.image === "string" &&
    (story.image.startsWith("http://") ||
      story.image.startsWith("https://") ||
      story.image.startsWith("blob:"))
  ) {
    return story.image.trim();
  }

  // 3. Backend endpoint URL
  const id = story.id || story._id;
  if (id) {
    return `/api/stories/${id}/image`;
  }

  // 4. Category-based fallback
  return getCategoryFallbackImage(story.category);
};

// ======================================================
// DEFAULT STORIES FALLBACK (Guarantees stories never empty)
// ======================================================

const DEFAULT_STORIES = [
  {
    id: 1,
    title: "The Lion and Mouse",
    category: "Moral Story",
    read_time: "5 Min",
    age_group: "4-6 Years",
    description:
      "One sunny afternoon, a mighty lion meets a tiny mouse in the jungle. Kindness is never wasted.",
  },
  {
    id: 2,
    title: "The Clever Rabbit",
    category: "Moral Story",
    read_time: "5 Min",
    age_group: "4-6 Years",
    description:
      "In a peaceful jungle, a clever little rabbit uses intelligence instead of strength to save the forest.",
  },
  {
    id: 3,
    title: "Magic Forest Adventure",
    category: "Adventure",
    read_time: "6 Min",
    age_group: "6-8 Years",
    description:
      "Join Lily on an unforgettable journey through the magical forest filled with fairies and wonder.",
  },
  {
    id: 4,
    title: "Friendship Forever",
    category: "Moral Story",
    read_time: "5 Min",
    age_group: "5-7 Years",
    description:
      "Rohan and Aman learn that true friendship means never leaving a friend behind in times of need.",
  },
  {
    id: 5,
    title: "The Brave Little Sparrow",
    category: "Moral Story",
    read_time: "4 Min",
    age_group: "3-5 Years",
    description:
      "A tiny sparrow named Pia proves courage is not measured by size during a fierce forest storm.",
  },
  {
    id: 6,
    title: "The Honest Fox",
    category: "Moral Story",
    read_time: "5 Min",
    age_group: "5-8 Years",
    description:
      "Finn, a clever young fox, discovers a bag of gold coins and chooses to find its rightful owner.",
  },
  {
    id: 7,
    title: "The Rainbow After the Rain",
    category: "Adventure",
    read_time: "6 Min",
    age_group: "4-7 Years",
    description:
      "Four curious friends discover a magical rainbow stretching across the sky after heavy rain.",
  },
  {
    id: 8,
    title: "The Kind Elephant",
    category: "Moral Story",
    read_time: "5 Min",
    age_group: "3-6 Years",
    description:
      "Meet Ella, the gentle elephant who spends every day helping jungle animals in need.",
  },
  {
    id: 9,
    title: "The Lost Star",
    category: "Bedtime",
    read_time: "5 Min",
    age_group: "4-7 Years",
    description:
      "A tiny shining star named Twinkle accidentally falls from the sky into an enchanted forest.",
  },
  {
    id: 10,
    title: "The Secret Castle",
    category: "Mystery",
    read_time: "7 Min",
    age_group: "7-10 Years",
    description:
      "Hidden deep inside an enchanted forest lies an ancient castle waiting to be explored.",
  },
  {
    id: 11,
    title: "The Laughing Magic Balloon",
    category: "Entertainment",
    read_time: "5 Min",
    age_group: "4-7 Years",
    views: 140,
    likes: 12,
    image_url: "/api/stories/11/image",
    description:
      "A cheerful little boy discovers a magical balloon that laughs with every smile.",
  },
  {
    id: 12,
    title: "The Whispering Clock Tower",
    category: "Moral Story",
    read_time: "5 Min",
    age_group: "4-6 years",
    views: 140,
    likes: 12,
    image_url: "/api/stories/12/image",
    description:
      "Two curious children, Riya and Aarav, discover a mysterious old clock tower in their town. When they step inside, they find a magical world full of secrets, hidden clues and a special message from the past. Will they solve the mystery before the clock strikes midnight? This heartwarming story teaches us about courage, curiosity and the value of time.",
  },
  {
    id: 13,
    title: "The Honest Little Sparrow",
    category: "Moral Story",
    read_time: "5 Min",
    age_group: "4-6 Years",
    views: 140,
    likes: 12,
    image_url: "/api/stories/13/image",
    description:
      "Meet Pip, a tiny sparrow who finds a golden necklace and returns it to its rightful owner. A heartwarming tale showing that honesty is the greatest jewel of all.",
  },
];

// ======================================================
// MAIN COMPONENT
// ======================================================

const StoryDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // Grab state passed directly from StoryCard
  const passedImage = location?.state?.cardImage;
  const passedStory = location?.state?.story;

  const initialStory = useMemo(() => {
    if (passedStory) return passedStory;
    const fallback = DEFAULT_STORIES.find((s) => String(s.id) === String(id));
    return fallback || null;
  }, [passedStory, id]);

  const [story, setStory] = useState(initialStory);
  const [loading, setLoading] = useState(() => !initialStory && !passedStory);
  const [error, setError] = useState("");
  const [imageError, setImageError] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  // Language state (English / Hindi)
  const [language, setLanguage] = useState("en"); // "en" | "hi"

  // Reading experience settings
  const [fontSize, setFontSize] = useState("md"); // sm, md, lg, xl
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(
    initialStory?.likes || passedStory?.likes || 12
  );
  const [copied, setCopied] = useState(false);

  // Reading progress
  const [readingProgress, setReadingProgress] = useState(0);

  // All stories list & bottom carousel
  const [allStories, setAllStories] = useState(DEFAULT_STORIES);

  // Filter out current active story so related carousel shows all other stories
  const relatedStories = useMemo(() => {
    const list = allStories.length > 0 ? allStories : DEFAULT_STORIES;
    const filtered = list.filter((s) => String(s.id || s._id) !== String(id));
    return filtered.length > 0 ? filtered : list;
  }, [allStories, id]);

  const storyCarouselRef = useRef(null);
  const [canScrollLeftStory, setCanScrollLeftStory] = useState(false);
  const [canScrollRightStory, setCanScrollRightStory] = useState(true);

  // Update Story Carousel buttons
  const updateStoryScrollButtons = () => {
    if (storyCarouselRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = storyCarouselRef.current;
      setCanScrollLeftStory(scrollLeft > 15);
      setCanScrollRightStory(scrollLeft + clientWidth < scrollWidth - 15);
    }
  };

  const handleStoryScroll = (direction) => {
    if (storyCarouselRef.current) {
      const scrollAmount = direction === "left" ? -360 : 360;
      storyCarouselRef.current.scrollBy({
        left: scrollAmount,
        behavior: "smooth",
      });
      setTimeout(updateStoryScrollButtons, 350);
    }
  };

  // Check speech synthesis support on mount
  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      setSpeechSupported(true);
    }
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Reading progress tracker
  useEffect(() => {
    const onScroll = () => {
      const currentScrollY = window.scrollY;
      const totalHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const progress = Math.min(
          100,
          Math.max(0, Math.round((currentScrollY / totalHeight) * 100))
        );
        setReadingProgress(progress);
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Fetch story data & all stories
  useEffect(() => {
    let mounted = true;

    // Stop speaking if switching stories
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }

    // Immediately load passedStory or fallback story to prevent empty flash
    if (
      passedStory &&
      (String(passedStory.id) === String(id) ||
        String(passedStory._id) === String(id))
    ) {
      setStory(passedStory);
      setLikesCount(passedStory.likes || 12);
      setLoading(false);
    } else {
      const fallback = DEFAULT_STORIES.find((s) => String(s.id) === String(id));
      if (fallback) {
        setStory((prev) => prev || fallback);
        setLikesCount(fallback.likes || 12);
      }
    }

    const fetchStoryData = async () => {
      if (!id) {
        setError("Story ID is missing.");
        setLoading(false);
        return;
      }

      try {
        setError("");
        setImageError(false);

        const data = await storyService.getById(id);
        if (!mounted) return;

        if (data) {
          // CRITICAL FIX: In MySQL database, data.story is the text string of the story content.
          // data itself is the complete story object (with id, title, description, story, image, etc.)
          let fetchedStory = data;
          if (data.story && typeof data.story === "object") {
            fetchedStory = data.story;
          } else if (data.data && typeof data.data === "object") {
            fetchedStory = data.data;
          }

          setStory((prev) => ({
            ...(prev || {}),
            ...fetchedStory,
          }));
          setLikesCount(fetchedStory.likes || 12);

          const isLiked = localStorage.getItem(`story_liked_${id}`);
          if (isLiked) setLiked(true);
        } else {
          setError("Story not found.");
        }
      } catch (err) {
        if (!mounted) return;
        console.error("Error fetching story:", err);
        setStory((prev) => {
          if (!prev) {
            const fallback = DEFAULT_STORIES.find((s) => String(s.id) === String(id));
            if (fallback) return fallback;
            setError(
              err.response?.data?.message || "Failed to load story details."
            );
          }
          return prev;
        });
      } finally {
        if (mounted) setLoading(false);
      }
    };

    const fetchAllStories = async () => {
      try {
        const res = await storyService.getAll();
        if (!mounted) return;
        const list = Array.isArray(res)
          ? res
          : res?.stories || res?.data || [];
        if (list.length > 0) {
          setAllStories(list);
        }
      } catch (e) {
        console.error("Error fetching all stories:", e);
      }
    };

    fetchStoryData();
    fetchAllStories();
    window.scrollTo({ top: 0, behavior: "smooth" });

    return () => {
      mounted = false;
    };
  }, [id, passedStory]);

  // Update carousel buttons on data changes
  useEffect(() => {
    updateStoryScrollButtons();
  }, [relatedStories]);

  // Handle Like Button
  const handleLike = () => {
    if (!liked) {
      setLiked(true);
      setLikesCount((prev) => prev + 1);
      localStorage.setItem(`story_liked_${id}`, "true");
    } else {
      setLiked(false);
      setLikesCount((prev) => Math.max(0, prev - 1));
      localStorage.removeItem(`story_liked_${id}`);
    }
  };

  // Handle Share Button
  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  // Category Name
  const categoryName = useMemo(() => {
    if (!story) return "Moral Story";
    if (typeof story.category === "string" && story.category.trim()) {
      return story.category.trim();
    }
    if (story.category_id && CATEGORY_MAP[story.category_id]) {
      return CATEGORY_MAP[story.category_id];
    }
    return "Moral Story";
  }, [story]);

  // Resolved Image URL: STRICT MATCH WITH CARD FIRST!
  const resolvedImageUrl = useMemo(() => {
    if (imageError) {
      return getCategoryFallbackImage(categoryName);
    }
    if (passedImage && typeof passedImage === "string" && passedImage.trim()) {
      return passedImage.trim();
    }
    if (story) {
      const url = getStoryImageUrl(story);
      if (url) return url;
    }
    const sId = story?.id || story?._id || id;
    if (sId) {
      return `/api/stories/${sId}/image`;
    }
    return getCategoryFallbackImage(categoryName);
  }, [imageError, passedImage, story, id, categoryName]);

  // Bilingual Hindi content memo
  const hindiData = useMemo(() => {
    return getHindiStoryData(story);
  }, [story]);

  // Localized Active Content based on Language (en / hi)
  const activeTitle = useMemo(() => {
    if (language === "hi") return hindiData.title;
    if (typeof story?.title === "string" && story.title.trim()) {
      return story.title.trim();
    }
    const sId = Number(story?.id || story?._id || id);
    const fallback = DEFAULT_STORIES.find((s) => Number(s.id) === sId);
    return fallback?.title || "Untitled Story";
  }, [language, hindiData, story, id]);

  const activeDescription = useMemo(() => {
    if (language === "hi") return hindiData.synopsis;
    if (typeof story?.description === "string" && story.description.trim()) {
      return story.description.trim();
    }
    const sId = Number(story?.id || story?._id || id);
    const fallback = DEFAULT_STORIES.find((s) => Number(s.id) === sId);
    if (fallback?.description) return fallback.description;
    return "A magical story filled with wonder, valuable life lessons, and heartwarming adventures for young minds.";
  }, [language, hindiData, story, id]);

  const activeParagraphs = useMemo(() => {
    if (language === "hi") {
      return hindiData.paragraphs;
    }
    const raw =
      (typeof story?.story === "string" && story.story.trim()) ||
      (typeof story?.content === "string" && story.content.trim()) ||
      "";
    if (!raw) {
      const sId = Number(story?.id || story?._id || id);
      if (sId === 12) {
        return [
          "Long ago, in the peaceful village of Sunnybrook, there stood a magnificent old clock tower that touched the clouds. Its golden clock shined brightly during the day, and every hour its bells echoed across the village.",
          "People believed the tower had stood there for hundreds of years. The villagers often said, 'Listen carefully at midnight, and you'll hear the tower whisper.' Most people laughed at the story. 'It's only the wind,' they said.",
          "But two curious children, Riya and Aarav, were determined to discover the truth. One starry evening, with flashlights in hand, they quietly walked toward the ancient tower.",
          "As the clock struck midnight with three majestic chimes—DONG! DONG! DONG!—a gentle whisper echoed through the stone chamber: 'Welcome, brave explorers...'",
          "Suddenly, a hidden golden doorway opened behind the great clock face, revealing a staircase of sparkling starlight and floating gears that glowed like fireflies.",
          "Together, through courage and teamwork, they solved the ancient riddle of the tower and restored the Clock of Happiness, proving that curiosity, kindness, and cherishing every moment are life's greatest treasures."
        ];
      }
      if (typeof story?.description === "string" && story.description.trim()) {
        return [story.description.trim()];
      }
      return ["Once upon a time in a magical land far away..."];
    }
    return raw
      .split(/\n\s*\n/)
      .map((p) => p.trim())
      .filter(Boolean);
  }, [language, hindiData, story, id]);

  const activeMoral = useMemo(() => {
    if (language === "hi") return hindiData.moral;
    if (typeof story?.moral === "string" && story.moral.trim()) {
      return story.moral.trim();
    }
    const sId = Number(story?.id || story?._id || id);
    if (sId === 12) {
      return "Time is life's greatest treasure. Use every moment wisely by spreading kindness, love, friendship, and happiness wherever you go.";
    }
    return (
      story?.moral ||
      "Kindness, courage, and honesty always light the way through life's greatest adventures."
    );
  }, [language, hindiData, story, id]);

  // Formatted Read Time & Age Group
  const formattedReadTime = useMemo(() => {
    if (!story?.read_time) return "5 Min Read";
    const rt = String(story.read_time);
    return rt.toLowerCase().includes("min") ? rt : `${rt} Min Read`;
  }, [story]);

  const formattedAgeGroup = useMemo(() => {
    if (!story?.age_group) return "All Ages";
    const ag = String(story.age_group);
    return ag.toLowerCase().includes("age") || ag.toLowerCase().includes("yr")
      ? ag
      : `${ag} Years`;
  }, [story]);

  // Key Theme String (as shown in mockup)
  const activeThemeString = useMemo(() => {
    const sId = story?.id || story?._id;
    if (sId && STORY_THEMES[sId]) {
      return language === "hi"
        ? STORY_THEMES[sId].hi
        : STORY_THEMES[sId].en;
    }
    if (story?.theme) return story.theme;
    return language === "hi"
      ? "साहस • जिज्ञासा • ईमानदारी • समय का महत्व"
      : "Courage • Curiosity • Honesty • Value of Time";
  }, [story, language]);

  // Handle Text-to-Speech (Audio Read-Along in English & Hindi)
  const toggleSpeech = () => {
    if (!speechSupported || !story) return;

    const synth = window.speechSynthesis;

    if (isSpeaking) {
      synth.cancel();
      setIsSpeaking(false);
      return;
    }

    synth.cancel();
    const textToRead = `${activeTitle}. ${activeDescription}. ${activeParagraphs.join(
      " "
    )}`;

    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.rate = 0.95;
    utterance.pitch = 1.05;

    if (language === "hi") {
      utterance.lang = "hi-IN";
      const voices = synth.getVoices ? synth.getVoices() : [];
      const hiVoice = voices.find(
        (v) =>
          (v.lang && (v.lang.startsWith("hi") || v.lang.includes("HI"))) ||
          (v.name && v.name.toLowerCase().includes("hindi"))
      );
      if (hiVoice) utterance.voice = hiVoice;
    } else {
      utterance.lang = "en-US";
    }

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    synth.speak(utterance);
    setIsSpeaking(true);
  };

  // Handle language switch
  const handleLanguageSwitch = (newLang) => {
    if (newLang === language) return;
    if (isSpeaking && typeof window !== "undefined") {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
    setLanguage(newLang);
  };

  // Kid-Friendly Font size classes
  const fontSizes = {
    sm: "text-base sm:text-lg leading-relaxed",
    md: "text-lg sm:text-xl leading-loose",
    lg: "text-xl sm:text-2xl leading-loose",
    xl: "text-2xl sm:text-3xl leading-loose",
  };

  // ====================================================
  // LOADING STATE (With auth.png - NO WHITE LIGHT)
  // ====================================================
  if (loading && !story) {
    return (
      <div className="min-h-screen relative flex items-center justify-center">
        <img
          src="/images/Other/auth.png"
          alt=""
          className="fixed inset-0 w-full h-full object-cover z-0 pointer-events-none"
        />
        <div className="fixed inset-0 bg-black/20 z-0 pointer-events-none" />
        <div className="relative z-10">
          <MagicalLoader
            message="Opening Storybook..."
            subtext="Gathering illustrations & fairy dust... ✨"
          />
        </div>
      </div>
    );
  }

  // ====================================================
  // ERROR STATE (With auth.png - NO WHITE LIGHT & NO FOOTER)
  // ====================================================
  if (error && !story) {
    return (
      <div className="min-h-screen relative flex flex-col">
        <img
          src="/images/Other/auth.png"
          alt=""
          className="fixed inset-0 w-full h-full object-cover z-0 pointer-events-none"
        />
        <div className="fixed inset-0 bg-black/25 z-0 pointer-events-none" />
        <Navbar />
        <div className="relative z-10 flex-1 flex items-center justify-center px-4 pt-28 pb-16">
          <div className="max-w-md w-full bg-[#FFFDF7]/95 backdrop-blur-md rounded-3xl p-8 text-center shadow-2xl border-2 border-amber-300">
            <div className="text-6xl mb-4">📖</div>
            <h2 className="text-2xl font-black text-amber-950 mb-2">
              Story Not Found
            </h2>
            <p className="text-slate-600 mb-6 text-sm">
              {error || "This story could not be found or has been moved."}
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => navigate(-1)}
                className="px-5 py-2.5 bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold rounded-2xl transition text-sm cursor-pointer"
              >
                ← Go Back
              </button>
              <Link
                to="/all-stories"
                className="px-5 py-2.5 bg-gradient-to-r from-amber-400 to-orange-500 text-white font-bold rounded-2xl shadow-md hover:shadow-lg transition text-sm cursor-pointer"
              >
                Browse All Stories
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ====================================================
  // FULL PAGE SPLIT-SCREEN LAYOUT
  // Top header bar removed.
  // Language & Share integrated into the Story Header.
  // Left Column sticky throughout entire reading.
  // Two horizontal scroll carousels after story completion:
  // 1. 🎬 Animated Video Tales
  // 2. 📚 More Stories For You / All Stories Cards ("add a all stroy card here")
  // ====================================================
  return (
    <div className="min-h-screen relative text-slate-800 flex flex-col selection:bg-amber-200 overflow-x-hidden">
      {/* Background Image: auth.png without white light overlay */}
      <img
        src="/images/Other/auth.png"
        alt=""
        className="fixed inset-0 w-full h-full object-cover z-0 pointer-events-none"
      />
      {/* Subtle glass tint for crisp contrast - NO WHITE LIGHT */}
      <div className="fixed inset-0 bg-black/15 pointer-events-none z-0" />

      {/* Scrollbar styles */}
      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .story-scroll::-webkit-scrollbar {
          width: 8px;
        }
        .story-scroll::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 9999px;
        }
        .story-scroll::-webkit-scrollbar-thumb {
          background: #93c5fd;
          border-radius: 9999px;
        }
        .story-scroll::-webkit-scrollbar-thumb:hover {
          background: #60a5fa;
        }
        .story-scroll {
          scrollbar-width: thin;
          scrollbar-color: #93c5fd #f1f5f9;
        }
      `}</style>

      {/* Top Fixed Navbar */}
      <Navbar />

      {/* Main Container - Starts cleanly below Navbar with NO extra dead space */}
      <main className="relative z-10 flex-1 w-full max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 pt-20 sm:pt-24 pb-20 sm:pb-24">
        {/* ==================================================
            2-COLUMN SPLIT GRID (EXACT MATCH WITH USER MOCKUP)
            Left: White Card with Story Artwork & Like Engagement
            Right: White Card with Scroll for Reading Whole Story
        ================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* ================================================
              LEFT CARD: STORY IMAGE & LIKE ENGAGEMENT (Matching Mockup)
          ================================================= */}
          <div className="lg:col-span-5 xl:col-span-5">
            <div className="bg-white/95 backdrop-blur-md rounded-[2.5rem] p-3.5 sm:p-4 shadow-xl border-2 border-sky-100 flex flex-col justify-between">
              {/* Story Artwork Frame */}
              <div className="relative group rounded-[2rem] overflow-hidden aspect-[4/3] sm:aspect-[1/1] lg:aspect-[4/3] xl:aspect-[1/1] max-h-[500px] bg-slate-900/10 flex items-center justify-center shadow-inner">
                {/* Saturated Ambient Aura */}
                <img
                  src={resolvedImageUrl}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover blur-2xl scale-125 opacity-70 filter saturate-150 brightness-95 pointer-events-none"
                />

                {/* 100% Top & Middle Focused Story Illustration */}
                <img
                  src={resolvedImageUrl}
                  alt={activeTitle}
                  onError={(e) => {
                    setImageError(true);
                    e.currentTarget.onerror = null;
                    e.currentTarget.src =
                      getCategoryFallbackImage(categoryName);
                  }}
                  loading="eager"
                  decoding="async"
                  fetchPriority="high"
                  className="relative z-10 w-full h-full object-cover object-top origin-top drop-shadow-md group-hover:scale-105 transition-transform duration-500 ease-out cursor-pointer"
                  onClick={() => setIsLightboxOpen(true)}
                />

                {/* Floating Category Pill on Top Left */}
                <div className="absolute top-4 left-4 z-20">
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/95 backdrop-blur-md text-xs font-black text-amber-900 shadow-md border border-amber-200">
                    <span className="text-amber-500 text-sm">⭐</span>
                    <span>{categoryName}</span>
                  </span>
                </div>

                {/* Expand to Lightbox Button on Top Right */}
                <button
                  onClick={() => setIsLightboxOpen(true)}
                  className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-black/40 hover:bg-black/65 backdrop-blur-md text-white flex items-center justify-center shadow-md transition-all cursor-pointer hover:scale-110"
                  title="View full-size illustration 🪄"
                >
                  <FaExpand className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Bottom Strip: Floral Doodles & Like Button with Sparkles */}
              <div className="pt-4 pb-1 px-4 flex items-center justify-between">
                {/* Left floral decoration */}
                <div className="flex items-center gap-1 text-emerald-600 select-none">
                  <span className="text-2xl">🌱</span>
                  <span className="text-base">🌸</span>
                </div>

                {/* Centered Like Button with Sparkles/Rays */}
                <div className="flex items-center gap-2.5">
                  <span className="text-pink-400 font-bold text-sm select-none">═</span>
                  <button
                    onClick={handleLike}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-full font-black text-sm transition-all cursor-pointer shadow-md active:scale-95 border border-pink-300 ${
                      liked
                        ? "bg-pink-600 text-white ring-2 ring-pink-200 scale-105"
                        : "bg-pink-500 hover:bg-pink-600 text-white"
                    }`}
                  >
                    <FaHeart className={`w-4 h-4 fill-current ${liked ? "animate-bounce" : ""}`} />
                    <span>Like</span>
                  </button>
                  <span className="text-pink-600 font-black text-base">{likesCount}</span>
                  <span className="text-pink-400 font-bold text-sm select-none">═</span>
                </div>

                {/* Right floral decoration */}
                <div className="flex items-center gap-1 text-emerald-600 select-none">
                  <span className="text-base">🌼</span>
                  <span className="text-2xl">🌿</span>
                </div>
              </div>
            </div>
          </div>

          {/* ================================================
              RIGHT CARD: SCROLLABLE STORY DETAILS & SANCTUARY (Matching Mockup)
          ================================================= */}
          <div className="lg:col-span-7 xl:col-span-7">
            <div className="bg-white/95 backdrop-blur-md rounded-[2.5rem] p-6 sm:p-8 shadow-xl border-2 border-sky-100 flex flex-col max-h-[620px] xl:max-h-[660px]">
              {/* Scrollable Container with Custom Kid-Friendly Scrollbar */}
              <div className="overflow-y-auto story-scroll pr-3 space-y-5 flex-1">
                {/* Row 1: Language Switcher & Share */}
                <div className="flex items-center justify-end gap-3">
                  {/* Language Switcher */}
                  <div className="flex items-center gap-1 bg-sky-50 border border-sky-200 rounded-full p-1 shadow-2xs">
                    <span className="text-sky-800 text-xs font-black px-2 flex items-center gap-1">
                      <span>🌐</span>
                      <span>Language:</span>
                    </span>
                    <button
                      onClick={() => handleLanguageSwitch("en")}
                      className={`px-3.5 py-1 rounded-full text-xs font-black transition-all cursor-pointer ${
                        language === "en"
                          ? "bg-sky-500 text-white shadow-xs scale-105"
                          : "text-sky-800 hover:bg-sky-100"
                      }`}
                      title="Read in English"
                    >
                      English
                    </button>
                    <button
                      onClick={() => handleLanguageSwitch("hi")}
                      className={`px-3.5 py-1 rounded-full text-xs font-black transition-all cursor-pointer ${
                        language === "hi"
                          ? "bg-sky-500 text-white shadow-xs scale-105"
                          : "text-sky-800 hover:bg-sky-100"
                      }`}
                      title="हिंदी में पढ़ें (Read in Hindi)"
                    >
                      हिंदी
                    </button>
                  </div>

                  {/* Share Button */}
                  <button
                    onClick={handleShare}
                    className="flex items-center gap-1.5 px-4 py-1.5 bg-white hover:bg-sky-50 border border-sky-200 rounded-full text-slate-700 font-bold text-xs shadow-2xs transition-all cursor-pointer active:scale-95"
                    title="Share story link"
                  >
                    {copied ? (
                      <>
                        <FaCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700 font-black">Copied!</span>
                      </>
                    ) : (
                      <>
                        <FaShareAlt className="w-3.5 h-3.5 text-sky-600" />
                        <span>Share</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Row 2: Metadata Chips */}
                <div className="flex flex-wrap items-center gap-3">
                  {/* 140 Young Readers */}
                  <div className="flex items-center gap-2 bg-sky-50 border border-sky-200 text-sky-800 px-4 py-2 rounded-full font-bold text-xs shadow-2xs">
                    <FaEye className="text-sky-500 w-3.5 h-3.5" />
                    <span>{story?.views || 140} Young Readers</span>
                  </div>

                  {/* 5 Min Read */}
                  <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-900 px-4 py-2 rounded-full font-bold text-xs shadow-2xs">
                    <span className="text-amber-600">⏱️</span>
                    <span>{formattedReadTime}</span>
                  </div>

                  {/* 4-6 years */}
                  <div className="flex items-center gap-2 bg-pink-50 border border-pink-200 text-pink-700 px-4 py-2 rounded-full font-bold text-xs shadow-2xs">
                    <FaUserFriends className="text-pink-500 w-3.5 h-3.5" />
                    <span>{formattedAgeGroup}</span>
                  </div>
                </div>

                {/* Row 3: "About This Story" Box (Matching Mockup) */}
                <div className="bg-[#EAF8F2] rounded-3xl p-6 border border-[#C6EBDD] relative overflow-hidden shadow-2xs">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <span className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center text-sm shadow-xs font-bold">
                        📖
                      </span>
                      <h3 className="text-emerald-950 font-black text-lg sm:text-xl tracking-tight">
                        {language === "hi" ? "कहानी के बारे में" : "About This Story"}
                      </h3>
                    </div>

                    {/* Magic book illustration */}
                    <div className="relative flex items-center justify-center select-none" title="Magical Story">
                      <div className="relative">
                        <span className="text-3xl drop-shadow-xs">📖</span>
                        <span className="absolute -top-2 -right-1 text-amber-400 text-sm animate-pulse">✨</span>
                        <span className="absolute -bottom-1 -left-2 text-amber-400 text-xs">⭐</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-slate-700 text-sm sm:text-base font-medium leading-relaxed">
                    {activeDescription}
                  </p>
                </div>

                {/* Row 4: "Key Theme" Box (Matching Mockup) */}
                <div className="bg-[#EAF8F2] rounded-3xl p-5 border border-[#C6EBDD] relative overflow-hidden shadow-2xs">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <span className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center text-sm shadow-xs font-bold">
                        🍃
                      </span>
                      <h4 className="text-emerald-950 font-black text-base sm:text-lg tracking-tight">
                        {language === "hi" ? "मुख्य सीख / विषय" : "Key Theme"}
                      </h4>
                    </div>

                    {/* Sprout with heart */}
                    <div className="flex items-center gap-1 select-none">
                      <span className="text-2xl drop-shadow-xs">🌱</span>
                      <span className="text-rose-500 text-base -ml-1 -mt-2 animate-bounce">❤️</span>
                    </div>
                  </div>

                  <div className="bg-white/95 border border-[#C6EBDD] rounded-2xl px-5 py-2.5 flex items-center gap-2.5 shadow-2xs">
                    <span className="text-amber-500 text-base">⭐</span>
                    <span className="text-[#1E3A8A] font-bold text-xs sm:text-sm">
                      {activeThemeString}
                    </span>
                  </div>
                </div>

                {/* Row 5: Whole Story Reading Sanctuary (Scroll to read whole story!) */}
                <div className="bg-[#FFFDF8] rounded-3xl p-6 sm:p-8 border border-amber-200/80 relative overflow-hidden shadow-sm">
                  {/* Story Title & Reader Controls */}
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-amber-100">
                    <div>
                      <h2 className="text-2xl sm:text-3xl font-black text-amber-950 tracking-tight">
                        {activeTitle}
                      </h2>
                      <p className="text-xs text-slate-400 font-medium mt-0.5">
                        {language === "hi" ? "पूरी कहानी पढ़ें ✨" : "Read the whole story ✨"}
                      </p>
                    </div>

                    <div className="flex items-center gap-2.5 flex-wrap">
                      {/* Audio Narration Toggle */}
                      {speechSupported && (
                        <button
                          onClick={toggleSpeech}
                          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer shadow-xs active:scale-95 border-b-2 ${
                            isSpeaking
                              ? "bg-rose-500 hover:bg-rose-600 text-white border-rose-700 animate-pulse"
                              : "bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white border-teal-700"
                          }`}
                          title={
                            isSpeaking
                              ? "Pause Narration"
                              : language === "hi"
                              ? "कहानी सुनें"
                              : "Listen to Story (Read Aloud 🎧)"
                          }
                        >
                          {isSpeaking ? (
                            <>
                              <FaVolumeMute className="w-3.5 h-3.5" />
                              <span>{language === "hi" ? "रोकें ⏹️" : "Stop ⏹️"}</span>
                            </>
                          ) : (
                            <>
                              <FaVolumeUp className="w-3.5 h-3.5" />
                              <span>{language === "hi" ? "कहानी सुनें 🎧" : "Read Aloud 🎧"}</span>
                            </>
                          )}
                        </button>
                      )}

                      {/* Font Size Selector */}
                      <div className="flex items-center gap-1.5 bg-amber-50 px-2.5 py-1 rounded-xl border border-amber-200 text-xs font-black text-amber-900">
                        <span className="text-[10px] uppercase tracking-wider text-amber-700 mr-1 font-black">
                          Text:
                        </span>
                        {[
                          { key: "sm", label: "🐥 Small" },
                          { key: "md", label: "🦊 Medium" },
                          { key: "lg", label: "🦁 Large" },
                          { key: "xl", label: "🐘 Jumbo" },
                        ].map((item) => (
                          <button
                            key={item.key}
                            onClick={() => setFontSize(item.key)}
                            className={`px-2 py-0.5 rounded-lg font-black transition-all text-xs cursor-pointer ${
                              fontSize === item.key
                                ? "bg-amber-500 text-white shadow-xs scale-105"
                                : "text-amber-800 hover:bg-amber-200/70"
                            }`}
                          >
                            {item.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Story Paragraphs with Drop-Cap */}
                  <div className={`prose prose-slate max-w-none text-slate-800 ${fontSizes[fontSize]}`}>
                    {activeParagraphs.map((paragraph, index) => (
                      <p key={index} className="mb-6 font-normal">
                        {index === 0 ? (
                          <span className="float-left text-5xl sm:text-6xl font-black text-amber-600 mr-3.5 leading-none font-serif select-none">
                            {paragraph.charAt(0)}
                          </span>
                        ) : null}
                        {index === 0 ? paragraph.slice(1) : paragraph}
                      </p>
                    ))}
                  </div>

                  {/* Moral of the Story */}
                  <div className="mt-8 p-5 bg-gradient-to-r from-amber-50 via-orange-50/60 to-yellow-50 rounded-2xl border-2 border-dashed border-amber-300 shadow-xs">
                    <div className="flex items-center gap-2 text-amber-900 font-black text-base sm:text-lg mb-2">
                      <span>🌟</span>
                      <span>
                        {language === "hi"
                          ? "कहानी की सीख (Moral of the Story)"
                          : "Secret Wisdom / Moral of the Story"}
                      </span>
                    </div>
                    <p className="text-slate-700 font-semibold italic text-base sm:text-lg">
                      {activeMoral}
                    </p>
                  </div>

                  {/* Celebration Banner */}
                  <div className="text-center mt-10 pt-6 border-t border-amber-100">
                    <div className="inline-flex items-center justify-center p-3 bg-amber-100 text-amber-900 rounded-full text-3xl mb-2 shadow-inner border border-amber-200">
                      🎉🏆✨
                    </div>
                    <h3 className="text-2xl sm:text-3xl font-black text-amber-950 mb-1 tracking-tight">
                      {language === "hi" ? "🎉 कहानी पूरी हो गई!" : "🎉 Story Completed!"}
                    </h3>
                    <p className="text-sm sm:text-base text-amber-900/80 font-bold max-w-md mx-auto">
                      {language === "hi"
                        ? "शानदार! आपने पूरी कहानी समाप्त कर ली।"
                        : "Great job! You finished the story."}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ──────────────────────────────────────────────────
            DIVIDER LINE
        ────────────────────────────────────────────────── */}
        <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-amber-300 to-transparent my-10" />

        {/* ==================================================
            SECTION 2: 📚 ALL STORIES CARDS / MORE STORIES FOR YOU
            "add a all stroy card here" - Directly below videos!
        ================================================== */}
        <div className="my-10">
          {/* Header with Title & Scroll Controls */}
          <div className="bg-white/90 backdrop-blur-md rounded-3xl p-5 sm:p-6 shadow-md border-2 border-amber-200/90 mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-100/90 text-amber-900 text-xs font-black uppercase tracking-wider mb-2 shadow-2xs border border-amber-300/80">
                <span>📚 All Story Books</span>
              </div>
              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black text-amber-950 tracking-tight flex items-center gap-2.5">
                <span>More Magical Stories For You</span>
                <span className="animate-pulse">✨</span>
              </h3>
              <p className="text-xs sm:text-sm text-slate-700 mt-1 font-semibold">
                Explore hand-picked illustrated stories and reading adventures
              </p>
            </div>

            {/* Navigation Controls */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleStoryScroll("left")}
                  disabled={!canScrollLeftStory}
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-black transition-all shadow-md active:scale-90 cursor-pointer ${
                    canScrollLeftStory
                      ? "bg-gradient-to-b from-amber-300 to-amber-500 text-amber-950 hover:brightness-105 border-b-2 border-amber-600"
                      : "bg-amber-100 text-amber-300 border-none cursor-not-allowed opacity-40"
                  }`}
                  title="Scroll left"
                >
                  <FaChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleStoryScroll("right")}
                  disabled={!canScrollRightStory}
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-black transition-all shadow-md active:scale-90 cursor-pointer ${
                    canScrollRightStory
                      ? "bg-gradient-to-b from-amber-300 to-amber-500 text-amber-950 hover:brightness-105 border-b-2 border-amber-600"
                      : "bg-amber-100 text-amber-300 border-none cursor-not-allowed opacity-40"
                  }`}
                  title="Scroll right"
                >
                  <FaChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <Link
                to="/all-stories"
                className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-black text-xs sm:text-sm rounded-full shadow-md hover:shadow-lg transition-all flex items-center gap-1.5 active:scale-95 border-b-2 border-amber-700"
              >
                <span>View All Stories</span>
                <span>→</span>
              </Link>
            </div>
          </div>

          {/* Horizontal Scrollable Story Carousel */}
          <div
            ref={storyCarouselRef}
            onScroll={updateStoryScrollButtons}
            className="flex gap-6 overflow-x-auto scroll-smooth py-4 px-1 snap-x snap-mandatory no-scrollbar"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {relatedStories.map((relStory) => {
              const relImg = getStoryImageUrl(relStory);
              return (
                <Link
                  key={relStory.id || relStory._id}
                  to={`/story/${relStory.id || relStory._id}`}
                  state={{ cardImage: relImg, story: relStory }}
                  className="w-[280px] sm:w-[320px] flex-shrink-0 snap-start group bg-[#FFFDF8]/95 backdrop-blur-md rounded-3xl overflow-hidden shadow-md hover:shadow-2xl border-2 border-amber-200/90 hover:border-amber-400 hover:-translate-y-2 transition-all duration-300 flex flex-col cursor-pointer"
                >
                  {/* Artwork Frame: aspect-[4/3], Top & Middle in focus, Bottom cropped out */}
                  <div className="relative aspect-[4/3] overflow-hidden bg-amber-50/50 flex items-center justify-center">
                    <img
                      src={relImg}
                      alt={relStory.title}
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = getCategoryFallbackImage(
                          relStory.category
                        );
                      }}
                      className="w-full h-full object-cover object-top origin-top group-hover:scale-105 transition-transform duration-500 ease-out"
                    />

                    <span className="absolute top-3 left-3 z-20 px-3 py-1 rounded-full bg-white/95 backdrop-blur-md text-[11px] font-black text-amber-800 shadow-sm border border-amber-100 flex items-center gap-1">
                      <span>✨</span>
                      <span>{relStory.category || "Moral Story"}</span>
                    </span>
                  </div>

                  {/* Card Content */}
                  <div className="p-5 flex-1 flex flex-col justify-between bg-gradient-to-b from-white to-amber-50/30">
                    <div>
                      <h4 className="font-black text-amber-950 text-base sm:text-lg group-hover:text-amber-600 transition-colors line-clamp-1 leading-snug">
                        {relStory.title}
                      </h4>
                      <p className="text-slate-500 text-xs sm:text-sm mt-2 line-clamp-2 leading-relaxed font-medium">
                        {relStory.description ||
                          "Read this exciting illustrated story!"}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-amber-100 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-amber-800 bg-amber-100/70 px-2.5 py-0.5 rounded-lg">
                          🎈 {relStory.age_group || "All Ages"}
                        </span>
                        <span className="text-xs font-bold text-amber-800 bg-amber-100/70 px-2 py-0.5 rounded-lg flex items-center gap-1">
                          <FaClock className="text-amber-600 text-[10px]" />
                          <span>{relStory.read_time || "5 Min"}</span>
                        </span>
                      </div>

                      <div className="px-3.5 py-1.5 bg-gradient-to-r from-amber-400 to-orange-400 group-hover:from-amber-500 group-hover:to-orange-500 text-amber-950 font-black text-xs rounded-xl shadow-xs group-hover:shadow transition-all flex items-center gap-1.5 border-b border-amber-600">
                        <span>Read</span>
                        <span className="group-hover:translate-x-0.5 transition-transform">
                          📖✨
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </main>

      {/* ==================================================
          LIGHTBOX MODAL FOR FULL ILLUSTRATION
      ================================================== */}
      <AnimatePresence>
        {isLightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-8"
            onClick={() => setIsLightboxOpen(false)}
          >
            <div className="relative max-w-4xl max-h-[90vh] w-full flex flex-col items-center">
              <button
                onClick={() => setIsLightboxOpen(false)}
                className="absolute -top-12 right-0 text-white/80 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
                title="Close"
              >
                <FaTimes className="w-6 h-6" />
              </button>
              <img
                src={resolvedImageUrl}
                alt={activeTitle}
                className="max-w-full max-h-[80vh] object-contain rounded-2xl shadow-2xl border border-white/20"
                onClick={(e) => e.stopPropagation()}
              />
              <p className="text-white/90 text-sm font-bold mt-4 text-center">
                {activeTitle} • {categoryName}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StoryDetail;