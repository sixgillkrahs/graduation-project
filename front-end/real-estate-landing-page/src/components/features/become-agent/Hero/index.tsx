"use client";

import { Button, Icon } from "@/components/ui";
import { Avatar } from "@/components/ui/Icon/Avatar";
import bg from "@/assets/images/become-agent/bg.png";
import Image from "next/image";
import { useRouter } from "next/navigation";

const Hero = () => {
  const router = useRouter();

  const handleApplyNow = () => {
    router.push("/work/become-agent/recruitment");
  };

  return (
    <section className="flex flex-col md:flex-row items-start justify-between px-4 md:px-20 container mx-auto py-10 md:py-20 min-h-screen md:min-h-0">
      <div className="flex flex-col items-start justify-start gap-6 flex-1 w-full md:w-auto">
        <div className="bg-[#F7F7F7] main-color-red font-bold text-center px-4 py-2 rounded-full flex items-center gap-2 text-sm">
          <Icon.Circle className="w-3" /> New AI Features Live
        </div>
        <span className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl cs-typography font-extrabold! text-[#000000] max-w-[600px] leading-tight">
          Supercharge Your Real Estate Career with{" "}
          <span className="main-color-red">AI</span>
        </span>
        <div className="cs-paragraph-gray max-w-[600px]">
          Join the fastest-growing network. Access exclusive AI tools to close
          details faster, price accurately, and manage clients effortlessly
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-start gap-4">
          <Button
            className="cs-bg-red text-white font-semibold"
            onClick={handleApplyNow}
          >
            Join Now
          </Button>
          <Button className="cs-bg-black text-white font-semibold">
            Learn More
          </Button>
        </div>
        <div className="flex items-center justify-start gap-4">
          <Avatar />
          <span className="cs-paragraph-gray text-sm! font-medium!">
            Trusted by over{" "}
            <span className="main-color-black font-bold!">1000+ agents</span>{" "}
            like you
          </span>
        </div>
      </div>
      <div className="flex-1 w-full md:w-auto h-auto md:h-[80%] mt-8 md:mt-0">
        <div className="relative h-[250px] sm:h-[300px] md:h-[500px] w-full rounded-2xl overflow-hidden">
          <Image
            src={bg}
            alt="bg"
            fill
            className="object-cover scale-105"
            priority
          />
        </div>
      </div>
    </section>
  );
};

export default Hero;
