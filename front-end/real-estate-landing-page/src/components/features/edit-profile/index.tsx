"use client";

import { bankList } from "@/const/bank";
import { vietnamProvinces } from "@/const/vietnam-provinces";
import { useEffect, useRef } from "react";
import { Controller, useForm } from "react-hook-form";
import { useProfile } from "../profile/services/query";
import { useEditProfile } from "./services/mutate";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { CsButton } from "@/components/custom";
import { Avatar } from "@/components/ui/avatar";
import { useUploadImages } from "@/shared/upload/mutate";
import { fetchProfileItem } from "@/store/profile.store";
import { AppDispatch } from "@/store";
import { Camera, Edit } from "lucide-react";
import { CsSelect } from "@/components/ui/select";
import { toast } from "sonner";
import { useDispatch } from "react-redux";
import { useAIModeration } from "@/hooks/useAIModeration";

const EditProfile = () => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { data: profile } = useProfile();
  const { mutateAsync: editProfile, isPending } = useEditProfile();
  const { mutateAsync: uploadImages, isPending: isUploadingAvatar } =
    useUploadImages();
  const {
    handleSubmit,
    formState: { errors },
    control,
    reset,
    watch,
    setValue,
    setError,
    clearErrors,
  } = useForm<IEditProfileService.IFormData>({
    defaultValues: {
      avatarUrl: "",
      nameRegister: "",
      phone: "",
      description: "",
      certificateNumber: "",
      taxCode: "",
      yearsOfExperience: "",
      workingArea: [],
      specialization: [],
      bankAccountName: "",
      bankAccountNumber: "",
      bankName: "",
    },
    mode: "onChange",
  });

  const description = watch("description");

  useAIModeration({
    description,
    setError,
    clearErrors,
    errorType: errors.description?.type as string,
  });

  useEffect(() => {
    if (profile?.data) {
      reset({
        avatarUrl: profile.data.avatarUrl || "",
        nameRegister: profile.data.basicInfo.nameRegister || "",
        phone: profile.data.basicInfo.phoneNumber || "",
        description: profile.data.description || "",
        certificateNumber: profile.data.businessInfo.certificateNumber || "",
        taxCode: profile.data.businessInfo.taxCode || "",
        yearsOfExperience: profile.data.businessInfo.yearsOfExperience || "",
        workingArea: profile.data.businessInfo.workingArea || [],
        specialization: profile.data.businessInfo.specialization || [],
        bankAccountName: profile.data.bankInfo?.bankAccountName || "",
        bankAccountNumber: profile.data.bankInfo?.bankAccountNumber || "",
        bankName: profile.data.bankInfo?.bankName || "",
      });
    }
  }, [profile, reset]);

  const avatarUrl = watch("avatarUrl");

  const handleSelectAvatar = () => {
    fileInputRef.current?.click();
  };

  const handleUploadAvatar = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    try {
      const response = await uploadImages([file]);
      const uploadedAvatar = response.data.files[0]?.url;

      if (!uploadedAvatar) {
        toast.error("Avatar upload failed");
        return;
      }

      setValue("avatarUrl", uploadedAvatar, {
        shouldDirty: true,
        shouldValidate: true,
      });
    } catch (error) {
      toast.error("Avatar upload failed");
    } finally {
      event.target.value = "";
    }
  };

  const onSubmit = async (data: IEditProfileService.IFormData) => {
    if (errors.description?.type === "manual") {
      toast.error("Mô tả của bạn chứa từ ngữ không phù hợp.");
      return;
    }
    await editProfile(data);
    dispatch(fetchProfileItem());
    router.push("/agent/profile");
  };

  const onBack = () => {
    router.back();
  };

  return (
    <section className="p-6 md:p-8 bg-black/10">
      <div className="container mx-auto grid gap-6">
        <div className="min-w-3xl mx-auto grid gap-6">
          <div className="flex gap-3 items-start ">
            <div className="w-12 h-12 rounded-full bg-[#F5F5F5] flex items-center justify-center">
              <Edit />
            </div>
            <div className="flex flex-col gap-1">
              <h3 className="text-[20px] font-bold text-black">Edit Profile</h3>
              <p className="text-[16px] font-medium text-[#4B5563]">
                Update your profile information
              </p>
            </div>
          </div>
          <div className="rounded-[18px] bg-white p-10">
            <div className="grid gap-4">
              <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
                <div className="flex items-center gap-5 rounded-[18px] border border-black/10 bg-black/[0.02] p-5">
                  <div className="relative">
                    <Avatar
                      src={avatarUrl}
                      alt={watch("nameRegister") || "Agent avatar"}
                      className="size-24 rounded-full bg-gray-200 object-cover"
                    />
                    <button
                      type="button"
                      onClick={handleSelectAvatar}
                      disabled={isUploadingAvatar}
                      className="absolute -right-1 -bottom-1 flex size-9 items-center justify-center rounded-full border border-black/10 bg-white text-black shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <Camera className="size-4" />
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleUploadAvatar}
                    />
                  </div>

                  <div className="grid gap-1">
                    <h4 className="text-[16px] font-bold text-black">
                      Profile Avatar
                    </h4>
                    <p className="text-[14px] leading-6 text-[#4B5563]">
                      Upload a clear profile photo to make your agent profile
                      more trustworthy and recognizable.
                    </p>
                    <div>
                      <CsButton
                        type="button"
                        onClick={handleSelectAvatar}
                        className="bg-white! border border-black/10! text-black"
                        loading={isUploadingAvatar}
                      >
                        Change Avatar
                      </CsButton>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex gap-3 items-center ">
                    <div className="w-10 h-10 rounded-full bg-[#F5F5F5] flex items-center justify-center text-[18px] font-black text-black">
                      1
                    </div>
                    <h3 className="text-[18px] font-bold text-black">
                      Personal Information
                    </h3>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Controller
                      name="nameRegister"
                      control={control}
                      rules={{
                        required: "Full name is required",
                        minLength: {
                          value: 2,
                          message: "Name must be at least 2 characters",
                        },
                      }}
                      render={({ field }) => (
                        <Input
                          label="Full Name"
                          placeholder="e.g. 123 Main St"
                          error={errors.nameRegister?.message}
                          {...field}
                        />
                      )}
                    />
                    <Controller
                      name="phone"
                      control={control}
                      rules={{
                        required: "Phone number is required",
                        pattern: {
                          value: /^(0|\+84)[0-9]{9}$/,
                          message: "Invalid phone number",
                        },
                      }}
                      render={({ field }) => (
                        <Input
                          label="Phone"
                          placeholder="e.g. 123 Main St"
                          error={errors.phone?.message}
                          {...field}
                        />
                      )}
                    />
                  </div>
                  <Controller
                    name="description"
                    control={control}
                    rules={{
                      validate: (value) =>
                        value.replace(/<(.|\n)*?>/g, "").trim().length > 0 ||
                        "Description is required",
                    }}
                    render={({ field }) => (
                      <RichTextEditor
                        label="Description"
                        placeholder="Introduce yourself, your market expertise, and how you support clients"
                        error={errors.description?.message}
                        {...field}
                      />
                    )}
                  />
                </div>
                <div className="border-b border-black/10 my-4"></div>
                <div className="space-y-4">
                  <div className="flex gap-3 items-center ">
                    <div className="w-10 h-10 rounded-full bg-[#F5F5F5] flex items-center justify-center text-[18px] font-black text-black">
                      2
                    </div>
                    <h3 className="text-[18px] font-bold text-black">
                      Professional Information
                    </h3>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Controller
                      name="certificateNumber"
                      control={control}
                      rules={{
                        required: "Certificate number is required",
                        pattern: {
                          value: /^[A-Z0-9-]{6,}$/,
                          message: "Invalid certificate format",
                        },
                      }}
                      render={({ field }) => (
                        <Input
                          label="Certificate Number"
                          placeholder="CCHN-HN-123456"
                          error={errors.certificateNumber?.message}
                          {...field}
                        />
                      )}
                    />
                    <Controller
                      name="taxCode"
                      control={control}
                      rules={{
                        required: "Tax code is required",
                        pattern: {
                          value: /^[0-9]{9,13}$/,
                          message: "Tax code must be 9–13 digits",
                        },
                      }}
                      render={({ field }) => (
                        <Input
                          label="Tax code"
                          error={errors.taxCode?.message}
                          {...field}
                        />
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    <Controller
                      name="yearsOfExperience"
                      control={control}
                      rules={{
                        required: "Year of experience is required",
                        validate: (value) => {
                          const num = Number(value);
                          if (isNaN(num)) return "Must be a number";
                          if (num < 0) return "Must be >= 0";
                          if (num > 50) return "Too large";
                          return true;
                        },
                      }}
                      render={({ field }) => (
                        <Input
                          label="Years Of Experience"
                          suffix="Year"
                          error={errors.yearsOfExperience?.message}
                          {...field}
                        />
                      )}
                    />
                    <Controller
                      name="specialization"
                      control={control}
                      rules={{
                        validate: (val) =>
                          val?.length > 0 ||
                          "Select at least one specialization",
                      }}
                      render={({ field }) => (
                        <CsSelect
                          label="Specialization"
                          error={errors.specialization?.message}
                          multiple
                          options={[
                            {
                              value: "APARTMENT",
                              label: "APARTMENT",
                            },
                            {
                              value: "LAND",
                              label: "LAND",
                            },
                          ]}
                          {...field}
                        />
                      )}
                    />
                  </div>
                  <div className="grid mt-3">
                    <Controller
                      name="workingArea"
                      control={control}
                      rules={{
                        validate: (val) =>
                          val?.length > 0 || "Select at least one working area",
                      }}
                      render={({ field }) => (
                        <CsSelect
                          multiple
                          label="Working Area"
                          error={errors.workingArea?.message}
                          options={vietnamProvinces}
                          {...field}
                        />
                      )}
                    />
                  </div>
                  <div className="mt-3">
                    {/* <Controller
                    name="certificateImage"
                    control={control}
                    rules={{
                      required: "Certificate image is required",
                      validate: (val) =>
                        (val && val.length > 0) ||
                        "Certificate image is required",
                    }}
                    render={({
                      field: { onChange, value, ...restField },
                      fieldState: { error },
                    }) => (
                      <Upload
                        label="Certificate Image"
                        accept="image/jpeg,image/png"
                        {...restField}
                        value={value || []}
                        onChange={(files) => {
                          onChange(files);
                          handleUploadImage(files);
                        }}
                        error={error?.message}
                      />
                    )}
                  /> */}
                  </div>
                </div>
                <div className="border-b border-black/10 my-4"></div>
                <div className="space-y-4">
                  <div className="flex gap-3 items-center ">
                    <div className="w-10 h-10 rounded-full bg-[#F5F5F5] flex items-center justify-center text-[18px] font-black text-black">
                      3
                    </div>
                    <h3 className="text-[18px] font-bold text-black">
                      Bank Information
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 gap-4">
                    <Controller
                      name="bankAccountName"
                      control={control}
                      rules={{
                        required: "Bank account name is required",
                        pattern: {
                          value: /^[A-Za-zÀ-ỹ\s]+$/,
                          message: "Invalid account name",
                        },
                      }}
                      render={({ field }) => (
                        <Input
                          label="Bank Account Name"
                          placeholder="e.g. 123 Main St"
                          error={errors.bankAccountName?.message}
                          {...field}
                        />
                      )}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <Controller
                        name="bankAccountNumber"
                        control={control}
                        rules={{
                          required: "Bank account number is required",
                          pattern: {
                            value: /^[0-9]{8,20}$/,
                            message: "Invalid bank account number",
                          },
                        }}
                        render={({ field }) => (
                          <Input
                            label="Bank Account Number"
                            placeholder="e.g. 123 Main St"
                            error={errors.bankAccountNumber?.message}
                            {...field}
                          />
                        )}
                      />
                      <Controller
                        name="bankName"
                        control={control}
                        rules={{
                          required: "Bank name is required",
                        }}
                        render={({ field }) => (
                          <CsSelect
                            label="Bank Name"
                            options={bankList}
                            // searchable
                            // searchPlaceholder="Search bank name"
                            placeholder="e.g. 123 Main St"
                            error={errors.bankName?.message}
                            {...field}
                          />
                        )}
                      />
                    </div>
                  </div>
                </div>
                <div className="mt-10 flex justify-end gap-4">
                  <CsButton type="button" onClick={onBack}>
                    Cancel
                  </CsButton>
                  <CsButton
                    type="submit"
                    className="bg-black text-white"
                    loading={isPending || isUploadingAvatar}
                  >
                    Save
                  </CsButton>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EditProfile;
