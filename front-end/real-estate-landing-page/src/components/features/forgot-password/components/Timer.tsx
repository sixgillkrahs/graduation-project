"use client";

import { useEffect, useState } from "react";
import { useForgotPassword } from "../services/mutate";

const RESEND_SECONDS = 45;

const Timer = ({ email }: { email: string }) => {
  const { mutateAsync: sendOTP } = useForgotPassword();
  const [seconds, setSeconds] = useState(RESEND_SECONDS);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    if (seconds <= 0) {
      setCanResend(true);
      return;
    }

    const interval = setInterval(() => {
      setSeconds((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [seconds]);

  const handleResend = async () => {
    if (!canResend) return;
    await sendOTP({ email });
    setSeconds(RESEND_SECONDS);
    setCanResend(false);
  };

  return (
    <div className="mt-6 text-center text-sm text-gray-500">
      <span>Didn’t receive the code?</span>

      {canResend ? (
        <button
          type="button"
          onClick={handleResend}
          className="
            ml-1 font-medium text-red-500
            hover:text-red-600
            transition-colors
          "
        >
          Resend code
        </button>
      ) : (
        <span className="ml-1">
          Resend in{" "}
          <span className="font-medium text-gray-700">{seconds}s</span>
        </span>
      )}
    </div>
  );
};

export default Timer;
