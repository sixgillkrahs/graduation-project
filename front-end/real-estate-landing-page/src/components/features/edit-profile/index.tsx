"use client";

import { Button, Icon, Input, Select } from "@/components/ui";
import { Controller, useForm } from "react-hook-form";
import ExtractService from "../recruitment/services/service";
import { useProfile } from "../profile/services/query";

const EditProfile = () => {
  const { data: profile, isLoading } = useProfile();
  const {
    handleSubmit,
    formState: { errors },
    control,
  } = useForm<{
    nameRegister: string;
    phone: string;
    certificateNumber: string;
    taxCode: string;
    yearsOfExperience: string;
    workingArea: string;
    specialization: string;
    bankAccountName: string;
    bankAccountNumber: string;
    bankName: string;
  }>({
    defaultValues: {
      nameRegister: profile?.data.basicInfo.nameRegister || "",
      phone: profile?.data.basicInfo.phoneNumber || "",
      certificateNumber: profile?.data.businessInfo.certificateNumber || "",
      taxCode: profile?.data.businessInfo.taxCode || "",
      yearsOfExperience: profile?.data.businessInfo.yearsOfExperience || "",
      workingArea: profile?.data.businessInfo.workingArea?.join(", ") || "",
      specialization:
        profile?.data.businessInfo.specialization?.join(", ") || "",
      bankAccountName: profile?.data.bankInfo?.bankAccountName || "",
      bankAccountNumber: profile?.data.bankInfo?.bankAccountNumber || "",
      bankName: profile?.data.bankInfo?.bankName || "",
    },
    mode: "onChange",
  });

  return (
    <section className="p-6 md:p-8 bg-black/10">
      <div className="container mx-auto grid gap-6">
        <div className="min-w-3xl mx-auto grid gap-6">
          <div className="flex gap-3 items-start ">
            <div className="w-12 h-12 rounded-full bg-[#F5F5F5] flex items-center justify-center">
              <Icon.Edit />
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
              {/* <div className="border-b border-black/10 "></div> */}
              <form className="space-y-4">
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
                      rules={{ required: "Name is required" }}
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
                      rules={{ required: "Phone is required" }}
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
                      }}
                      render={({ field }) => (
                        <Input
                          label="Tax code"
                          placeholder="8888888888"
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
                        pattern: {
                          value: /^[0-9]{0,}$/,
                          message: "Please enter number",
                        },
                      }}
                      render={({ field }) => (
                        <Input
                          label="Years Of Experience"
                          placeholder="8888888888"
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
                        required: "Specialization is required",
                      }}
                      render={({ field }) => (
                        <Select
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
                        required: "Working area is required",
                      }}
                      render={({ field }) => (
                        <Select
                          multiple
                          label="Specialization"
                          error={errors.workingArea?.message}
                          options={ExtractService.vietnamProvinces}
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
                      rules={{ required: "Bank account name is required" }}
                      render={({ field }) => (
                        <Input
                          label="Bank Account Name"
                          placeholder="e.g. 123 Main St"
                          error={errors.nameRegister?.message}
                          {...field}
                        />
                      )}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <Controller
                        name="bankAccountNumber"
                        control={control}
                        rules={{ required: "Bank account number is required" }}
                        render={({ field }) => (
                          <Input
                            label="Bank Account Number"
                            placeholder="e.g. 123 Main St"
                            error={errors.phone?.message}
                            {...field}
                          />
                        )}
                      />
                      <Controller
                        name="bankName"
                        control={control}
                        rules={{ required: "Bank name is required" }}
                        render={({ field }) => (
                          <Input
                            label="Bank Name"
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
                  <Button type="button" outline>
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-black text-white">
                    Save
                  </Button>
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
