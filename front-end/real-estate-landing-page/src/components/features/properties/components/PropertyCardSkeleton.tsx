const PropertyCardSkeleton = () => {
  return (
    <div className="flex h-full animate-pulse flex-col overflow-hidden rounded-[28px] border border-stone-200 bg-white shadow-[0_18px_40px_-28px_rgba(15,23,42,0.18)]">
      <div className="aspect-[16/11] w-full bg-stone-200" />

      <div className="flex flex-1 flex-col gap-5 p-5">
        <div className="grid gap-3 sm:grid-cols-[132px_1fr]">
          <div className="rounded-2xl bg-stone-100 px-3 py-3">
            <div className="h-3 w-20 rounded bg-stone-200" />
            <div className="mt-3 h-4 w-16 rounded bg-stone-200" />
          </div>
          <div className="rounded-2xl bg-stone-100 px-4 py-3">
            <div className="h-3 w-24 rounded bg-stone-200" />
            <div className="mt-3 h-7 w-32 rounded bg-stone-200" />
            <div className="mt-2 h-3 w-14 rounded bg-stone-200" />
          </div>
        </div>

        <div className="space-y-3">
          <div className="h-6 w-full rounded bg-stone-200" />
          <div className="h-6 w-4/5 rounded bg-stone-200" />
          <div className="h-4 w-full rounded bg-stone-100" />
          <div className="h-4 w-2/3 rounded bg-stone-100" />
        </div>

        <div className="grid grid-cols-3 gap-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={`property-card-skeleton-stat-${index + 1}`}
              className="rounded-2xl bg-stone-100 px-3 py-3"
            >
              <div className="h-8 w-8 rounded-full bg-white" />
              <div className="mt-3 h-3 w-14 rounded bg-stone-200" />
              <div className="mt-3 h-4 w-10 rounded bg-stone-200" />
            </div>
          ))}
        </div>

        <div className="mt-auto flex items-center justify-between border-t border-stone-100 pt-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-stone-200" />
            <div className="space-y-2">
              <div className="h-4 w-24 rounded bg-stone-200" />
              <div className="h-3 w-16 rounded bg-stone-100" />
            </div>
          </div>
          <div className="h-3 w-20 rounded bg-stone-100" />
        </div>

        <div className="border-t border-stone-100 pt-4">
          <div className="h-11 w-full rounded-2xl bg-stone-100" />
        </div>
      </div>
    </div>
  );
};

export default PropertyCardSkeleton;
