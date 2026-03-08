type ProfileCompletionCardProps = {
  completion: number;
  completedItems: number;
  totalItems: number;
};

const ProfileCompletionCard = ({
  completion,
  completedItems,
  totalItems,
}: ProfileCompletionCardProps) => {
  const normalizedCompletion = Math.max(0, Math.min(100, completion));

  return (
    <div className="w-full rounded-[18px] bg-white p-5 md:p-6">
      <div className="grid gap-4 lg:grid-cols-[180px_minmax(0,1fr)] lg:items-center">
        <div className="relative mx-auto flex w-full max-w-[180px] items-end justify-center">
          <svg
            viewBox="0 0 100 60"
            className="h-[110px] w-full overflow-visible"
            aria-hidden="true"
          >
            <path
              d="M 10 50 A 40 40 0 0 1 90 50"
              fill="none"
              stroke="rgba(0,0,0,0.08)"
              strokeWidth="10"
              strokeLinecap="round"
              pathLength="100"
            />
            <path
              d="M 10 50 A 40 40 0 0 1 90 50"
              fill="none"
              stroke="currentColor"
              strokeWidth="10"
              strokeLinecap="round"
              pathLength="100"
              strokeDasharray={`${normalizedCompletion} 100`}
              className="text-black transition-all duration-500"
            />
          </svg>
          <div className="absolute bottom-0.5 flex flex-col items-center">
            <span className="cs-typography text-[28px]! font-black! leading-none">
              {normalizedCompletion}%
            </span>
            <span className="cs-paragraph-gray text-[11px]! font-bold! uppercase tracking-[0.16em]">
              Complete
            </span>
          </div>
        </div>

        <div className="grid gap-2.5">
          <div className="grid gap-1">
            <span className="cs-paragraph-gray text-[11px]! font-bold! uppercase tracking-[0.16em]">
              Profile Completion
            </span>
            <h3 className="cs-typography text-[22px]! font-bold! text-black md:text-[24px]!">
              Complete your profile
            </h3>
          </div>
          <p className="cs-paragraph-gray text-[14px]! leading-6">
            You have completed {completedItems}/{totalItems} profile checkpoints.
            Fill in the missing information to make your profile look stronger
            to clients and appear more complete across the platform.
          </p>
          <div className="flex flex-wrap gap-2.5">
            <div className="rounded-xl bg-black px-3 py-2.5 text-white">
              <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white/70">
                Completed
              </div>
              <div className="mt-1 text-[20px] font-black">
                {completedItems}
              </div>
            </div>
            <div className="rounded-xl bg-black/5 px-3 py-2.5 text-black">
              <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-black/50">
                Remaining
              </div>
              <div className="mt-1 text-[20px] font-black">
                {Math.max(totalItems - completedItems, 0)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileCompletionCard;
