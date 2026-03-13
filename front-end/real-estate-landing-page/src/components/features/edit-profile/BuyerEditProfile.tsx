"use client";

import { CsButton } from "@/components/custom";
import { Input } from "@/components/ui/input";
import { ROUTES } from "@/const/routes";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { useProfile } from "../profile/services/query";
import { useEditProfile } from "./services/mutate";

const BuyerEditProfile = () => {
  const router = useRouter();
  const { data: profile } = useProfile();
  const { mutateAsync: editProfile, isPending } = useEditProfile();
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<IEditProfileService.IBuyerFormData>({
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
    },
    mode: "onChange",
  });

  useEffect(() => {
    if (!profile?.data) {
      return;
    }

    reset({
      fullName: profile.data.fullName || "",
      email: profile.data.email || "",
      phone: profile.data.phone || "",
    });
  }, [profile?.data, reset]);

  const onSubmit = async (data: IEditProfileService.IBuyerFormData) => {
    await editProfile({
      fullName: data.fullName.trim(),
      email: data.email.trim().toLowerCase(),
      phone: data.phone.trim(),
    });
    router.push(ROUTES.PROFILE);
  };

  return (
    <section className="bg-black/10 p-6 md:p-8">
      <div className="container mx-auto max-w-3xl">
        <div className="rounded-[18px] bg-white p-8 shadow-sm">
          <div className="mb-8 space-y-2">
            <h1 className="text-2xl font-bold text-black">
              Complete Buyer Profile
            </h1>
            <p className="text-sm text-black/60">
              Your display name, phone number, and email are used for
              appointments, inquiries, and agent follow-up in CRM.
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
            <Controller
              name="fullName"
              control={control}
              rules={{
                required: "Display name is required",
                minLength: {
                  value: 2,
                  message: "Display name must be at least 2 characters",
                },
              }}
              render={({ field }) => (
                <Input
                  label="Display Name"
                  placeholder="Enter your display name"
                  error={errors.fullName?.message}
                  {...field}
                />
              )}
            />

            <Controller
              name="email"
              control={control}
              rules={{
                required: "Email is required",
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Invalid email address",
                },
              }}
              render={({ field }) => (
                <Input
                  label="Email"
                  placeholder="Enter your email"
                  error={errors.email?.message}
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
                  label="Phone Number"
                  placeholder="Enter your phone number"
                  error={errors.phone?.message}
                  {...field}
                />
              )}
            />

            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              Keep these three fields up to date so booking and inquiry requests
              always reach agents with complete buyer information.
            </div>

            <div className="flex justify-end gap-4 pt-2">
              <CsButton type="button" onClick={() => router.back()}>
                Cancel
              </CsButton>
              <CsButton
                type="submit"
                className="bg-black text-white"
                loading={isPending}
              >
                Save Profile
              </CsButton>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default BuyerEditProfile;
