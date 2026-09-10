
// src/components/VideoCard.jsx

const VideoCard = ({
  videoId,
  idx,
  parachutePatterns,
  getThumbnail,
  setModal,
}) => {
  const lanes = [
    "4%",
    "16%",
    "28%",
    "40%",
    "52%",
    "64%",
    "76%",
    "88%",
  ];

  const chosenLeft = lanes[idx % lanes.length];

  const duration = 15 + (idx % 3) * 2;
  const delay = idx * 1.6;

  const xVariant = idx % 2 === 0 ? "35px" : "-35px";

  const currentPattern =
    parachutePatterns[idx % parachutePatterns.length];

  const thumbnail = getThumbnail(videoId);

  const handleClick = () => {
    if (videoId) {
      setModal(videoId);
    }
  };

  return (
    <div
      className="absolute flex flex-col items-center select-none cursor-pointer will-change-transform filter drop-shadow-[0_12px_24px_rgba(0,0,0,0.35)]"
      style={{
        left: chosenLeft,
        zIndex: 20 + (idx % 5),
        animation: `floatUpward ${duration}s ${delay}s infinite linear both`,
        "--x-offset": xVariant,
      }}
      onClick={handleClick}
    >
      {/* =========================
          DESKTOP VIEW
      ========================== */}
      <div className="hidden md:flex flex-col items-center w-[160px] lg:w-[180px] transition-transform duration-200 hover:scale-105 group">

        {/* Parachute */}
        <div className="w-full aspect-[1.25/1] rounded-t-[110px_90px] border-[3.5px] border-amber-950 bg-slate-100 relative shadow-md flex overflow-hidden">
          {currentPattern.map((gradColor, i) => (
            <div
              key={i}
              className={`w-1/4 h-full bg-gradient-to-b ${gradColor} border-r-[1.5px] border-amber-950/30 relative flex flex-col justify-between items-center py-2`}
            >
              <div className="w-1.5 h-1.5 rounded-full bg-white/70" />
            </div>
          ))}
        </div>

        {/* Rope */}
        <div className="w-full h-12 relative z-0 -mt-[1px]">
          <svg
            viewBox="0 0 100 60"
            className="w-full h-full stroke-amber-900 stroke-[1.8] fill-none opacity-95"
          >
            <path d="M 50 0 L 50 55" />
          </svg>

          <div className="absolute bottom-[-4px] left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-pink-500 border-2 border-amber-950 z-20" />
        </div>

        {/* Video Basket */}
        <div className="w-[85%] aspect-[1.15/1] bg-gradient-to-br from-orange-400 via-amber-400 to-yellow-500 rounded-[30px] p-2 border-[3.5px] border-amber-950 shadow-lg relative flex flex-col items-center justify-center">

          <div className="w-[94%] h-[76%] bg-slate-950 rounded-xl overflow-hidden relative border-[3px] border-amber-950 shadow-inner">

            {/* Thumbnail */}
            <img
              src={thumbnail}
              alt="Video"
              className="w-full h-full object-cover"
              loading={idx < 3 ? "eager" : "lazy"}
              decoding="async"
              fetchPriority={idx < 3 ? "high" : "auto"}
              onError={(e) => {
                e.currentTarget.src =
                  "/images/video-placeholder.jpg";
              }}
            />

            {/* Play Overlay */}
            <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/20 transition-colors duration-150">
              <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                <span className="text-amber-600 text-lg font-black ml-0.5">
                  ▶
                </span>
              </div>
            </div>

            {/* 
              YOUTUBE TITLE REMOVED
              No title overlay here
            */}
          </div>
        </div>
      </div>

      {/* =========================
          MOBILE VIEW
      ========================== */}
      <div className="flex md:hidden flex-col items-center w-[35vw] max-w-[140px] aspect-[5/8] active:scale-95 relative">

        {/* Video */}
        <div
          className="relative w-full h-[70%] p-[2px] bg-gradient-to-b from-yellow-400 via-amber-300 to-yellow-500 shadow-md flex items-center justify-center"
          style={{
            borderRadius:
              "50% 50% 50% 50% / 45% 45% 55% 55%",
          }}
        >
          <div
            className="w-full h-full relative bg-slate-900 overflow-hidden"
            style={{
              clipPath:
                "ellipse(49% 50% at 50% 50%)",
              borderRadius:
                "50% 50% 50% 50% / 45% 45% 55% 55%",
            }}
          >

            {/* Thumbnail */}
            <img
              src={thumbnail}
              alt="Video"
              className="w-full h-full object-cover scale-110"
              loading={idx < 2 ? "eager" : "lazy"}
              decoding="async"
              fetchPriority={idx < 2 ? "high" : "auto"}
              onError={(e) => {
                e.currentTarget.src =
                  "/images/video-placeholder.jpg";
              }}
            />

            {/* Play Button */}
            <div className="absolute inset-0 flex items-center justify-center bg-black/15">
              <div className="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center shadow-md">
                <span className="text-amber-600 text-sm font-black pl-0.5">
                  ▶
                </span>
              </div>
            </div>

            {/*
              MOBILE YOUTUBE TITLE REMOVED
            */}
          </div>
        </div>

        {/* Rope */}
        <div className="w-[1px] h-8 bg-gradient-to-b from-yellow-400 via-transparent to-transparent -mt-1" />
      </div>
    </div>
  );
};

export default VideoCard;

