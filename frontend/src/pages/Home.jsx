
import { useState, useEffect } from "react";

import { videoService } from "../services/videoService";

import Navbar from "../components/Navbar";
import JungleFriends from "../components/JungleFriends";
import VideoSection from "../components/VideoSection";
import StoryCards from "../components/StoryCards";
import Newsletter from "../components/Newsletter";
import Contact from "../components/Contact";
import Footer from "../components/Footer";

function Home() {
  const [isContactOpen, setIsContactOpen] = useState(false);

  const [videos, setVideos] = useState([]);

  // ==========================================
  // CONTACT EVENT
  // ==========================================
  useEffect(() => {
    const handleOpenContact = () => {
      setIsContactOpen(true);
    };

    window.addEventListener("openContact", handleOpenContact);

    return () => {
      window.removeEventListener("openContact", handleOpenContact);
    };
  }, []);

  // ==========================================
  // FETCH VIDEOS
  // ==========================================
  useEffect(() => {
    let mounted = true;

    const loadVideos = async () => {
      try {
        const data = await videoService.getAll();

        if (!mounted) return;

        setVideos(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to load videos:", error);

        if (mounted) {
          setVideos([]);
        }
      }
    };

    loadVideos();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 relative">

      {/* ==========================================
          LIGHTWEIGHT BACKGROUND
      ========================================== */}
      <div
        className="absolute inset-0 pointer-events-none overflow-hidden"
        aria-hidden="true"
      >
        {/* Top-left light */}
        <div className="absolute -top-20 -left-20 w-72 h-72 rounded-full bg-yellow-200/20 blur-3xl" />

        {/* Bottom-right light */}
        <div className="absolute -bottom-20 -right-20 w-72 h-72 rounded-full bg-orange-200/20 blur-3xl" />
      </div>

      {/* ==========================================
          MAIN CONTENT
      ========================================== */}
      <div className="relative z-10">

        {/* NAVBAR */}
        <Navbar />

        {/* ========================================
            CHARACTERS
        ======================================== */}
        <section id="characters">
          <JungleFriends />
        </section>

        {/* ========================================
            VIDEOS
        ======================================== */}
        <section id="videos">
          <VideoSection videos={videos} />
        </section>

        {/* ========================================
            STORIES
            StoryCards handles story fetching
        ======================================== */}
        <section id="stories">
          <StoryCards />
        </section>

        {/* ========================================
            NEWSLETTER
        ======================================== */}
        <section id="newsletter">
          <Newsletter />
        </section>

        {/* ========================================
            CONTACT
        ======================================== */}
        <Contact
          isOpen={isContactOpen}
          onClose={() => setIsContactOpen(false)}
        />

        {/* ========================================
            FOOTER
        ======================================== */}
        <Footer />

      </div>
    </div>
  );
}

export default Home;

