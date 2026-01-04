import { IResp } from "@/@types/service";
import { useMutation, UseMutationResult } from "@tanstack/react-query";
import VerifyEmailService from "./service";
import ForgotPasswordService from "./service";

export const useForgotPassword = (): UseMutationResult<
  IResp<void>,
  Error,
  IForgotPasswordService.IBodyForgotPassword,
  void
> => {
  return useMutation({
    mutationFn: (data: IForgotPasswordService.IBodyForgotPassword) => {
      return ForgotPasswordService.forgotPassword(data);
    },
    meta: {
      ERROR_SOURCE:
        "[Forgot password failed]: The password has been successfully reset",
      SUCCESS_MESSAGE: "The password has been successfully reset",
    },
  });
};

export const useVerifyOTP = (): UseMutationResult<
  IResp<void>,
  Error,
  IForgotPasswordService.IBodyVerifyOTP,
  void
> => {
  return useMutation({
    mutationFn: (data: IForgotPasswordService.IBodyVerifyOTP) => {
      return ForgotPasswordService.verifyOTP(data);
    },
    meta: {
      ERROR_SOURCE:
        "[Verify OTP failed]: The OTP is invalid",
      SUCCESS_MESSAGE: "The OTP is valid",
    },
  });
};

