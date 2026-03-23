"use client";

import { Icon, Image, Tag, useModal } from "@/components/ui";
import { startRegistration } from "@simplewebauthn/browser";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/const/routes";
import { useCallback } from "react";
import CardField from "./components/CardField";
import CardIdentity from "./components/CardIdentity";
import { ModalChangePassword } from "./components/ModalChangePassword";
import ProfileCompletionCard from "./components/ProfileCompletionCard";
import RenderField from "./components/RenderField";
import {
  useRegisterPasskey,
  useVerifyPasskey,
} from "../profile/services/mutate";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { CsButton } from "@/components/custom";
import DOMPurify from "dompurify";
import { BadgeCheck, FileText } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { resolveDocumentImageUrl } from "@/lib/document-image";

const Profile = () => {
  const router = useRouter();
  const { data: profileData, loading: isLoading } = useSelector(
    (state: RootState) => state.profile,
  );
  const { open, show, hide } = useModal();
  const { mutateAsync: registerPasskey } = useRegisterPasskey();
  const { mutateAsync: verifyPasskey } = useVerifyPasskey();

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

  const handleToEdit = () => {
    router.push(ROUTES.PROFILE_EDIT);
  };

  const isBankInfoMissing =
    !isLoading && !!profileData && !profileData.bankInfo;
  const profileCompletionFields = [
    profileData?.avatarUrl,
    profileData?.basicInfo?.nameRegister,
    profileData?.basicInfo?.email,
    profileData?.basicInfo?.phoneNumber,
    profileData?.description,
    profileData?.businessInfo?.certificateNumber,
    profileData?.businessInfo?.taxCode,
    profileData?.businessInfo?.yearsOfExperience,
    profileData?.businessInfo?.specialization?.length,
    profileData?.businessInfo?.workingArea?.length,
    profileData?.bankInfo?.bankAccountName,
    profileData?.bankInfo?.bankAccountNumber,
    profileData?.bankInfo?.bankName,
    profileData?.imageInfo?.identityFront,
    profileData?.imageInfo?.identityBack,
    profileData?.imageInfo?.certificateImage?.length,
  ];
  const completedProfileItems = profileCompletionFields.filter(Boolean).length;
  const totalProfileItems = profileCompletionFields.length;
  const profileCompletion = Math.round(
    (completedProfileItems / totalProfileItems) * 100,
  );
  const sanitizedDescription = DOMPurify.sanitize(
    profileData?.description ||
      "<p>No public description has been added yet.</p>",
  );

  return (
    <section className="bg-black/10 p-6 md:p-8">
      <div className="container mx-auto grid gap-6">
        <ProfileCompletionCard
          completion={profileCompletion}
          completedItems={completedProfileItems}
          totalItems={totalProfileItems}
        />
        {isBankInfoMissing && (
          <div className="flex w-full items-start gap-3 rounded-[18px] border border-amber-200 bg-amber-50 p-6">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-100 shrink-0">
              <Icon.Alert className="size-4 text-amber-600" />
            </div>

            <div className="text-sm">
              <div className="mb-0.5 font-medium text-amber-900">Warning</div>
              <div className="text-amber-700 leading-relaxed">
                Your profile is not complete. Please complete your bank
                information to continue.
              </div>
            </div>
          </div>
        )}
        <div className="grid gap-6 rounded-[18px] bg-white p-6 md:p-8 xl:grid-cols-[minmax(0,1fr)_280px] xl:items-center">
          <div className="min-w-0">
            <div className="flex flex-col gap-4 md:flex-row md:items-center">
              <Avatar
                src={profileData?.avatarUrl}
                alt={profileData?.basicInfo.nameRegister}
                className="size-28 shrink-0 overflow-hidden rounded-full bg-gray-200 object-cover md:size-36"
              />
              <div className="grid min-w-0 gap-2">
                <span className="cs-typography break-words text-[30px]! font-bold!">
                  {profileData?.basicInfo.nameRegister}
                </span>
                <span className="cs-typography flex items-start gap-2 break-all text-[16px]! md:items-center">
                  <Icon.Mail className="mt-0.5 size-5 shrink-0 md:mt-0" />
                  {profileData?.basicInfo.email}
                </span>
                <span className="cs-typography flex items-start gap-2 break-all text-[16px]! md:items-center">
                  <Icon.Phone className="mt-0.5 size-5 shrink-0 md:mt-0" />
                  {profileData?.basicInfo.phoneNumber}
                </span>
                <div className="bg-[#F7F7F7] main-color-red w-fit font-bold text-center px-3 py-1 rounded-lg flex items-center gap-2 text-[12px]!">
                  {profileData?.businessInfo && <>Real Estate Agent</>}
                </div>
              </div>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            <CsButton
              icon={<Icon.Fingerprint className="size-5" />}
              onClick={handleRegisterPasskey}
              className="w-full border border-black/10! bg-white! text-black"
            >
              Register Passkey
            </CsButton>
            <CsButton
              className="w-full border border-black/10! bg-white! text-black"
              icon={<Icon.RotateLock className="size-5" />}
              onClick={handleOpenModal}
            >
              Change Password
            </CsButton>
            <CsButton
              className="cs-bg-black w-full text-white sm:col-span-2 xl:col-span-1"
              icon={<Icon.Pencil className="size-5" />}
              onClick={handleToEdit}
            >
              Edit Profile
            </CsButton>
          </div>
        </div>
        <div className="grid gap-6 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.15fr)_minmax(0,0.9fr)]">
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
          <div className="min-w-0 rounded-[18px] bg-white xl:min-w-0">
            <div className="cs-typography text-[16px]! font-bold! border-b border-b-black/10 py-4  px-8 flex items-center gap-2">
              <div className="size-5 flex items-center justify-center bg-black/10 p-2 rounded-lg box-content">
                <Icon.Briefcase className="size-5" />
              </div>{" "}
              Professional Profile
            </div>
            <div className="grid min-w-0 gap-4 px-8 py-4">
              <div className="grid w-full min-w-0 gap-4 sm:grid-cols-2">
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
                        {profileData?.rating ?? 0}
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
                <span className="flex items-center gap-2 cs-typography text-[14px]! font-bold!">
                  <span>
                    <FileText className="size-5" />
                  </span>{" "}
                  Description
                </span>
                <CardField
                  className="whitespace-pre-wrap leading-7"
                  value={
                    <div
                      className="min-w-0 break-words [overflow-wrap:anywhere] [&_p]:mb-3 [&_ul]:my-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:my-3 [&_ol]:list-decimal [&_ol]:pl-5 [&_a]:break-all [&_a]:text-black [&_a]:underline"
                      dangerouslySetInnerHTML={{ __html: sanitizedDescription }}
                    />
                  }
                />
              </div>
              <div className="my-4 bg-white w-full h-px" />
              <div className="grid gap-2">
                <span className="flex items-center gap-2 cs-typography text-[14px]! font-bold! ">
                  <span>
                    <BadgeCheck className="size-5" />
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
                  <div className="grid gap-2 sm:grid-cols-2">
                    <Image
                      src={resolveDocumentImageUrl(
                        profileData?.imageInfo?.identityFront,
                      )}
                      alt="Identity Front"
                      width={40}
                      height={40}
                      className="w-full"
                      unoptimized={true}
                    />
                    <Image
                      src={resolveDocumentImageUrl(
                        profileData?.imageInfo?.identityBack,
                      )}
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
                    {profileData?.imageInfo?.certificateImage.map((item) => {
                      return (
                        <Image
                          src={resolveDocumentImageUrl(item)}
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
    </section>
  );
};

export default Profile;
