import { useState, useEffect } from "react";
import { storyService } from "../services/storyService";
import Navbar from "../components/Navbar";
import StoryCards from "../components/StoryCards";
import Footer from "../components/Footer";
import Contact from "../components/Contact";

const Stories = () => {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isContactOpen, setIsContactOpen] = useState(false);

  useEffect(() => {
    const handleOpenContact = () => {
      setIsContactOpen(true);
    };

    window.addEventListener("openContact", handleOpenContact);

    return () => {
      window.removeEventListener("openContact", handleOpenContact);
    };
  }, []);

  useEffect(() => {
    const fetchStories = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await storyService.getAll();
        setStories(data || []);
      } catch (error) {
        console.error("Error fetching stories:", error);
        setError("Failed to load stories. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchStories();
  }, []);

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 to-indigo-900">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-white font-bold mt-4 text-xl">Loading magical stories... ✨</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 to-indigo-900 p-4">
          <div className="bg-red-500/20 border-2 border-red-400 text-red-200 px-6 py-4 rounded-xl max-w-md text-center">
            <p className="text-4xl mb-2">😅</p>
            <p className="font-bold">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-4 px-6 py-2 bg-yellow-400 text-purple-900 rounded-xl font-bold hover:bg-yellow-300 transition"
            >
              Try Again 🔄
            </button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar storyCount={stories.length} />
      {/* Remove the wrapper div - StoryCards already handles its own layout */}
      <StoryCards stories={stories} />
      <Contact
        isOpen={isContactOpen}
        onClose={() => setIsContactOpen(false)}
      />
      <Footer />
    </>
  );
};

export default Stories;