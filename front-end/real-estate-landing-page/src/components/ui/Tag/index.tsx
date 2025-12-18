const Tag = ({ title }: { title: string }) => {
  return (
    <div className="px-4 py-2 border border-black/10 rounded-full text-black/50 text-[14px]! cursor-pointer">
      {title}
    </div>
  );
};

export default Tag;
