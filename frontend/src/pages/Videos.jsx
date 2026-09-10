import { useState, useEffect } from "react";
import { videoService } from "../services/videoService";
import Navbar from "../components/Navbar";
import VideoSection from "../components/VideoSection";
import Footer from "../components/Footer";

const Videos = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await videoService.getAll();
        setVideos(data || []);
      } catch (error) {
        console.error("Error fetching videos:", error);
        setError("Failed to load videos. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, []);

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
      <Navbar />
      <div className="pt-0">
        <VideoSection videos={videos} loading={loading} />
      </div>
      <Footer />
    </>
  );
};

export default Videos;