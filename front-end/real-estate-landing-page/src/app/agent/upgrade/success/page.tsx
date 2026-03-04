"use client";

import { CsButton } from "@/components/custom";
import { Icon } from "@/components/ui";
import { Check, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { ROUTES } from "@/const/routes";
import request from "@/lib/axios/request";
import { AxiosMethod } from "@/lib/axios/method";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store";
import { fetchProfileItem } from "@/store/profile.store";

function UpgradeSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    const verifyPayment = async () => {
      try {
        const query = searchParams.toString();
        if (!query) {
          if (!signal.aborted) {
            setStatus("error");
            setErrorMessage("No payment information found.");
          }
          return;
        }

        const isMomo =
          searchParams.has("partnerCode") &&
          searchParams.get("partnerCode")?.includes("MOMO");
        const endpoint = isMomo
          ? "/payment/momo_return"
          : "/payment/vnpay_return";

        const resp = await request({
          url: `${endpoint}?${query}`,
          method: AxiosMethod.GET,
        });

        if (signal.aborted) return;

        if (resp.data?.code === "00") {
          setStatus("success");
          dispatch(fetchProfileItem());
        } else {
          setStatus("error");
          setErrorMessage(resp.data?.message || "Payment verification failed.");
        }
      } catch (err: any) {
        if (signal.aborted) return;
        setStatus("error");
        setErrorMessage(
          err.message || "An error occurred during verification.",
        );
      }
    };

    verifyPayment();

    // Cleanup: khi React StrictMode unmount lần 1 → abort request đang chạy
    return () => {
      controller.abort();
    };
  }, [searchParams]);

  const handleGoToDashboard = () => {
    router.push(ROUTES.AGENT_DASHBOARD);
  };

  const handleTryAgain = () => {
    router.push("/agent/upgrade");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4">
      <div className="bg-white p-8 md:p-12 rounded-3xl shadow-xl max-w-md w-full text-center space-y-8">
        {status === "loading" && (
          <div className="flex flex-col items-center space-y-4">
            <div className="w-16 h-16 border-4 border-gray-200 border-t-black rounded-full animate-spin"></div>
            <h2 className="text-xl font-bold text-gray-900">
              Verifying Payment...
            </h2>
            <p className="text-gray-500">
              Please wait while we confirm your transaction with VNPay.
            </p>
          </div>
        )}

        {status === "success" && (
          <div className="flex flex-col items-center space-y-6">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center animate-bounce">
              <Check className="w-12 h-12 text-green-600" />
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl font-bold text-gray-900">
                Payment Successful!
              </h2>
              <p className="text-gray-500 text-lg">
                Your agent account has been upgraded to PRO.
              </p>
            </div>
            <CsButton
              onClick={handleGoToDashboard}
              className="w-full cs-bg-black text-white hover:bg-gray-900 py-6 text-lg font-semibold rounded-xl mt-4"
            >
              Go to Dashboard
            </CsButton>
          </div>
        )}

        {status === "error" && (
          <div className="flex flex-col items-center space-y-6">
            <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center">
              <X className="w-12 h-12 text-red-600" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-gray-900">
                Payment Failed
              </h2>
              <p className="text-red-500">{errorMessage}</p>
            </div>
            <CsButton
              onClick={handleTryAgain}
              //   className="w-full bg-white border border-gray-200 text-black hover:bg-gray-50 py-6 text-lg font-semibold rounded-xl mt-4"
              className="w-full"
            >
              Try Again
            </CsButton>
          </div>
        )}
      </div>
    </div>
  );
}

export default function UpgradeSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center">
          <div className="w-16 h-16 border-4 border-gray-200 border-t-black rounded-full animate-spin"></div>
        </div>
      }
    >
      <UpgradeSuccessContent />
    </Suspense>
  );
}
