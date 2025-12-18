"use client";

import bg1 from "@/assets/images/bg.jpg";
import bg from "@/assets/images/bg1.jpg";
import bg2 from "@/assets/images/bg2.jpg";
import Button from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon/Icon";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Slider from "@/components/ui/Slider";
import Tabs from "@/components/ui/Tabs";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import FormSearch from "./components/FormSearch";

const Banner = () => {
  const [active, setActive] = useState(0);
  const images = [bg1, bg, bg2];
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      setActive((prev) => (prev + 1) % images.length);
    }, 5000);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [active, images.length]);

  return (
    <section className="relative h-[100vh] overflow-hidden px-20">
      <div
        className="absolute inset-0 flex transition-transform duration-700 ease-in-out"
        style={{ transform: `translateX(-${active * 100}%)` }}
      >
        {images.map((item, index) => (
          <div key={index} className="relative min-w-full h-full">
            <Image
              src={item}
              alt={`Slide ${index + 1}`}
              fill
              sizes="100vw"
              className="object-cover"
              priority={index === 0}
            />
          </div>
        ))}
      </div>

      <FormSearch />

      <div className="absolute top-2 right-20 z-10 grid grid-cols-1 gap-4">
        {images.map((item, index) => (
          <div
            key={index}
            className={`w-12 h-12 rounded-lg ${
              active === index ? "cs-outline-red" : ""
            } cursor-pointer`}
            onClick={() => setActive(index)}
          >
            <Image
              src={item}
              alt={`Image ${index + 1}`}
              className="object-cover w-full h-full rounded-lg"
            />
          </div>
        ))}
      </div>
    </section>
  );
};

export default Banner;
