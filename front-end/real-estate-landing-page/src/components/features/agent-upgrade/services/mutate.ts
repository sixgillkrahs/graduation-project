import { useMutation } from "@tanstack/react-query";
import PaymentService from "./service";

export const useCreateVNPayUrl = () => {
  return useMutation({
    mutationFn: (data: { amount: number; language: string }) =>
      PaymentService.createVNPayUrl(data),
    meta: { ERROR_SOURCE: "Failed to initialize VNPay payment" },
  });
};

export const useCreateMoMoUrl = () => {
  return useMutation({
    mutationFn: (data: { amount: number }) =>
      PaymentService.createMoMoUrl(data),
    meta: { ERROR_SOURCE: "Failed to initialize MoMo payment" },
  });
};

export const useDowngrade = () => {
  return useMutation({
    mutationFn: () => PaymentService.downgrade(),
    meta: { ERROR_SOURCE: "Failed to downgrade plan" },
  });
};
