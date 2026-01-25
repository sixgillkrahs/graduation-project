"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import EmailStep from "./components/EmailStep";
import EnterPassStep from "./components/EnterPassStep";
import OTPStep from "./components/OTPStep";

const ForgotPassword = () => {
  const [step, setStep] = useState<"email" | "otp" | "password">("email");

  return (
    <AnimatePresence mode="wait">
      {step === "email" && (
        <motion.div
          key="email"
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -100, opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          <EmailStep onNext={() => setStep("otp")} />
        </motion.div>
      )}

      {step === "otp" && (
        <motion.div
          key="otp"
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -100, opacity: 0 }}
        >
          <OTPStep
            onBack={() => setStep("email")}
            onNext={() => setStep("password")}
          />
        </motion.div>
      )}

      {step === "password" && (
        <motion.div
          key="password"
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -100, opacity: 0 }}
        >
          <EnterPassStep onBack={() => setStep("otp")} />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ForgotPassword;
