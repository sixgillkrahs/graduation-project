import Image from "next/image";

export const CsCard = ({
  image,
  title,
  tag,
}: {
  image?: string;
  title: string;
  tag: string;
}) => {
  return (
    <div className="relative w-full h-full min-h-[200px] flex flex-col justify-between p-4 rounded-[18px] overflow-hidden bg-[#f7f7f7] sm:min-h-[250px] md:min-h-[300px] lg:min-h-[350px]">
      {image ? (
        <>
          <Image
            src={image}
            alt={title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/30 to-black/10" />
        </>
      ) : null}

      <span className="relative z-10 cs-paragraph-gray text-[12px]! cs-bg-black px-3 py-1 rounded-full cs-paragraph-white w-fit">
        {tag}
      </span>

      <h3
        className={`relative z-10 text-[20px] sm:text-[24px] md:text-[28px] lg:text-[32px] font-bold text-left max-w-[300px] sm:max-w-[400px] md:max-w-[500px] ${
          image ? "text-white" : "cs-typography"
        }`}
      >
        {title}
      </h3>
    </div>
  );
};
