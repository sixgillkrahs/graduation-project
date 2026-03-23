import { ReactNode } from "react";
import { cn } from "@/lib/utils";

const CardField = ({
  title,
  value,
  className,
}: {
  title?: string;
  value: ReactNode;
  className?: string;
}) => {
  return (
    <div
      className={cn(
        "grid min-w-0 gap-2 rounded-[18px] bg-black/10",
        title ? "p-4" : "px-4 py-2",
        className,
      )}
    >
      {title && (
        <div className="flex items-center gap-2">
          <span className="cs-paragraph-gray text-[14px]! font-bold! uppercase">
            {title}
          </span>
        </div>
      )}
      <div className="min-w-0 break-words [overflow-wrap:anywhere]">
        {value}
      </div>
    </div>
  );
};

export default CardField;
