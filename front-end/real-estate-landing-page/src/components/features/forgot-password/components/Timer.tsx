"use client";

import { useEffect, useState } from "react";
import { useLocale } from "next-intl";
import { useForgotPassword } from "../services/mutate";

const RESEND_SECONDS = 45;

const Timer = ({ email }: { email: string }) => {
  const { mutateAsync: sendOTP } = useForgotPassword();
  const locale = useLocale();
  const [seconds, setSeconds] = useState(RESEND_SECONDS);
  const [canResend, setCanResend] = useState(false);
  const isVi = locale === "vi";

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
      <span>{isVi ? "Chưa nhận được mã?" : "Didn’t receive the code?"}</span>

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
          {isVi ? "Gửi lại mã" : "Resend code"}
        </button>
      ) : (
        <span className="ml-1">
          {isVi ? "Gửi lại sau" : "Resend in"}{" "}
          <span className="font-medium text-gray-700">{seconds}s</span>
        </span>
      )}
    </div>
  );
};

export default Timer;
