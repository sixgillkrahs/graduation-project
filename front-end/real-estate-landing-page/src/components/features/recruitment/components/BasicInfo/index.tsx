"use client";

import { Icon, Input } from "@/components/ui";
import { AppDispatch, RootState } from "@/store";
import { updateBasicInfo } from "@/store/store";
import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";

type BasicInfoForm = {
  fullName: string;
  email: string;
  phoneNumber: string;
};

const BasicInfo = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { basicInfo } = useSelector((state: RootState) => state.form);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
  } = useForm<BasicInfoForm>({
    defaultValues: basicInfo,
    mode: "onChange",
  });

  const formValues = watch();
  const debouncedUpdate = useMemo(
    () =>
      debounce((data: BasicInfoForm) => {
        dispatch(updateBasicInfo(data));
      }, 300),
    [dispatch]
  );

  useEffect(() => {
    debouncedUpdate(formValues);
    return () => debouncedUpdate.cancel();
  }, [formValues, debouncedUpdate]);

  const onSubmit = (data: BasicInfoForm) => {
    dispatch(updateBasicInfo(data));
  };

  return (
    <div className="flex flex-col gap-4 pt-3">
      <form onSubmit={handleSubmit(onSubmit)}>
        <Input
          label="Full Name"
          preIcon={<Icon.User className="main-color-gray w-5 h-5" />}
          placeholder="e.g. John Doe"
          error={errors.fullName?.message}
          {...register("fullName", {
            required: "Full name is required",
            minLength: {
              value: 2,
              message: "Full name must be at least 2 characters",
            },
          })}
        />

        <div className="grid grid-cols-2 gap-4 mt-4">
          <Input
            label="Email Address"
            placeholder="john.doe@example.com"
            preIcon={<Icon.Mail className="main-color-gray w-5 h-5" />}
            error={errors.email?.message}
            {...register("email", {
              required: "Email is required",
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: "Invalid email address",
              },
            })}
          />

          <Input
            label="Phone Number"
            placeholder="0123456789"
            preIcon={<Icon.Phone className="main-color-gray w-5 h-5" />}
            error={errors.phoneNumber?.message}
            {...register("phoneNumber", {
              required: "Phone number is required",
              pattern: {
                value: /^[0-9]+$/,
                message: "Phone number must contain only numbers",
              },
              minLength: {
                value: 10,
                message: "Phone number must be at least 10 digits",
              },
            })}
          />
        </div>

        <div className="mt-4 text-sm text-gray-500">
          Your information is automatically saved as you type.
        </div>
      </form>
    </div>
  );
};

function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): T & { cancel: () => void } {
  let timeout: NodeJS.Timeout;

  const debounced = (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };

  debounced.cancel = () => clearTimeout(timeout);

  return debounced as T & { cancel: () => void };
}

export default BasicInfo;
