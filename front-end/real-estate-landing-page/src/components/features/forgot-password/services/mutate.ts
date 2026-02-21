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
      ERROR_SOURCE: "notifications.forgotPasswordFailed",
      SUCCESS_MESSAGE: "notifications.forgotPasswordSuccess",
    },
  });
};

export const useVerifyOTP = (): UseMutationResult<
  IResp<IForgotPasswordService.IRespVerifyOTP>,
  Error,
  IForgotPasswordService.IBodyVerifyOTP,
  void
> => {
  return useMutation({
    mutationFn: (data: IForgotPasswordService.IBodyVerifyOTP) => {
      return ForgotPasswordService.verifyOTP(data);
    },
    meta: {
      ERROR_SOURCE: "notifications.verifyOtpFailed",
      SUCCESS_MESSAGE: "notifications.verifyOtpSuccess",
    },
  });
};

export const useResetPassword = (): UseMutationResult<
  IResp<void>,
  Error,
  IForgotPasswordService.IBodyResetPassword,
  void
> => {
  return useMutation({
    mutationFn: (data: IForgotPasswordService.IBodyResetPassword) => {
      return ForgotPasswordService.resetPassword(data);
    },
    meta: {
      ERROR_SOURCE: "notifications.resetPasswordFailed",
      SUCCESS_MESSAGE: "notifications.resetPasswordSuccess",
    },
  });
};
