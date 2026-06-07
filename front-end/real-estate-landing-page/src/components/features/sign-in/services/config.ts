export const SignInEndpoint = {
  signIn: () => `/auth/login`,
  signInPasskey: () => `/auth/login-passkey`,
  verifySignInPasskey: () => `/auth/verify-login-passkey`,
  registerPasskey: () => `/auth/register-passkey`,
  verifyPasskey: () => `/auth/verify-passkey`,
} as const;

export const SignInQueryKey = {
  signIn: "signIn",
  signInPasskey: "signInPasskey",
  registerPasskey: "registerPasskey",
  verifyPasskey: "verifyPasskey",
} as const;
