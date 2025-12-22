import { Icon } from "@/components/ui";
import React from "react";

const Step = ({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
}) => {
  return (
    <div className="flex flex-col items-center text-center gap-3">
      <div className="rounded-full bg-white flex items-center justify-center p-1 shadow-2xl">
        <div className="rounded-full bg-black/10 flex items-center justify-center p-6">
          {icon}
        </div>
      </div>
      <div className="cs-typography font-black! text-2xl! mb-2">{title}</div>
      <div className="cs-typography-gray text-base!  mx-auto font-medium! max-w-2xs">
        {description}
      </div>
    </div>
  );
};

const HowToJoin = () => {
  return (
    <section className="container mx-auto px-20 py-30">
      <div className="text-center">
        <div className="cs-typography font-black! text-4xl! mb-2">
          How to Join Havenly
        </div>
        <div className="cs-typography-gray text-base! max-w-lg mx-auto font-medium!">
          Three simple steps to launch your upgraded agent.
        </div>
      </div>
      <div className="grid grid-cols-3 gap-10 mt-20">
        <Step
          icon={<Icon.AddUser className="size-8 main-color-red" />}
          title="1. Create Account"
          description="Sign up in minutes. Tell us about your experience and goals."
        />
        <Step
          icon={<Icon.ShieldCheck className="size-8 main-color-red" />}
          title="2. Verify License"
          description="Upload your active real estate license for quick verification by our team."
        />
        <Step
          icon={<Icon.Rocket2 className="size-8 main-color-red" />}
          title="3. Start Selling"
          description="Get immediate access to the AI dashboard and start receiving leads."
        />
      </div>
    </section>
  );
};

export default HowToJoin;
