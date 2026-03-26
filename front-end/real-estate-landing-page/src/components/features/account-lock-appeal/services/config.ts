export const AccountLockAppealEndpoint = {
  detail: (token: string) => `/agents/account-lock/appeal/${token}`,
  submit: () => "/agents/account-lock/appeal",
} as const;
