import { ReactNode } from "react";

const CardField = ({ title, value }: { title?: string; value: ReactNode }) => {
  return (
    <div
      className={` rounded-[18px] grid gap-2 bg-black/10 ${
        title ? "p-4" : "px-4 py-2"
      }`}
    >
      {title && (
        <div className="flex items-center gap-2">
          <span className="cs-paragraph-gray text-[14px]! font-bold! uppercase">
            {title}
          </span>
        </div>
      )}
      <div>{value}</div>
    </div>
  );
};

export default CardField;
