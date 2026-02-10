const PropertyCardSkeleton = () => {
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 flex flex-col h-full animate-pulse">
      {/* Image skeleton */}
      <div className="h-64 w-full bg-gray-200" />

      {/* Content skeleton */}
      <div className="p-4 flex flex-col flex-1 gap-3">
        {/* Price */}
        <div>
          <div className="h-7 w-32 bg-gray-200 rounded mb-2" />
          <div className="h-5 w-48 bg-gray-200 rounded mb-1" />
          <div className="h-4 w-40 bg-gray-100 rounded" />
        </div>

        {/* Specs */}
        <div className="flex items-center gap-4 py-3 border-t border-b border-gray-50">
          <div className="h-4 w-16 bg-gray-200 rounded" />
          <div className="w-px h-4 bg-gray-200" />
          <div className="h-4 w-16 bg-gray-200 rounded" />
          <div className="w-px h-4 bg-gray-200" />
          <div className="h-4 w-16 bg-gray-200 rounded" />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-auto pt-1">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-gray-200" />
            <div className="h-3 w-20 bg-gray-200 rounded" />
          </div>
          <div className="h-3 w-16 bg-gray-100 rounded" />
        </div>
      </div>
    </div>
  );
};

export default PropertyCardSkeleton;
