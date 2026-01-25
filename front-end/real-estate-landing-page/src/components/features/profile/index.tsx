import { useRouter } from "next/navigation";
import { useProfile } from "./services/query";
import { Icon, Image, useModal } from "@/components/ui";
import { useRegisterPasskey, useVerifyPasskey } from "./services/mutate";
import { useCallback } from "react";
import { startRegistration } from "@simplewebauthn/browser";
import { ModalChangePassword } from "./components/ModalChangePassword";
import RegisterPasskey from "./components/RegisterPasskey";
import { CsButton } from "@/components/custom";
import RenderField from "./components/RenderField";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage } from "@/components/ui/avatar";

const Profile = () => {
  const router = useRouter();
  const { data: profile, isLoading } = useProfile();
  const { open, show, hide } = useModal();
  const { mutateAsync: registerPasskey } = useRegisterPasskey();
  const { mutateAsync: verifyPasskey } = useVerifyPasskey();

  const profileData = profile?.data;

  const handleOpenModal = () => {
    show();
  };

  const handleCloseModal = useCallback(() => {
    hide();
  }, [hide]);

  const handleRegisterPasskey = async () => {
    const resp = await registerPasskey();
    if (resp.success) {
      const credential = await startRegistration(resp.data as any);
      await verifyPasskey(credential);
    }
  };

  console.log(profile);

  const handleToEdit = () => {
    router.push("/profile/edit");
  };

  return (
    <section className="p-6 md:p-8 bg-black/10">
      <div className="container mx-auto grid gap-6">
        <div className="flex justify-between items-center gap-4 p-8 w-full rounded-[18px] bg-white ">
          <div className="">
            <div className="flex items-center gap-2">
              <Avatar
                src={
                  profileData?.avatarUrl
                    ? `${process.env.NEXT_PUBLIC_BASEURLAI}/images/${profileData?.avatarUrl}`
                    : undefined
                }
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

                <Badge>
                  {profileData?.roleId === "AGENT" ? (
                    <>Real Estate Agent</>
                  ) : (
                    <>User</>
                  )}
                </Badge>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <CsButton
              icon={<Icon.Fingerprint className="size-5" />}
              onClick={handleRegisterPasskey}
              className="bg-white! border border-black/10! text-black"
            >
              Register Passkey
            </CsButton>
            <CsButton
              className="bg-white! border border-black/10! text-black"
              icon={<Icon.RotateLock className="size-5" />}
              onClick={handleOpenModal}
            >
              Change Password
            </CsButton>
            <CsButton
              className="cs-bg-black text-white"
              icon={<Icon.Pencil className="size-5" />}
              onClick={handleToEdit}
            >
              Edit Profile
            </CsButton>
          </div>
        </div>
        {/* <div className="grid grid-cols-3 gap-6">
          <div className="grid grid-cols-1 gap-6">
            <div className="bg-white rounded-[18px]">
              <div className="cs-typography text-[16px]! font-bold! border-b border-b-black/10 py-4  px-8 flex items-center gap-2">
                <div className="size-5 flex items-center justify-center bg-black/10 p-2 rounded-lg box-content">
                  <Icon.User className="size-5" />
                </div>{" "}
                Contact Info
              </div>
              <div className="grid gap-4 py-4 px-8">
                <RenderField
                  label="Phone Number"
                  value={profileData?.basicInfo.phoneNumber || ""}
                />
                <RenderField
                  label="Email"
                  value={profileData?.basicInfo.email || ""}
                />
                <RenderField
                  label="Address"
                  value={profileData?.basicInfo.identityInfo.placeOfBirth || ""}
                />
              </div>
            </div>
            <div
              className={
                isBankInfoMissing
                  ? "bg-amber-50 border border-amber-200 rounded-[18px]"
                  : "bg-white rounded-[18px]"
              }
            >
              <div className="cs-typography text-[16px]! font-bold! border-b border-b-black/10 py-4 px-8 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="size-5 flex items-center justify-center bg-black/10 p-2 rounded-lg box-content">
                    <Icon.BankCard className="size-5" />
                  </div>{" "}
                  Bank Info
                </div>
                {isBankInfoMissing && (
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-100 shrink-0">
                    <Icon.Alert className="size-4 text-amber-600" />
                  </div>
                )}
              </div>
              <div className="grid gap-4 py-4 px-8">
                <RenderField
                  label="Bank Account Name"
                  value={profileData?.bankInfo?.bankAccountName || "-"}
                />
                <RenderField
                  label="Bank Account Number"
                  value={profileData?.bankInfo?.bankAccountNumber || "-"}
                />
                <RenderField
                  label="Bank Name"
                  value={profileData?.bankInfo?.bankName || "-"}
                />
              </div>
            </div>
          </div>
        </div> */}
      </div>
      <ModalChangePassword onCancel={handleCloseModal} open={open} />
      <RegisterPasskey />
    </section>
  );
};

export default Profile;
