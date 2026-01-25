export const ProfileEndpoint = {
  profile: () => `/users/profile`,
  changePassword: () => `/auth/change-password`,
  registerPasskey: () => `/auth/register-passkey`,
  verifyPasskey: () => `/auth/verify-passkey`,
} as const;

export const ProfileQueryKey = {
  profile: "profile",
  changePassword: "changePassword",
  registerPasskey: "registerPasskey",
  verifyPasskey: "verifyPasskey",
} as const;
