import { ROUTES } from "@/const/routes";
import { useRouter } from "next/navigation";
import { useProfile } from "./services/query";
import { Icon, Image, useModal } from "@/components/ui";
import { useRegisterPasskey, useVerifyPasskey } from "./services/mutate";
import { useCallback } from "react";
import { startRegistration } from "@simplewebauthn/browser";
import { ModalChangePassword } from "./components/ModalChangePassword";
import { CsButton } from "@/components/custom";
import RenderField from "./components/RenderField";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { CalendarClock, ArrowRight } from "lucide-react";
import { useLocale } from "next-intl";

const Profile = () => {
  const router = useRouter();
  const locale = useLocale();
  const { data: profile, isLoading } = useProfile();
  const { open, show, hide } = useModal();
  const { mutateAsync: registerPasskey } = useRegisterPasskey();
  const { mutateAsync: verifyPasskey } = useVerifyPasskey();
  const isVi = locale === "vi";

  const profileData = profile?.data;
  const hasMinimalBuyerProfile = Boolean(
    profileData?.fullName?.trim() &&
      profileData?.email?.trim() &&
      profileData?.phone?.trim(),
  );

  const handleOpenModal = () => {
    show();
  };

  const handleCloseModal = useCallback(() => {
    hide();
  }, [hide]);

  const handleRegisterPasskey = async () => {
    try {
      const resp = await registerPasskey();
      if (resp.success) {
        const credential = await startRegistration(resp.data as any);
        await verifyPasskey(credential);
      }
    } catch (err: any) {
      if (err?.name !== "NotAllowedError") {
        console.error("Passkey registration error:", err);
      }
    }
  };

  console.log(profile);

  const handleToEdit = () => {
    router.push(ROUTES.PROFILE_EDIT);
  };

  return (
    <section className="p-6 md:p-8 bg-black/10">
      <div className="container mx-auto grid gap-6">
        <div className="flex justify-between items-center gap-4 p-8 w-full rounded-[18px] bg-white ">
          <div className="">
            <div className="flex items-center gap-2">
              <Avatar
                src={profileData?.avatarUrl}
                alt={profileData?.fullName}
                className="size-36 flex items-center justify-center object-cover overflow-hidden"
              />
              <div className="grid gap-2">
                <span className="cs-typography text-[30px]! font-bold!">
                  {profileData?.fullName}
                </span>
                <span className="cs-typography text-[16px]! flex gap-2 items-center">
                  <Icon.Mail className="size-5" /> {profileData?.email}
                </span>
                <span className="cs-typography text-[16px]! flex gap-2 items-center">
                  <Icon.Phone className="size-5" /> {profileData?.phone}
                </span>

                <Badge>{isVi ? "Khách hàng" : "Customer"}</Badge>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <CsButton
              icon={<Icon.Fingerprint className="size-5" />}
              onClick={handleRegisterPasskey}
              className="bg-white! border border-black/10! text-black"
            >
              {isVi ? "Đăng ký Passkey" : "Register Passkey"}
            </CsButton>
            <CsButton
              className="bg-white! border border-black/10! text-black"
              icon={<Icon.RotateLock className="size-5" />}
              onClick={handleOpenModal}
            >
              {isVi ? "Đổi mật khẩu" : "Change Password"}
            </CsButton>
            <CsButton
              className="cs-bg-black text-white"
              icon={<Icon.Pencil className="size-5" />}
              onClick={handleToEdit}
            >
              {isVi ? "Sửa hồ sơ" : "Edit Profile"}
            </CsButton>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-6">
          <div className="grid grid-cols-1 gap-6">
            <div className="rounded-[18px] bg-white">
              <div className="border-b border-b-black/10 px-8 py-4 text-[16px] font-bold">
                {isVi ? "Trạng thái hồ sơ người mua" : "Buyer Profile Status"}
              </div>
              <div className="grid gap-3 px-8 py-5">
                <Badge>
                  {hasMinimalBuyerProfile
                    ? isVi
                      ? "Sẵn sàng"
                      : "Ready"
                    : isVi
                      ? "Cần cập nhật"
                      : "Needs update"}
                </Badge>
                <p className="text-sm text-black/60">
                  {hasMinimalBuyerProfile
                    ? isVi
                      ? "Tên hiển thị, email và số điện thoại của bạn đã sẵn sàng để đặt lịch và gửi yêu cầu bất động sản."
                      : "Your display name, email, and phone are ready for bookings and property inquiries."
                    : isVi
                      ? "Hãy hoàn thiện tên hiển thị, email và số điện thoại để các lịch hẹn và yêu cầu luôn có đủ thông tin người mua."
                      : "Complete your display name, email, and phone so appointments and inquiries always include full buyer details."}
                </p>
                {!hasMinimalBuyerProfile && (
                  <CsButton
                    className="cs-bg-black text-white"
                    onClick={handleToEdit}
                  >
                    {isVi
                      ? "Hoàn thiện hồ sơ người mua"
                      : "Complete Buyer Profile"}
                  </CsButton>
                )}
              </div>
            </div>
            <div className="bg-white rounded-[18px]">
              <div className="cs-typography text-[16px]! font-bold! border-b border-b-black/10 py-4  px-8 flex items-center gap-2">
                <div className="size-5 flex items-center justify-center bg-black/10 p-2 rounded-lg box-content">
                  <Icon.User className="size-5" />
                </div>{" "}
                {isVi ? "Thông tin liên hệ" : "Contact Info"}
              </div>
              <div className="grid gap-4 py-4 px-8">
                <RenderField
                  label={isVi ? "Số điện thoại" : "Phone Number"}
                  value={
                    profileData?.phone ||
                    profileData?.basicInfo?.phoneNumber ||
                    ""
                  }
                />
                <RenderField
                  label="Email"
                  value={
                    profileData?.email || profileData?.basicInfo?.email || ""
                  }
                />
                <RenderField
                  label={isVi ? "Địa chỉ" : "Address"}
                  value={
                    profileData?.address ||
                    profileData?.basicInfo?.identityInfo?.placeOfBirth ||
                    ""
                  }
                />
              </div>
            </div>
          </div>
          <div className="col-span-2 rounded-[18px] bg-white p-8">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <div className="flex items-center gap-2 text-[16px] font-bold">
                  <div className="size-5 flex items-center justify-center rounded-lg bg-black/10 p-2 box-content">
                    <CalendarClock className="size-5" />
                  </div>
                  {isVi ? "Lịch hẹn của tôi" : "My Appointments"}
                </div>
                <p className="mt-3 max-w-xl text-sm text-black/60">
                  {isVi
                    ? "Xem lại các lịch hẹn tham quan bạn đã yêu cầu, hủy những lịch không còn phù hợp, hoặc gửi đề xuất thời gian mới cho môi giới."
                    : "Review the property tours you requested, cancel plans that no longer fit, or send a new time request to the agent."}
                </p>
              </div>

              <CsButton
                className="cs-bg-black text-white"
                icon={<ArrowRight className="size-4" />}
                onClick={() => router.push(ROUTES.PROFILE_APPOINTMENTS)}
              >
                {isVi ? "Mở lịch hẹn" : "Open Appointments"}
              </CsButton>
            </div>
          </div>
        </div>
      </div>
      <ModalChangePassword onCancel={handleCloseModal} open={open} />
    </section>
  );
};

export default Profile;
