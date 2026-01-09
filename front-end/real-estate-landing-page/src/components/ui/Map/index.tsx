"use client";

import dynamic from "next/dynamic";

const MapPicker = dynamic(() => import("./MapPickerClient"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[300px] bg-gray-100 animate-pulse rounded-xl flex items-center justify-center text-gray-400">
      Loading Map...
    </div>
  ),
});

export { MapPicker };
