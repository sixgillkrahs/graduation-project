export const ForgotPasswordEndpoint = {
  forgotPassword: () => `/auth/forgot-password`,
  verifyOTP: () => `/auth/verify-otp`,
  resetPassword: () => `/auth/reset-password`,
} as const;

export const ForgotPasswordQueryKey = {
  forgotPassword: "forgotPassword",
  verifyOTP: "verifyOTP",
  resetPassword: "resetPassword",
} as const;
