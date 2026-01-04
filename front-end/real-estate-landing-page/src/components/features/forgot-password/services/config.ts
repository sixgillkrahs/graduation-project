
export const ForgotPasswordEndpoint = {
  forgotPassword: () => `/auth/forgot-password`,
  verifyOTP: () => `/auth/verify-otp`,
} as const;

export const ForgotPasswordQueryKey = {
  forgotPassword: "forgotPassword",
  verifyOTP: "verifyOTP",
} as const;
