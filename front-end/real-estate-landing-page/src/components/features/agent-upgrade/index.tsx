"use client";

import { CsButton } from "@/components/custom";
import { Icon, Modal, useModal } from "@/components/ui";
import { Check, X } from "lucide-react";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import { fetchProfileItem } from "@/store/profile.store";
import { useDateTimeFormatter } from "@/hooks/useDateTimeFormatter";
import { toast } from "@/lib/toast";
import { ROUTES } from "@/const/routes";
import {
  useCreateMoMoUrl,
  useCreateVNPayUrl,
  useDowngrade,
} from "./services/mutate";

const AgentUpgrade = () => {
  const locale = useLocale();
  const isVi = locale.toLowerCase().startsWith("vi");
  const [isAnnual, setIsAnnual] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { open, show, hide } = useModal();
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { formatDate } = useDateTimeFormatter();

  const profile = useSelector((state: RootState) => state.profile.data);
  const isPro = profile?.planInfo?.plan === "PRO";

  const handleOpenModal = () => {
    setIsSuccess(false);
    show();
  };

  const handleSuccess = () => {
    setIsSuccess(true);
  };

  const [paymentMethod, setPaymentMethod] = useState<"vnpay" | "momo">("vnpay");

  const { mutateAsync: createVNPayUrl, isPending: isVNPayPending } =
    useCreateVNPayUrl();
  const { mutateAsync: createMoMoUrl, isPending: isMoMoPending } =
    useCreateMoMoUrl();
  const { mutateAsync: downgradeReq, isPending: isDowngrading } =
    useDowngrade();

  const isLoadingPayment = isVNPayPending || isMoMoPending;

  const handleVNPayPayment = async () => {
    try {
      const resp = await createVNPayUrl({
        amount: isAnnual ? 4800000 : 500000,
        language: "vn",
      });
      if (resp.data) {
        window.location.href = resp.data;
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleMoMoPayment = async () => {
    try {
      const resp = await createMoMoUrl({
        amount: isAnnual ? 4800000 : 500000,
      });
      if (resp.data) {
        window.location.href = resp.data;
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleGoToDashboard = () => {
    hide();
    router.push(ROUTES.AGENT_DASHBOARD);
  };

  const handleDowngrade = async () => {
    if (
      !window.confirm(
        isVi
          ? "Bạn có chắc muốn hủy gói PRO không? Bạn sẽ mất quyền truy cập vào các tính năng cao cấp ngay lập tức."
          : "Are you sure you want to cancel your PRO plan? You will immediately lose access to premium features.",
      )
    )
      return;

    try {
      await downgradeReq();
      toast.success(
        isVi
          ? "Đã hạ xuống gói Cơ bản thành công"
          : "Successfully downgraded to Basic plan",
      );
      dispatch(fetchProfileItem());
    } catch (err: any) {}
  };

  return (
    <div className="min-h-screen bg-gray-50/50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Page Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 tracking-tight">
            {isPro
              ? isVi
                ? "Chi tiết gói hiện tại"
                : "Your Subscription Details"
              : isVi
                ? "Tăng tốc công việc môi giới"
                : "Supercharge Your Real Estate Business"}
          </h1>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            {isPro
              ? isVi
                ? "Bạn đang sử dụng toàn bộ quyền lợi độc quyền của Havenly PRO."
                : "You are currently enjoying all the exclusive privileges of Havenly PRO."
              : isVi
                ? "Nâng cấp PRO để mở khóa tour 3D, công cụ AI và số lượng tin đăng không giới hạn."
                : "Upgrade to Pro to unlock 3D Virtual Tours, AI tools, and unlimited listings."}
          </p>

          {/* Billing Toggle */}
          <div className="flex justify-center items-center mt-8">
            <div className="relative flex items-center p-1 bg-gray-100 rounded-full border border-gray-200">
              <button
                type="button"
                className={`w-32 py-2 text-sm font-semibold rounded-full transition-all duration-200 ${
                  !isAnnual
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-900"
                }`}
                onClick={() => setIsAnnual(false)}
              >
                {isVi ? "Theo tháng" : "Monthly"}
              </button>
              <button
                type="button"
                className={`w-40 py-2 text-sm font-semibold rounded-full transition-all duration-200 flex items-center justify-center gap-2 ${
                  isAnnual
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-900"
                }`}
                onClick={() => setIsAnnual(true)}
              >
                {isVi ? "Theo năm" : "Annually"}
                <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full">
                  {isVi ? "Tiết kiệm 20%" : "Save 20%"}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Pricing Cards Container */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Card 1: Basic Plan */}
          <div className="relative bg-white rounded-3xl border border-gray-200 p-8 shadow-sm flex flex-col items-center">
            <div className="w-full flex justify-between items-start mb-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Basic</h3>
                <div className="mt-2 text-gray-500">
                  {isVi ? "Công cụ thiết yếu" : "Essential tools"}
                </div>
              </div>
              {!isPro && (
                <span className="bg-gray-100 text-gray-600 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider">
                  {isVi ? "Gói hiện tại" : "Current Plan"}
                </span>
              )}
            </div>

            <div className="my-6 text-center w-full">
              <span className="text-4xl font-extrabold text-gray-900">
                {isVi ? "Miễn phí" : "Free"}
              </span>
            </div>

            <ul className="w-full space-y-4 mb-8 grow">
              <li className="flex items-start gap-3 text-gray-700">
                <Check className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
                <span>
                  {isVi
                    ? "Tối đa 3 tin đăng hoạt động mỗi tháng"
                    : "Up to 3 active listings/month"}
                </span>
              </li>
              <li className="flex items-start gap-3 text-gray-700">
                <Check className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
                <span>
                  {isVi ? "Tải ảnh tiêu chuẩn" : "Standard photo uploads"}
                </span>
              </li>
              <li className="flex items-start gap-3 text-gray-700">
                <Check className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
                <span>
                  {isVi ? "Quản lý lead cơ bản" : "Basic Lead Management"}
                </span>
              </li>
              <li className="flex items-start gap-3 text-gray-400">
                <X className="w-5 h-5 text-gray-300 shrink-0 mt-0.5" />
                <span className="line-through decoration-gray-300">
                  {isVi ? "Không có tour 3D" : "No 3D Virtual Tours"}
                </span>
              </li>
              <li className="flex items-start gap-3 text-gray-400">
                <X className="w-5 h-5 text-gray-300 shrink-0 mt-0.5" />
                <span className="line-through decoration-gray-300">
                  {isVi
                    ? "Không có tạo nội dung bằng AI"
                    : "No AI Auto-Descriptions"}
                </span>
              </li>
              <li className="flex items-start gap-3 text-gray-400">
                <X className="w-5 h-5 text-gray-300 shrink-0 mt-0.5" />
                <span className="line-through decoration-gray-300">
                  {isVi
                    ? "Không có chấm điểm lead bằng AI"
                    : "No AI Lead Scoring"}
                </span>
              </li>
            </ul>

            <button
              disabled={!isPro || isDowngrading}
              onClick={handleDowngrade}
              type="button"
              className={`w-full py-3.5 rounded-xl font-bold text-center transition-colors ${
                !isPro
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-red-50 text-red-600 border border-red-200 hover:bg-red-100"
              }`}
            >
              {isDowngrading
                ? isVi
                  ? "Đang xử lý..."
                  : "Processing..."
                : !isPro
                  ? isVi
                    ? "Gói đang dùng"
                    : "Your Active Plan"
                  : isVi
                    ? "Hạ xuống gói Cơ bản"
                    : "Downgrade to Basic"}
            </button>
          </div>

          {/* Card 2: PRO Plan */}
          <div
            className={`relative bg-white rounded-3xl border-2 ${isPro ? "border-amber-400" : "border-black"} p-8 shadow-xl flex flex-col items-center bg-linear-to-b from-white to-gray-50`}
          >
            <div className="absolute top-0 transform -translate-y-1/2">
              {isPro ? (
                <span className="bg-amber-400 text-black text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider shadow-sm flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5" />{" "}
                  {isVi ? "Đang hoạt động" : "Active Plan"}
                </span>
              ) : (
                <span className="bg-amber-400 text-black text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider shadow-sm flex items-center gap-1.5">
                  <Icon.Star className="w-3.5 h-3.5" />{" "}
                  {isVi ? "Phổ biến nhất" : "Most Popular"}
                </span>
              )}
            </div>

            <div className="w-full flex justify-between items-start mb-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Havenly PRO</h3>
                <div className="mt-2 text-gray-500">
                  {isVi ? "Mọi thứ bạn cần" : "Everything you need"}
                </div>
              </div>
            </div>

            <div className="my-6 text-center w-full">
              <span className="text-4xl font-extrabold text-black">
                {isAnnual ? "400,000" : "500,000"}{" "}
                <span className="text-xl text-gray-500 font-medium">VND</span>
              </span>
              <div className="text-gray-500 font-medium">
                {isVi ? "/ tháng" : "/ month"}
              </div>
            </div>

            <ul className="w-full space-y-4 mb-8 grow">
              <li className="flex items-start gap-3 text-gray-900 font-medium">
                <Check className="w-5 h-5 text-black shrink-0 mt-0.5" />
                <span>
                  {isVi
                    ? "Tin đăng hoạt động không giới hạn"
                    : "Unlimited active listings"}
                </span>
              </li>
              <li className="flex items-start gap-3 text-gray-900">
                <Check className="w-5 h-5 text-black shrink-0 mt-0.5" />
                <span>
                  {isVi
                    ? "Đăng tour 3D Virtual Tour"
                    : "3D Virtual Tour (Panorama) uploads"}
                </span>
              </li>
              <li className="flex items-start gap-3 text-gray-900">
                <Check className="w-5 h-5 text-black shrink-0 mt-0.5" />
                <span>
                  {isVi
                    ? "AI tạo nội dung cho tin đăng"
                    : "AI Content Generator (Write listings instantly)"}
                </span>
              </li>
              <li className="flex items-start gap-3 text-gray-900">
                <Check className="w-5 h-5 text-black shrink-0 mt-0.5" />
                <span>
                  {isVi
                    ? "CRM nâng cao với AI lead scoring"
                    : "Advanced CRM with AI Lead Scoring"}
                </span>
              </li>
              <li className="flex items-start gap-3 text-gray-900">
                <Check className="w-5 h-5 text-black shrink-0 mt-0.5" />
                <span>
                  {isVi
                    ? 'Huy hiệu "PRO Agent" xác minh trên hồ sơ'
                    : '"PRO Agent" verified badge on profile'}
                </span>
              </li>
            </ul>

            {!isPro ? (
              <button
                onClick={handleOpenModal}
                type="button"
                className="w-full py-3.5 rounded-xl font-bold text-center bg-black text-white hover:bg-gray-900 transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 duration-200"
              >
                {isVi ? "Nâng cấp ngay" : "Upgrade Now"}
              </button>
            ) : (
              <button
                disabled
                type="button"
                className="w-full py-3.5 rounded-xl font-bold text-center bg-gray-100 text-gray-600 cursor-not-allowed shadow-none"
              >
                {isVi ? "Hết hạn:" : "Expires:"}{" "}
                {profile?.planInfo?.endDate
                  ? formatDate(profile.planInfo.endDate)
                  : isVi
                    ? "Không có"
                    : "N/A"}
              </button>
            )}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="text-center pt-8">
          <p className="text-gray-500 flex items-center justify-center gap-2">
            <Icon.ShieldCheck className="w-5 h-5" />{" "}
            {isVi
              ? "Hủy bất cứ lúc nào. Thanh toán được bảo mật."
              : "Cancel anytime. Secure payment processing."}
          </p>
        </div>
      </div>

      {/* Mock Payment Modal */}
      <Modal open={open} onCancel={hide}>
        <div className="p-6">
          {!isSuccess ? (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900">
                  {isVi ? "Hoàn tất nâng cấp" : "Complete Your Upgrade"}
                </h2>
                <p className="text-gray-500 mt-2">
                  {isVi
                    ? "Chọn phương thức thanh toán để tiếp tục."
                    : "Choose a payment method to proceed."}
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex justify-between items-center shadow-inner">
                <div>
                  <div className="font-semibold text-gray-900">
                    Havenly PRO - 1{" "}
                    {isAnnual
                      ? isVi
                        ? "Năm"
                        : "Year"
                      : isVi
                        ? "Tháng"
                        : "Month"}
                  </div>
                  <div className="text-sm text-gray-500">
                    {isAnnual
                      ? isVi
                        ? "Thanh toán theo năm"
                        : "Billed annually"
                      : isVi
                        ? "Thanh toán theo tháng"
                        : "Billed monthly"}
                  </div>
                </div>
                <div className="text-xl font-bold text-black border-l pl-4 border-gray-200">
                  {isAnnual ? "4,800,000" : "500,000"} VND
                </div>
              </div>

              <div className="space-y-3">
                <div className="text-sm font-semibold text-gray-900 mb-2">
                  {isVi ? "Phương thức thanh toán" : "Payment Method"}
                </div>
                <label className="flex items-center justify-between p-4 border border-gray-200 rounded-xl cursor-pointer hover:border-black transition-colors bg-white">
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="payment"
                      value="vnpay"
                      checked={paymentMethod === "vnpay"}
                      onChange={() => setPaymentMethod("vnpay")}
                      className="w-4 h-4 text-black border-gray-300 focus:ring-black"
                    />
                    <span className="font-medium text-gray-900">VNPay QR</span>
                  </div>
                  <div className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-bold">
                    VNPAY
                  </div>
                </label>
                <label className="flex items-center justify-between p-4 border border-gray-200 rounded-xl cursor-pointer hover:border-black transition-colors bg-white">
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="payment"
                      value="momo"
                      checked={paymentMethod === "momo"}
                      onChange={() => setPaymentMethod("momo")}
                      className="w-4 h-4 text-pink-600 border-gray-300 focus:ring-pink-600"
                    />
                    <span className="font-medium text-gray-900">
                      {isVi ? "Ví MoMo" : "MoMo Wallet"}
                    </span>
                  </div>
                  <div className="bg-pink-50 text-pink-600 px-2 py-1 rounded text-xs font-bold">
                    MoMo
                  </div>
                </label>
              </div>

              <CsButton
                onClick={
                  paymentMethod === "vnpay"
                    ? handleVNPayPayment
                    : handleMoMoPayment
                }
                loading={isLoadingPayment}
                className={`w-full text-white py-6 text-lg font-semibold rounded-xl transition-colors ${
                  paymentMethod === "momo"
                    ? "bg-pink-600 hover:bg-pink-700"
                    : "cs-bg-black hover:bg-gray-900"
                }`}
              >
                {isVi ? "Tiến hành thanh toán" : "Proceed to Payment"} (
                {paymentMethod === "vnpay" ? "VNPay" : "MoMo"} Sandbox)
              </CsButton>
            </div>
          ) : (
            <div className="text-center py-8 space-y-6 flex flex-col items-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center animate-bounce">
                <Check className="w-10 h-10 text-green-600" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-gray-900">
                  {isVi ? "Thanh toán thành công!" : "Payment Successful!"}
                </h2>
                <p className="text-gray-500 text-lg">
                  {isVi
                    ? "Chào mừng bạn đến với Havenly PRO."
                    : "Welcome to Havenly PRO."}
                </p>
              </div>
              <CsButton
                onClick={handleGoToDashboard}
                className="w-full cs-bg-black text-white hover:bg-gray-900 py-6 font-semibold rounded-xl"
              >
                {isVi ? "Đến trang tổng quan" : "Go to Dashboard"}
              </CsButton>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default AgentUpgrade;
