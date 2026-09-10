import React from "react";
import { FaBookOpen, FaPlay, FaStar } from "react-icons/fa";

// ==========================================
// STORY CARD SKELETON
// ==========================================
export const StoryCardSkeleton = () => (
  <div className="bg-white rounded-2xl overflow-hidden shadow-lg border border-white/20 animate-pulse flex flex-col h-full">
    {/* Image placeholder with 4/3 aspect ratio */}
    <div className="relative aspect-[4/3] bg-gradient-to-br from-amber-100 via-yellow-100 to-orange-100 flex items-center justify-center">
      <div className="w-12 h-12 rounded-full bg-white/50 flex items-center justify-center">
        <FaBookOpen className="text-amber-300 text-xl" />
      </div>
      {/* Read time pill placeholder */}
      <div className="absolute bottom-3 right-3 h-5 w-14 bg-black/20 rounded-md" />
    </div>

    {/* Content placeholder */}
    <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
      <div>
        {/* Category tag */}
        <div className="h-4 w-20 bg-yellow-200/70 rounded-full mb-2" />
        {/* Title lines */}
        <div className="h-5 bg-gray-200 rounded-md w-4/5 mb-1.5" />
        <div className="h-5 bg-gray-200 rounded-md w-3/5" />
      </div>

      {/* Meta (age, author) */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
        <div className="h-3.5 bg-gray-200 rounded w-16" />
        <div className="h-3.5 bg-gray-200 rounded w-20" />
      </div>
    </div>
  </div>
);

// ==========================================
// STORY GRID SKELETON
// ==========================================
export const StoryGridSkeleton = ({ count = 4 }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
    {Array.from({ length: count }).map((_, idx) => (
      <StoryCardSkeleton key={`story-skeleton-${idx}`} />
    ))}
  </div>
);

// ==========================================
// VIDEO CARD SKELETON
// ==========================================
export const VideoCardSkeleton = () => (
  <div className="bg-white rounded-2xl overflow-hidden shadow-lg border border-white/20 animate-pulse flex flex-col h-full">
    {/* Video 16/9 aspect ratio */}
    <div className="relative aspect-video bg-gradient-to-br from-purple-100 via-indigo-100 to-pink-100 flex items-center justify-center">
      <div className="w-12 h-12 rounded-full bg-white/60 flex items-center justify-center shadow-inner">
        <FaPlay className="text-purple-300 text-lg ml-0.5" />
      </div>
      {/* Duration pill */}
      <div className="absolute bottom-3 right-3 h-5 w-12 bg-black/20 rounded-md" />
    </div>

    {/* Content */}
    <div className="p-4 space-y-2">
      <div className="h-4 bg-purple-100 rounded-full w-24 mb-1" />
      <div className="h-5 bg-gray-200 rounded-md w-5/6" />
      <div className="h-5 bg-gray-200 rounded-md w-2/3" />
    </div>
  </div>
);

// ==========================================
// VIDEO GRID SKELETON
// ==========================================
export const VideoGridSkeleton = ({ count = 8 }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 w-full">
    {Array.from({ length: count }).map((_, idx) => (
      <VideoCardSkeleton key={`video-skeleton-${idx}`} />
    ))}
  </div>
);

// ==========================================
// MAGICAL FULL/SECTION LOADER
// ==========================================
export const MagicalLoader = ({
  message = "Loading magical stories...",
  subtext = "Please wait a moment ✨",
  fullScreen = false,
}) => {
  const content = (
    <div className="text-center p-8 max-w-sm mx-auto">
      <div className="relative w-20 h-20 mx-auto mb-6">
        {/* Outer pulse ring */}
        <div className="absolute inset-0 rounded-full bg-yellow-400/30 animate-ping" />
        {/* Spinning border */}
        <div className="w-20 h-20 border-4 border-yellow-400/30 border-t-yellow-400 rounded-full animate-spin" />
        {/* Center glowing star */}
        <div className="absolute inset-0 flex items-center justify-center">
          <FaStar className="text-yellow-400 text-2xl animate-pulse" />
        </div>
      </div>
      <h3 className="text-xl font-bold text-gray-800 drop-shadow-sm">{message}</h3>
      {subtext && <p className="text-sm text-gray-600 mt-2 font-medium">{subtext}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50">
        {content}
      </div>
    );
  }

  return <div className="w-full py-16 flex items-center justify-center">{content}</div>;
};

// ==========================================
// ADMIN DASHBOARD / TABLE SKELETON
// ==========================================
export const AdminTableSkeleton = ({ rows = 5, columns = 4, title = "Loading data..." }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 animate-pulse space-y-4">
    <div className="flex items-center justify-between border-b border-gray-100 pb-4">
      <div className="h-6 bg-gray-200 rounded w-48" />
      <div className="h-8 bg-gray-200 rounded w-32" />
    </div>
    <div className="space-y-3 pt-2">
      {Array.from({ length: rows }).map((_, rIdx) => (
        <div key={`row-${rIdx}`} className="flex items-center gap-4 py-2 border-b border-gray-50">
          {Array.from({ length: columns }).map((_, cIdx) => (
            <div
              key={`col-${cIdx}`}
              className={`h-4 bg-gray-200 rounded ${
                cIdx === 0 ? "w-1/3" : cIdx === 1 ? "w-1/4" : "w-1/6"
              }`}
            />
          ))}
        </div>
      ))}
    </div>
  </div>
);
