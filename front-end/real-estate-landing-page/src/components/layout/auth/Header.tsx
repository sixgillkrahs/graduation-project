"use client";

import Logo from "@/assets/Logo.svg";
import Image from "next/image";
import { useRouter } from "next/navigation";

const Header = () => {
  const router = useRouter();

  const handleToHome = () => {
    router.push("/");
  };
  return (
    <div
      className="flex items-start gap-2 text-xl md:text-2xl font-semibold cursor-pointer mb-6"
      onClick={handleToHome}
    >
      <Image src={Logo} alt="logo" width={24} height={24} />
      <span className="text-black">Havenly</span>
    </div>
  );
};

export default Header;
