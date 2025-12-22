import { Icon } from "@/components/ui";
import { ReactNode } from "react";

const Card = ({
  icon,
  description,
  title,
  main,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  main?: boolean;
}) => (
  <div className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-8 shadow-lg transition hover:shadow-xl hover:-translate-y-1">
    <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-blue-50 text-primary group-hover:bg-primary group-hover:text-[#FF5C56] transition-colors">
      <span className=" text-3xl">{icon}</span>
    </div>
    <h3 className="mb-3 text-xl! font-bold! cs-typography">{title}</h3>
    <p className="cs-paragraph-gray text-base! leading-relaxed">
      {description}
    </p>
  </div>
);

const Benefit = () => {
  return (
    <section className="container mx-auto px-20 py-30">
      <div className="text-center">
        <div className="cs-typography font-black! text-4xl! mb-2">
          Why Top Agents Choose Havenly
        </div>
        <div className="cs-typography-gray text-base! max-w-lg mx-auto font-medium!">
          We provide the infrastructure so you can focus on what matters most:
          building relationships and closing details.
        </div>
      </div>
      <div className="grid grid-cols-3 gap-5 mt-20">
        <Card
          icon={<Icon.HeadGear />}
          title="AI-Powered Leads"
          description="Our proprietary algorithm matches you with high-intent buyers instantly, reducing cold calls and increasing conversion rates."
        />
        <Card
          icon={<Icon.BarChatBox />}
          title="Market Insights"
          description="Get real-time data to value properties accurately. Access neighborhood trends and predictive analytics at your fingertips"
        />
        <Card
          icon={<Icon.Safe2 />}
          title="Competitive Commission"
          description="Keep more of what you earn with our transparent tiered split. No hidden desk fees or franchise costs."
        />
      </div>
    </section>
  );
};

export default Benefit;
