"use client";

import { Button, Icon, Image, Tag, useModal } from "@/components/ui";
import { startRegistration } from "@simplewebauthn/browser";
import { useCallback } from "react";
import CardField from "./components/CardField";
import CardIdentity from "./components/CardIdentity";
import { ModalChangePassword } from "./components/ModalChangePassword";
import RegisterPasskey from "./components/RegisterPasskey";
import RenderField from "./components/RenderField";
import { useRegisterPasskey, useVerifyPasskey } from "./services/mutate";
import { useProfile } from "./services/query";
import { useRouter } from "next/navigation";

const Profile = () => {
  const router = useRouter();
  const { data: profile } = useProfile();
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

  const handleToEdit = () => {
    router.push("/profile/edit");
  };

  return (
    <section className="p-6 md:p-8 bg-black/10">
      <div className="container mx-auto grid gap-6">
        {!profileData?.bankInfo && (
          <div className="w-full rounded-[18px] bg-amber-50 border border-amber-200 p-6 flex gap-3 items-start">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-100 shrink-0">
              <Icon.Alert className="size-4 text-amber-600" />
            </div>

            <div className="text-sm">
              <div className="font-medium text-amber-900 mb-0.5">Warning</div>
              <div className="text-amber-700 leading-relaxed">
                Your profile is not complete. Please complete your bank
                information to continue.
              </div>
            </div>
          </div>
        )}
        <div className="flex justify-between items-center gap-4 p-8 w-full rounded-[18px] bg-white ">
          <div className="">
            <div className="flex items-center gap-2">
              <Image
                src={`${process.env.NEXT_PUBLIC_BASEURLAI}/images/${profileData?.imageInfo.identityBack}`}
                alt="avatar"
                className="w-full h-full rounded-full bg-gray-200 p-4 size-36 flex items-center justify-center object-cover overflow-hidden"
                width={150}
                height={150}
              />
              <div className="grid gap-2">
                <span className="cs-typography text-[30px]! font-bold!">
                  {profileData?.basicInfo.nameRegister}
                </span>
                <span className="cs-typography text-[16px]! flex gap-2 items-center">
                  <Icon.Mail className="size-5" />{" "}
                  {profileData?.basicInfo.email}
                </span>
                <span className="cs-typography text-[16px]! flex gap-2 items-center">
                  <Icon.Phone className="size-5" />{" "}
                  {profileData?.basicInfo.phoneNumber}
                </span>
                <div className="bg-[#F7F7F7] main-color-red w-fit font-bold text-center px-3 py-1 rounded-lg flex items-center gap-2 text-[12px]!">
                  {profileData?.businessInfo && <>Real Estate Agent</>}
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              className="text-black"
              outline
              icon={<Icon.Fingerprint className="size-5" />}
              onClick={handleRegisterPasskey}
            >
              Register Passkey
            </Button>
            <Button
              className="text-black"
              outline
              icon={<Icon.RotateLock className="size-5" />}
              onClick={handleOpenModal}
            >
              Change Password
            </Button>
            <Button
              className="cs-bg-black text-white"
              icon={<Icon.Pencil className="size-5" />}
              onClick={handleToEdit}
            >
              Edit Profile
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-6">
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
                profileData?.bankInfo
                  ? "bg-white rounded-[18px]"
                  : "bg-amber-50 border border-amber-200 rounded-[18px]"
              }
            >
              <div className="cs-typography text-[16px]! font-bold! border-b border-b-black/10 py-4 px-8 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="size-5 flex items-center justify-center bg-black/10 p-2 rounded-lg box-content">
                    <Icon.BankCard className="size-5" />
                  </div>{" "}
                  Bank Info
                </div>
                {!profileData?.bankInfo && (
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
          <div className="bg-white rounded-[18px]">
            <div className="cs-typography text-[16px]! font-bold! border-b border-b-black/10 py-4  px-8 flex items-center gap-2">
              <div className="size-5 flex items-center justify-center bg-black/10 p-2 rounded-lg box-content">
                <Icon.Briefcase className="size-5" />
              </div>{" "}
              Professional Profile
            </div>
            <div className="grid gap-4 py-4 px-8 b">
              <div className="grid grid-cols-2 gap-4">
                <CardField
                  title="Experience"
                  value={
                    <span>
                      <span className="cs-typography text-[18px]! font-bold!">
                        {profileData?.businessInfo.yearsOfExperience}
                      </span>{" "}
                      <span className="cs-paragraph-gray text-[14px]! font-bold!">
                        years
                      </span>
                    </span>
                  }
                />
                <CardField
                  title="Rating"
                  value={
                    <span className="flex items-center gap-1 ">
                      <span className="cs-typography text-[18px]! font-bold!">
                        {profileData?.businessInfo.yearsOfExperience}
                      </span>{" "}
                      <Icon.Star className="size-3 " />
                    </span>
                  }
                />
              </div>
              <div className="grid gap-2">
                <div className="grid gap-1">
                  <div className="cs-paragraph-gray text-[14px]! font-bold! uppercase">
                    Tax Code
                  </div>
                  <CardField value={profileData?.businessInfo.taxCode || ""} />
                </div>
                <div className="grid gap-1">
                  <div className="cs-paragraph-gray text-[14px]! font-bold! uppercase">
                    Certificate Number
                  </div>
                  <CardField
                    value={profileData?.businessInfo.certificateNumber || ""}
                  />
                </div>
              </div>
              <div className="my-4 bg-white w-full h-px" />
              <div className="grid gap-2">
                <span className="flex items-center gap-2 cs-typography text-[14px]! font-bold! ">
                  <span>
                    <Icon.VerifiedBadge className="size-5" />
                  </span>{" "}
                  Specialization
                </span>
                <div className="flex flex-wrap gap-2">
                  {profileData?.businessInfo.specialization.map((item) => {
                    return (
                      <Tag
                        key={item}
                        title={item}
                        className="text-[14px]! text-black! font-bold!"
                      />
                    );
                  })}
                </div>
              </div>
              <div className="my-4 bg-white w-full h-px" />
              <div className="grid gap-2">
                <span className="flex items-center gap-2 cs-typography text-[14px]! font-bold!">
                  <span>
                    <Icon.MapPin className="size-5" />
                  </span>{" "}
                  Working Area
                </span>
                <div className="flex flex-wrap gap-2">
                  {profileData?.businessInfo.workingArea.map((item) => {
                    return (
                      <Tag
                        key={item}
                        title={item}
                        className="text-[14px]! text-black! font-bold!"
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-6">
            <CardIdentity identityInfo={profileData?.basicInfo.identityInfo} />
            <div className="bg-white rounded-[18px] h-full">
              <div className="cs-typography text-[16px]! font-bold! border-b border-b-black/10 py-4  px-8 flex items-center gap-2">
                <div className="size-5 flex items-center justify-center bg-black/10 p-2 rounded-lg box-content">
                  <Icon.IdCard className="size-5" />
                </div>{" "}
                Documents
              </div>
              <div className="grid gap-4 py-4 px-8">
                <div className="grid gap-2">
                  <div className="cs-paragraph text-[14px]! font-bold! uppercase">
                    Identity Card
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Image
                      src={`${process.env.NEXT_PUBLIC_BASEURLAI}/images/${profileData?.imageInfo.identityFront}`}
                      alt="Identity Front"
                      width={40}
                      height={40}
                      className="w-full"
                      unoptimized={true}
                    />
                    <Image
                      src={`${process.env.NEXT_PUBLIC_BASEURLAI}/images/${profileData?.imageInfo.identityBack}`}
                      alt="Identity Back"
                      width={40}
                      height={40}
                      className="w-full"
                      unoptimized={true}
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <div className="cs-paragraph text-[14px]! font-bold! uppercase">
                    Business License
                  </div>
                  <div className="grid gap-2">
                    {profileData?.imageInfo.certificateImage.map((item) => {
                      return (
                        <Image
                          src={`${process.env.NEXT_PUBLIC_BASEURLAI}/images/${item}`}
                          key={item}
                          alt="Business License"
                          width={40}
                          height={40}
                          className="w-full"
                          unoptimized={true}
                        />
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <ModalChangePassword onCancel={handleCloseModal} open={open} />
      <RegisterPasskey />
    </section>
  );
};

export default Profile;
