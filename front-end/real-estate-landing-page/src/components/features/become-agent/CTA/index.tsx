import { Button } from "@/components/ui";
import React from "react";

const CTA = () => {
  return (
    <section className="container mx-auto px-20 py-30 flex flex-col items-center justify-center gap-4">
      <div className="text-center">
        <div className="cs-typography font-black! text-4xl! mb-2">
          Ready to start your journey?
        </div>
        <div className="cs-typography-gray text-base! max-w-lg mx-auto font-medium!">
          join the network that empowers agents with technology, not paperwork
        </div>
      </div>
      <Button className="cs-bg-black text-white">Apply Now</Button>
    </section>
  );
};

export default CTA;
