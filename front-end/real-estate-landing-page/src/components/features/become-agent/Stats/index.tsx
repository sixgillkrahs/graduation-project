const StatItem = ({ number, text }: { number: string; text: string }) => {
  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <span className="text-3xl md:text-6xl! cs-typography font-black! text-[#000000]">
        {number}
      </span>
      <span className="cs-paragraph-gray text-sm! font-medium!">{text}</span>
    </div>
  );
};

const Stats = () => {
  return (
    <section className=" py-10 md:py-20 bg-black/10">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-10 container mx-auto px-4">
        <StatItem number="1000+" text="ACTIVE AGENTS" />
        <StatItem number="$10M+" text="PAID IN COMMISSIONS" />
        <StatItem number="24/7" text="AGENT SUPPORT" />
      </div>
    </section>
  );
};

export default Stats;
