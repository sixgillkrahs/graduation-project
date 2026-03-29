"use client";

import { CsButton } from "@/components/custom";
import { Check, X } from "lucide-react";
import { useLocale } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { ROUTES } from "@/const/routes";
import request from "@/lib/axios/request";
import { AxiosMethod } from "@/lib/axios/method";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "@/store";
import { fetchProfileItem } from "@/store/profile.store";

function UpgradeSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const locale = useLocale();
  const isVi = locale.toLowerCase().startsWith("vi");
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
            setErrorMessage(
              isVi
                ? "Không tìm thấy thông tin thanh toán."
                : "No payment information found.",
            );
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
          setErrorMessage(
            resp.data?.message ||
              (isVi
                ? "Xác minh thanh toán thất bại."
                : "Payment verification failed."),
          );
        }
      } catch (err: unknown) {
        if (signal.aborted) return;
        const message =
          err instanceof Error
            ? err.message
            : isVi
              ? "Đã xảy ra lỗi trong quá trình xác minh."
              : "An error occurred during verification.";
        setStatus("error");
        setErrorMessage(
          message ||
            (isVi
              ? "Đã xảy ra lỗi trong quá trình xác minh."
              : "An error occurred during verification."),
        );
      }
    };

    verifyPayment();

    // Cleanup: khi React StrictMode unmount lần 1 → abort request đang chạy
    return () => {
      controller.abort();
    };
  }, [dispatch, isVi, searchParams]);

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
              {isVi ? "Đang xác minh thanh toán..." : "Verifying Payment..."}
            </h2>
            <p className="text-gray-500">
              {isVi
                ? "Vui lòng chờ trong khi chúng tôi xác nhận giao dịch."
                : "Please wait while we confirm your transaction."}
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
                {isVi ? "Thanh toán thành công!" : "Payment Successful!"}
              </h2>
              <p className="text-gray-500 text-lg">
                {isVi
                  ? "Tài khoản môi giới của bạn đã được nâng cấp lên PRO."
                  : "Your agent account has been upgraded to PRO."}
              </p>
            </div>
            <CsButton
              onClick={handleGoToDashboard}
              className="w-full cs-bg-black text-white hover:bg-gray-900 py-6 text-lg font-semibold rounded-xl mt-4"
            >
              {isVi ? "Đến trang tổng quan" : "Go to Dashboard"}
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
                {isVi ? "Thanh toán thất bại" : "Payment Failed"}
              </h2>
              <p className="text-red-500">{errorMessage}</p>
            </div>
            <CsButton
              onClick={handleTryAgain}
              //   className="w-full bg-white border border-gray-200 text-black hover:bg-gray-50 py-6 text-lg font-semibold rounded-xl mt-4"
              className="w-full"
            >
              {isVi ? "Thử lại" : "Try Again"}
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
