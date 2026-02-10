"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import React, { useRef, useState } from "react";
import { ReactPhotoSphereViewer } from "react-photo-sphere-viewer";

interface TourViewerProps {
  urls: string[];
}

const TourViewer = ({ urls }: TourViewerProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const psvrRef = useRef<any>(null);

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % urls.length);
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + urls.length) % urls.length);
  };

  return (
    <div className="relative w-full h-full bg-black group-viewer">
      <ReactPhotoSphereViewer
        key={currentIndex}
        ref={psvrRef}
        src={urls[currentIndex]}
        height={"100%"}
        width={"100%"}
        container={""}
        navbar={["autorotate", "zoom", "fullscreen", "caption"]}
        mousewheel={false} // Disable mousewheel zoom by default for better UX
      />

      {/* Navigation Controls */}
      {urls.length > 1 && (
        <>
          <button
            onClick={handlePrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white p-2 rounded-full backdrop-blur-sm transition-colors z-10"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <button
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white p-2 rounded-full backdrop-blur-sm transition-colors z-10"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm backdrop-blur-sm z-10 pointer-events-none">
            Scene {currentIndex + 1} / {urls.length}
          </div>
        </>
      )}
    </div>
  );
};

export default TourViewer;
