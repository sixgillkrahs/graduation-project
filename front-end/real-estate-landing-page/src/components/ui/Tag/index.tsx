const Tag = ({
  title,
  className,
  onClick,
}: {
  title: string;
  className?: string;
  onClick?: () => void;
}) => {
  return (
    <div
      className={`px-4 py-2 border border-black/10 rounded-full text-black/50 text-[14px]! cursor-pointer ${className}`}
      onClick={onClick}
    >
      {title}
    </div>
  );
};

export { Tag };
