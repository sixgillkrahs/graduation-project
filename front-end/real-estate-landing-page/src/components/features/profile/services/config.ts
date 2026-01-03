export const ProfileEndpoint = {
  profile: () => `/users/profile`,
  changePassword: () => `/auth/change-password`,
} as const;

export const ProfileQueryKey = {
  profile: "profile",
  changePassword: "changePassword",
} as const;
