// src/pages/AllVideos.jsx
import VideoSection from "../components/VideoSection";

const AllVideos = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 to-indigo-900">
      <VideoSection showOnlyGrid={true} />
    </div>
  );
};

export default AllVideos;