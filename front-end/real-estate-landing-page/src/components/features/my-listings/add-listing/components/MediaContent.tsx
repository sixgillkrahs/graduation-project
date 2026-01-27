"use client";

import ImageUpload from "@/components/ui/image-upload";
import { Images } from "lucide-react";

const MediaContent = () => {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 min-w-[700px]">
        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Images />
          Step 4: Media
          {/* <Icon.MapPin className="w-6 h-6" /> Step 2: Location */}
        </h2>

        <ImageUpload
          // label="Property Photos"
          description="Upload high-quality images of your property. You can upload multiple images at once."
          accept="image/*"
          multiple
          maxSizeMB={10}
        />
      </div>
    </div>
  );
};

export default MediaContent;
