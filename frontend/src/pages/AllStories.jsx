// src/pages/AllVideos.jsx
import StoryCards from "../components/StoryCards";

const AllStories = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 to-indigo-900">
      <StoryCards showOnlyGrid={true} />
    </div>
  );
};

export default AllStories ;