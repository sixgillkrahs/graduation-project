"use client";

import Logo from "@/assets/Logo.svg";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useState } from "react";
import EmailStep from "./components/EmailStep";
import OTPStep from "./components/OTPStep";

const ForgotPassword = () => {
  const router = useRouter();
  const [step, setStep] = useState<"email" | "otp">("email");
  const [email, setEmail] = useState("");

  const handleToHome = () => {
    router.push("/");
  };

  return (
    <div className="px-10 py-5 h-full">
      <div
        className="flex items-start gap-2 text-xl md:text-2xl font-semibold cursor-pointer mb-6"
        onClick={handleToHome}
      >
        <Image src={Logo} alt="logo" width={24} height={24} />
        <span className="text-black">Havenly</span>
      </div>
      <AnimatePresence mode="wait">
        {step === "email" && (
          <motion.div
            key="email"
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -100, opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <EmailStep onNext={() => setStep("otp")} setEmail={setEmail} />
          </motion.div>
        )}

        {step === "otp" && (
          <motion.div
            key="otp"
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -100, opacity: 0 }}
          >
            <OTPStep onBack={() => setStep("email")} email={email} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ForgotPassword;
