import Image from "next/image";

const Card = ({
  image,
  title,
  tag,
}: {
  image: string;
  title: string;
  tag: string;
}) => {
  return (
    <div className="w-full h-full min-h-[200px] flex flex-col justify-between p-4 rounded-[18px] bg-[#f7f7f7]">
      <span className="cs-paragraph-gray text-[12px]! cs-bg-black px-3 py-1 rounded-full cs-paragraph-white w-fit">
        {tag}
      </span>

      <h3 className="cs-typography text-[24px]! font-bold! text-left max-w-[300px]">
        {title}
      </h3>
    </div>
  );
};

export { Card };
