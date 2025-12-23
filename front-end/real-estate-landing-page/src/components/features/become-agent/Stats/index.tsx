const StatItem = ({ number, text }: { number: string; text: string }) => {
  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <span className="text-6xl! cs-typography font-black! text-[#000000]">
        {number}
      </span>
      <span className="cs-paragraph-gray text-sm! font-medium!">{text}</span>
    </div>
  );
};

const Stats = () => {
  return (
    <section className=" py-20 bg-black/10">
      <div className="grid grid-cols-3 gap-10 container mx-auto">
        <StatItem number="1000+" text="ACTIVE AGENTS" />
        <StatItem number="$10M+" text="PAID IN COMMISSIONS" />
        <StatItem number="24/7" text="AGENT SUPPORT" />
      </div>
    </section>
  );
};

export default Stats;
